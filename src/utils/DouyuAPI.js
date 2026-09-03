import { SETTINGS } from '../modules/SettingsManager';
import { Utils } from './utils';
import { GM_getValue, GM_setValue, GM_xmlhttpRequest, unsafeWindow } from '$';
import { extractDouyuCsrfConfig } from '../platform/douyu/CsrfConfig.js';
import {
  compareRedBagPrizeValue,
  selectActiveRedBag,
  summarizeRedBagPrizePool,
} from '../features/redbag/RedBagState.js';

const ROOM_POOL_KEY = "douyu_qmx_room_pool";
const ROOM_POOL_LOCK_KEY = "douyu_qmx_room_pool_lock";
const CSRF_CONFIG_KEY = "douyu_qmx_csrf_config";
const RED_BAG_ROOM_LIST_PATH = '/japi/livebiznc/web/anchorstardiscover/redbag/room/list';
const RED_BAG_SNATCH_PATH = '/japi/livebiznc/web/anchorstardiscover/redbag/snatch';
const CSRF_COOKIE_PATH = '/wgapi/livenc/liveweb/csrfApi/getCsrfCookie';

const mapWithConcurrency = async (items, concurrency, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;
  const workerCount = Math.min(items.length, Math.max(1, Number(concurrency) || 1));
  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
};

const normalizeSquareCandidates = (items, limit) => {
  const seenRoomIds = new Set();
  const candidates = [];
  for (const item of Array.isArray(items) ? items : []) {
    const rid = String(item?.rid || '');
    if (!/^\d+$/.test(rid) || seenRoomIds.has(rid)) continue;
    seenRoomIds.add(rid);
    candidates.push({
      rid,
      rbId: Number(item?.rbId) || 0,
      rbType: Number(item?.rbType) || 0,
      sourceIndex: candidates.length,
    });
    if (candidates.length >= limit) break;
  }
  return candidates;
};

const createRequestError = (message, kind = 'transport', details = {}) => Object.assign(
  new Error(message),
  { kind, ...details },
);

const readDocumentCookie = (pageWindow, cookieName) => {
  const cookieText = String(pageWindow?.document?.cookie || '');
  const item = cookieText.split(';').map((part) => part.trim()).find((part) =>
    part.startsWith(`${cookieName}=`)
  );
  if (!item) return '';
  const value = item.slice(cookieName.length + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const readEmbeddedCsrfConfig = (pageWindow) => {
  const scripts = Array.from(pageWindow?.document?.scripts || []);
  const source = scripts
    .map((script) => script.textContent || '')
    .filter((text) => /(?:cookie_pre|["']?tvk["']?\s*:|["']?tn["']?\s*:)/.test(text))
    .join('\n');
  return extractDouyuCsrfConfig(source);
};

const isCompleteCsrfConfig = (config) => Boolean(config?.fieldName && config?.cookieName);

/**
 * =================================================================================
 * 模块：斗鱼 API 客户端 (DouyuAPI)
 * ---------------------------------------------------------------------------------
 * 负责所有与斗鱼服务器的 API 通信。
 * =================================================================================
 */
export const DouyuAPI = {
  getPageWindow() {
    if (typeof unsafeWindow !== 'undefined' && unsafeWindow?.fetch) return unsafeWindow;
    return window;
  },

  async pageFetchJson(path, options = {}) {
    const pageWindow = this.getPageWindow();
    const { timeout = 10_000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await pageWindow.fetch.call(pageWindow, path, {
        credentials: 'include',
        ...fetchOptions,
        signal: controller.signal,
      });
      const text = await response.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        throw createRequestError('斗鱼接口返回了非 JSON 响应', 'protocol', {
          httpStatus: response.status,
        });
      }
      if (!response.ok) {
        throw createRequestError(`斗鱼接口 HTTP ${response.status}`, 'transport', {
          httpStatus: response.status,
          payload,
        });
      }
      return payload;
    } catch (error) {
      if (error?.kind) throw error;
      const message = error?.name === 'AbortError' ? '斗鱼接口请求超时' : String(error?.message || error);
      throw createRequestError(message, 'transport');
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async pageFetchText(path, options = {}) {
    const pageWindow = this.getPageWindow();
    const { timeout = 15_000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await pageWindow.fetch.call(pageWindow, path, {
        credentials: 'include',
        ...fetchOptions,
        signal: controller.signal,
      });
      const text = await response.text();
      if (!response.ok) {
        throw createRequestError(`斗鱼页面 HTTP ${response.status}`, 'transport', {
          httpStatus: response.status,
        });
      }
      return { text, url: response.url || String(path), status: response.status };
    } catch (error) {
      if (error?.kind) throw error;
      const message = error?.name === 'AbortError' ? '斗鱼页面请求超时' : String(error?.message || error);
      throw createRequestError(message, 'transport');
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async resolveRoomIdentity(roomId) {
    const inputRoomId = String(roomId || '').trim();
    if (!/^\d+$/.test(inputRoomId)) {
      throw createRequestError('控制室房间号必须是纯数字', 'protocol');
    }

    const { text, url } = await this.pageFetchText(`/${inputRoomId}`, { method: 'GET' });
    const realRoomId = text.match(/window\.room_id\s*=\s*(\d+)/)?.[1] || '';
    const canonicalTag = text.match(/<link\b[^>]*\brel=["'][^"']*canonical[^"']*["'][^>]*>/i)?.[0] || '';
    const canonicalUrl = canonicalTag.match(/\bhref=["']([^"']+)/i)?.[1] || '';
    const getPathRoomId = (value) => {
      try {
        return new URL(value, window.location.origin).pathname.match(/^\/(\d+)\/?$/)?.[1] || '';
      } catch {
        return '';
      }
    };
    const controlRoomId = getPathRoomId(canonicalUrl) || getPathRoomId(url) || inputRoomId;
    if (!realRoomId) {
      throw createRequestError('未能从直播间页面解析真实 RID', 'protocol');
    }

    return { controlRoomId, realRoomId };
  },

  async getDynamicCsrf() {
    const pageWindow = this.getPageWindow();
    const embedded = readEmbeddedCsrfConfig(pageWindow);
    if (isCompleteCsrfConfig(embedded)) {
      GM_setValue(CSRF_CONFIG_KEY, embedded);
    }
    const config = isCompleteCsrfConfig(embedded)
      ? embedded
      : GM_getValue(CSRF_CONFIG_KEY, {});
    const fieldName = String(config?.fieldName || '');
    const cookieName = String(config?.cookieName || '');
    if (!fieldName || !cookieName) {
      throw createRequestError('当前页及共享缓存中没有动态 CSRF 配置', 'auth');
    }

    let token = readDocumentCookie(pageWindow, cookieName);
    if (!token) {
      await this.pageFetchJson(CSRF_COOKIE_PATH, { method: 'GET' });
      token = readDocumentCookie(pageWindow, cookieName);
    }
    if (!token) {
      throw createRequestError('动态 CSRF Cookie 不可用', 'auth');
    }

    return { fieldName, token };
  },

  cachePageCsrfConfig() {
    const embedded = readEmbeddedCsrfConfig(this.getPageWindow());
    if (!isCompleteCsrfConfig(embedded)) return false;
    GM_setValue(CSRF_CONFIG_KEY, embedded);
    return true;
  },

  async getRoomRedBags(rid, options = {}) {
    const payload = await this.pageFetchJson(
      `${RED_BAG_ROOM_LIST_PATH}?rid=${encodeURIComponent(rid)}`,
      { method: 'GET', timeout: options.timeout },
    );
    if (Number(payload?.error) !== 0 || !Array.isArray(payload?.data?.redBagList)) {
      throw createRequestError(
        String(payload?.msg || '红包列表响应结构异常'),
        'protocol',
        { businessError: payload?.error },
      );
    }
    return { ...payload.data, receivedAt: Date.now() };
  },

  async rankSquareCandidates(candidates) {
    const probes = await mapWithConcurrency(
      candidates,
      SETTINGS.API_ROOM_PROBE_CONCURRENCY,
      async (candidate) => {
        try {
          const roomData = await this.getRoomRedBags(candidate.rid, {
            timeout: SETTINGS.API_ROOM_PROBE_TIMEOUT,
          });
          const bag = selectActiveRedBag({
            redBagList: roomData.redBagList,
            roomId: candidate.rid,
          });
          if (!bag) return { candidate, state: 'stale', bag: null };
          return { candidate, state: 'ranked', bag };
        } catch (error) {
          return { candidate, state: 'unverified', bag: null, error };
        }
      },
    );

    const ranked = probes.filter((probe) => probe.state === 'ranked');
    ranked.sort((left, right) => {
      const prizeOrder = compareRedBagPrizeValue(left.bag, right.bag);
      if (prizeOrder !== 0) return prizeOrder;
      if (left.bag.waitSec !== right.bag.waitSec) return left.bag.waitSec - right.bag.waitSec;
      return left.candidate.sourceIndex - right.candidate.sourceIndex;
    });
    const unverified = probes.filter((probe) => probe.state === 'unverified');
    const staleCount = probes.length - ranked.length - unverified.length;

    Utils.log(
      `[房间优选] 已探测 ${probes.length} 个候选：有效 ${ranked.length}，` +
      `已失效 ${staleCount}，查询失败 ${unverified.length}。`
    );
    if (ranked[0]) {
      const pool = summarizeRedBagPrizePool(ranked[0].bag);
      Utils.log(
        `[房间优选] 当前最高奖池房间 ${ranked[0].candidate.rid}：` +
        `金币 ${pool.coins}，星光棒 ${pool.starlight}，总量 ${pool.total}，` +
        `等待 ${ranked[0].bag.waitSec} 秒。`
      );
    }

    return [...ranked, ...unverified]
      .map((probe) => `https://www.douyu.com/${probe.candidate.rid}`);
  },

  async snatchRedBag({ rid, id, code }) {
    if (!rid || !id || !code) {
      throw createRequestError('红包身份参数不完整', 'protocol');
    }
    const { fieldName, token } = await this.getDynamicCsrf();
    const body = new URLSearchParams({
      code: String(code),
      id: String(id),
      rid: String(rid),
      [fieldName]: token,
    });
    return this.pageFetchJson(RED_BAG_SNATCH_PATH, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: body.toString(),
    });
  },

  /**
   * 获取共享URL池。
   * @returns {string[]}
   */
  getRoomPool() {
    const pool = GM_getValue(ROOM_POOL_KEY, []);
    return Array.isArray(pool) ? pool : [];
  },

  /**
   * 保存共享URL池。
   * @param {string[]} pool
   */
  setRoomPool(pool) {
    GM_setValue(ROOM_POOL_KEY, Array.isArray(pool) ? pool : []);
  },

  /**
   * 获取URL对应的房间ID。
   * @param {string} url
   * @returns {string|null}
   */
  getRoomIdFromUrl(url) {
    if (!url || typeof url !== "string") return null;
    return url.match(/\/(\d+)/)?.[1] || null;
  },

  /**
   * 加锁（用于池读写的原子化）。
   */
  async acquireRoomPoolLock() {
    while (GM_getValue(ROOM_POOL_LOCK_KEY, false)) {
      await Utils.sleep(20);
    }
    GM_setValue(ROOM_POOL_LOCK_KEY, true);
  },

  /**
   * 释放锁。
   */
  releaseRoomPoolLock() {
    GM_setValue(ROOM_POOL_LOCK_KEY, false);
  },

  /**
   * 从池中消费一个可用URL（池空时自动调用 getRooms 补池）。
   * @param {number} count - 期望获取的房间数量。
   * @param {string} rid - 当前房间ID。
   * @param {number} [retries=SETTINGS.API_RETRY_COUNT] - 重试次数。
   * @returns {Promise<string|null>} - 单个可用URL。
   */
  async getRoom(count, rid, retries = SETTINGS.API_RETRY_COUNT) {
    // 缓存动态字段映射作为控制页路由变化时的回退，不保存 Cookie/token。
    this.cachePageCsrfConfig();

    const consumeFromPool = () => {
      const uniquePool = Array.from(new Set(this.getRoomPool()));
      if (uniquePool.length === 0) {
        this.setRoomPool(uniquePool);
        return null;
      }

      const [url] = uniquePool.splice(0, 1);
      this.setRoomPool(uniquePool);
      return url || null;
    };

    // 1) 优先消费现有池
    await this.acquireRoomPoolLock();
    try {
      const cachedUrl = consumeFromPool();
      if (cachedUrl) {
        Utils.log(`[房间池] 命中缓存URL: ${cachedUrl}`);
        return cachedUrl;
      }
    } finally {
      this.releaseRoomPoolLock();
    }

    // 2) 池空则拉取
    const fetchedRooms = await this.getRooms(count, rid, retries);

    // 3) 合并新池并消费
    await this.acquireRoomPoolLock();
    try {
      const mergedPool = Array.from(
        new Set([...this.getRoomPool(), ...fetchedRooms]),
      );
      this.setRoomPool(mergedPool);

      const nextUrl = consumeFromPool();
      if (nextUrl) {
        Utils.log(`[房间池] 拉取后消费URL: ${nextUrl}`);
        return nextUrl;
      }

      Utils.log("[房间池] 拉取后仍无可用URL。");
      return null;
    } finally {
      this.releaseRoomPoolLock();
    }
  },

  /**
   * 通过 API 获取可领取红包的房间列表。
   * @param {number} count - 期望获取的房间数量。
   * @param {string} rid - 当前房间的ID。
   * @param {number} [retries=SETTINGS.API_RETRY_COUNT] - 重试次数。
   * @returns {Promise<string[]>} - 房间链接数组。
   */
  getRooms(count, rid, retries = SETTINGS.API_RETRY_COUNT) {
    return new Promise((resolve, reject) => {
      const attempt = (remainingTries) => {
                Utils.log(`开始调用 API 获取房间列表... (剩余重试次数: ${remainingTries})`);
        GM_xmlhttpRequest({
                    method: 'GET',
          url: `${SETTINGS.API_URL}?rid=${rid}`,
          headers: {
                        Referer: 'https://www.douyu.com/',
                        'User-Agent': navigator.userAgent,
          },
                    responseType: 'json',
          timeout: 10000,
          onload: (response) => {
            if (
              response.status === 200 &&
              response.response?.error === 0 &&
              Array.isArray(response.response.data?.redBagList)
            ) {
              const candidates = normalizeSquareCandidates(
                response.response.data.redBagList,
                count * 2,
              );
              this.rankSquareCandidates(candidates)
                .then((rooms) => {
                  Utils.log(`API 成功返回并排序 ${rooms.length} 个房间URL。`);
                  resolve(rooms);
                })
                .catch((error) => {
                  Utils.log(`候选房间奖池排序失败，保留 square/list 原顺序: ${error.message}`);
                  resolve(candidates.map((item) => `https://www.douyu.com/${item.rid}`));
                });
            } else {
              const errorMsg = `API 数据格式错误或失败: ${
                                response.response?.msg || '未知错误'
              }`;
              Utils.log(errorMsg);
              if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
              else reject(new Error(errorMsg));
            }
          },
          onerror: (error) => {
                        const errorMsg = `API 请求网络错误: ${error.statusText || '未知'}`;
            Utils.log(errorMsg);
            if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
            else reject(new Error(errorMsg));
          },
          ontimeout: () => {
                        const errorMsg = 'API 请求超时';
            Utils.log(errorMsg);
            if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
            else reject(new Error(errorMsg));
          },
        });
      };

      const retry = (remainingTries, reason) => {
                Utils.log(`${reason}，将在 ${SETTINGS.API_RETRY_DELAY / 1000} 秒后重试...`);
        setTimeout(() => attempt(remainingTries), SETTINGS.API_RETRY_DELAY);
      };

      attempt(retries);
    });
  },

  /**
   * 返回用户的金币历史列表
   * @param current - 当前页码
   * @param count - 返回数量单次获取不超过100
   * @param retries - 重试次数
   * @returns {Promise<Array<{
   *  balanceDiff: number,
   *  createTime: number,
   *  opDirection: number,
   *  remark: string
   * }>>}
   */
  async getCoinRecord(current, count, retries = SETTINGS.API_RETRY_COUNT) {
    const query = new URLSearchParams({
      current: String(Math.max(1, Number(current) || 1)),
      pageSize: String(Math.min(100, Math.max(10, Number(count) || 20))),
    });
    const requestUrl = `${SETTINGS.COIN_LIST_URL}?${query.toString()}`;
    const retryCount = Math.max(0, Number(retries) || 0);

    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      const remainingTries = retryCount - attempt;
      Utils.log(`开始调用 API 获取金币历史列表... (剩余重试次数: ${remainingTries})`);
      try {
        // 与斗鱼官方活动页保持一致：同源请求自动携带完整登录会话。
        const payload = await this.pageFetchJson(requestUrl, { method: 'GET' });
        const businessError = Number(payload?.error);
        if (businessError !== 0) {
          throw createRequestError(
            String(payload?.msg || '金币记录接口返回失败'),
            businessError === -9 ? 'auth' : 'business',
            { businessError },
          );
        }
        if (!Array.isArray(payload?.data?.list)) {
          throw createRequestError('金币记录响应结构异常', 'protocol');
        }

        const coinListData = payload.data.list.filter((item) =>
          Number(item?.opDirection) === 1 && String(item?.remark || '').includes('红包')
        );
        Utils.log(`API 成功返回 ${coinListData.length} 个红包记录。`);
        return coinListData;
      } catch (error) {
        if (error?.kind !== 'transport' || remainingTries === 0) throw error;
        Utils.log(
          `${error.message}，将在 ${SETTINGS.API_RETRY_DELAY / 1000} 秒后重试...`
        );
        await Utils.sleep(SETTINGS.API_RETRY_DELAY);
      }
    }

    return [];
  },
};

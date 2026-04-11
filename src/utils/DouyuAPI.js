import { SETTINGS } from '../modules/SettingsManager';
import { Utils } from './utils';
import { GM_cookie, GM_xmlhttpRequest } from '$';

const ROOM_POOL_KEY = "douyu_qmx_room_pool";
const ROOM_POOL_LOCK_KEY = "douyu_qmx_room_pool_lock";

/**
 * =================================================================================
 * 模块：斗鱼 API 客户端 (DouyuAPI)
 * ---------------------------------------------------------------------------------
 * 负责所有与斗鱼服务器的 API 通信。
 * =================================================================================
 */
export const DouyuAPI = {
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
              const rooms = response.response.data.redBagList
                .map((item) => item.rid)
                .filter(Boolean)
                .slice(0, count * 2)
                .map((rid) => `https://www.douyu.com/${rid}`);
              Utils.log(`API 成功返回 ${rooms.length} 个房间URL。`);
              resolve(rooms);
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
   * 获取cookie
   * @param {string} cookieName - cookie名字
   * @returns {Promise<Object>} - 返回cookie对象
   */
  getCookie: function (cookieName) {
    return new Promise((resolve, reject) => {
      GM_cookie.list({ name: cookieName }, function (cookies, error) {
        if (error) {
          Utils.log(error);
          reject(error);
        } else if (cookies && cookies.length > 0) {
          resolve(cookies[0]);
        } else {
          resolve(null); // 未找到 cookie
        }
      });
    });
  },

  /**
   * 返回用户的金币历史列表
   * @param current - 当前页码
   * @param count - 返回数量单次获取不超过100
   * @param {string} rid - 当前房间的ID。
   * @param retries - 重试次数
   * @returns {Promise<Array<{
   *  balanceDiff: number,
   *  createTime: number,
   *  opDirection: number,
   *  remark: string
   * }>>}
   */
    getCoinRecord: function (current, count, rid, retries = SETTINGS.API_RETRY_COUNT) {
    return new Promise((resolve, reject) => {
            this.getCookie('acf_auth')
        .then((acfCookie) => {
          if (!acfCookie) {
                        Utils.log('获取cookie错误');
                        reject(new Error('获取cookie错误'));
            return;
          }

          const fullUrl = `${SETTINGS.COIN_LIST_URL}?current=${current}&pageSize=${count}&rid=${rid}`;
          const attempt = (remainingTries) => {
            Utils.log(
                            `开始调用 API 获取金币历史列表... (剩余重试次数: ${remainingTries})`
            );
            GM_xmlhttpRequest({
                            method: 'GET',
              url: fullUrl,
              headers: {
                                Referer: 'https://www.douyu.com/',
                                'User-Agent': navigator.userAgent,
              },
                            cookie: acfCookie['value'],
                            responseType: 'json',
              timeout: 10000,
              onload: (response) => {
                if (
                  response.status === 200 &&
                  response.response?.error === 0 &&
                  Array.isArray(response.response.data.list)
                ) {
                  const coinListData = response.response.data.list.filter(
                    (item) =>
                                            item.opDirection === 1 && item.remark.includes('红包')
                  );
                  Utils.log(`API 成功返回 ${coinListData.length} 个红包记录。`);
                  resolve(coinListData);
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
        })
        .catch((error) => {
          Utils.log(error);
          reject(error);
        });
    });
  },
};

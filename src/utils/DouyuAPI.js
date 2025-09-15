import { SETTINGS } from '../modules/SettingsManager';
import { Utils } from './utils';

/**
 * =================================================================================
 * 模块：斗鱼 API 客户端 (DouyuAPI)
 * ---------------------------------------------------------------------------------
 * 负责所有与斗鱼服务器的 API 通信。
 * =================================================================================
 */
export const DouyuAPI = {
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
                            const errorMsg = `API 数据格式错误或失败: ${response.response?.msg || '未知错误'}`;
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
        return new Promise(async (resolve, reject) => {
            const acfCookie = await this.getCookie('acf_auth');
            if (!acfCookie) {
                Utils.log('获取cookie错误');
                reject(new Error('获取cookie错误'));
                return;
            }

            const fullUrl = `${SETTINGS.COIN_LIST_URL}?current=${current}&pageSize=${count}&rid=${rid}`;
            const attempt = (remainingTries) => {
                Utils.log(`开始调用 API 获取金币历史列表... (剩余重试次数: ${remainingTries})`);
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
                                (item) => item.opDirection === 1 && item.remark.includes('红包')
                            );
                            Utils.log(`API 成功返回 ${coinListData.length} 个红包记录。`);
                            resolve(coinListData);
                        } else {
                            const errorMsg = `API 数据格式错误或失败: ${response.response?.msg || '未知错误'}`;
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
};

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
     * @param {number} [retries=SETTINGS.API_RETRY_COUNT] - 重试次数。
     * @returns {Promise<string[]>} - 房间链接数组。
     */
    getRooms(count, retries = SETTINGS.API_RETRY_COUNT) {
        return new Promise((resolve, reject) => {
            const attempt = (remainingTries) => {
                Utils.log(`开始调用 API 获取房间列表... (剩余重试次数: ${remainingTries})`);
                GM_xmlhttpRequest({
                    method: "GET",
                    url: SETTINGS.API_URL,
                    headers: { 'Referer': 'https://www.douyu.com/', 'User-Agent': navigator.userAgent },
                    responseType: "json",
                    timeout: 10000,
                    onload: (response) => {
                        if (response.status === 200 && response.response?.error === 0 && Array.isArray(response.response.data?.redBagList)) {
                            const rooms = response.response.data.redBagList
                            .map(item => item.rid).filter(Boolean)
                            .slice(0, count * 2)
                            .map(rid => `https://www.douyu.com/${rid}`);
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
                        const errorMsg = "API 请求超时";
                        Utils.log(errorMsg);
                        if (remainingTries > 0) retry(remainingTries - 1, errorMsg);
                        else reject(new Error(errorMsg));
                    }
                });
            };

            const retry = (remainingTries, reason) => {
                Utils.log(`${reason}，将在 ${SETTINGS.API_RETRY_DELAY / 1000} 秒后重试...`);
                setTimeout(() => attempt(remainingTries), SETTINGS.API_RETRY_DELAY);
            };

            attempt(retries);
        });
    }
};
import { SETTINGS } from '../modules/SettingsManager';

/**
 * =================================================================================
 * 模块：通用工具 (Utils)
 * ---------------------------------------------------------------------------------
 * 提供与业务逻辑无关的、可复用的辅助函数。
 * =================================================================================
 */
export const Utils = {
    /**
     * 打印带脚本前缀的日志。
     * @param {string} message - 要打印的消息。
     */
    log(message) {
        const logMsg = `${SETTINGS.SCRIPT_PREFIX} ${message}`;
        try {
            GM_log(logMsg);
        } catch (e) {
            console.log(logMsg);
        }
    },

    /**
     * 异步等待指定时间。
     * @param {number} ms - 等待的毫秒数。
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 获取指定范围内的随机延迟时间。
     * @param {number} [min=SETTINGS.MIN_DELAY] - 最小延迟。
     * @param {number} [max=SETTINGS.MAX_DELAY] - 最大延迟。
     */
    getRandomDelay(min = SETTINGS.MIN_DELAY, max = SETTINGS.MAX_DELAY) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 获取当前页面的房间号。
     * @returns {string|null} - 房间号或 null。
     */
    getCurrentRoomId() {
        const match = window.location.href.match(
            /douyu\.com\/(?:beta\/)?(?:topic\/[^?]+\?rid=|(\d+))/);
        return match ? (match[1] ||
            new URLSearchParams(window.location.search).get('rid')) : null;
    },

    /**
     * 将秒数格式化为 MM:SS 格式的字符串。
     * @param {number} totalSeconds - 总秒数。
     * @returns {string} - MM:SS 格式的时间。
     */
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const paddedMinutes = String(minutes).padStart(2, '0');
        const paddedSeconds = String(seconds).padStart(2, '0');
        return `${paddedMinutes}:${paddedSeconds}`;
    },

    /**
     * 获取当前北京时间 (UTC+8) 的 Date 对象
     * @returns {Date} - 当前北京时间的 Date 对象
     */
    getBeijingTime() {
        const now = new Date();
        const utcMillis = now.getTime(); // 获取当前时间的UTC毫秒时间戳
        const beijingMillis = utcMillis + (8 * 60 * 60 * 1000); // 加上8小时的毫秒数
        return new Date(beijingMillis);
    },

    /**
     * 将一个Date对象视为UTC时间，并格式化为 YYYY-MM-DD 的日期字符串。
     * @param {Date} date - 任何Date对象
     * @returns {string} - YYYY-MM-DD 格式的日期
     */
    formatDateAsBeijing(date) {
        // 先将传入的任何时区的date对象转为北京时间的date对象
        const beijingDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));

        // 然后从这个新的date对象中，按UTC标准提取年月日
        const year = beijingDate.getUTCFullYear();
        const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(beijingDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
};
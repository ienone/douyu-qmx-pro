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
        return new Promise((resolve) => setTimeout(resolve, ms));
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
     * @returns {string|null} - 房间ID或null。
     */
    getCurrentRoomId() {
        const url = window.location.href;
        // 优先匹配 /12345 这样的标准直播间
        let match = url.match(/douyu\.com\/(?:beta\/)?(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        // 其次匹配 topic/xyz?rid=12345 这样的活动页
        match = url.match(/rid=(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
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
        const beijingMillis = utcMillis + 8 * 60 * 60 * 1000; // 加上8小时的毫秒数
        return new Date(beijingMillis);
    },

    /**
     * 将一个Date对象视为UTC时间，并格式化为 YYYY-MM-DD 的日期字符串。
     * @param {Date} date - 任何Date对象
     * @returns {string} - YYYY-MM-DD 格式的日期
     */
    formatDateAsBeijing(date) {
        // 先将传入的任何时区的date对象转为北京时间的date对象
        const beijingDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);

        // 然后从这个新的date对象中，按UTC标准提取年月日
        const year = beijingDate.getUTCFullYear();
        const month = String(beijingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(beijingDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 防冲突锁机制
     * @param {string} lockKey - 在油猴中本地保存的键 key
     * @param {function} callback - 回调函数发现有锁时延迟回调
     * @param args - 回调函数的参数
     * @returns {boolean} - 返回值为true时继续执行
     */
    lockChecker: function (lockKey, callback, ...args) {
        if (GM_getValue(lockKey, false)) {
            // 如果发现有锁，则延迟50毫秒后重试
            setTimeout(() => callback(...args), 50);
            return false;
        }
        return true;
    },

    /**
     * 安全地使用锁写入本地存储
     * @param {string} lockKey - 锁定键
     * @param {string} storageKey - 目标存储键
     * @param {*} value - 要存储的值
     * @param {string} nickname - 操作昵称，用于日志
     */
    setLocalValueWithLock: function (lockKey, storageKey, value, nickname) {
        try {
            // 上锁
            GM_setValue(lockKey, true);
            // 执行写入操作
            GM_setValue(storageKey, value);
        } catch (e) {
            Utils.log(`[${nickname}-写] 严重错误：GM_setValue 写入失败！ 错误信息: ${e.message}`);
        } finally {
            // 无论成功与否，最后都要解锁
            GM_setValue(lockKey, false);
        }
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 防抖延迟时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} delay - 节流延迟时间
     * @returns {Function} 节流后的函数
     */
    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * 检查是否在斗鱼直播间页面
     * @returns {boolean} 是否在直播间页面
     */
    isInLiveRoom() {
        const roomId = this.getCurrentRoomId();
        return roomId !== null && document.querySelector('[data-v-5aa519d2]'); // 斗鱼聊天区域特征
    },

    /**
     * 获取元素的绝对位置
     * @param {HTMLElement} element - 目标元素
     * @returns {object} 包含 x, y, width, height 的位置信息
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    },

    /**
     * 安全地执行函数，捕获异常
     * @param {Function} func - 要执行的函数
     * @param {string} context - 执行上下文（用于错误日志）
     * @returns {*} 函数执行结果或 null
     */
    safeExecute(func, context = 'unknown') {
        try {
            return func();
        } catch (error) {
            this.log(`执行函数时出错 [${context}]: ${error.message}`, 'error');
            return null;
        }
    },

    /**
     * 生成唯一ID
     * @param {string} prefix - ID前缀
     * @returns {string} 唯一ID
     */
    generateId(prefix = 'dda') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
};

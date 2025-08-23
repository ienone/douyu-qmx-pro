// ==UserScript==
// @name         斗鱼全民星推荐自动领取pro
// @namespace    http://tampermonkey.net/
// @version      2.0.6
// @description  原版《斗鱼全民星推荐自动领取》的增强版(应该增强了……)在保留核心功能的基础上，引入了可视化管理面板。
// @author       ienone
// @original-author ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)
// @match        *://www.douyu.com/*
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_log
// @grant        GM_xmlhttpRequest
// @connect      list-www.douyu.com
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';


    // --- HackTimer.js Inlined Code Start ---
    // 这段代码的作用是重写系统的计时器，以避免浏览器在后台标签页降低其运行频率。
    // https://cdn.jsdelivr.net/gh/turuslan/HackTimer/HackTimer.js
    (function (workerScript) {
        try {
            var blob = new Blob (["\
    var fakeIdToId = {};\
    onmessage = function (event) {\
        var data = event.data,\
            name = data.name,\
            fakeId = data.fakeId,\
            time;\
        if(data.hasOwnProperty('time')) {\
            time = data.time;\
        }\
        switch (name) {\
            case 'setInterval':\
                fakeIdToId[fakeId] = setInterval(function () {\
                    postMessage({fakeId: fakeId});\
                }, time);\
                break;\
            case 'clearInterval':\
                if (fakeIdToId.hasOwnProperty (fakeId)) {\
                    clearInterval(fakeIdToId[fakeId]);\
                    delete fakeIdToId[fakeId];\
                }\
                break;\
            case 'setTimeout':\
                fakeIdToId[fakeId] = setTimeout(function () {\
                    postMessage({fakeId: fakeId});\
                    if (fakeIdToId.hasOwnProperty (fakeId)) {\
                        delete fakeIdToId[fakeId];\
                    }\
                }, time);\
                break;\
            case 'clearTimeout':\
                if (fakeIdToId.hasOwnProperty (fakeId)) {\
                    clearTimeout(fakeIdToId[fakeId]);\
                    delete fakeIdToId[fakeId];\
                }\
                break;\
        }\
    }\
    "]);
            // Obtain a blob URL reference to our worker 'file'.
            workerScript = window.URL.createObjectURL(blob);
        } catch (error) {
            /* Blob is not supported, use external script instead */
        }
        var worker,
            fakeIdToCallback = {},
            lastFakeId = 0,
            maxFakeId = 0x7FFFFFFF, // 2 ^ 31 - 1, 31 bit, positive values of signed 32 bit integer
            logPrefix = 'HackTimer.js by turuslan: ';
        if (typeof (Worker) !== 'undefined') {
            function getFakeId () {
                do {
                    if (lastFakeId == maxFakeId) {
                        lastFakeId = 0;
                    } else {
                        lastFakeId ++;
                    }
                } while (fakeIdToCallback.hasOwnProperty (lastFakeId));
                return lastFakeId;
            }
            try {
                worker = new Worker (workerScript);
                window.setInterval = function (callback, time /* , parameters */) {
                    var fakeId = getFakeId ();
                    fakeIdToCallback[fakeId] = {
                        callback: callback,
                        parameters: Array.prototype.slice.call(arguments, 2)
                    };
                    worker.postMessage ({
                        name: 'setInterval',
                        fakeId: fakeId,
                        time: time
                    });
                    return fakeId;
                };
                window.clearInterval = function (fakeId) {
                    if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                        delete fakeIdToCallback[fakeId];
                        worker.postMessage ({
                            name: 'clearInterval',
                            fakeId: fakeId
                        });
                    }
                };
                window.setTimeout = function (callback, time /* , parameters */) {
                    var fakeId = getFakeId ();
                    fakeIdToCallback[fakeId] = {
                        callback: callback,
                        parameters: Array.prototype.slice.call(arguments, 2),
                        isTimeout: true
                    };
                    worker.postMessage ({
                        name: 'setTimeout',
                        fakeId: fakeId,
                        time: time
                    });
                    return fakeId;
                };
                window.clearTimeout = function (fakeId) {
                    if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                        delete fakeIdToCallback[fakeId];
                        worker.postMessage ({
                            name: 'clearTimeout',
                            fakeId: fakeId
                        });
                    }
                };
                worker.onmessage = function (event) {
                    var data = event.data,
                        fakeId = data.fakeId,
                        request,
                        parameters,
                        callback;
                    if (fakeIdToCallback.hasOwnProperty(fakeId)) {
                        request = fakeIdToCallback[fakeId];
                        callback = request.callback;
                        parameters = request.parameters;
                        if (request.hasOwnProperty ('isTimeout') && request.isTimeout) {
                            delete fakeIdToCallback[fakeId];
                        }
                    }
                    if (typeof (callback) === 'string') {
                        try {
                            callback = new Function (callback);
                        } catch (error) {
                            console.log (logPrefix + 'Error parsing callback code string: ', error);
                        }
                    }
                    if (typeof (callback) === 'function') {
                        callback.apply (window, parameters);
                    }
                };
                worker.onerror = function (event) {
                    console.log (event);
                };
                console.log (logPrefix + 'Initialisation succeeded');
            } catch (error) {
                console.log (logPrefix + 'Initialisation failed');
                console.error (error);
            }
        } else {
            console.log (logPrefix + 'Initialisation failed - HTML5 Web Worker is not supported');
        }
    }) ('HackTimerWorker.js');

    /**
     * =================================================================================
     * 模块：配置 (CONFIG)
     * ---------------------------------------------------------------------------------
     * 存储所有硬编码的、不应在运行时改变的常量和设置。
     * 未来设置界面的功能就是读取和修改这个模块中的值。
     * =================================================================================
     */
    const CONFIG = {
        // --- 核心标识 ---
        SCRIPT_PREFIX: "[全民星推荐助手]", // 脚本在控制台输出日志时使用的前缀，便于识别和过滤。
        CONTROL_ROOM_ID: "6657", // 控制室的房间号，只有在此房间页面，脚本的控制面板UI才会加载。
        TEMP_CONTROL_ROOM_RID: "6979222", // 备用的控制室房间号（例如斗鱼官方活动页的RID），用于兼容特殊页面。

        // --- 时间控制 (ms) ---
        POPUP_WAIT_TIMEOUT: 20000, // 点击红包后，等待领取弹窗出现的最长超时时间。
        PANEL_WAIT_TIMEOUT: 10000, // 查找通用UI面板或元素、等待失联的默认等待超时时间。
        ELEMENT_WAIT_TIMEOUT: 30000, // 等待播放器加载完成的超时时间，用以判断页面是否可用。
        RED_ENVELOPE_LOAD_TIMEOUT: 15000, // 在工作标签页中，等待右下角红包活动区域加载的超时时间。
        MIN_DELAY: 1000, // 模拟人类操作的随机延迟时间范围的最小值，用于点击等操作，避免行为过于机械。
        MAX_DELAY: 2500, // 模拟人类操作的随机延迟时间范围的最大值。
        CLOSE_TAB_DELAY: 1500, // 旧标签页在打开新标签页后，等待多久再关闭自己，以确保新页面已成功接管任务。
        INITIAL_SCRIPT_DELAY: 3000, // 页面加载完成后，脚本延迟多久再开始执行，以避开页面初始化时的高资源占用期。
        UNRESPONSIVE_TIMEOUT: 15 * 60 * 1000, // 工作标签页多久未向控制中心汇报心跳后，在面板上被标记为“无响应”状态。
        SWITCHING_CLEANUP_TIMEOUT: 30000, // 处于“切换中”状态的标签页，超过此时间后将被自动清理，防止卡死。
        HEALTHCHECK_INTERVAL: 10000, // 工作页中，哨兵检查UI倒计时的时间间隔。
        DISCONNECTED_GRACE_PERIOD: 10000, // 已断开的标签页在被清理前，等待其重连的宽限时间。

        // --- UI 与交互 ---
        DRAGGABLE_BUTTON_ID: 'douyu-qmx-starter-button', // 主悬浮按钮的HTML ID。
        BUTTON_POS_STORAGE_KEY: 'douyu_qmx_button_position', // 用于在油猴存储中记录主悬浮按钮位置的键名。
        MODAL_DISPLAY_MODE: 'floating', // 控制面板的显示模式。可选值: 'floating'(浮动窗口), 'centered'(屏幕居中), 'inject-rank-list'(注入到排行榜)。

        // --- API 相关 ---
        API_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list", // 获取可领取红包直播间列表的官方API地址。
        API_RETRY_COUNT: 3, // API请求失败时的最大重试次数。
        API_RETRY_DELAY: 5000, // 每次API请求重试之间的等待时间。

        // --- 业务逻辑配置 ---
        MAX_WORKER_TABS: 24, // 允许同时运行的最大工作标签页（直播间）数量。
        DAILY_LIMIT_ACTION: 'CONTINUE_DORMANT', // 当达到每日领取上限时的处理策略。可选值: 'STOP_ALL'(停止所有任务), 'CONTINUE_DORMANT'(进入休眠等待第二天)。
        AUTO_PAUSE_ENABLED: true, // 是否启用在工作标签页中自动暂停视频播放的功能，以节省系统资源。
        AUTO_PAUSE_DELAY_AFTER_ACTION: 5000, // 在执行领取等操作后，需要等待多久才能再次尝试自动暂停视频。

        // --- 存储键名 ---
        STATE_STORAGE_KEY: 'douyu_qmx_dashboard_state', // 用于在油猴存储中记录脚本核心状态（如所有工作标签页信息）的键名。
        DAILY_LIMIT_REACHED_KEY: 'douyu_qmx_daily_limit_reached', // 用于在油猴存储中记录“每日上限”状态的键名。

        // --- UI 与 API ---
        DEFAULT_THEME : 'dark',
        INJECT_TARGET_RETRIES: 10, // 在“注入模式”下，尝试寻找并注入UI到侧边栏排行榜的重试次数。
        INJECT_TARGET_INTERVAL: 500, // 每次尝试注入UI到侧边栏之间的间隔时间。
        API_ROOM_FETCH_COUNT: 10, // 单次调用API时，期望获取的直播间数量建议值。
        UI_FEEDBACK_DELAY: 2000, // UI上临时反馈信息（如“无新房间”）的显示时长。
        DRAG_BUTTON_DEFAULT_PADDING: 20, // 主悬浮按钮距离屏幕边缘的默认像素间距。

        // --- 选择器 ---
        // 存储所有脚本需要操作的页面元素的CSS选择器，便于统一管理和修改。
        SELECTORS: {
            redEnvelopeContainer: "#layout-Player-aside div.LiveNewAnchorSupportT-enter", // 右下角红包活动的总容器。
            countdownTimer: "span.LiveNewAnchorSupportT-enter--bottom", // 红包容器内显示倒计时的元素。
            popupModal: "body > div.LiveNewAnchorSupportT-pop", // 点击红包后弹出的主模态框（弹窗）。
            openButton: "div.LiveNewAnchorSupportT-singleBag--btnOpen", // 弹窗内的“开”或“抢”按钮。
            closeButton: "div.LiveNewAnchorSupportT-pop--close", // 领取奖励后，弹窗上的关闭按钮。
            criticalElement: "#js-player-video", // 用于判断页面是否加载成功的关键元素（如此处的视频播放器）。
            pauseButton: "div.pause-c594e8:not(.removed-9d4c42)", // 播放器上的暂停按钮。
            playButton: "div.play-8dbf03:not(.removed-9d4c42)", // 播放器上的播放按钮。
            rewardSuccessIndicator: ".LiveNewAnchorSupportT-singleBagOpened", // 成功状态的弹窗
            limitReachedPopup: "div.dy-Message-custom-content.dy-Message-info", // 斗鱼官方弹出的“今日已达上限”的提示信息元素。
            rankListContainer: "#layout-Player-aside > div.layout-Player-asideMainTop > div.layout-Player-rank", // 在“注入模式”下，用作UI注入目标的侧边栏排行榜容器。
            anchorName: "div.Title-anchorName > h2.Title-anchorNameH2", // 直播间页面中显示主播昵称的元素。
        }
    };

    /**
     * =================================================================================
     * 模块：设置管理器 (SettingsManager)
     * ---------------------------------------------------------------------------------
     * 负责加载、合并和保存用户配置。
     * =================================================================================
     */
    const SettingsManager = {
        STORAGE_KEY: 'douyu_qmx_user_settings',

        /**
         * 获取最终的运行时配置。
         * 它会加载用户保存的设置，并用其覆盖默认的 CONFIG。
         * @returns {object} - 合并后的配置对象。
         */
        get() {
            const userSettings = GM_getValue(this.STORAGE_KEY, {});
            const themeSetting = GM_getValue('douyu_qmx_theme', CONFIG.DEFAULT_THEME);

            // 合并用户设置，并强制包含主题设置
            const finalSettings = Object.assign({}, CONFIG, userSettings, { THEME: themeSetting });
            return finalSettings;
        },

        /**
         * 保存用户的自定义设置。
         * @param {object} settingsToSave - 只包含用户修改过的设置的对象。
         */
        save(settingsToSave) {
            // 在保存时，将主题设置单独存储，因为它需要实时应用
            const theme = settingsToSave.THEME;
            delete settingsToSave.THEME;
            GM_setValue('douyu_qmx_theme', theme);

            GM_setValue(this.STORAGE_KEY, settingsToSave);
        },

        /**
         * 重置为默认设置。
         */
        reset() {
            GM_deleteValue(this.STORAGE_KEY);
            GM_deleteValue('douyu_qmx_theme'); // 重置主题设置
        }
    };

    /**
     * =================================================================================
     * 运行时配置 (SETTINGS)
     * ---------------------------------------------------------------------------------
     * 脚本实际使用的配置对象，合并用户设置。
     * =================================================================================
     */
    const SETTINGS = SettingsManager.get();
    SETTINGS.THEME = GM_getValue('douyu_qmx_theme', SETTINGS.DEFAULT_THEME);
    /**
     * =================================================================================
     * 模块：运行时状态 (STATE)
     * ---------------------------------------------------------------------------------
     * 存储脚本运行期间会动态变化的变量。
     * =================================================================================
     */
    const STATE = {
        isSwitchingRoom: false,
        lastActionTime: 0,
    };

    /**
     * =================================================================================
     * 模块：通用工具 (Utils)
     * ---------------------------------------------------------------------------------
     * 提供与业务逻辑无关的、可复用的辅助函数。
     * =================================================================================
     */
    const Utils = {
        /**
         * 打印带脚本前缀的日志。
         * @param {string} message - 要打印的消息。
         */
        log(message) {
            const logMsg = `${SETTINGS.SCRIPT_PREFIX} ${message}`;
            GM_log(logMsg);
            console.log(logMsg);
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
            const match = window.location.href.match(/douyu\.com\/(?:beta\/)?(?:topic\/[^?]+\?rid=|(\d+))/);
            return match ? (match[1] || new URLSearchParams(window.location.search).get('rid')) : null;
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

    /**
     * =================================================================================
     * 模块：主题管理器 (ThemeManager)
     * ---------------------------------------------------------------------------------
     */
    const ThemeManager = {
        /**
         * 将主题应用到 body 元素上。
         * @param {string} theme - 'light' or 'dark'.
         */
        applyTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            // 也更新 SETTINGS 对象，以便脚本内部逻辑知道当前主题
            SETTINGS.THEME = theme;
            GM_setValue('douyu_qmx_theme', theme);
        }
    };

    /**
     * =================================================================================
     * 模块：跨页面状态管理器 (GlobalState)
     * ---------------------------------------------------------------------------------
     * 封装所有对 GM_setValue 和 GM_getValue 的操作，用于页面间通信。
     * 增加了详细的日志输出，用于追踪数据流。
     * =================================================================================
     */
    const GlobalState = {
        /**
         * 获取完整的共享状态对象。
         * @returns {{tabs: object, rewards: Array, command: object|null}} - 共享状态。
         */
        get() {
            const state = GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tabs: {} });
            // 日志：记录每次读取操作，以及读取到了什么
            return state;
        },

        /**
         * 保存完整的共享状态对象。
         * @param {object} state - 要保存的状态。
         */
        set(state) {

            // --- 防冲突锁机制 ---
            const lockKey = 'douyu_qmx_state_lock';
            if (GM_getValue(lockKey, false)) {
                // 如果发现有锁，则延迟50毫秒后重试，避免冲突
                setTimeout(() => this.set(state), 50);
                return;
            }

            try {
                // 上锁
                GM_setValue(lockKey, true);

                // 执行写入操作
                GM_setValue(SETTINGS.STATE_STORAGE_KEY, state);
            } catch (e) {
                Utils.log(`[全局状态-写] 严重错误：GM_setValue 写入失败！ 错误信息: ${e.message}`);
            } finally {
                // 无论成功与否，最后都要解锁
                GM_setValue(lockKey, false);
            }
        },

        /**
         * 更新单个工作标签页的状态，支持附加数据
         * @param {string} roomId - 房间ID。
         * @param {string} status - 状态标识。
         * @param {string} statusText - 状态描述文本。
         * @param {object} [options={}] - 可选的附加数据，如 { nickname: '主播名' }。
         */
        updateWorker(roomId, status, statusText, options = {}) {
            if (!roomId) return;

            const state = this.get();
            const oldTabData = state.tabs[roomId] || {};

            // --- 状态流转逻辑补丁 ---
            if (status === 'DISCONNECTED' && oldTabData.status === 'SWITCHING') {
                Utils.log(`[状态管理] 检测到正在切换的标签页已断开连接，判定为成功关闭，立即清理。`);
                this.removeWorker(roomId); // 直接调用清理函数
                return; // 任务完成，提前退出
            }

            // 1. 创建一个包含所有新数据的临时对象
            const updates = {
                status,
                statusText,
                lastUpdateTime: Date.now(),
                ...options
            };

            // 2. 将旧数据和新数据合并到一个全新的对象中
            const newTabData = { ...oldTabData, ...updates };

            // 3. 在这个新对象上清理所有值为 null 的键
            for (const key in newTabData) {
                if (newTabData[key] === null) {
                    delete newTabData[key];
                }
            }

            // 4. 将处理干净的新对象赋给状态树
            state.tabs[roomId] = newTabData;

            this.set(state);
        },

        /**
         * 从状态中移除一个工作标签页。
         * @param {string} roomId - 房间ID。
         */
        removeWorker(roomId) {
            if (!roomId) return;
            const state = this.get();
            delete state.tabs[roomId];
            this.set(state);
        },

        /**
         * 设置每日上限状态。
         * @param {boolean} reached - 是否已达到上限。
         */
        setDailyLimit(reached) {
             GM_setValue(SETTINGS.DAILY_LIMIT_REACHED_KEY, { reached, timestamp: Date.now() });
        },

        /**
         * 获取每日上限状态。
         * @returns {{reached: boolean, timestamp: number}|undefined}
         */
        getDailyLimit() {
            return GM_getValue(SETTINGS.DAILY_LIMIT_REACHED_KEY);
        }
    };

    /**
     * =================================================================================
     * 模块：斗鱼 API 客户端 (DouyuAPI)
     * ---------------------------------------------------------------------------------
     * 负责所有与斗鱼服务器的 API 通信。
     * =================================================================================
     */
    const DouyuAPI = {
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

    /**
     * =================================================================================
     * 模块：DOM 操作 (DOM)
     * ---------------------------------------------------------------------------------
     * 封装所有查找、点击和操作页面元素的方法。
     * =================================================================================
     */
    const DOM = {
        /**
         * 异步查找一个元素，直到超时。
         * @param {string} selector - CSS选择器。
         * @param {number} [timeout=SETTINGS.PANEL_WAIT_TIMEOUT] - 超时时间。
         * @param {Document|HTMLElement} [parent=document] - 父元素。
         * @returns {Promise<HTMLElement|null>} - 找到的元素或 null。
         */
        async findElement(selector, timeout = SETTINGS.PANEL_WAIT_TIMEOUT, parent = document) {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const element = parent.querySelector(selector);
                if (element && window.getComputedStyle(element).display !== 'none') {
                    return element;
                }
                await Utils.sleep(300);
            }
            Utils.log(`查找元素超时: ${selector}`);
            return null;
        },

        /**
         * 安全地模拟点击一个元素。
         * @param {HTMLElement|null} element - 要点击的元素。
         * @param {string} description - 元素描述，用于日志。
         * @returns {Promise<boolean>} - 是否点击成功。
         */
        async safeClick(element, description) {
            if (!element) {
                return false;
            }
            try {
                if (window.getComputedStyle(element).display === 'none') {
                     return false;
                }
                await Utils.sleep(Utils.getRandomDelay(SETTINGS.MIN_DELAY / 2, SETTINGS.MAX_DELAY / 2));
                element.click();
                await Utils.sleep(Utils.getRandomDelay());
                return true;
            } catch (error) {
                Utils.log(`[点击异常] ${description} 时发生错误: ${error.message}`);
                return false;
            }
        },

        /**
         * 检查是否存在每日上限弹窗。
         * @returns {Promise<boolean>}
         */
        async checkForLimitPopup() {
            const limitPopup = await this.findElement(SETTINGS.SELECTORS.limitReachedPopup, 3000);
            if (limitPopup && limitPopup.textContent.includes('已达上限')) {
                 Utils.log("捕获到“已达上限”弹窗！");
                 return true;
            }
            return false;
        }
    };

    /**
     * =================================================================================
     * 模块：工作页面 (WorkerPage)
     * ---------------------------------------------------------------------------------
     * 负责在直播间页面执行所有自动化任务。
     * =================================================================================
     */
    const WorkerPage = {

        // 新增属性，用于管理哨兵定时器
        healthCheckTimeoutId: null,
        currentTaskEndTime: null, 
        lastHealthCheckTime: null,
        lastPageCountdown: null,
        stallLevel: 0,
        /**
         * 在后台非阻塞地查找并点击“返回旧版”按钮。
         * 这是一个可选操作，不阻塞主初始化流程。
         */

        /**
         * 工作页面的总入口和初始化函数。
         */
        async init() {
            Utils.log("混合模式工作单元初始化...");
            const roomId = Utils.getCurrentRoomId();
            if (!roomId) {
                Utils.log("无法识别当前房间ID，脚本停止。");
                return;
            }
            GlobalState.updateWorker(roomId, 'OPENING', '页面加载中...', { countdown: null, nickname: null });

            await Utils.sleep(1000);

            // 保留命令轮询器，以便接收来自控制面板的“关闭”指令
            this.startCommandListener(roomId);

            // 页面关闭前的清理工作
            window.addEventListener('beforeunload', () => {
                // GlobalState.removeWorker(roomId);
                GlobalState.updateWorker(Utils.getCurrentRoomId(), 'DISCONNECTED', '连接已断开...');
                // 确保在关闭时清理我们的“暂停哨兵”定时器
                if (this.pauseSentinelInterval) {
                    clearInterval(this.pauseSentinelInterval);
                }
            });

            // 等待页面关键元素加载完成
            Utils.log("正在等待页面关键元素 (#js-player-video) 加载...");
            const criticalElement = await DOM.findElement(SETTINGS.SELECTORS.criticalElement, SETTINGS.ELEMENT_WAIT_TIMEOUT);
            if (!criticalElement) {
                Utils.log("页面关键元素加载超时，此标签页可能无法正常工作，即将关闭。");
                await this.selfClose(roomId);
                return;
            }
            Utils.log("页面关键元素已加载。");

            Utils.log("开始检测 UI 版本 和红包活动...");
            if (window.location.href.includes('/beta')){
                // --- 找到了“/beta”，说明是新版UI ---
                GlobalState.updateWorker(roomId, 'OPENING', '切换旧版UI...');
                localStorage.setItem("newWebLive", "A");
                window.location.href = window.location.href.replace("/beta", "")
            }
            Utils.log("确认进入稳定工作状态，执行身份核销。");
            const pendingWorkers = GM_getValue('qmx_pending_workers', []);
            const myIndex = pendingWorkers.indexOf(roomId);
            if (myIndex > -1) {
                pendingWorkers.splice(myIndex, 1);
                GM_setValue('qmx_pending_workers', pendingWorkers);
                Utils.log(`房间 ${roomId} 已从待处理列表中移除。`);
            }
            const anchorNameElement = document.querySelector(SETTINGS.SELECTORS.anchorName);
            const nickname = anchorNameElement ? anchorNameElement.textContent.trim() : `房间${roomId}`;
            GlobalState.updateWorker(roomId, 'WAITING', '寻找任务中...', { nickname, countdown: null });
            
            // 检查每日上限
            const limitState = GlobalState.getDailyLimit();
            if (limitState?.reached) {
                Utils.log("初始化检查：检测到全局上限旗标。");
                if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                    await this.enterDormantMode();
                } else {
                    await this.selfClose(roomId);
                }
                return;
            }

            this.findAndExecuteNextTask(roomId); // 直接进入任务流程

            if (SETTINGS.AUTO_PAUSE_ENABLED) {
                this.pauseSentinelInterval = setInterval(() => this.autoPauseVideo(), 8000);
            }
        },

        async findAndExecuteNextTask(roomId) {
            // 在每次寻找新任务时，确保取消上一个任务的哨兵
            if (this.healthCheckTimeoutId) {
                clearTimeout(this.healthCheckTimeoutId);
                this.healthCheckTimeoutId = null;
            }
            // 为每个新任务重置卡顿等级
            this.stallLevel = 0;

            if (SETTINGS.AUTO_PAUSE_ENABLED) this.autoPauseVideo();

            const redEnvelopeDiv = await DOM.findElement(SETTINGS.SELECTORS.redEnvelopeContainer, SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT);

            if (!redEnvelopeDiv) {
                GlobalState.updateWorker(roomId, 'SWITCHING', '无活动, 切换中', { countdown: null });
                await this.switchRoom();
                return;
            }

            const statusSpan = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
            const statusText = statusSpan ? statusSpan.textContent.trim() : '';

            if (statusText.includes(':')) {
                const [minutes, seconds] = statusText.split(':').map(Number);
                const remainingSeconds = (minutes * 60 + seconds);
                this.currentTaskEndTime = Date.now() + remainingSeconds * 1000;

                // 为新的哨兵逻辑设置初始状态
                this.lastHealthCheckTime = Date.now();
                this.lastPageCountdown = remainingSeconds;

                Utils.log(`发现新任务：倒计时 ${statusText}。`);
                GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${statusText}`, { countdown: { endTime: this.currentTaskEndTime } });

                const wakeUpDelay = Math.max(0, (remainingSeconds * 1000) - 1500);
                Utils.log(`本单元将在约 ${Math.round(wakeUpDelay / 1000)} 秒后唤醒执行任务。`);
                setTimeout(() => this.claimAndRecheck(roomId), wakeUpDelay);

                this.startHealthChecks(roomId, redEnvelopeDiv);

            } else if (statusText.includes('抢') || statusText.includes('领')) {
                GlobalState.updateWorker(roomId, 'CLAIMING', '立即领取中...');
                await this.claimAndRecheck(roomId);
            } else {
                GlobalState.updateWorker(roomId, 'WAITING', `状态未知, 稍后重试`, { countdown: null });
                setTimeout(() => this.findAndExecuteNextTask(roomId), 30000);
            }
        },


        /**
         * 哨兵观察链。
         * 信任首次获取的倒计时和由HackTimer驱动的主定时器。
         * 哨兵只对比UI和脚本计时器的差异，并报告UI是否被“节流”(显示为STALLED)，但不修改核心的 `currentTaskEndTime`。
         */
        startHealthChecks(roomId, redEnvelopeDiv) {
            const CHECK_INTERVAL = SETTINGS.HEALTHCHECK_INTERVAL;
            const STALL_THRESHOLD = 4;    // UI显示与脚本计时允许的最大偏差

            const check = () => {
                const currentPageStatus = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer)?.textContent.trim();
                
                if (!currentPageStatus || !currentPageStatus.includes(':')) {
                    return; // UI消失，观察结束
                }

                // 1. 计算脚本的精确剩余时间 (这是我们的“真实”时间)
                const scriptRemainingSeconds = (this.currentTaskEndTime - Date.now()) / 1000;
                
                // 2. 获取页面UI显示的剩余时间 (这是“可能不准”的显示时间)
                const [pMin, pSec] = currentPageStatus.split(':').map(Number);
                const pageRemainingSeconds = pMin * 60 + pSec;
                
                // 3. 计算两者偏差
                const deviation = Math.abs(scriptRemainingSeconds - pageRemainingSeconds);
                
                const currentFormattedTime = Utils.formatTime(scriptRemainingSeconds);

                // 4. 根据偏差，只更新“状态”，不改变“核心计时”
                if (deviation > STALL_THRESHOLD) {
                    if (this.stallLevel === 0) { // 只在第一次检测到卡顿时记录日志
                        Utils.log(`[哨兵] 检测到UI节流。脚本精确倒计时: ${currentFormattedTime} | UI显示: ${Utils.formatTime(pageRemainingSeconds)}`);
                    }
                    this.stallLevel = 1;
                    // [关键] 只更新状态为STALLED，但countdown依然使用我们精确的endTime
                    GlobalState.updateWorker(roomId, 'STALLED', `UI节流中...`, { countdown: { endTime: this.currentTaskEndTime } });
                } else {
                    if (this.stallLevel > 0) {
                        Utils.log('[哨兵] UI已从节流中恢复。');
                        this.stallLevel = 0;
                    }
                    GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${currentFormattedTime}`, { countdown: { endTime: this.currentTaskEndTime } });
                }
                
                // 5. 只要我们的精确计时器没到终点，就继续观察
                if (scriptRemainingSeconds > (CHECK_INTERVAL / 1000) + 1) {
                    this.healthCheckTimeoutId = setTimeout(check, CHECK_INTERVAL);
                }
            };

            this.healthCheckTimeoutId = setTimeout(check, CHECK_INTERVAL);
        },



        /**
         * 处理点击红包后的弹窗逻辑。
         */
        async claimAndRecheck(roomId) {

            if (this.healthCheckTimeoutId) {
                clearTimeout(this.healthCheckTimeoutId);
                this.healthCheckTimeoutId = null;
            }

            Utils.log("开始执行领取流程...");
            GlobalState.updateWorker(roomId, 'CLAIMING', '尝试打开红包...', { countdown: null });

            const redEnvelopeDiv = document.querySelector(SETTINGS.SELECTORS.redEnvelopeContainer);
            if (!await DOM.safeClick(redEnvelopeDiv, "右下角红包区域")) {
                Utils.log("点击红包区域失败，重新寻找任务。");
                await Utils.sleep(2000);
                this.findAndExecuteNextTask(roomId);
                return;
            }

            const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, SETTINGS.POPUP_WAIT_TIMEOUT);
            if (!popup) {
                Utils.log("等待红包弹窗超时，重新寻找任务。");
                await Utils.sleep(2000);
                this.findAndExecuteNextTask(roomId);
                return;
            }

            const openBtn = popup.querySelector(SETTINGS.SELECTORS.openButton);
            if (await DOM.safeClick(openBtn, "红包弹窗的打开按钮")) {
                // 检查是否触发上限
                if (await DOM.checkForLimitPopup()) {
                    GlobalState.setDailyLimit(true);
                    Utils.log("检测到每日上限！");
                    if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                        await this.enterDormantMode();
                    } else {
                        await this.selfClose(roomId);
                    }
                    return; // 达到上限，终止任务链
                }

                await Utils.sleep(1500); // 等待奖励动画
                // 不再查找具体的奖励文本，而是查找代表“成功”的容器
                const successIndicator = await DOM.findElement(
                    SETTINGS.SELECTORS.rewardSuccessIndicator,
                    3000,
                    popup
                );

                // 根据是否找到成功标志来确定奖励信息
                const reward = successIndicator ? '领取成功 ' : '空包或失败';
                Utils.log(`领取操作完成，结果: ${reward}`);

                GlobalState.updateWorker(roomId, 'WAITING', `领取到: ${reward}`, { countdown: null });
                const closeBtn = document.querySelector(SETTINGS.SELECTORS.closeButton);
                await DOM.safeClick(closeBtn, "领取结果弹窗的关闭按钮");
            } else {
                 Utils.log("点击打开按钮失败。");
            }

            STATE.lastActionTime = Date.now();

            // 核心：无论成功与否，等待后都回到起点，寻找下一个任务
            Utils.log("操作完成，2秒后在本房间内寻找下一个任务...");
            await Utils.sleep(2000);
            this.findAndExecuteNextTask(roomId);
        },

        /**
         * 自动暂停视频播放。
         */
        async autoPauseVideo() {
            if ( STATE.isSwitchingRoom || Date.now() - STATE.lastActionTime < SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION) {
                return;
            }

            // 使用 DOM.findElement 替换 querySelector，给它5秒的等待时间
            Utils.log("正在寻找暂停按钮...");
            const pauseBtn = await DOM.findElement(SETTINGS.SELECTORS.pauseButton, 5000);

            if (pauseBtn) {
                // Utils.log("检测到视频正在播放，尝试自动暂停...");
                if (await DOM.safeClick(pauseBtn, "暂停按钮")) {
                    Utils.log("视频已通过脚本暂停。"); // 只有这里出现，才代表真的成功了
                }
            } else {
                // Utils.log("在5秒内未找到暂停按钮，可能视频未播放或已暂停。");
            }
        },

        /**
         * 切换到新的直播间。
         */
        async switchRoom() {

            if (this.healthCheckTimeoutId) {
                clearTimeout(this.healthCheckTimeoutId);
                this.healthCheckTimeoutId = null;
            }

            if (STATE.isSwitchingRoom) return;
            STATE.isSwitchingRoom = true;

            Utils.log("开始执行切换房间流程...");
            const currentRoomId = Utils.getCurrentRoomId();

            // 1. 冻结当前页面所有活动，并更新状态
            GlobalState.updateWorker(currentRoomId, 'SWITCHING', '查找新房间...');

            try {
                // 2. 获取 API 房间列表和当前已打开的房间列表
                const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT);
                const currentState = GlobalState.get();
                const openedRoomIds = new Set(Object.keys(currentState.tabs));

                // 3. 筛选出未被打开的新房间
                const nextUrl = apiRoomUrls.find(url => {
                    const rid = url.match(/\/(\d+)/)?.[1];
                    return rid && !openedRoomIds.has(rid);
                });

                if (nextUrl) {
                    Utils.log(`确定下一个房间链接: ${nextUrl}`);

                    const nextRoomId = nextUrl.match(/\/(\d+)/)[1];
                    const pendingWorkers = GM_getValue('qmx_pending_workers', []);
                    pendingWorkers.push(nextRoomId);
                    GM_setValue('qmx_pending_workers', pendingWorkers);
                    Utils.log(`已将房间 ${nextRoomId} 加入待处理列表。`);

                    // 4. 打开新标签页（交棒）
                    GM_openInTab(nextUrl, { active: false, setParent: true });
                    await Utils.sleep(SETTINGS.CLOSE_TAB_DELAY);
                    await this.selfClose(currentRoomId); // 使用统一的"自毁程序"
                } else {
                    Utils.log("API未能返回任何新的、未打开的房间，将关闭当前页。");
                    await this.selfClose(currentRoomId);
                }
            } catch (error) {
                Utils.log(`切换房间时发生严重错误: ${error.message}`);
                await this.selfClose(currentRoomId); // 即使出错，也要确保销毁
            }
        },



        /**
         * 进入休眠模式，等待午夜刷新。
         */
        async enterDormantMode() {
            const roomId = Utils.getCurrentRoomId();
            Utils.log(`[上限处理] 房间 ${roomId} 进入休眠模式。`);
            GlobalState.updateWorker(roomId, 'DORMANT', '休眠中 (等待北京时间0点)', { countdown: null });

            const now = Utils.getBeijingTime();
            const tomorrow = new Date(now.getTime());
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
            tomorrow.setUTCHours(0, 0, 30, 0); // 设置为北京时间 00:00:30

            const msUntilMidnight = tomorrow.getTime() - now.getTime();

            Utils.log(`将在 ${Math.round(msUntilMidnight / 1000 / 60)} 分钟后自动刷新页面 (基于北京时间)。`);
            setTimeout(() => window.location.reload(), msUntilMidnight);
        },

        /**
         * 统一的自毁程序
         * 在关闭前，异步从全局状态中移除自己。
         * @param {string} roomId - 要移除的房间ID。
         */
        async selfClose(roomId) {
            Utils.log(`本单元任务结束 (房间: ${roomId})，尝试更新状态并关闭。`);

            // 在关闭前，主动清理定时器
            if (this.pauseSentinelInterval) {
                clearInterval(this.pauseSentinelInterval);
            }
            // 1. 广播“正在关闭”的状态，让控制中心知道它已收到指令
            GlobalState.updateWorker(roomId, 'SWITCHING', '任务结束，关闭中...');
            await Utils.sleep(100); // 短暂等待确保状态写入

            // 2. 异步地调用状态移除，不阻塞后续的关闭操作
            GlobalState.removeWorker(roomId);
            await Utils.sleep(300);

            // 3. 执行关闭
            this.closeTab();
        },

        /**
         * 关闭标签页。
         */
        closeTab() {
            try {
                window.close();
                // 替换当前页面（不保留历史记录）
                window.location.replace('about:blank');
            } catch (e) {
                // // 备用关闭方法
                // window.close();
                // window.location.replace('about:blank');
                Utils.log(`关闭失败，故障为: ${e.message}`);
            }
        },

        startCommandListener(roomId) {
            this.commandChannel = new BroadcastChannel('douyu_qmx_commands');
            Utils.log(`工作页 ${roomId} 已连接到指令广播频道。`);

            this.commandChannel.onmessage = (event) => {
                const { action, target } = event.data;

                // 检查指令是否是给自己的
                if (target === roomId || target === '*') {
                    Utils.log(`接收到广播指令: ${action} for target ${target}`);

                    if (action === 'CLOSE' || action === 'CLOSE_ALL') {
                        this.selfClose(roomId); // 执行关闭操作
                    }
                    // 未来可以扩展其他指令, 如 'PAUSE', 'REFRESH' 等
                }
            };

            // 确保页面关闭时，也关闭频道连接
            window.addEventListener('beforeunload', () => {
                if (this.commandChannel) {
                    this.commandChannel.close();
                }
            });
        },

    };

    /**
     * =================================================================================
     * 模块：控制页面 (ControlPage)
     * ---------------------------------------------------------------------------------
     * 负责在控制室页面创建和管理仪表盘UI。
     * =================================================================================
     */
    const ControlPage = {
        // --- 模块内部状态 ---
        injectionTarget: null,    // 存储被注入的DOM元素引用
        isPanelInjected: false,   // 标记是否成功进入注入模式
        commandChannel: null,
        /**
         * 控制页面的总入口和初始化函数。
         */
        init() {
            Utils.log("当前是控制页面，开始设置UI...");
            this.commandChannel = new BroadcastChannel('douyu_qmx_commands'); // 创建广播频道
            this.injectCSS();
            ThemeManager.applyTheme(SETTINGS.THEME);
            this.createHTML();
            // applyModalMode 必须在 bindEvents 之前调用，因为它会决定事件如何绑定
            this.applyModalMode();
            this.bindEvents();
            setInterval(() => {
                this.renderDashboard()
                this.cleanupAndMonitorWorkers(); // 标签页回收及监控僵尸标签页
            }, 1000);

            // 确保页面关闭时关闭频道
            window.addEventListener('beforeunload', () => {
                if (this.commandChannel) {
                    this.commandChannel.close();
                }
            });
        },

        /**
         * 注入所有UI所需的CSS样式。
         */
        injectCSS() {
            GM_addStyle(`
        /* ---------------------------------- */
        /* --- 1. CSS 变量定义 --- */
        /* ---------------------------------- */
        :root {
            color-scheme: light dark;
            --motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
            --status-color-waiting: #4CAF50; 
            --status-color-claiming: #2196F3;
            --status-color-switching: #FFC107;
            --status-color-error: #F44336;
            --status-color-opening: #9C27B0;
            --status-color-dormant: #757575;
            --status-color-unresponsive: #FFA000;
            --status-color-disconnected: #BDBDBD;
            --status-color-stalled: #9af39dff;
        }

        body[data-theme="dark"] {
            --md-sys-color-primary: #D0BCFF;
            --md-sys-color-on-primary: #381E72;
            --md-sys-color-surface-container: #211F26;
            --md-sys-color-on-surface: #E6E1E5;
            --md-sys-color-on-surface-variant: #CAC4D0;
            --md-sys-color-outline: #938F99;
            --md-sys-color-surface-bright: #36343B;
            --md-sys-color-tertiary: #EFB8C8;
            --md-sys-color-scrim: #000000;
            --surface-container-highest: #3D3B42;
            --primary-container: #4F378B;
            --on-primary-container: #EADDFF;
        }

        body[data-theme="light"] {
            /* 经过优化的日间模式颜色，层次更分明 */
            --md-sys-color-primary: #6750A4;
            --md-sys-color-on-primary: #FFFFFF;
            --md-sys-color-surface-container: #F3EDF7;
            --md-sys-color-surface-bright: #FEF7FF;
            --md-sys-color-on-surface: #1C1B1F;
            --md-sys-color-on-surface-variant: #49454F;
            --md-sys-color-outline: #79747E;
            --md-sys-color-tertiary: #7D5260;
            --md-sys-color-scrim: #000000;
            --surface-container-highest: #E6E0E9;
            --primary-container: #EADDFF;
            --on-primary-container: #21005D;
        }

        /* --- 核心布局与基础组件 --- */
        .is-dragging { transition: none !important; }
        .qmx-hidden { display: none !important; }
        .qmx-modal-open-scroll-lock { overflow: hidden !important; }
        #${SETTINGS.DRAGGABLE_BUTTON_ID} {
            position: fixed; top: 0; left: 0; z-index: 10000;
            background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);
            border: none; width: 56px; height: 56px; border-radius: 16px;
            cursor: grab; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(1);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform, opacity;
        }
        #${SETTINGS.DRAGGABLE_BUTTON_ID} .icon { font-size: 28px; }
        #${SETTINGS.DRAGGABLE_BUTTON_ID}.hidden { opacity: 0; transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0) scale(0.5); pointer-events: none; }
        #qmx-modal-backdrop {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: var(--md-sys-color-scrim); z-index: 9998;
            opacity: 0; visibility: hidden; transition: opacity 0.3s ease;
        }
        #qmx-modal-backdrop.visible { opacity: 0.5; visibility: visible; }

        /* --- 主控制面板样式 --- */
        #qmx-modal-container {
            background-color: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);
            display: flex; flex-direction: column;
        }
        #qmx-modal-container.mode-floating, #qmx-modal-container.mode-centered {
            position: fixed; z-index: 9999; width: 335px; max-width: 90vw; max-height: 80vh;
            border-radius: 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); opacity: 0; visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s, transform 0.2s ease-out; will-change: transform, opacity;
        }
        #qmx-modal-container.visible { opacity: 1; visibility: visible; }
        #qmx-modal-container.mode-floating { top: 0; left: 0; transform: translate3d(var(--tx, 0px), var(--ty, 0px), 0); }
        #qmx-modal-container.mode-floating .qmx-modal-header { cursor: move; }
        #qmx-modal-container.mode-centered { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        #qmx-modal-container.mode-inject-rank-list {
            position: relative; width: 100%; flex: 1; min-height: 0;
            box-shadow: none; border-radius: 0; transform: none !important;
        }
        .qmx-modal-header {
            position: relative; padding: 16px 24px; font-size: 24px; font-weight: 400; color: var(--md-sys-color-on-surface);
            user-select: none; display: flex; align-items: center; justify-content: space-between;
        }
        .qmx-modal-close-icon {
            width: 36px; height: 36px; background-color: rgba(208, 188, 255, 0.15);
            border: none; border-radius: 50%; cursor: pointer; transition: all 0.2s ease-in-out;
            position: relative; flex-shrink: 0;
        }
        .qmx-modal-close-icon:hover { background-color: var(--md-sys-color-primary); transform: scale(1.05) rotate(180deg); }
        .qmx-modal-close-icon::before, .qmx-modal-close-icon::after {
            content: ''; position: absolute; top: 50%; left: 50%; width: 16px; height: 2px;
            background-color: var(--md-sys-color-primary); transition: background-color 0.2s ease-in-out;
        }
        .qmx-modal-close-icon:hover::before, .qmx-modal-close-icon:hover::after { background-color: var(--md-sys-color-on-primary); }
        .qmx-modal-close-icon::before { transform: translate(-50%, -50%) rotate(45deg); }
        .qmx-modal-close-icon::after { transform: translate(-50%, -50%) rotate(-45deg); }
        .qmx-modal-content { flex-grow: 1; overflow-y: auto; padding: 0 24px; }
        .qmx-modal-content h3 { font-size: 16px; font-weight: 500; color: var(--md-sys-color-on-surface-variant); margin: 8px 0; }
        .qmx-tab-list-item {
            background-color: var(--md-sys-color-surface-bright); border-radius: 12px; padding: 12px 16px;
            margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
            transition: background-color 0.2s, transform 0.3s ease, opacity 0.3s ease;
        }
        .qmx-tab-list-item:hover { background-color: rgba(255,255,255,0.05); }
        .qmx-item-enter { opacity: 0; transform: translateX(20px); }
        .qmx-item-enter-active { opacity: 1; transform: translateX(0); }
        .qmx-item-exit-active { position: absolute; opacity: 0; transform: scale(0.8); transition: all 0.3s ease; z-index: -1; pointer-events: none; }
        .qmx-tab-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .qmx-tab-info { display: flex; flex-direction: column; flex-grow: 1; gap: 4px; font-size: 14px; overflow: hidden; }
        .qmx-tab-header { display: flex; align-items: baseline; justify-content: space-between; }
        .qmx-tab-nickname { font-weight: 500; color: var(--md-sys-color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qmx-tab-room-id { font-size: 12px; color: var(--md-sys-color-on-surface-variant); opacity: 0.7; }
        .qmx-tab-details { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--md-sys-color-on-surface-variant); }
        .qmx-tab-status-name { font-weight: 500; }
        .qmx-modal-footer { padding: 16px 24px; display: flex; gap: 8px; }
        .qmx-modal-btn {
            flex-grow: 1; padding: 10px 16px; border: 1px solid var(--md-sys-color-outline);
            background-color: transparent; color: var(--md-sys-color-primary);
            border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .qmx-modal-btn.primary { background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border: none; }
        .qmx-modal-btn:hover { background-color: rgba(208, 188, 255, 0.1); transform: translateY(-2px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .qmx-modal-btn.primary:hover { background-color: hsl(252, 100%, 85%); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .qmx-modal-btn:active { transform: translateY(0) scale(0.98); box-shadow: none; }
        .qmx-modal-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .qmx-modal-btn.danger { border-color: #F44336; color: #F44336; }
        .qmx-modal-btn.danger:hover { background-color: rgba(244, 67, 54, 0.1); }
        .qmx-tab-close-btn {
            flex-shrink: 0; background: none; border: none; color: var(--md-sys-color-on-surface-variant);
            font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1; opacity: 0.6; transition: all 0.2s;
        }
        .qmx-tab-close-btn:hover { opacity: 1; color: #F44336; transform: scale(1.1); }

        /* --- 设置面板统一样式 --- */
        #qmx-settings-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95);
            width: 500px; max-width: 95vw; z-index: 10001;
            background-color: var(--md-sys-color-surface-bright); color: var(--md-sys-color-on-surface);
            border-radius: 28px; box-shadow: 0 12px 32px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; opacity: 0; visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
        }
        #qmx-settings-modal.visible { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
        .qmx-settings-header { padding: 12px 24px; border-bottom: 1px solid var(--md-sys-color-outline); flex-shrink: 0; }
        .qmx-settings-tabs { display: flex; gap: 8px; }
        .qmx-settings-tabs .tab-link {
            padding: 8px 16px; border: none; background: none; color: var(--md-sys-color-on-surface-variant);
            cursor: pointer; border-radius: 8px; transition: all 0.2s; font-size: 14px;
        }
        .qmx-settings-tabs .tab-link:hover { background-color: rgba(255,255,255,0.05); }
        .qmx-settings-tabs .tab-link.active { background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); font-weight: 500; }
        .qmx-settings-content {
            padding: 16px 24px; flex-grow: 1; overflow-y: auto; max-height: 60vh;
            scrollbar-gutter: stable;
        }
        .qmx-settings-content .tab-content { display: none; }
        .qmx-settings-content .tab-content.active { display: block; }
        .qmx-settings-footer {
            padding: 16px 24px; display: flex; justify-content: flex-end; gap: 10px;
            border-top: 1px solid var(--md-sys-color-outline); flex-shrink: 0;
        }
        .qmx-settings-warning {
            padding: 12px; background-color: rgba(244, 67, 54, 0.2); border: 1px solid #F44336;
            color: #EFB8C8; border-radius: 8px; grid-column: 1 / -1;
        }
        .qmx-settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; align-items: start;}
        .qmx-settings-item { display: flex; flex-direction: column; gap: 8px; }
        .qmx-settings-item label { font-size: 14px; font-weight: 500; }
        .qmx-settings-item small { font-size: 12px; color: var(--md-sys-color-on-surface-variant); opacity: 0.8; }

        /* --- 所有输入框的统一样式 --- */
        /* 1. 基础样式 (对所有数字输入框生效) */
        .qmx-settings-item input[type="number"] {
            background-color: var(--md-sys-color-surface-container);
            border: 1px solid var(--md-sys-color-outline);
            color: var(--md-sys-color-on-surface);
            border-radius: 8px;
            padding: 10px; /* 默认内边距 */
            width: 100%;
            box-sizing: border-box;
            transition: box-shadow 0.2s, border-color 0.2s;
        }

        /* 2. 聚焦与对齐 (仅对不带单位的普通输入框生效) */
        .qmx-settings-item > input[type="number"] {
            padding-top: 12px;
            padding-bottom: 12px;
        }
        .qmx-settings-item > input[type="number"]:hover {
            border-color: var(--md-sys-color-primary);
        }
        .qmx-settings-item > input[type="number"]:focus {
            outline: none;
            border-color: var(--md-sys-color-primary);
            box-shadow: 0 0 0 2px rgba(208, 188, 255, 0.3);
        }


        /* --- 隐藏数字输入框的原生步进器箭头 --- */
        /* Webkit 浏览器 (Chrome, Safari, Edge) */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        /* Firefox 浏览器 */
        input[type=number] {
            -moz-appearance: textfield;
        }

        /* 滑动开关 (Toggle Switch) */
        .qmx-toggle { position: relative; display: inline-block; width: 52px; height: 30px; }
        .qmx-toggle input { opacity: 0; width: 0; height: 0; }
        .qmx-toggle .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline);
            border-radius: 30px; transition: all 0.3s ease;
        }
        .qmx-toggle .slider:before {
            position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px;
            background-color: var(--md-sys-color-on-surface-variant); border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .qmx-toggle input:checked + .slider { background-color: var(--md-sys-color-primary); border-color: var(--md-sys-color-primary); }
        .qmx-toggle input:checked + .slider:before { background-color: var(--md-sys-color-on-primary); transform: translateX(22px); }
        .qmx-toggle:hover .slider { border-color: var(--md-sys-color-primary); }

        /* 自定义下拉菜单 (Select Dropdown) */
        .qmx-select { position: relative; width: 100%; }
        .qmx-select-styled {
            position: relative; padding: 10px 30px 10px 12px;
            background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline);
            border-radius: 8px; cursor: pointer; transition: all 0.2s; user-select: none;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
        }
        .qmx-select-styled::after {
            content: ""; position: absolute; top: 50%; right: 12px;
            transform: translateY(-50%); width: 0; height: 0; border-left: 5px solid transparent;
            border-right: 5px solid transparent; border-top: 5px solid var(--md-sys-color-on-surface-variant);
            transition: transform 0.3s ease;
        }
        .qmx-select:hover .qmx-select-styled { border-color: var(--md-sys-color-primary); }
        .qmx-select.active .qmx-select-styled {
            border-color: var(--md-sys-color-primary);
            box-shadow: inset 0 3px 6px rgba(0,0,0,0.1), 0 0 0 2px rgba(208, 188, 255, 0.3);
        }
        .qmx-select.active .qmx-select-styled::after { transform: translateY(-50%) rotate(180deg); }
        .qmx-select-options {
            position: absolute; top: 105%; left: 0; right: 0; z-index: 10;
            background-color: var(--md-sys-color-surface-bright); border: 1px solid var(--md-sys-color-outline);
            border-radius: 8px; max-height: 0; overflow: hidden;
            opacity: 0; transform: translateY(-10px);
            transition: all 0.3s ease; padding: 4px 0;
        }
        .qmx-select.active .qmx-select-options { max-height: 200px; opacity: 1; transform: translateY(0); }
        .qmx-select-options div { padding: 10px 12px; cursor: pointer; transition: background-color 0.2s; }
        .qmx-select-options div:hover { background-color: rgba(208, 188, 255, 0.1); }
        .qmx-select-options div.selected { background-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); font-weight: 500; }

        /* 为滚动条统一样式 (包含设置面板) */
        .qmx-modal-content::-webkit-scrollbar, .qmx-settings-content::-webkit-scrollbar { width: 10px; }
        .qmx-modal-content::-webkit-scrollbar-track, .qmx-settings-content::-webkit-scrollbar-track { background: var(--md-sys-color-surface-bright); border-radius: 10px; }
        .qmx-modal-content::-webkit-scrollbar-thumb, .qmx-settings-content::-webkit-scrollbar-thumb {
            background-color: var(--md-sys-color-primary); border-radius: 10px;
            border: 2px solid var(--md-sys-color-surface-bright);
        }
        .qmx-modal-content::-webkit-scrollbar-thumb:hover, .qmx-settings-content::-webkit-scrollbar-thumb:hover { background-color: #E0D1FF; }


        /* --- 关于页样式 --- */
        #tab-about { line-height: 1.7; font-size: 14px; }
        #tab-about h4 {
            color: var(--md-sys-color-primary);
            font-size: 16px;
            font-weight: 500;
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--md-sys-color-outline);
        }
        #tab-about h4:first-child { margin-top: 0; }
        #tab-about p { margin-bottom: 10px; color: var(--md-sys-color-on-surface-variant); }
        #tab-about .version-tag {
            display: inline-block;
            background-color: var(--md-sys-color-tertiary);
            color: var(--md-sys-color-on-primary);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            margin-left: 8px;
        }
        #tab-about ul {
            list-style: none;
            padding-left: 0;
        }
        #tab-about li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
        }
        #tab-about li::before {
            content: '◆';
            position: absolute;
            left: 0;
            top: 2px;
            color: var(--md-sys-color-primary);
            font-size: 12px;
        }
        #tab-about a {
            color: var(--md-sys-color-tertiary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }
        #tab-about a:hover {
            color: #FFD6E1; /* A lighter shade for hover */
            text-decoration: underline;
        }

        /* --- 设置项标签与图标 --- */
        .qmx-settings-item label {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .qmx-tooltip-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: var(--md-sys-color-outline);
            color: var(--md-sys-color-surface-container);
            font-size: 12px;
            font-weight: bold;
            cursor: help;
            user-select: none;
        }

        /* --- 新增：全局工具提示 (Tooltip) 样式 --- */
        #qmx-global-tooltip {
            position: fixed; /* 使用 fixed 定位，脱离所有容器限制 */
            background-color:  var(--surface-container-highest);
            color: var(--md-sys-color-on-surface);
            padding: 8px 12px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-size: 12px;
            font-weight: 400;
            line-height: 1.5;
            z-index: 10002; /* 确保在设置面板之上 */
            max-width: 250px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-5px); /* 初始位置偏上 */
            transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
            pointer-events: none; /* 自身不响应鼠标事件 */
        }
        #qmx-global-tooltip.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* --- 优化：带单位缺口的输入框 (采用 fieldset) --- */
        /* 1. 容器样式 */
        .qmx-fieldset-unit {
            position: relative;
            padding: 0;
            margin: 0;
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 8px;
            background-color: var(--md-sys-color-surface-container);
            transition: border-color 0.2s, box-shadow 0.2s; /* 添加 box-shadow 过渡 */
            width: 100%;
            box-sizing: border-box;
        }

        /* 2. 悬停与聚焦效果 (应用到 fieldset 自身) */
        .qmx-fieldset-unit:hover {
            border-color: var(--md-sys-color-primary);
        }
        .qmx-fieldset-unit:focus-within {
            border-color: var(--md-sys-color-primary);
            box-shadow: 0 0 0 2px rgba(208, 188, 255, 0.3); /* 将外发光应用到 fieldset */
        }

        /* 3. 内部 input 样式重置 */
        .qmx-fieldset-unit input[type="number"] {
            border: none;
            background: none;
            outline: none;
            box-shadow: none; /* 移除任何可能继承的 box-shadow */
            color: var(--md-sys-color-on-surface);
            padding: 3px 10px 4px 10px;
            width: 100%;
            box-sizing: border-box;
        }

        /* 4. 单位缺口 legend 样式 */
        .qmx-fieldset-unit legend {
            padding: 0 6px;
            font-size: 12px;
            color: var(--md-sys-color-on-surface-variant);
            margin-left: auto;
            margin-right: 12px;
            text-align: right;
            pointer-events: none;
        }

        /* --- 为内容区增加 overflow-x: hidden --- */
        .qmx-settings-content {
            overflow-x: hidden; /* 防止横向滚动条 */
        }

        /* --- 范围滑块样式 --- */
        .qmx-range-slider-wrapper {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .qmx-range-slider-container {
            position: relative;
            height: 24px;
            display: flex;
            align-items: center;
        }
        .qmx-range-slider-container input[type="range"] {
            position: absolute;
            width: 100%;
            height: 4px; /* 让轨道和进度条对齐 */
            -webkit-appearance: none;
            appearance: none;
            background: none; /* 隐藏默认轨道 */
            pointer-events: none; /* 让鼠标事件穿透到下面的轨道 */
            margin: 0;
        }
        /* Webkit (Chrome, Safari) 浏览器滑块手柄样式 */
        .qmx-range-slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            pointer-events: auto; /* 只有手柄可以响应鼠标事件 */
            width: 20px;
            height: 20px;
            background-color: var(--md-sys-color-primary);
            border-radius: 50%;
            cursor: grab;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .qmx-range-slider-container input[type="range"]::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
        }
        /* Firefox 浏览器滑块手柄样式 */
        .qmx-range-slider-container input[type="range"]::-moz-range-thumb {
            pointer-events: auto;
            width: 20px;
            height: 20px;
            background-color: var(--md-sys-color-primary);
            border-radius: 50%;
            cursor: grab;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .qmx-range-slider-container input[type="range"]::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
        }
        .qmx-range-slider-track-container {
            position: absolute;
            width: 100%;
            height: 4px;
            background-color: var(--md-sys-color-surface-container);
            border-radius: 2px;
        }
        .qmx-range-slider-progress {
            position: absolute;
            height: 100%;
            background-color: var(--md-sys-color-primary);
            border-radius: 2px;
        }
        .qmx-range-slider-values {
            font-size: 14px;
            color: var(--md-sys-color-primary);
            text-align: center;
            font-weight: 500;
        }

        /* 1. 总容器 (label.theme-switch) */
        /* 它的作用是定义一个固定的、可供鼠标悬停的区域 */
        .theme-switch {
            position: relative;
            display: block; /* 使用 block 或 inline-block */
            width: 60px;  /* 固定的、展开后的宽度 */
            height: 34px;
            cursor: pointer;
            /* 取消容器自身的过渡，它应该是稳定的 */
            transition: none;
        }

        .theme-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        /* 2. 背景轨道 (.slider-track) */
        /* 这个元素专门负责实现“展开”和“收缩”的动画 */
        .slider-track {
            position: absolute;
            top: 0;
            left: 0;
            width: 34px; /* 默认是收缩状态，和圆点一样大 */
            height: 34px;
            background-color: var(--surface-container-highest);
            border-radius: 17px; /* 收缩时是圆形 */

            box-shadow: inset 2px 2px 4px rgba(0,0,0,0.2),
                            inset -2px -2px 4px rgba(255,255,255,0.05);

            transition: width 0.3s ease, left 0.3s ease, border-radius 0.3s ease, box-shadow 0.3s ease;
        }

        /* ★ 鼠标悬停时，轨道展开 */
        .theme-switch:hover .slider-track {
            width: 60px; /* 展开为长条形 */
        }

        /* ★ 当开关被选中(夜间模式)且鼠标未悬停时，收缩的轨道移动到右边 */
        .theme-switch input:checked + .slider-track {
            left: 26px; /* 60px - 34px = 26px，移动到最右侧 */
        }
        /* 鼠标悬停在已选中的开关上时，轨道也要保持在左侧展开 */
        .theme-switch:hover input:checked + .slider-track {
            left: 0;
        }


        /* 3. 滑块圆点 (.slider-dot) */
        /* 这个元素只负责左右平移，动画路径单一且稳定 */
        .slider-dot {
            position: absolute;
            height: 26px;
            width: 26px;
            left: 4px; /* 初始内边距 */
            top: 4px;
            background-color: var(--md-sys-color-primary);
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            box-shadow: 0 4px 8px rgba(0,0,0,0.3);

            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, box-shadow 0.3s ease;

        }

        /* ★ 当开关被选中(夜间模式)时，圆点向右移动 */
        .theme-switch input:checked ~ .slider-dot {
            transform: translateX(26px); /* 移动固定的26px */
            background-color: var(--primary-container);
        }


        /* 4. 图标样式 */
        .slider-dot .icon {
            position: absolute;
            width: 20px;
            height: 20px;
            color: var(--md-sys-color-on-primary);
            transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sun {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
        .moon {
            opacity: 0;
            transform: translateY(20px) rotate(-45deg); /* 从下方进入 */
        }

        input:checked ~ .slider-dot .sun {
            opacity: 0;
            transform: translateY(-20px) rotate(45deg); /* 向上方退出 */
        }
        input:checked ~ .slider-dot .moon {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
            color: var(--md-sys-color-on-surface);
        }
                `);
        },

        createHTML() {
            Utils.log("创建UI的HTML结构...");
            const modalBackdrop = document.createElement('div');
            modalBackdrop.id = 'qmx-modal-backdrop';

            const modalContainer = document.createElement('div');
            modalContainer.id = 'qmx-modal-container';
            modalContainer.innerHTML = `
                <div class="qmx-modal-header">
                    <span>控制中心</span>
                    <button id="qmx-modal-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <h3>监控面板 (<span id="qmx-active-tabs-count">0</span>/${SETTINGS.MAX_WORKER_TABS})</h3>
                    <div id="qmx-tab-list"></div>
                </div>
                <div class="qmx-modal-footer">
                    <button id="qmx-modal-settings-btn" class="qmx-modal-btn">设置</button>
                    <button id="qmx-modal-close-all-btn" class="qmx-modal-btn danger">关闭所有</button>
                    <button id="qmx-modal-open-btn" class="qmx-modal-btn primary">打开新房间</button>
                </div>
            `;
            document.body.appendChild(modalBackdrop);
            document.body.appendChild(modalContainer);

            const mainButton = document.createElement('button');
            mainButton.id = SETTINGS.DRAGGABLE_BUTTON_ID;
            mainButton.innerHTML = `<span class="icon">🎁</span>`;
            document.body.appendChild(mainButton);

            const settingsModal = document.createElement('div');
            settingsModal.id = 'qmx-settings-modal';
            document.body.appendChild(settingsModal);

            const globalTooltip = document.createElement('div');
            globalTooltip.id = 'qmx-global-tooltip';
            document.body.appendChild(globalTooltip);
        },

        /**
         * 核心监控与清理函数
         */
        cleanupAndMonitorWorkers() {
            const state = GlobalState.get();
            let stateModified = false;

            for (const roomId in state.tabs) {
                const tab = state.tabs[roomId];
                const timeSinceLastUpdate = Date.now() - tab.lastUpdateTime;

                // 如果一个标签页标记为“断开连接”且超过了宽限期，就清理它。
                // 准确地处理手动关闭的标签页，同时给刷新的标签页重连的机会。
                if (tab.status === 'DISCONNECTED' && timeSinceLastUpdate > SETTINGS.DISCONNECTED_GRACE_PERIOD) {
                    Utils.log(`[监控] 任务 ${roomId} (已断开) 超过 ${SETTINGS.DISCONNECTED_GRACE_PERIOD / 1000} 秒未重连，执行清理。`);
                    delete state.tabs[roomId];
                    stateModified = true;
                    continue; // 处理完这个就检查下一个
                }


                // 规则: 如果一个标签页处于“切换中”状态超过30秒，我们就认为它已经关闭
                if (tab.status === 'SWITCHING' && timeSinceLastUpdate > SETTINGS.SWITCHING_CLEANUP_TIMEOUT) {
                    Utils.log(`[监控] 任务 ${roomId} (切换中) 已超时，判定为已关闭，执行清理。`);
                    delete state.tabs[roomId];
                    stateModified = true;
                    continue; // 处理完这个就检查下一个
                }

                // 规则：如果一个标签页（无论何种状态）长时间没有任何通信，则判定为失联
                if (timeSinceLastUpdate > SETTINGS.UNRESPONSIVE_TIMEOUT && tab.status !== 'UNRESPONSIVE') {
                    Utils.log(`[监控] 任务 ${roomId} 已失联超过 ${SETTINGS.UNRESPONSIVE_TIMEOUT / 60000} 分钟，标记为无响应。`);
                    tab.status = 'UNRESPONSIVE';
                    tab.statusText = '心跳失联，请点击激活或关闭此标签页';
                    stateModified = true;
                }
            }

            if (stateModified) {
                GlobalState.set(state);
            }
        },

        /**
         * 显示设置面板并填充当前配置
         */
        showSettingsPanel() {
            const modal = document.getElementById('qmx-settings-modal');

            // --- 数据准备区 ---

            // 1. 带单位输入的元数据
            const settingsMeta = {
                'setting-initial-script-delay': { value: SETTINGS.INITIAL_SCRIPT_DELAY / 1000, unit: '秒' },
                'setting-auto-pause-delay': { value: SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION / 1000, unit: '秒' },
                'setting-unresponsive-timeout': { value: SETTINGS.UNRESPONSIVE_TIMEOUT / 60000, unit: '分钟' },
                'setting-red-envelope-timeout': { value: SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT / 1000, unit: '秒' },
                'setting-popup-wait-timeout': { value: SETTINGS.POPUP_WAIT_TIMEOUT / 1000, unit: '秒' },
                'setting-worker-loading-timeout': { value: SETTINGS.ELEMENT_WAIT_TIMEOUT / 1000, unit: '秒' },
                'setting-close-tab-delay': { value: SETTINGS.CLOSE_TAB_DELAY / 1000, unit: '秒' },
                'setting-api-retry-delay': { value: SETTINGS.API_RETRY_DELAY / 1000, unit: '秒' },
                'setting-switching-cleanup-timeout': { value: SETTINGS.SWITCHING_CLEANUP_TIMEOUT / 1000, unit: '秒' },
                'setting-healthcheck-interval': { value: SETTINGS.HEALTHCHECK_INTERVAL / 1000, unit: '秒' },
                'setting-disconnected-grace-period': { value: SETTINGS.DISCONNECTED_GRACE_PERIOD / 1000, unit: '秒' }
            };

            // 2. 所有工具提示的文本
            const allTooltips = {
                'control-room': '只有在此房间号的直播间中才能看到插件面板，看准了再改！',
                'auto-pause': '自动暂停非控制直播间的视频播放，大幅降低资源占用。',
                'initial-script-delay': '页面加载后等待多久再运行脚本，可适当增加以确保页面完全加载。',
                'auto-pause-delay': '领取红包后等待多久再次尝试暂停视频。',
                'unresponsive-timeout': '工作页多久未汇报任何状态后，在面板上标记为“无响应”。',
                'red-envelope-timeout': '进入直播间后，最长等待多久来寻找红包活动，超时后将切换房间。',
                'popup-wait-timeout': '点击红包后，等待领取弹窗出现的最长时间。',
                'worker-loading-timeout': '新开的直播间卡在加载状态多久还没显示播放组件，被判定为加载失败或缓慢。',
                'range-delay': '脚本在每次点击等操作前后随机等待的时间范围，模拟真人行为。',
                'close-tab-delay': '旧页面在打开新页面后，等待多久再关闭自己，确保新页面已接管。',
                'switching-cleanup-timeout': '处于“切换中”状态的标签页，超过此时间后将被强行清理，避免残留。',
                'max-worker-tabs': '同时运行的直播间数量上限。',
                'api-room-fetch-count': '每次从API获取的房间数。增加可提高找到新房间的几率。',
                'api-retry-count': '获取房间列表失败时的重试次数。',
                'api-retry-delay': 'API请求失败后，等待多久再重试。',
                'healthcheck-interval': '哨兵检查后台UI的频率。值越小，UI节流越快，但会增加资源占用。',
                'disconnected-grace-period': '刷新或关闭的标签页，在被彻底清理前等待重连的宽限时间。'

            };

            // --- 动态生成HTML ---

            // 辅助函数：动态生成带单位输入框的HTML
            const createUnitInput = (id, label) => {
                const meta = settingsMeta[id];
                return `
                    <div class="qmx-settings-item">
                        <label for="${id}">
                            ${label}
                            <span class="qmx-tooltip-icon" data-tooltip-key="${id.replace('setting-','') }">?</span>
                        </label>
                        <fieldset class="qmx-fieldset-unit">
                            <legend>${meta.unit}</legend>
                            <input type="number" id="${id}" value="${meta.value}">
                        </fieldset>
                    </div>
                `;
            };

            // --- 完整HTML结构 ---
            modal.innerHTML = `
                <div class="qmx-settings-header">
                    <div class="qmx-settings-tabs">
                        <button class="tab-link active" data-tab="basic">基本设置</button>
                        <button class="tab-link" data-tab="perf">性能与延迟</button>
                        <button class="tab-link" data-tab="advanced">高级设置</button>
                        <button class="tab-link" data-tab="about">关于</button>
                        <!-- 主题模式切换开关 -->
                        <div class="qmx-settings-item">
                            <div class="theme-switch-wrapper">
                                <label class="theme-switch">
                                    <input type="checkbox" id="setting-theme-mode" ${SETTINGS.THEME === 'dark' ? 'checked' : ''}>

                                    <!-- 1. 背景轨道：只负责展开和收缩的动画 -->
                                    <span class="slider-track"></span>

                                    <!-- 2. 滑块圆点：只负责左右移动和图标切换 -->
                                    <span class="slider-dot">
                                        <span class="icon sun">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="12" r="5"></circle>
                                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                            </svg>
                                        </span>
                                        <span class="icon moon">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.398-8.552a.75.75 0 01.818.162z" clip-rule="evenodd"></path></svg>
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="qmx-settings-content">
                    <!-- ==================== Tab 1: 基本设置 ==================== -->
                    <div id="tab-basic" class="tab-content active">
                        <div class="qmx-settings-grid">
                            <div class="qmx-settings-item">
                                <label for="setting-control-room-id">控制室房间号 <span class="qmx-tooltip-icon" data-tooltip-key="control-room">?</span></label>
                                <input type="number" id="setting-control-room-id" value="${SETTINGS.CONTROL_ROOM_ID}">
                            </div>
                            <div class="qmx-settings-item">
                                <label>自动暂停后台视频 <span class="qmx-tooltip-icon" data-tooltip-key="auto-pause">?</span></label>
                                <label class="qmx-toggle">
                                    <input type="checkbox" id="setting-auto-pause" ${SETTINGS.AUTO_PAUSE_ENABLED ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="qmx-settings-item">
                                <label>达到上限后的行为</label>
                                <div class="qmx-select" data-target-id="setting-daily-limit-action">
                                    <div class="qmx-select-styled"></div>
                                    <div class="qmx-select-options"></div>
                                    <select id="setting-daily-limit-action" style="display: none;">
                                        <option value="STOP_ALL" ${SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL' ? 'selected' : ''}>直接关停所有任务</option>
                                        <option value="CONTINUE_DORMANT" ${SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT' ? 'selected' : ''}>进入休眠模式，等待刷新</option>
                                    </select>
                                </div>
                            </div>
                            <div class="qmx-settings-item">
                                <label>控制中心显示模式</label>
                                <div class="qmx-select" data-target-id="setting-modal-mode">
                                    <div class="qmx-select-styled"></div>
                                    <div class="qmx-select-options"></div>
                                    <select id="setting-modal-mode" style="display: none;">
                                        <option value="floating" ${SETTINGS.MODAL_DISPLAY_MODE === 'floating' ? 'selected' : ''}>浮动窗口</option>
                                        <option value="centered" ${SETTINGS.MODAL_DISPLAY_MODE === 'centered' ? 'selected' : ''}>屏幕居中</option>
                                        <option value="inject-rank-list" ${SETTINGS.MODAL_DISPLAY_MODE === 'inject-rank-list' ? 'selected' : ''}>替换排行榜显示</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ==================== Tab 2: 性能与延迟 ==================== -->
                    <div id="tab-perf" class="tab-content">
                        <div class="qmx-settings-grid">
                            ${createUnitInput('setting-initial-script-delay', '脚本初始启动延迟')}
                            ${createUnitInput('setting-auto-pause-delay', '领取后暂停延迟')}
                            ${createUnitInput('setting-unresponsive-timeout', '工作页失联超时')}
                            ${createUnitInput('setting-red-envelope-timeout', '红包活动加载超时')}
                            ${createUnitInput('setting-popup-wait-timeout', '红包弹窗等待超时')}
                            ${createUnitInput('setting-worker-loading-timeout', '播放器加载超时')}
                            ${createUnitInput('setting-close-tab-delay', '关闭标签页延迟')}
                            ${createUnitInput('setting-switching-cleanup-timeout', '切换中状态兜底超时')}
                            ${createUnitInput('setting-healthcheck-interval', '哨兵健康检查间隔')}
                            ${createUnitInput('setting-disconnected-grace-period', '断开连接清理延迟')}

                            <div class="qmx-settings-item" style="grid-column: 1 / -1;">
                                <label>模拟操作延迟范围 (秒) <span class="qmx-tooltip-icon" data-tooltip-key="range-delay">?</span></label>
                                <div class="qmx-range-slider-wrapper">
                                    <div class="qmx-range-slider-container">
                                        <div class="qmx-range-slider-track-container"><div class="qmx-range-slider-progress"></div></div>
                                        <input type="range" id="setting-min-delay" min="0.1" max="5" step="0.1" value="${SETTINGS.MIN_DELAY / 1000}">
                                        <input type="range" id="setting-max-delay" min="0.1" max="5" step="0.1" value="${SETTINGS.MAX_DELAY / 1000}">
                                    </div>
                                    <div class="qmx-range-slider-values"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ==================== Tab 3: 高级设置 ==================== -->
                    <div id="tab-advanced" class="tab-content">
                        <div class="qmx-settings-grid">
                            <div class="qmx-settings-item">
                                <label for="setting-max-tabs">最大工作标签页数量 <span class="qmx-tooltip-icon" data-tooltip-key="max-worker-tabs">?</span></label>
                                <input type="number" id="setting-max-tabs" value="${SETTINGS.MAX_WORKER_TABS}">
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-api-fetch-count">单次API获取房间数 <span class="qmx-tooltip-icon" data-tooltip-key="api-room-fetch-count">?</span></label>
                                <input type="number" id="setting-api-fetch-count" value="${SETTINGS.API_ROOM_FETCH_COUNT}">
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-api-retry-count">API请求重试次数 <span class="qmx-tooltip-icon" data-tooltip-key="api-retry-count">?</span></label>
                                <input type="number" id="setting-api-retry-count" value="${SETTINGS.API_RETRY_COUNT}">
                            </div>

                            ${createUnitInput('setting-api-retry-delay', 'API重试延迟')}

                            <!-- 新增：添加两个空的占位符，使网格平衡为 2x3 -->
                            <div class="qmx-settings-item"></div>
                            <div class="qmx-settings-item"></div>
                        </div>
                    </div>

                    <!-- ==================== Tab 4: 关于 ==================== -->
                    <div id="tab-about" class="tab-content">
                        <h4>关于脚本 <span class="version-tag">v2.0.6</span></h4>
                        <h4>致谢</h4>
                        <li>本脚本基于<a href="https://greasyfork.org/zh-CN/users/1453821-ysl-ovo" target="_blank" rel="noopener noreferrer">ysl-ovo</a>的插件<a href="https://greasyfork.org/zh-CN/scripts/532514-%E6%96%97%E9%B1%BC%E5%85%A8%E6%B0%91%E6%98%9F%E6%8E%A8%E8%8D%90%E8%87%AA%E5%8A%A8%E9%A2%86%E5%8F%96" target="_blank" rel="noopener noreferrer">《斗鱼全民星推荐自动领取》</a>
                            进行一些功能改进(也许)与界面美化，同样遵循MIT许可证开源。感谢原作者的分享</li>
                        <li>v2.0.5更新中的“兼容斗鱼新版UI”功能由<a href="https://github.com/Truthss" target="_blank" rel="noopener noreferrer">@Truthss</a> 在 <a href="https://github.com/ienone/douyu-qmx-pro/pull/5" target="_blank" rel="noopener noreferrer">#5</a> 中贡献，非常感谢！</li>
                        <h4>一些tips</h4>
                        <ul>
                            <li>每天大概1000左右金币到上限</li>
                            <li>注意这个活动到晚上的时候，100/50/20星光棒的选项可能空了(奖池对应项会变灰)这时候攒金币过了12点再抽，比较有性价比</li>
                            <li>后台标签页有时会在还剩几秒时卡死在红包弹窗界面(标签页倒计时不动了)，然后就死循环了。这是已知bug但暂未定位到问题，请手动刷新界面</li>
                            <li>脚本还是bug不少，随缘修了＞︿＜</li>
                            <li>读取奖励内容文本需要用api实现，暂时搁置</li>
                        </ul>
                        <h4>脚本更新日志 (v2.0.6)</h4>
                        <ul>
                            <li><b>【修复】增强脚本健壮性与兼容性</b>
                                <ul>
                                    <li>修复了非东八区(UTC+8)用户每日上限重置时间不正确的问题，现在脚本会以北京时间为准进行判断。</li>
                                    <li>修复了刷新(F5)工作标签页后，该页面会因身份验证失败而“死亡”的问题。现在刷新后脚本可以正常恢复工作。</li>
                                </ul>
                            </li>
                            <li><b>【优化】核心计时与监控逻辑，标识后台UI节流</b>
                                <ul>
                                    <li>引入新的<code>[UI节流]</code>状态。它表示后台标签页的UI显示可能没有更新，但脚本的计时器依然正常确。<strong>这个状态不影响抢包</strong>。如需恢复UI显示，仅需切换到对应直播间一下即可</li>
                                    <li>此状态的检测频率可在“设置”->“性能与延迟”中修改。</li>
                                </ul>
                            </li>
                            <li><b>【说明】关于部分标签页无法自动关闭的问题</b>
                                <ul>
                                    <li>部分工作标签页在任务结束后可能无法关闭，而是跳转到空白页。我推测这是出现在由新版UI切换旧版UI的直播间中：因为切换旧版过程中斗鱼的页面跳转逻辑导致脚本关闭此工作标签页是不被允许的行为。</li>
                                    <li>脚本采用跳转到<code>空白页面</code>作为备用方案，这能有效停止页面的所有活动并释放资源。<strong>请注意，这个问题是按猜测修复的，我未能实际测试能否正常实现</strong></li>
                                </ul>
                            </li>
                            <li><b>【说明】关于[已断联] 状态的说明</b>
                                <ul>
                                    <li>手动关闭或刷新工作标签页后，控制面板可能会短暂显示 [已断联] 状态，这是正常的缓冲过程，用于防止刷新时任务丢失。该状态会在宽限期后自动清除。</li>
                                    <li>此宽限时间可在“设置”->“性能与延迟”中修改。</li>
                                </ul>
                            </li>
                        </ul>
                        <h4>源码与社区</h4>
                        <ul>
                            <li>可以在 <a href="https://github.com/ienone/eilatam" target="_blank" rel="noopener noreferrer">GitHub</a> 查看本脚本源码</li>
                            <li>发现BUG或有功能建议，欢迎提交 <a href="https://github.com/ienone/eilatam/issues" target="_blank" rel="noopener noreferrer">Issue</a>（不过大概率不会修……）</li>
                            <li>如果你有能力进行改进，非常欢迎提交 <a href="https://github.com/ienone/eilatam/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>！</li>
                        </ul>
                    </div>
                </div>
                <div class="qmx-settings-footer">
                    <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
                    <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
                    <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存并刷新</button>
                </div>
            `;

            // --- 激活所有交互元素 ---

            // 1. 激活全局工具提示 (Tooltip)
            const globalTooltip = document.getElementById('qmx-global-tooltip');
            modal.addEventListener('mouseover', (e) => {
                const icon = e.target.closest('.qmx-tooltip-icon');
                if (!icon) return;
                const key = icon.dataset.tooltipKey;
                if (allTooltips[key]) {
                    globalTooltip.textContent = allTooltips[key];
                    const iconRect = icon.getBoundingClientRect();
                    globalTooltip.style.left = `${iconRect.left + iconRect.width / 2}px`;
                    globalTooltip.style.top = `${iconRect.top}px`;
                    globalTooltip.style.transform = `translate(-50%, calc(-100% - 8px))`;
                    globalTooltip.classList.add('visible');
                }
            });
            modal.addEventListener('mouseout', (e) => {
                if (e.target.closest('.qmx-tooltip-icon')) {
                    globalTooltip.classList.remove('visible');
                }
            });

            // 2. 激活自定义下拉菜单
            modal.querySelectorAll('.qmx-select').forEach(wrapper => {
                const nativeSelect = wrapper.querySelector('select');
                const styledSelect = wrapper.querySelector('.qmx-select-styled');
                const optionsList = wrapper.querySelector('.qmx-select-options');
                styledSelect.textContent = nativeSelect.options[nativeSelect.selectedIndex].text;
                optionsList.innerHTML = '';
                for (const option of nativeSelect.options) {
                    const optionDiv = document.createElement('div');
                    optionDiv.textContent = option.text;
                    optionDiv.dataset.value = option.value;
                    if (option.selected) optionDiv.classList.add('selected');
                    optionsList.appendChild(optionDiv);
                }
                styledSelect.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.qmx-select.active').forEach(el => {
                        if (el !== wrapper) el.classList.remove('active');
                    });
                    wrapper.classList.toggle('active');
                });
                optionsList.querySelectorAll('div').forEach(optionDiv => {
                    optionDiv.addEventListener('click', () => {
                        styledSelect.textContent = optionDiv.textContent;
                        nativeSelect.value = optionDiv.dataset.value;
                        optionsList.querySelector('.selected')?.classList.remove('selected');
                        optionDiv.classList.add('selected');
                        wrapper.classList.remove('active');
                    });
                });
            });
            document.addEventListener('click', () => modal.querySelectorAll('.qmx-select.active').forEach(el => el.classList.remove('active')));

            // 3. 激活范围滑块
            const minSlider = modal.querySelector('#setting-min-delay');
            const maxSlider = modal.querySelector('#setting-max-delay');
            const sliderValues = modal.querySelector('.qmx-range-slider-values');
            const progress = modal.querySelector('.qmx-range-slider-progress');
            function updateSliderView() {
                if (parseFloat(minSlider.value) > parseFloat(maxSlider.value)) {
                    maxSlider.value = minSlider.value;
                }
                sliderValues.textContent = `${minSlider.value} s - ${maxSlider.value} s`;
                const minPercent = ((minSlider.value - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
                const maxPercent = ((maxSlider.value - maxSlider.min) / (maxSlider.max - minSlider.min)) * 100;
                progress.style.left = `${minPercent}%`;
                progress.style.width = `${maxPercent - minPercent}%`;
            }
            minSlider.addEventListener('input', updateSliderView);
            maxSlider.addEventListener('input', updateSliderView);
            updateSliderView();

            // 4. 激活UI显示和底部按钮
            document.getElementById('qmx-modal-backdrop').classList.add('visible');
            modal.classList.add('visible');
            document.body.classList.add('qmx-modal-open-scroll-lock');

            modal.querySelector('#qmx-settings-cancel-btn').onclick = () => this.hideSettingsPanel();
            modal.querySelector('#qmx-settings-save-btn').onclick = () => this.saveSettings();
            modal.querySelector('#qmx-settings-reset-btn').onclick = () => {
                if (confirm("确定要恢复所有默认设置吗？此操作会刷新页面。")) {
                    SettingsManager.reset();
                    window.location.reload();
                }
            };

            // 5. 激活标签页切换
            modal.querySelectorAll('.tab-link').forEach(button => {
                button.onclick = (e) => {
                    const tabId = e.target.dataset.tab;
                    modal.querySelectorAll('.tab-link.active').forEach(btn => btn.classList.remove('active'));
                    modal.querySelectorAll('.tab-content.active').forEach(content => content.classList.remove('active'));
                    e.target.classList.add('active');
                    modal.querySelector(`#tab-${tabId}`).classList.add('active');
                };
            });

            const themeToggle = modal.querySelector('#setting-theme-mode');
            if (themeToggle) {
                themeToggle.addEventListener('change', (e) => {
                    const newTheme = e.target.checked ? 'dark' : 'light';
                    ThemeManager.applyTheme(newTheme);
                });
            }
        },

        /**
         * 隐藏设置面板
         */
        hideSettingsPanel() {
            const modal = document.getElementById('qmx-settings-modal');
            modal.classList.remove('visible');
            document.body.classList.remove('qmx-modal-open-scroll-lock');
            // 如果主面板不是居中模式，则背景遮罩也应该隐藏
            if (SETTINGS.MODAL_DISPLAY_MODE !== 'centered' || !document.getElementById('qmx-modal-container').classList.contains('visible')) {
                 document.getElementById('qmx-modal-backdrop').classList.remove('visible');
            }
        },

        /**
         * 从UI读取并保存设置
         */
        saveSettings() {
            // 从UI读取所有暴露出来的值，并进行单位转换
            const newSettings = {
                // Tab 1: 基本设置
                CONTROL_ROOM_ID: document.getElementById('setting-control-room-id').value,
                AUTO_PAUSE_ENABLED: document.getElementById('setting-auto-pause').checked,
                DAILY_LIMIT_ACTION: document.getElementById('setting-daily-limit-action').value,
                MODAL_DISPLAY_MODE: document.getElementById('setting-modal-mode').value,
                THEME: document.getElementById('setting-theme-mode').checked ? 'light' : 'dark', // 保存主题设置

                // Tab 2: 性能与延迟 (单位转换：从 秒/分钟 转为 毫秒)
                INITIAL_SCRIPT_DELAY: parseFloat(document.getElementById('setting-initial-script-delay').value) * 1000,
                AUTO_PAUSE_DELAY_AFTER_ACTION: parseFloat(document.getElementById('setting-auto-pause-delay').value) * 1000,
                SWITCHING_CLEANUP_TIMEOUT: parseFloat(document.getElementById('setting-switching-cleanup-timeout').value) * 1000,
                UNRESPONSIVE_TIMEOUT: parseInt(document.getElementById('setting-unresponsive-timeout').value, 10) * 60000,
                RED_ENVELOPE_LOAD_TIMEOUT: parseFloat(document.getElementById('setting-red-envelope-timeout').value) * 1000,
                POPUP_WAIT_TIMEOUT: parseFloat(document.getElementById('setting-popup-wait-timeout').value) * 1000,
                ELEMENT_WAIT_TIMEOUT: parseFloat(document.getElementById('setting-worker-loading-timeout').value) * 1000,
                MIN_DELAY: parseFloat(document.getElementById('setting-min-delay').value) * 1000,
                MAX_DELAY: parseFloat(document.getElementById('setting-max-delay').value) * 1000,
                CLOSE_TAB_DELAY: parseFloat(document.getElementById('setting-close-tab-delay').value) * 1000,
                HEALTHCHECK_INTERVAL: parseFloat(document.getElementById('setting-healthcheck-interval').value) * 1000,
                DISCONNECTED_GRACE_PERIOD: parseFloat(document.getElementById('setting-disconnected-grace-period').value) * 1000,   

                // Tab 3: 高级设置
                MAX_WORKER_TABS: parseInt(document.getElementById('setting-max-tabs').value, 10),
                API_ROOM_FETCH_COUNT: parseInt(document.getElementById('setting-api-fetch-count').value, 10),
                API_RETRY_COUNT: parseInt(document.getElementById('setting-api-retry-count').value, 10),
                API_RETRY_DELAY: parseFloat(document.getElementById('setting-api-retry-delay').value) * 1000,
            };

            // 获取所有已存在的用户设置，以保留那些未在UI中暴露的设置
            const existingUserSettings = GM_getValue(SettingsManager.STORAGE_KEY, {});
            // 将未在UI中暴露的旧设置与新设置合并
            const finalSettingsToSave = Object.assign(existingUserSettings, newSettings);

            // 删除已废弃的 OPEN_TAB_DELAY，以防旧配置残留
            delete finalSettingsToSave.OPEN_TAB_DELAY;

            SettingsManager.save(finalSettingsToSave);

            alert("设置已保存！页面将刷新以应用所有更改。");
            window.location.reload();
        },

        /**
         * 为所有UI元素绑定事件监听器
         */
        bindEvents() {
            Utils.log("为UI元素绑定事件...");

            const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
            const modalContainer = document.getElementById('qmx-modal-container');
            const modalBackdrop = document.getElementById('qmx-modal-backdrop');

            // --- 核心交互：主按钮的点击与拖拽 ---
            this.setupDrag(mainButton, SETTINGS.BUTTON_POS_STORAGE_KEY, () => this.showPanel());

            // 仅在浮动模式下，插件面板本身才可拖动
            if (SETTINGS.MODAL_DISPLAY_MODE === 'floating') {
                const modalHeader = modalContainer.querySelector('.qmx-modal-header');
                // 面板拖拽不需要点击行为，所以第三个参数留空或不传
                this.setupDrag(modalContainer, 'douyu_qmx_modal_position', null, modalHeader);
            }

            // --- 关闭事件 ---
            document.getElementById('qmx-modal-close-btn').onclick = () => this.hidePanel();
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modalContainer.classList.contains('visible')) {
                    this.hidePanel();
                }
            });

            // 只有在非注入模式下才可能有背景，才需要绑定事件
            if (SETTINGS.MODAL_DISPLAY_MODE !== 'inject-rank-list') {
                modalBackdrop.onclick = () => this.hidePanel();
            }

            document.getElementById('qmx-modal-open-btn').onclick = () => this.openOneNewTab();
            document.getElementById('qmx-modal-settings-btn').onclick = () => this.showSettingsPanel();
            document.getElementById('qmx-modal-close-all-btn').onclick = () => {
                if (confirm("确定要关闭所有工作标签页吗？")) {
                    Utils.log("用户请求关闭所有标签页。");

                    // 1: 向所有工作页广播关闭指令
                    Utils.log("通过 BroadcastChannel 发出 CLOSE_ALL 指令...");
                    this.commandChannel.postMessage({ action: 'CLOSE_ALL', target: '*' });

                    // 2: 清空全局状态中的所有标签页，无论工作页是否收到指令，控制中心都认为它们已被处理
                    Utils.log("强制清空全局状态中的标签页列表...");
                    const state = GlobalState.get();
                    if (Object.keys(state.tabs).length > 0) {
                        state.tabs = {}; // 直接清空
                        GlobalState.set(state);
                    }

                    // 3: 重新渲染UI，面板变空
                    this.renderDashboard();
                }
            }
            document.getElementById('qmx-tab-list').addEventListener('click', (e) => {
                const closeButton = e.target.closest('.qmx-tab-close-btn');
                if (!closeButton) return;

                const roomItem = e.target.closest('[data-room-id]');
                const roomId = roomItem?.dataset.roomId;
                if (!roomId) return;

                Utils.log(`[控制中心] 用户请求关闭房间: ${roomId}。`);

                // 1. 立即更新UI和状态 (这部分保留)
                const state = GlobalState.get();
                delete state.tabs[roomId];
                GlobalState.set(state); // 仍然需要更新 tabs 列表

                // 2. 发送关闭指令
                Utils.log(`通过 BroadcastChannel 向 ${roomId} 发出 CLOSE 指令...`);
                this.commandChannel.postMessage({ action: 'CLOSE', target: roomId }); // 通过广播发送单点指令

                // 3. 立即在UI上模拟移除，而不是等待下一次renderDashboard
                roomItem.style.opacity = '0';
                roomItem.style.transform = 'scale(0.8)';
                roomItem.style.transition = 'all 0.3s ease';
                setTimeout(() => roomItem.remove(), 300);
            });
        },

        /**
         * 渲染仪表盘，从GlobalState获取数据并更新UI。
         */
        renderDashboard() {
            const state = GlobalState.get();
            const tabList = document.getElementById('qmx-tab-list');
            if (!tabList) return;

            const tabIds = Object.keys(state.tabs);
            Utils.log(`[Render] 开始渲染，检测到 ${tabIds.length} 个活动标签页。IDs: [${tabIds.join(', ')}]`); // 新增日志

            document.getElementById('qmx-active-tabs-count').textContent = tabIds.length;

            const statusDisplayMap = {
                OPENING: '加载中', WAITING: '等待中', CLAIMING: '领取中', SWITCHING: '切换中',
                DORMANT: '休眠中', ERROR: '出错了', UNRESPONSIVE: '无响应', DISCONNECTED: '已断开',STALLED: 'UI节流' 
            };

            const existingRoomIds = new Set(Array.from(tabList.children).map(node => node.dataset.roomId).filter(Boolean));
            Utils.log(`[Render] 当前UI上显示的IDs: [${Array.from(existingRoomIds).join(', ')}]`); // 新增日志

            // --- 核心更新/创建循环 ---
            tabIds.forEach(roomId => {
                const tabData = state.tabs[roomId];
                let existingItem = tabList.querySelector(`[data-room-id="${roomId}"]`);

                let currentStatusText = tabData.statusText;

                // 使用 endTime 来计算剩余时间
                if (tabData.status === 'WAITING'|| tabData.status === 'STALLED' && tabData.countdown?.endTime) {
                    const remainingSeconds = (tabData.countdown.endTime - Date.now()) / 1000;

                    if (remainingSeconds > 0) {
                        currentStatusText = `倒计时 ${Utils.formatTime(remainingSeconds)}`;
                    } else {
                        currentStatusText = '等待开抢...';
                    }
                }

                if (existingItem) {
                    // --- A. 如果条目已存在，则只更新内容 (UPDATE path) ---
                    Utils.log(`[Render] 房间 ${roomId}: UI条目已存在，准备更新。状态: ${tabData.status}, 文本: "${currentStatusText}"`); // 新增日志
                    const nicknameEl = existingItem.querySelector('.qmx-tab-nickname');
                    const statusNameEl = existingItem.querySelector('.qmx-tab-status-name');
                    const statusTextEl = existingItem.querySelector('.qmx-tab-status-text');
                    const dotEl = existingItem.querySelector('.qmx-tab-status-dot');

                    if (tabData.nickname && nicknameEl.textContent !== tabData.nickname) {
                        nicknameEl.textContent = tabData.nickname;
                    }

                    const newStatusName = `[${statusDisplayMap[tabData.status] || tabData.status}]`;
                    if (statusNameEl.textContent !== newStatusName) {
                        statusNameEl.textContent = newStatusName;
                        dotEl.style.backgroundColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
                    }
                    if (statusTextEl.textContent !== currentStatusText) {
                        statusTextEl.textContent = currentStatusText;
                    }
                } else {
                    // --- B. 如果条目不存在，则创建并添加 (CREATE path) ---
                    Utils.log(`[Render] 房间 ${roomId}: UI条目不存在，执行创建！状态: ${tabData.status}, 文本: "${currentStatusText}"`); // 新增日志
                    const newItem = this.createTaskItem(roomId, tabData, statusDisplayMap, currentStatusText);
                    tabList.appendChild(newItem);
                    requestAnimationFrame(() => {
                        newItem.classList.add('qmx-item-enter-active');
                        setTimeout(() => newItem.classList.remove('qmx-item-enter'), 300);
                    });
                }
            });

            // --- 处理删除 (DELETE path) ---
            existingRoomIds.forEach(roomId => {
                if (!state.tabs[roomId]) {
                    const itemToRemove = tabList.querySelector(`[data-room-id="${roomId}"]`);
                    if (itemToRemove && !itemToRemove.classList.contains('qmx-item-exit-active')) {
                        Utils.log(`[Render] 房间 ${roomId}: 在最新状态中已消失，执行移除。`); // 新增日志
                        itemToRemove.classList.add('qmx-item-exit-active');
                        setTimeout(() => itemToRemove.remove(), 300);
                    }
                }
            });

            // --- 处理空列表和上限状态 ---
            const emptyMsg = tabList.querySelector('.qmx-empty-list-msg');
            if (tabIds.length === 0) {
                if (!emptyMsg) {
                    tabList.innerHTML = '<div class="qmx-tab-list-item qmx-empty-list-msg">没有正在运行的任务</div>';
                }
            } else if (emptyMsg) {
                emptyMsg.remove();
            }
            this.renderLimitStatus();
        },

        /**
         * 专门处理和渲染每日上限状态的UI部分。
         */
        renderLimitStatus() {
            let limitState = GlobalState.getDailyLimit();
            let limitMessageEl = document.getElementById('qmx-limit-message');
            const openBtn = document.getElementById('qmx-modal-open-btn');

            // 新的一天，自动重置上限状态
            if (limitState?.reached && Utils.formatDateAsBeijing(new Date(limitState.timestamp)) !== Utils.formatDateAsBeijing(new Date())) {
                Utils.log("[控制中心] 新的一天，重置每日上限旗标。");
                GlobalState.setDailyLimit(false);
                limitState = null; // 重置后立即生效
            }

            if (limitState?.reached) {
                if (!limitMessageEl) {
                    limitMessageEl = document.createElement('div');
                    limitMessageEl.id = 'qmx-limit-message';
                    limitMessageEl.style.cssText = 'padding: 10px 24px; background-color: var(--status-color-error); color: white; font-weight: 500; text-align: center;';
                    const header = document.querySelector('.qmx-modal-header');
                    header.parentNode.insertBefore(limitMessageEl, header.nextSibling); // 确保在标题下方插入
                    document.querySelector('.qmx-modal-header').after(limitMessageEl);
                }

                if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                    limitMessageEl.textContent = '今日已达上限。任务休眠中，可新增标签页为明日准备。';
                    openBtn.disabled = false;
                    openBtn.textContent = '新增休眠标签页';
                } else {
                    limitMessageEl.textContent = '今日已达上限。任务已全部停止。';
                    openBtn.disabled = true;
                    openBtn.textContent = '今日已达上限';
                }
            } else {
                if(limitMessageEl) limitMessageEl.remove();
                openBtn.disabled = false;
                openBtn.textContent = '打开新房间';
            }
        },

        /**
         * 处理打开新标签页的逻辑。
         */
        async openOneNewTab() {
            const openBtn = document.getElementById('qmx-modal-open-btn');
            if (openBtn.disabled) return;

            const state = GlobalState.get();
            const openedCount = Object.keys(state.tabs).length;
            if (openedCount >= SETTINGS.MAX_WORKER_TABS) {
                Utils.log(`已达到最大标签页数量 (${SETTINGS.MAX_WORKER_TABS})。`);
                return;
            }

            openBtn.disabled = true;
            openBtn.textContent = '正在查找...';

            try {
                const openedRoomIds = new Set(Object.keys(state.tabs));
                const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT);
                const newUrl = apiRoomUrls.find(url => {
                    const rid = url.match(/\/(\d+)/)?.[1];
                    return rid && !openedRoomIds.has(rid);
                });

                if (newUrl) {
                    const newRoomId = newUrl.match(/\/(\d+)/)[1];

                    const pendingWorkers = GM_getValue('qmx_pending_workers', []);
                    pendingWorkers.push(newRoomId);
                    GM_setValue('qmx_pending_workers', pendingWorkers);
                    Utils.log(`已将房间 ${newRoomId} 加入待处理列表。`);

                    GlobalState.updateWorker(newRoomId, 'OPENING', '正在打开...');
                    GM_openInTab(newUrl, { active: false, setParent: true });
                    Utils.log(`打开指令已发送: ${newUrl}`);
                } else {
                    Utils.log("未能找到新的、未打开的房间。");
                    openBtn.textContent = '无新房间';
                    await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
                }
            } catch (error) {
                Utils.log(`查找或打开房间时出错: ${error.message}`);
                openBtn.textContent = '查找出错';
                await Utils.sleep(SETTINGS.UI_FEEDBACK_DELAY);
            } finally {
                openBtn.disabled = false;
                // renderDashboard会负责将按钮文本恢复正确
            }
        },


        /**
         * 设置拖拽功能 (v3: 使用 CSS 变量解耦，解决动画问题)
         * @param {HTMLElement} element - 要拖拽的元素。
         * @param {string} storageKey - 用于存储位置的键。
         * @param {Function | null} onClick - 当发生有效点击时要执行的回调函数。
         * @param {HTMLElement} [handle=element] - 拖拽手柄，默认为元素本身。
         */
        setupDrag(element, storageKey, onClick, handle = element) {
            let isMouseDown = false;
            let hasDragged = false;
            let startX, startY, initialX, initialY;
            const clickThreshold = 5;

            const setPosition = (x, y) => {
                element.style.setProperty('--tx', `${x}px`);
                element.style.setProperty('--ty', `${y}px`);
            };

            const savedPos = GM_getValue(storageKey);
            if (savedPos && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
                setPosition(savedPos.x, savedPos.y);
            } else {
                if (element.id === SETTINGS.DRAGGABLE_BUTTON_ID) {
                    const padding = SETTINGS.DRAG_BUTTON_DEFAULT_PADDING;
                    const defaultX = window.innerWidth - element.offsetWidth - padding;
                    const defaultY = padding;
                    setPosition(defaultX, defaultY);
                } else {
                    const defaultX = (window.innerWidth - element.offsetWidth) / 2;
                    const defaultY = (window.innerHeight - element.offsetHeight) / 2;
                    setPosition(defaultX, defaultY);
                }
            }

            const onMouseDown = (e) => {
                if (e.button !== 0) return;

                isMouseDown = true;
                hasDragged = false;

                const rect = element.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                initialX = rect.left;
                initialY = rect.top;

                element.classList.add('is-dragging'); // 拖动开始时，立即禁用动画
                handle.style.cursor = 'grabbing';

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp, { once: true });
            };

            const onMouseMove = (e) => {
                if (!isMouseDown) return;
                e.preventDefault();

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (!hasDragged && Math.sqrt(dx * dx + dy * dy) > clickThreshold) {
                    hasDragged = true;
                }

                let newX = initialX + dx;
                let newY = initialY + dy;

                const maxX = window.innerWidth - element.offsetWidth;
                const maxY = window.innerHeight - element.offsetHeight;
                newX = Math.max(0, Math.min(newX, maxX));
                newY = Math.max(0, Math.min(newY, maxY));

                setPosition(newX, newY);
            };

            const onMouseUp = () => {
                isMouseDown = false;
                document.removeEventListener('mousemove', onMouseMove);

                element.classList.remove('is-dragging');
                handle.style.cursor = 'grab';

                if (hasDragged) {
                    // 拖拽结束：保存位置
                    const finalRect = element.getBoundingClientRect();
                    GM_setValue(storageKey, { x: finalRect.left, y: finalRect.top });
                } else {
                    // 未拖拽：执行点击
                    if (onClick && typeof onClick === 'function') {
                        onClick();
                    }
                }
            };

            handle.addEventListener('mousedown', onMouseDown);
        },

        /**
         * 显示控制面板
         */
        showPanel() {
            const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
            const modalContainer = document.getElementById('qmx-modal-container');

            mainButton.classList.add('hidden');

            if (this.isPanelInjected) {
                // --- 侧边栏模式 ---
                this.injectionTarget.classList.add('qmx-hidden');
                modalContainer.classList.remove('qmx-hidden');
            } else {
                // --- 浮动/居中模式 ---
                modalContainer.classList.add('visible');
                // 仅在居中模式下显示背景遮罩
                if (SETTINGS.MODAL_DISPLAY_MODE === 'centered') {
                    document.getElementById('qmx-modal-backdrop').classList.add('visible');
                }
            }
            Utils.log("控制面板已显示。");
        },

        /**
         * 隐藏控制面板
         */
        hidePanel() {
            const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
            const modalContainer = document.getElementById('qmx-modal-container');

            mainButton.classList.remove('hidden');

            if (this.isPanelInjected) {
                // --- 侧边栏模式 ---
                modalContainer.classList.add('qmx-hidden');
                if (this.injectionTarget) {
                    this.injectionTarget.classList.remove('qmx-hidden');
                }
            } else {
                // --- 浮动/居中模式 ---
                modalContainer.classList.remove('visible');
                // 仅在居中模式下隐藏背景遮罩
                if (SETTINGS.MODAL_DISPLAY_MODE === 'centered') {
                    document.getElementById('qmx-modal-backdrop').classList.remove('visible');
                }
            }
            Utils.log("控制面板已隐藏。");
        },

        /**
         * 创建任务列表项的HTML元素
         */
        createTaskItem(roomId, tabData, statusMap, statusText) {
            const newItem = document.createElement('div');
            newItem.className = 'qmx-tab-list-item qmx-item-enter';
            newItem.dataset.roomId = roomId;

            const statusColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
            const nickname = tabData.nickname || '加载中...';
            const statusName = statusMap[tabData.status] || tabData.status;

            newItem.innerHTML = `
                <div class="qmx-tab-status-dot" style="background-color: ${statusColor};"></div>
                <div class="qmx-tab-info">
                    <div class="qmx-tab-header">
                        <span class="qmx-tab-nickname">${nickname}</span>
                        <span class="qmx-tab-room-id">${roomId}</span>
                    </div>
                    <div class="qmx-tab-details">
                        <span class="qmx-tab-status-name">[${statusName}]</span>
                        <span class="qmx-tab-status-text">${statusText}</span>
                    </div>
                </div>
                <button class="qmx-tab-close-btn" title="关闭该标签页">×</button>
            `;
            return newItem;
        },

        /**
         * 应用当前配置的模态框模式
         */
        applyModalMode() {
            const modalContainer = document.getElementById('qmx-modal-container');
            if (!modalContainer) return;

            const mode = SETTINGS.MODAL_DISPLAY_MODE;
            Utils.log(`尝试应用模态框模式: ${mode}`);

            if (mode === 'inject-rank-list') {
                const waitForTarget = (retries = SETTINGS.INJECT_TARGET_RETRIES, interval = SETTINGS.INJECT_TARGET_INTERVAL) => {
                    const target = document.querySelector(SETTINGS.SELECTORS.rankListContainer);
                    if (target) {
                        Utils.log("注入目标已找到，开始注入...");
                        this.injectionTarget = target;
                        this.isPanelInjected = true;
                        target.parentNode.insertBefore(modalContainer, target.nextSibling);
                        modalContainer.classList.add('mode-inject-rank-list', 'qmx-hidden');
                    } else if (retries > 0) {
                        setTimeout(() => waitForTarget(retries - 1, interval), interval);
                    } else {
                        Utils.log(`[注入失败] 未找到目标元素 "${SETTINGS.SELECTORS.rankListContainer}"。`);
                        Utils.log("[降级] 自动切换到 'floating' 备用模式。");
                        SETTINGS.MODAL_DISPLAY_MODE = 'floating';
                        this.applyModalMode();
                        SETTINGS.MODAL_DISPLAY_MODE = 'inject-rank-list';
                    }
                };
                waitForTarget();
                return;
            }

            // 对于所有非注入模式 (centered, floating)
            this.isPanelInjected = false;
            modalContainer.classList.remove('mode-inject-rank-list', 'qmx-hidden');
            modalContainer.classList.add(`mode-${mode}`);

        },

    };
    /**
     * =================================================================================
     * 脚本主入口 (Main)
     * ---------------------------------------------------------------------------------
     * 判断当前页面类型，并调用相应的模块进行初始化。
     * =================================================================================
     */
    function main() {
        const currentUrl = window.location.href;
        const isControlRoom = currentUrl.includes(`/${SETTINGS.CONTROL_ROOM_ID}`) ||
                            (currentUrl.includes(`/topic/`) && currentUrl.includes(`rid=${SETTINGS.TEMP_CONTROL_ROOM_RID}`));

        if (isControlRoom) {
            ControlPage.init();
            return; // 控制页逻辑独立，直接返回
        }

        // --- 工作页身份验证逻辑 ---
        const roomId = Utils.getCurrentRoomId();
        // 只有在明确是直播间页面的情况下才继续验证
        if (roomId && (currentUrl.match(/douyu\.com\/(?:beta\/)?(\d+)/) || currentUrl.match(/douyu\.com\/(?:beta\/)?topic\/.*rid=(\d+)/))) {
            
            const globalTabs = GlobalState.get().tabs;
            const pendingWorkers = GM_getValue('qmx_pending_workers', []);

            // 双重验证
            // 1. 检查自己是否已经是全局状态里公认的 worker
            // 2. 或者，检查自己是否是刚刚被打开、尚在等待名单中的 new worker
            if (globalTabs.hasOwnProperty(roomId) || pendingWorkers.includes(roomId)) {
                // 验证通过，授权 WorkerPage 初始化
                Utils.log(`[身份验证] 房间 ${roomId} 身份合法，授权初始化。`);
                //  如果是因为在全局状态中而通过的，顺便清理一下可能残留的 pending token
                const pendingIndex = pendingWorkers.indexOf(roomId);
                if (globalTabs.hasOwnProperty(roomId) && pendingIndex > -1) {
                    pendingWorkers.splice(pendingIndex, 1);
                    GM_setValue('qmx_pending_workers', pendingWorkers);
                    Utils.log(`[身份清理] 房间 ${roomId} 已是激活状态，清理残留的待处理标记。`);
                }
                
                WorkerPage.init();
            } else {
                // 验证失败，是普通页面
                Utils.log(`[身份验证] 房间 ${roomId} 未在全局状态或待处理列表中，脚本不活动。`);
            }

        } else {
            Utils.log("当前页面非控制页或工作页，脚本不活动。");
        }
    }
    // 延迟启动脚本，等待页面加载
    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1000} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);

})();
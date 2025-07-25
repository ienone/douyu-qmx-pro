// ==UserScript==
// @name         斗鱼全民星推荐自动领取pro
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  自动打开、领取并切换直播间处理全民星推荐活动红包，并尝试自动暂停视频。
// @author       ienone
// @original-author ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)
// @match        *://www.douyu.com/6657*
// @match        *://www.douyu.com/*
// @match        *://www.douyu.com/topic/*?rid=[0-9]*
// @grant        GM_openInTab
// @grant        GM_closeTab
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
        SCRIPT_PREFIX: "[全民星推荐助手]",
        CONTROL_ROOM_ID: "6657",
        TEMP_CONTROL_ROOM_RID: "6979222",

        // --- 时间控制 (ms) ---
        CHECK_INTERVAL: 1000,
        POPUP_WAIT_TIMEOUT: 20000,
        PANEL_WAIT_TIMEOUT: 10000,
        ELEMENT_WAIT_TIMEOUT: 30000,
        RED_ENVELOPE_LOAD_TIMEOUT: 15000,
        MIN_DELAY: 1000,
        MAX_DELAY: 2500,
        OPEN_TAB_DELAY: 1000,
        CLOSE_TAB_DELAY: 1500,
        INITIAL_SCRIPT_DELAY: 3000,
        MAX_TAB_LIFETIME_MS: 10 * 60 * 1000, // 10分钟
        NO_ENVELOPE_SWITCH_TIMEOUT: 30000, // 30秒。如果红包区持续消失30秒，则切换房间

        // --- UI 与交互 ---
        DRAGGABLE_BUTTON_ID: 'douyu-qmx-starter-button',
        BUTTON_POS_STORAGE_KEY: 'douyu_qmx_button_position',
        MODAL_DISPLAY_MODE: 'floating', // 可选: 'centered', 'floating', 'inject-rank-list'

        // --- API 相关 ---
        API_URL: "https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list",
        API_RETRY_COUNT: 3,
        API_RETRY_DELAY: 5000,

        // --- 业务逻辑配置 ---
        MAX_WORKER_TABS: 24,
        DAILY_LIMIT_ACTION: 'CONTINUE_DORMANT', // 可选: 'STOP_ALL', 'CONTINUE_DORMANT'
        AUTO_PAUSE_ENABLED: true,
        AUTO_PAUSE_CHECK_INTERVAL: 2000, // 自动暂停检查间隔 (ms)
        AUTO_PAUSE_DELAY_AFTER_ACTION: 5000,

        // --- 存储键名 ---
        STATE_STORAGE_KEY: 'douyu_qmx_dashboard_state',
        DAILY_LIMIT_REACHED_KEY: 'douyu_qmx_daily_limit_reached',


        // --- 监控与轮询 ---
        WORKER_STALE_TIMEOUT: 30000,         // 工作标签页失联超时时间 (ms)
        WORKER_LOADING_TIMEOUT: 45000,       // 工作标签页加载超时时间 (ms)
        COMMAND_POLL_INTERVAL: 500,          // 工作页轮询命令间隔 (ms)
        
        // --- UI 与 API ---
        INJECT_TARGET_RETRIES: 10,           // 侧边栏注入重试次数
        INJECT_TARGET_INTERVAL: 500,         // 侧边栏注入重试间隔 (ms)
        API_ROOM_FETCH_COUNT: 10,            // 单次从API获取的房间建议数量
        UI_FEEDBACK_DELAY: 2000,             // UI提示信息（如“无新房间”）的显示时长
        DRAG_BUTTON_DEFAULT_PADDING: 20,     // 主按钮距离屏幕边缘的默认间距 (px)


        // --- 选择器 ---
        SELECTORS: {
            redEnvelopeContainer: "#layout-Player-aside div.LiveNewAnchorSupportT-enter",
            countdownTimer: "span.LiveNewAnchorSupportT-enter--bottom",
            popupModal: "body > div.LiveNewAnchorSupportT-pop",
            openButton: "div.LiveNewAnchorSupportT-singleBag--btnOpen",
            closeButton: "div.LiveNewAnchorSupportT-pop--close",
            criticalElement: "#js-player-video",
            pauseButton: "div.pause-c594e8:not(.removed-9d4c42)",
            playButton: "div.play-8dbf03:not(.removed-9d4c42)",
            rewardText: ".LiveNewAnchorSupportT-pop .prop-item-name",
            limitReachedPopup: "div.dy-Message-custom-content.dy-Message-info",
            rankListContainer: "#layout-Player-aside > div.layout-Player-asideMainTop > div.layout-Player-rank",
            anchorName: "div.Title-anchorName > h2.Title-anchorNameH2",
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
            // 使用 Object.assign 创建一个新对象，避免修改原始的 CONFIG
            // 用户设置会覆盖同名的默认设置
            return Object.assign({}, CONFIG, userSettings);
        },

        /**
         * 保存用户的自定义设置。
         * @param {object} settingsToSave - 只包含用户修改过的设置的对象。
         */
        save(settingsToSave) {
            GM_setValue(this.STORAGE_KEY, settingsToSave);
        },

        /**
         * 重置为默认设置。
         */
        reset() {
            GM_deleteValue(this.STORAGE_KEY);
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

    /**
     * =================================================================================
     * 模块：运行时状态 (STATE)
     * ---------------------------------------------------------------------------------
     * 存储脚本运行期间会动态变化的变量。
     * =================================================================================
     */
    const STATE = {
        mainIntervalId: null,
        pauseIntervalId: null,
        isWaitingForPopup: false,
        isSwitchingRoom: false,
        tabStartTime: 0,
        lastActionTime: 0,
        isPausedByScript: false,
        noEnvelopeSince: 0, // 记录红包区域从何时开始消失，0表示未消失
        isWakeUpCallScheduled: false, // 是否已经为下一次抢红包设置了唤醒闹钟
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
            const match = window.location.href.match(/douyu\.com\/(?:topic\/[^?]+\?rid=|(\d+))/);
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
        }

    };

    /**
     * =================================================================================
     * 模块：跨页面状态管理器 (GlobalState)
     * ---------------------------------------------------------------------------------
     * 封装所有对 GM_setValue 和 GM_getValue 的操作，用于页面间通信。
     * =================================================================================
     */
    const GlobalState = {
        /**
         * 获取完整的共享状态对象。
         * @returns {{tabs: object, rewards: Array, command: object|null}} - 共享状态。
         */
        get() {
            return GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tabs: {}, command: null });
        },

        /**
         * 保存完整的共享状态对象。
         * @param {object} state - 要保存的状态。
         */
        set(state) {
            GM_setValue(SETTINGS.STATE_STORAGE_KEY, state);
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

            // 1. 获取当前房间的数据引用。如果不存在，则创建一个新的空对象
            const tabData = state.tabs[roomId] || {};

            // 2.备份旧昵称
            const preservedNickname = tabData.nickname;

            // 3. 更新基础信息
            tabData.status = status;
            tabData.statusText = statusText;
            tabData.lastUpdateTime = Date.now();

            // 4. 应用新的 options (这会覆盖 status, statusText 等，但没关系，因为我们刚设置过)
            Object.assign(tabData, options);

            // 5. 确保昵称不丢失。
            if (!tabData.nickname && preservedNickname) {
                tabData.nickname = preservedNickname;
            }

            // 6. 将更新后的 tabData 写回到 state 对象中
            state.tabs[roomId] = tabData;
            
            // 7. 保存最终的完整状态
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
            Utils.log(`已从状态面板移除房间: ${roomId}`);
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
                Utils.log(`[点击失败] 无法找到元素: ${description}`);
                return false;
            }
            try {
                if (window.getComputedStyle(element).display === 'none') {
                     Utils.log(`[点击失败] 元素不可见: ${description}`);
                     return false;
                }
                await Utils.sleep(Utils.getRandomDelay(SETTINGS.MIN_DELAY / 2, SETTINGS.MAX_DELAY / 2));
                Utils.log(`尝试点击: ${description}`);
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
        /**
         * 工作页面的总入口和初始化函数。
         */
        hasReportedCountdown: false, // 是否已报告过倒计时状态


        /**
         * 初始化工作页面。
         * 在这里设置所有必要的事件监听器和定时器。
         * @returns {Promise<void>}
         * @throws {Error} 如果无法识别当前房间ID。
         * @description
         * 初始化工作页面的主要逻辑：
         * 1. 获取当前房间ID。
         * 2. 启动命令轮询器，监听来自控制页面的指令。
         * 3. 检查全局状态，判断是否需要进入休眠模式或关闭页面。
         * 4. 并行等待红包活动区域和页面加载状态。
         * 5. 启动核心任务循环，定时检查红包状态。
         * 6. 处理红包领取逻辑，包括弹窗等待和奖励记录。
         * 7. 自动暂停视频播放。
         * 8. 切换房间逻辑，处理标签页切换和关闭。
         * 9. 进入休眠模式，等待午夜刷新。
         * 10. 统一的自毁程序，停止所有活动并关闭标签页。
         */
        async init() {
            Utils.log("当前是工作页面，开始初始化...");
            const roomId = Utils.getCurrentRoomId();
            if (!roomId) {
                Utils.log("无法识别当前房间ID，脚本停止。");
                return;
            }
            
            // 启动命令轮询器，接收来自控制页面的指令
            this.startCommandPoller(roomId);
            
            // 页面关闭前，从全局状态中移除自己
            window.addEventListener('beforeunload', () => GlobalState.removeWorker(roomId));

            GlobalState.updateWorker(roomId, 'OPENING', '页面加载中...');

            // 初始化检查：如果全局已达上限，则根据策略执行相应操作
            const limitState = GlobalState.getDailyLimit();
            if (limitState?.reached) {
                Utils.log("初始化检查：检测到全局上限旗标。");
                if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                    await this.enterDormantMode();
                } else {
                    await this.stopAndClose();
                }
                return; // 中断后续初始化
            }

            STATE.tabStartTime = Date.now();
            STATE.lastActionTime = Date.now();
            
            // 并行等待逻辑
            Utils.log(`步骤1: 开始并行等待 [红包活动区域] 和 [页面加载状态]...`);
            try {
                await Promise.race([
                    (async () => {
                        if (await DOM.findElement(SETTINGS.SELECTORS.redEnvelopeContainer, SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT)) {
                            Utils.log("成功找到 [红包活动区域]，初始化继续。");
                            return Promise.resolve("红包区域已找到");
                        }
                        return Promise.reject(new Error("红包区域加载超时"));
                    })(),
                    (async () => {
                        if (!await DOM.findElement(SETTINGS.SELECTORS.criticalElement, SETTINGS.ELEMENT_WAIT_TIMEOUT)) {
                            return Promise.reject(new Error("页面关键元素加载超时"));
                        }
                        // 这是一个“哨兵”，它自己不会成功，只会在失败时发声
                        await Utils.sleep(SETTINGS.ELEMENT_WAIT_TIMEOUT + 1000); 
                    })()
                ]);

            // 红包区域已加载，获取额外信息
            const anchorNameElement = document.querySelector(SETTINGS.SELECTORS.anchorName);
            const nickname = anchorNameElement ? anchorNameElement.textContent.trim() : `房间${roomId}`; // 获取昵称，如果失败则用房间号代替
            
            // 首次状态更新时，将昵称作为附加数据传递
            GlobalState.updateWorker(roomId, 'WAITING', '初始化完成，等待红包状态', { nickname: nickname });

            Utils.log(`初始化成功 (主播: ${nickname})，启动核心任务循环。`);
            STATE.mainIntervalId = setInterval(() => this.mainLoop(), SETTINGS.CHECK_INTERVAL);
            if (SETTINGS.AUTO_PAUSE_ENABLED) {
                STATE.pauseIntervalId = setInterval(() => this.autoPauseVideo(), SETTINGS.AUTO_PAUSE_CHECK_INTERVAL);
            }
            } catch (error) {
                Utils.log(`初始化失败: ${error.message}，将切换房间。`);
                if (error.message.includes("红包区域")) {
                    GlobalState.updateWorker(roomId, 'ERROR', '无红包活动');
                } else {
                    GlobalState.updateWorker(roomId, 'ERROR', '页面加载超时');
                }
                await this.switchRoom();
            }
        },

        /**
         * 核心主循环，定时检查红包状态。
         */
        async mainLoop() {
             // 检查全局上限旗标，如果其他标签页触发了上限，本页面也需要响应
            if (GlobalState.getDailyLimit()?.reached) {
                Utils.log("主循环检测到全局上限旗标，执行相应策略。");
                this.stopAllTimers();
                if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                    await this.enterDormantMode();
                } else {
                    await this.stopAndClose();
                }
                return;
            }

            if (STATE.isWaitingForPopup || STATE.isSwitchingRoom) return;
            
            // 检查标签页是否超时
            if (Date.now() - STATE.tabStartTime > SETTINGS.MAX_TAB_LIFETIME_MS) {
                Utils.log(`标签页达到最大生存时间，切换房间。`);
                await this.switchRoom();
                return;
            }

            const redEnvelopeDiv = document.querySelector(SETTINGS.SELECTORS.redEnvelopeContainer);
            if (!redEnvelopeDiv || window.getComputedStyle(redEnvelopeDiv).display === 'none') {
                // 红包区域不可见
                this.hasReportedCountdown = false;
                
                if (STATE.noEnvelopeSince === 0) {
                    // 第一次检测到消失，启动计时器
                    STATE.noEnvelopeSince = Date.now();
                    Utils.log("红包区域消失，开始计时切换...");
                    GlobalState.updateWorker(Utils.getCurrentRoomId(), 'WAITING', '无红包活动，等待中...');
                } else {
                    // 已经开始计时，检查是否超时
                    const timeout = SETTINGS.NO_ENVELOPE_SWITCH_TIMEOUT;
                    const elapsed = Date.now() - STATE.noEnvelopeSince;
                    if (elapsed > timeout) {
                        Utils.log(`红包区域持续消失超过 ${timeout / 1000} 秒，执行切换。`);
                        await this.switchRoom();
                        return; // 切换后立即退出循环
                    }
                    // 未超时，更新等待状态
                    const remaining = Math.round((timeout - elapsed) / 1000);
                    GlobalState.updateWorker(Utils.getCurrentRoomId(), 'WAITING', `无活动, ${remaining}s后切换`);
                }
                return; // 结束本次循环
            }

            // 如果红包区域可见，则重置计时器
            if (STATE.noEnvelopeSince !== 0) {
                STATE.noEnvelopeSince = 0;
                Utils.log("红包区域已恢复。");
            }

            const statusSpan = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
            if (!statusSpan) {
                 GlobalState.updateWorker(Utils.getCurrentRoomId(), 'ERROR', '找不到状态元素');
                 return;
            }
            
            const statusText = statusSpan.textContent.trim();
            const roomId = Utils.getCurrentRoomId();

            if (statusText.includes(':')) {
                // 如果红包区域恢复，重置“无活动”计时器
                if (STATE.noEnvelopeSince !== 0) { STATE.noEnvelopeSince = 0; }

                try {
                    const [minutes, seconds] = statusText.split(':').map(Number);
                    const durationInSeconds = minutes * 60 + seconds;

                    if (!isNaN(durationInSeconds) && durationInSeconds > 0) {
                        // 只有在尚未设置闹钟时，才进行处理
                        if (!STATE.isWakeUpCallScheduled) {
                            Utils.log(`[智能定时] 发现倒计时: ${statusText}。设置唤醒闹钟...`);
                            
                            // 提前 1s 准备唤醒，留出反应时间
                            const wakeUpDelay = Math.max(0, (durationInSeconds * 1000) - 1000);

                            // 设置一次性的“闹钟”
                            setTimeout(() => {
                                Utils.log(`[智能定时] 闹钟触发！尝试立即执行一次检查...`);
                                // 立即强制执行一次 mainLoop，而不是等待 setInterval
                                this.mainLoop(); 
                                // 闹钟响过后，重置标志，以便为下一次倒计时设置新闹钟
                                STATE.isWakeUpCallScheduled = false; 
                            }, wakeUpDelay);
                            // 标记为已设置闹钟，防止在倒计时期间重复设置
                            STATE.isWakeUpCallScheduled = true;
                        }
                        // 无论是否设置闹钟，心跳和状态更新照常进行
                        GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${statusText}`);
                    }
                } catch (e) { 
                    Utils.log(`[错误] 解析倒计时失败: ${e.message}`);
                    GlobalState.updateWorker(roomId, 'ERROR', `倒计时格式错误: ${statusText}`);
                }
                
            } else if (statusText.includes('抢') || statusText.includes('领')) {
                STATE.isWakeUpCallScheduled = false; // 抢的时刻到来，重置闹钟标志
                this.hasReportedCountdown = false; // 重置报告状态，为下一次做准备
                GlobalState.updateWorker(roomId, 'CLAIMING', `检测到可领取`);
                if (await DOM.safeClick(redEnvelopeDiv, "右下角红包区域")) {
                    await this.claimReward();
                } else {
                    GlobalState.updateWorker(roomId, 'ERROR', '点击右下角红包失败');
                }
            } else {
                this.hasReportedCountdown = false; // 其他状态也重置
                GlobalState.updateWorker(roomId, 'WAITING', `状态未知: ${statusText}`);
            }
        },
        
        /**
         * 处理点击红包后的弹窗逻辑。
         */
        async claimReward() {
            STATE.isWaitingForPopup = true;
            const roomId = Utils.getCurrentRoomId();
            GlobalState.updateWorker(roomId, 'CLAIMING', '等待弹窗...');

            const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, SETTINGS.POPUP_WAIT_TIMEOUT);
            if (!popup) {
                Utils.log("等待红包弹窗超时。");
                STATE.isWaitingForPopup = false;
                return;
            }
            
            GlobalState.updateWorker(roomId, 'CLAIMING', '尝试打开红包...');
            const openBtn = popup.querySelector(SETTINGS.SELECTORS.openButton);
            if (await DOM.safeClick(openBtn, "红包弹窗的打开按钮")) {
                STATE.lastActionTime = Date.now();

                // 立即检查是否触发上限
                if (await DOM.checkForLimitPopup()) {
                    GlobalState.setDailyLimit(true);
                    // mainLoop会在下一次循环时捕获到这个状态并执行相应操作
                    return; 
                }

                // 未触发上限，则尝试记录奖励并关闭弹窗
                await Utils.sleep(1500); // 等待奖励动画
                const rewardPopup = document.querySelector(SETTINGS.SELECTORS.popupModal);
                if (rewardPopup) {
                    const rewardEl = rewardPopup.querySelector(SETTINGS.SELECTORS.rewardText);
                    if (rewardEl?.textContent) {
                        const reward = rewardEl.textContent.trim();
                        Utils.log(`成功领取奖励: ${reward}`);
                    } else {
                        Utils.log("未找到奖励文本（可能为空包）。");
                    }
                    const closeBtn = rewardPopup.querySelector(SETTINGS.SELECTORS.closeButton);
                    await DOM.safeClick(closeBtn, "领取结果弹窗的关闭按钮");
                }
            } else {
                 GlobalState.updateWorker(roomId, 'ERROR', '无法点击打开按钮');
            }
            STATE.isWaitingForPopup = false;
        },

        /**
         * 自动暂停视频播放。
         */
        async autoPauseVideo() {
            if (STATE.isWaitingForPopup || STATE.isSwitchingRoom || Date.now() - STATE.lastActionTime < SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION) {
                return;
            }
            const pauseBtn = document.querySelector(SETTINGS.SELECTORS.pauseButton);
            if (pauseBtn) {
                Utils.log("检测到视频正在播放，尝试自动暂停...");
                if (await DOM.safeClick(pauseBtn, "暂停按钮")) {
                    STATE.isPausedByScript = true;
                    Utils.log("视频已通过脚本暂停。");
                }
            }
        },

        /**
         * 切换到新的直播间。
         */
        async switchRoom() {
            if (STATE.isSwitchingRoom) return;
            STATE.isSwitchingRoom = true;

            Utils.log("开始执行切换房间流程...");
            const currentRoomId = Utils.getCurrentRoomId();

            // 1. 冻结当前页面所有活动，并更新状态
            this.stopAllTimers();
            GlobalState.updateWorker(currentRoomId, 'SWITCHING', '查找新房间...');

            try {
                // 2. 获取 API 房间列表和当前已打开的房间列表
                const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT);
                const currentState = GlobalState.get();
                const openedRoomIds = new Set(Object.keys(currentState.tabs));

                // 3. ★ Bug修复：筛选出未被打开的新房间
                const nextUrl = apiRoomUrls.find(url => {
                    const rid = url.match(/\/(\d+)/)?.[1];
                    return rid && !openedRoomIds.has(rid);
                });

                if (nextUrl) {
                    Utils.log(`确定下一个房间链接: ${nextUrl}`);
                    // 4. 打开新标签页（交棒）
                    GM_openInTab(nextUrl, { active: false, setParent: true });
                    // 5. 等待交棒完成，然后彻底自毁
                    await Utils.sleep(SETTINGS.CLOSE_TAB_DELAY);
                    await this.stopAndClose(); // 使用统一的自毁程序
                } else {
                    Utils.log("API未能返回任何新的、未打开的房间，将关闭当前页。");
                    await this.stopAndClose();
                }
            } catch (error) {
                Utils.log(`切换房间时发生严重错误: ${error.message}`);
                await this.stopAndClose(); // 即使出错，也要确保销毁
            }
        },

        /**
         * 停止所有定时器。
         */
        stopAllTimers() {
            if (STATE.mainIntervalId) clearInterval(STATE.mainIntervalId);
            if (STATE.pauseIntervalId) clearInterval(STATE.pauseIntervalId);
            STATE.mainIntervalId = null;
            STATE.pauseIntervalId = null;
            Utils.log("已停止所有定时器。");
        },

        /**
         * 进入休眠模式，等待午夜刷新。
         */
        async enterDormantMode() {
            const roomId = Utils.getCurrentRoomId();
            Utils.log(`[上限处理] 房间 ${roomId} 进入休眠模式。`);
            this.stopAllTimers();
            GlobalState.updateWorker(roomId, 'DORMANT', '休眠中 (等待0点刷新)');
            
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 0);
            const msUntilMidnight = tomorrow.getTime() - now.getTime();
            
            Utils.log(`将在 ${Math.round(msUntilMidnight / 1000 / 60)} 分钟后自动刷新页面。`);
            setTimeout(() => window.location.reload(), msUntilMidnight);
        },


        /**
         * 统一的自毁程序
         */
        async stopAndClose() {
            // 确保所有活动已停止
            this.stopAllTimers();
            // 从全局状态中移除自己
            GlobalState.removeWorker(Utils.getCurrentRoomId());
            // 短暂等待，确保 GM_setValue 完成
            await Utils.sleep(500);
            // 关闭物理标签页
            this.closeTab();
        },
        
        /**
         * 关闭标签页。
         */
        closeTab() {
            try {
                GM_closeTab();
            } catch (e) {
                // 备用关闭方法
                window.close();
            }
        },

        /**
         * 启动一个定时器，轮询来自控制页的命令。
         * @param {string} roomId - 当前房间ID。
         */

        startCommandPoller(roomId) {
            setInterval(() => {
                const state = GlobalState.get();
                if (state.command && (state.command.target === roomId || state.command.target === '*')) {
                    const { action, target } = state.command;
                    Utils.log(`接收到命令: ${action} for target ${target}`);

                    // 如果是针对自己的单体指令，在执行前就从状态中清除，防止残留重复执行
                    if (target === roomId && action !== 'CLOSE_ALL') {
                        state.command = null;
                        GlobalState.set(state);
                    }
                    
                    if (action === 'CLOSE' || action === 'CLOSE_ALL') {
                        this.stopAndClose(); 
                    }
                }
            }, SETTINGS.COMMAND_POLL_INTERVAL);
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

        /**
         * 控制页面的总入口和初始化函数。
         */
        init() {
            Utils.log("当前是控制页面，开始设置UI...");
            this.injectCSS();
            this.createHTML();
            // applyModalMode 必须在 bindEvents 之前调用，因为它会决定事件如何绑定
            this.applyModalMode();
            this.bindEvents();
            setInterval(() => {
                this.renderDashboard()
                this.cleanupAndMonitorWorkers(); // 标签页回收及监控僵尸标签页
            }, 1000);
        },

        /**
         * 注入所有UI所需的CSS样式。
         */
        /**
         * 最终优化版：注入所有UI所需的CSS样式
         */
        injectCSS() {
            GM_addStyle(`
        :root { /* Material 3 Dark Theme Palette */
            --md-sys-color-primary: #D0BCFF; --md-sys-color-on-primary: #381E72;
            --md-sys-color-surface-container: #211F26; --md-sys-color-on-surface: #E6E1E5;
            --md-sys-color-on-surface-variant: #CAC4D0; --md-sys-color-outline: #938F99;
            --md-sys-color-surface-bright: #36343B; --md-sys-color-tertiary: #EFB8C8;
            --md-sys-color-scrim: #000000;
            --status-color-waiting: #4CAF50; --status-color-claiming: #2196F3;
            --status-color-switching: #FFC107; --status-color-error: #F44336;
            --status-color-opening: #9C27B0; --status-color-dormant: #757575;
            --status-color-unresponsive: #FFA000;
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
        
        /* --- 设置面板统一样式 (已整合所有优化) --- */
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
        .qmx-settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .qmx-settings-item { display: flex; flex-direction: column; gap: 8px; }
        .qmx-settings-item label { font-size: 14px; font-weight: 500; }
        .qmx-settings-item small { font-size: 12px; color: var(--md-sys-color-on-surface-variant); opacity: 0.8; }
        
        /* 数字输入框 "下沉" 效果 */
        .qmx-settings-item input[type="number"] {
            background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline);
            color: var(--md-sys-color-on-surface); border-radius: 8px; padding: 10px; width: 100%;
            box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
            transition: box-shadow 0.2s, border-color 0.2s;
        }
        .qmx-settings-item input[type="number"]:focus {
            outline: none; border-color: var(--md-sys-color-primary);
            box-shadow: inset 0 3px 6px rgba(0,0,0,0.1), 0 0 0 2px rgba(208, 188, 255, 0.3);
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

        /* 为滚动条统一样式 (已包含设置面板) */
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
        },

        /**
         * 核心监控与清理函数
         */
        cleanupAndMonitorWorkers() {
            const STALE_TIMEOUT = SETTINGS.WORKER_STALE_TIMEOUT; 
            const LOADING_TIMEOUT = SETTINGS.WORKER_LOADING_TIMEOUT;

            const state = GlobalState.get();
            let stateModified = false;

            for (const roomId in state.tabs) {
                const tab = state.tabs[roomId];
                const timeDiff = Date.now() - tab.lastUpdateTime;

                // 1. 僵尸任务处理
                if (timeDiff > STALE_TIMEOUT) {
                    // 如果已经不是“无响应”状态，才进行更新，避免重复写操作
                    if (tab.status !== 'UNRESPONSIVE') {
                        Utils.log(`[监控] 任务 ${roomId} 已失联超过 ${STALE_TIMEOUT / 1000} 秒，标记为无响应。`);
                        tab.status = 'UNRESPONSIVE';
                        tab.statusText = '心跳失联，请激活标签页恢复';
                        stateModified = true;
                    }
                    // 注意：我们不再删除它 (delete state.tabs[roomId])
                    continue; 
                }

                // 2. 加载超时监控
                if (tab.status === 'OPENING' && timeDiff > LOADING_TIMEOUT) {
                    if (!tab.statusText.includes('请点击激活')) {
                        Utils.log(`[加载监控] 任务 ${roomId} 卡在加载状态超过 ${LOADING_TIMEOUT/1000} 秒，更新UI提示用户。`);
                        tab.statusText = '加载缓慢，请点击激活';
                        tab.status = 'ERROR'; 
                        stateModified = true;
                    }
                }
            }

            if (stateModified) {
                GlobalState.set(state);
            }
        },

        /**
         * 修改：显示设置面板并填充当前配置 (采用新网格布局)
         */
        showSettingsPanel() {
            const modal = document.getElementById('qmx-settings-modal');
            
            // --- 1. 四标签页HTML结构 ---
            modal.innerHTML = `
                <div class="qmx-settings-header">
                    <div class="qmx-settings-tabs">
                        <button class="tab-link active" data-tab="basic">基本设置</button>
                        <button class="tab-link" data-tab="timing">时间设定</button>
                        <button class="tab-link" data-tab="advanced">高级设置</button>
                        <button class="tab-link" data-tab="about">关于</button>
                    </div>
                </div>
                <div class="qmx-settings-content">
                    <!-- ==================== Tab 1: 基本设置 ==================== -->
                    <div id="tab-basic" class="tab-content active">
                        <div class="qmx-settings-grid">
                            <div class="qmx-settings-item">
                                <label for="setting-control-room-id">控制室房间号</label>
                                <input type="number" id="setting-control-room-id" value="${SETTINGS.CONTROL_ROOM_ID}">
                                <small><b>警告：</b>只有在这个房间号的直播间中才能看到插件面板，所以请确保房间号正确无误。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label>自动暂停后台视频</label>
                                <label class="qmx-toggle">
                                    <input type="checkbox" id="setting-auto-pause" ${SETTINGS.AUTO_PAUSE_ENABLED ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                                <small>自动暂停非活动直播间视频，大幅降低资源占用。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label>达到上限后的行为</label>
                                <div class="qmx-select" data-target-id="setting-daily-limit-action">
                                    <div class="qmx-select-styled"></div>
                                    <div class="qmx-select-options"></div>
                                    <select id="setting-daily-limit-action" style="display: none;">
                                        <option value="STOP_ALL" ${SETTINGS.DAILY_LIMIT_ACTION === 'STOP_ALL' ? 'selected' : ''}>直接关停所有任务</option>
                                        <option value="CONTINUE_DORMANT" ${SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT' ? 'selected' : ''}>进入休眠模式，过了24点再战🤜</option>
                                    </select>
                                </div>
                                <small>任务达到上限后是全部关闭还是休眠等待刷新。</small>
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
                                <small>控制面板的显示方式。修改后需刷新生效。</small>
                            </div>
                        </div>
                    </div>

                    <!-- ==================== Tab 2: 时间设定 ==================== -->
                    <div id="tab-timing" class="tab-content">
                        <div class="qmx-settings-grid">
                            <div class="qmx-settings-item">
                                <label for="setting-max-tab-lifetime">标签页最大生存时间 (分钟)</label>
                                <input type="number" id="setting-max-tab-lifetime" value="${SETTINGS.MAX_TAB_LIFETIME_MS / 60000}">
                                <small>防止卡死，单个标签页最长存在多久后自动切换 </small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-no-envelope-timeout">无活动时切换延迟 (秒)</label>
                                <input type="number" id="setting-no-envelope-timeout" value="${SETTINGS.NO_ENVELOPE_SWITCH_TIMEOUT / 1000}">
                                <small>红包区域消失后多久，切换到新房间</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-check-interval">主循环检查间隔 (ms)</label>
                                <input type="number" id="setting-check-interval" value="${SETTINGS.CHECK_INTERVAL}">
                                <small>检查红包状态的频率。太快了可能导致卡顿&被浏览器限制</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-popup-wait-timeout">红包弹窗等待超时 (ms)</label>
                                <input type="number" id="setting-popup-wait-timeout" value="${SETTINGS.POPUP_WAIT_TIMEOUT}">
                                <small>模拟点击红包后，等待领取弹窗出现的最长时间</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-worker-stale-timeout">工作页失联超时 (ms)</label>
                                <input type="number" id="setting-worker-stale-timeout" value="${SETTINGS.WORKER_STALE_TIMEOUT}">
                                <small>到达指定时长后会在面板提醒切换一下以保活，权宜之计😭 </small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-worker-loading-timeout">工作页加载超时 (ms)</label>
                                <input type="number" id="setting-worker-loading-timeout" value="${SETTINGS.WORKER_LOADING_TIMEOUT}">
                                <small>新开的页面卡在“加载中”多久后判定为加载失败，触发切换 </small>
                            </div>
                        </div>
                    </div>

                    <!-- ==================== Tab 3: 高级设置 ==================== -->
                    <div id="tab-advanced" class="tab-content">
                        <div class="qmx-settings-grid">
                            <div class="qmx-settings-warning" style="grid-column: 1 / -1;">
                                <b>高级设置区域：</b> 修改此处的参数可能影响脚本的性能和稳定性，请谨慎修改。
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-max-tabs">最大工作标签页数量</label>
                                <input type="number" id="setting-max-tabs" value="${SETTINGS.MAX_WORKER_TABS}">
                                <small>同时运行的直播间数量。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-api-fetch-count">单次API获取房间数</label>
                                <input type="number" id="setting-api-fetch-count" value="${SETTINGS.API_ROOM_FETCH_COUNT}">
                                <small>每次获取的房间数。增加可提高找到新房间的几率，不过一般不会找不到。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-api-retry-count">API请求重试次数</label>
                                <input type="number" id="setting-api-retry-count" value="${SETTINGS.API_RETRY_COUNT}">
                                <small>获取房间列表失败时的重试次数，一般不会失败。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-api-retry-delay">API重试延迟 (ms)</label>
                                <input type="number" id="setting-api-retry-delay" value="${SETTINGS.API_RETRY_DELAY}">
                                <small>API请求失败后，等待多久再重试。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-open-tab-delay">打开标签页延迟 (ms)</label>
                                <input type="number" id="setting-open-tab-delay" value="${SETTINGS.OPEN_TAB_DELAY}">
                                <small>打开新页面后的等待时间，可适当增加以确保页面响应。</small>
                            </div>
                            <div class="qmx-settings-item">
                                <label for="setting-close-tab-delay">关闭标签页延迟 (ms)</label>
                                <input type="number" id="setting-close-tab-delay" value="${SETTINGS.CLOSE_TAB_DELAY}">
                                <small>旧页面等待多久后关闭自己，以确保新页面已接管。</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ==================== Tab 4: 关于 ==================== -->
                    <div id="tab-about" class="tab-content">
                        <h4>关于脚本 <span class="version-tag">v2.0.1</span></h4>
                        <h4>致谢</h4>
                        <p>
                            本脚本基于
                            <a href="https://greasyfork.org/zh-CN/users/1453821-ysl-ovo" target="_blank" rel="noopener noreferrer">ysl-ovo</a>
                            的插件
                            <a href="https://greasyfork.org/zh-CN/scripts/532514-%E6%96%97%E9%B1%BC%E5%85%A8%E6%B0%91%E6%98%9F%E6%8E%A8%E8%8D%90%E8%87%AA%E5%8A%A8%E9%A2%86%E5%8F%96" target="_blank" rel="noopener noreferrer">《斗鱼全民星推荐自动领取》</a>
                            进行一些功能改进(也许)与界面美化，同样遵循MIT许可证开源。感谢原作者的分享
                        </p>
                        <h4>一些tips</h4>
                        <ul>
                            <li>新开的后台直播间可能因浏览器策略不加载，手动切换过去几秒即可</li>
                            <li>标签页在后台久了可能被标记为“无响应”，同样是切换激活一下就能恢复心跳</li>
                            <li>由于后台定时器限制，倒计时结束时可能无法立即响应，可以到点后手动切过去抢</li>
                            <li>脚本bug不少，目前只能说勉强能跑。但时间精力有限暂时不打算改了＞︿＜</li>
                        </ul>

                        <h4>源码与社区</h4>
                        <ul>
                            <li>可以在 <a href="https://github.com/ienone/douyu-qmx-pro" target="_blank" rel="noopener noreferrer">GitHub</a> 查看本脚本源码</li>
                            <li>发现BUG或有功能建议，欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/issues" target="_blank" rel="noopener noreferrer">Issue</a>（不过大概率不会修……）</li>
                            <li>如果你有能力进行改进，非常欢迎提交 <a href="https://github.com/ienone/douyu-qmx-pro/pulls" target="_blank" rel="noopener noreferrer">Pull Request</a>！</li>
                        </ul>
                    </div>
                </div>
                <div class="qmx-settings-footer">
                    <button id="qmx-settings-cancel-btn" class="qmx-modal-btn">取消</button>
                    <button id="qmx-settings-reset-btn" class="qmx-modal-btn danger">恢复默认</button>
                    <button id="qmx-settings-save-btn" class="qmx-modal-btn primary">保存并刷新</button>
                </div>
            `;

            // --- 2. 激活所有交互元素 ---
            // 激活自定义下拉菜单
            modal.querySelectorAll('.qmx-select').forEach(wrapper => {
                const nativeSelect = wrapper.querySelector('select');
                const styledSelect = wrapper.querySelector('.qmx-select-styled');
                const optionsList = wrapper.querySelector('.qmx-select-options');
                
                styledSelect.textContent = nativeSelect.options[nativeSelect.selectedIndex].text;
                optionsList.innerHTML = ''; // 清空旧选项
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

            // 激活UI
            document.getElementById('qmx-modal-backdrop').classList.add('visible');
            modal.classList.add('visible');
            document.body.classList.add('qmx-modal-open-scroll-lock');

            // 绑定底部按钮事件
            modal.querySelector('#qmx-settings-cancel-btn').onclick = () => this.hideSettingsPanel();
            modal.querySelector('#qmx-settings-save-btn').onclick = () => this.saveSettings();
            modal.querySelector('#qmx-settings-reset-btn').onclick = () => {
                if (confirm("确定要恢复所有默认设置吗？此操作会刷新页面。")) {
                    SettingsManager.reset();
                    window.location.reload();
                }
            };

            // 绑定标签页切换事件
            modal.querySelectorAll('.tab-link').forEach(button => {
                button.onclick = (e) => {
                    const tabId = e.target.dataset.tab;
                    modal.querySelectorAll('.tab-link.active').forEach(btn => btn.classList.remove('active'));
                    modal.querySelectorAll('.tab-content.active').forEach(content => content.classList.remove('active'));
                    e.target.classList.add('active');
                    modal.querySelector(`#tab-${tabId}`).classList.add('active');
                };
            });
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
         * 修改：从UI读取并保存设置 (包含所有新选项)
         */
        saveSettings() {
            // 从UI读取所有暴露出来的值
            const newSettings = {
                // Tab 1: 基本设置
                CONTROL_ROOM_ID: document.getElementById('setting-control-room-id').value,
                AUTO_PAUSE_ENABLED: document.getElementById('setting-auto-pause').checked,
                DAILY_LIMIT_ACTION: document.getElementById('setting-daily-limit-action').value,
                MODAL_DISPLAY_MODE: document.getElementById('setting-modal-mode').value,
                
                // Tab 2: 时间设定 (注意单位转换)
                MAX_TAB_LIFETIME_MS: parseInt(document.getElementById('setting-max-tab-lifetime').value, 10) * 60000,
                NO_ENVELOPE_SWITCH_TIMEOUT: parseInt(document.getElementById('setting-no-envelope-timeout').value, 10) * 1000,
                CHECK_INTERVAL: parseInt(document.getElementById('setting-check-interval').value, 10),
                POPUP_WAIT_TIMEOUT: parseInt(document.getElementById('setting-popup-wait-timeout').value, 10),
                WORKER_STALE_TIMEOUT: parseInt(document.getElementById('setting-worker-stale-timeout').value, 10),
                WORKER_LOADING_TIMEOUT: parseInt(document.getElementById('setting-worker-loading-timeout').value, 10),

                // Tab 3: 高级设置
                MAX_WORKER_TABS: parseInt(document.getElementById('setting-max-tabs').value, 10),
                API_ROOM_FETCH_COUNT: parseInt(document.getElementById('setting-api-fetch-count').value, 10),
                API_RETRY_COUNT: parseInt(document.getElementById('setting-api-retry-count').value, 10),
                API_RETRY_DELAY: parseInt(document.getElementById('setting-api-retry-delay').value, 10),
                OPEN_TAB_DELAY: parseInt(document.getElementById('setting-open-tab-delay').value, 10),
                CLOSE_TAB_DELAY: parseInt(document.getElementById('setting-close-tab-delay').value, 10),
            };

            // 获取所有已存在的用户设置，以保留那些未在UI中暴露的设置
            const existingUserSettings = GM_getValue(SettingsManager.STORAGE_KEY, {});
            const finalSettingsToSave = Object.assign(existingUserSettings, newSettings);

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
            
            // --- 面板内部按钮事件 ---
            document.getElementById('qmx-modal-open-btn').onclick = () => this.openOneNewTab();
            document.getElementById('qmx-modal-settings-btn').onclick = () => this.showSettingsPanel();
            // document.getElementById('qmx-modal-reset-limit-btn').onclick = () => {
            //     Utils.log("[测试功能] 用户点击了重置上限按钮。");
            //     GlobalState.setDailyLimit(false);
            //     alert("每日上限状态已被重置！");
            //     this.renderDashboard();
            // };

            document.getElementById('qmx-modal-close-all-btn').onclick = () => {
                if (confirm("确定要关闭所有工作标签页吗？")) {
                    Utils.log("发出 CLOSE_ALL 广播指令...");
                    const state = GlobalState.get();
                    state.command = { action: 'CLOSE_ALL', target: '*', timestamp: Date.now() };
                    GlobalState.set(state);

                    // 在发出指令后，设置一个延迟定时器来清理该指令
                    setTimeout(() => {
                        const currentState = GlobalState.get();
                        // 再次检查，确保我们清除的是自己发出的指令，防止误删其他指令
                        if (currentState.command && currentState.command.action === 'CLOSE_ALL') {
                            Utils.log("清理已过期的 CLOSE_ALL 广播指令。");
                            currentState.command = null;
                            GlobalState.set(currentState);
                        }
                    }, SETTINGS.UI_FEEDBACK_DELAY); // 延迟2秒执行，确保所有worker都有足够时间收到指令
                }
            };

            document.getElementById('qmx-tab-list').addEventListener('click', (e) => {
                const closeButton = e.target.closest('.qmx-tab-close-btn');
                if (!closeButton) return;

                const roomItem = e.target.closest('[data-room-id]');
                const roomId = roomItem?.dataset.roomId;
                if (!roomId) return;

                Utils.log(`[控制中心] 用户请求关闭房间: ${roomId}。`);

                // --- 核心逻辑 ---
                // 1. 立即从全局状态中移除该条目
                const state = GlobalState.get();
                delete state.tabs[roomId];

                // 2. 同时，仍然发送一个CLOSE指令
                //    如果标签页还活着，它会收到这个指令并关闭自己
                //    如果它已经死了（是幽灵），指令无效但无妨
                state.command = { action: 'CLOSE', target: roomId, timestamp: Date.now() };
                GlobalState.set(state);

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

            // --- 准备阶段 ---
            const tabIds = Object.keys(state.tabs);
            document.getElementById('qmx-active-tabs-count').textContent = tabIds.length;
            
            const statusDisplayMap = {
                OPENING: '加载中', WAITING: '等待中', CLAIMING: '领取中',
                SWITCHING: '切换中', DORMANT: '休眠中', ERROR: '出错了',UNRESPONSIVE: '无响应'
            };

            const existingRoomIds = new Set(Array.from(tabList.children).map(node => node.dataset.roomId).filter(Boolean));

            // --- 增量更新逻辑 ---
            tabIds.forEach(roomId => {
                const tabData = state.tabs[roomId];
                let existingItem = tabList.querySelector(`[data-room-id="${roomId}"]`);

                // 计算状态文本
                let currentStatusText = tabData.statusText;
                if (tabData.countdown && tabData.status === 'WAITING') {
                    const elapsed = (Date.now() - tabData.countdown.startTime) / 1000;
                    const remaining = Math.max(0, tabData.countdown.duration - elapsed);
                    currentStatusText = (remaining > 0) ? `倒计时 ${Utils.formatTime(remaining)}` : '等待开抢...';
                }

                if (existingItem) {
                    // --- A. 如果条目已存在，则只更新内容 ---
                    const nicknameEl = existingItem.querySelector('.qmx-tab-nickname');
                    const statusNameEl = existingItem.querySelector('.qmx-tab-status-name');
                    const statusTextEl = existingItem.querySelector('.qmx-tab-status-text');
                    const dotEl = existingItem.querySelector('.qmx-tab-status-dot');
                    
                    // 只有在新状态提供了昵称时才更新，否则保持不变
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
                    // --- B. 如果条目不存在，则创建并添加入场动画 ---
                    const newItem = this.createTaskItem(roomId, tabData, statusDisplayMap, currentStatusText);
                    tabList.appendChild(newItem);
                    
                    requestAnimationFrame(() => {
                        newItem.classList.add('qmx-item-enter-active');
                        setTimeout(() => newItem.classList.remove('qmx-item-enter'), 300);
                    });
                }
            });

            // --- 处理删除 ---
            existingRoomIds.forEach(roomId => {
                if (!state.tabs[roomId]) {
                    const itemToRemove = tabList.querySelector(`[data-room-id="${roomId}"]`);
                    if (itemToRemove && !itemToRemove.classList.contains('qmx-item-exit-active')) {
                        itemToRemove.classList.add('qmx-item-exit-active');
                        setTimeout(() => itemToRemove.remove(), 300);
                    }
                }
            });

            // --- 处理空列表的情况 ---
            const emptyMsg = tabList.querySelector('.qmx-empty-list-msg');
            if (tabIds.length === 0) {
                if (!emptyMsg) {
                    tabList.innerHTML = '<div class="qmx-tab-list-item qmx-empty-list-msg">没有正在运行的任务</div>';
                }
            } else if (emptyMsg) {
                emptyMsg.remove();
            }
            
            // --- 渲染上限状态 ---
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
            if (limitState?.reached && new Date(limitState.timestamp).toDateString() !== new Date().toDateString()) {
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
                        Utils.log("[优雅降级] 自动切换到 'floating' 备用模式。");
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
        } else if (currentUrl.match(/douyu\.com\/(\d+)/) || currentUrl.match(/douyu\.com\/topic\/.*rid=(\d+)/)) {
            WorkerPage.init();
        } else {
            Utils.log("当前页面非控制页或工作页，脚本不活动。");
        }
    }

    // 延迟启动脚本，等待页面加载
    Utils.log(`脚本将在 ${SETTINGS.INITIAL_SCRIPT_DELAY / 1000} 秒后开始初始化...`);
    setTimeout(main, SETTINGS.INITIAL_SCRIPT_DELAY);

})(); 
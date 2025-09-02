/**
 * @file WorkerPage.js
 * @description 工作直播间页面执行所有自动化任务流程。
 */
import { Utils } from '../utils/utils';
import { GlobalState } from './GlobalState';
import { DOM } from '../utils/DOM';
import { SETTINGS, STATE } from './SettingsManager';
import { DouyuAPI } from '../utils/DouyuAPI';

/**
 * =================================================================================
 * 模块：工作页面 (WorkerPage)
 * ---------------------------------------------------------------------------------
 * 负责在直播间页面执行所有自动化任务。
 * =================================================================================
 */
export const WorkerPage = {

    // 新增属性，用于管理哨兵定时器
    healthCheckTimeoutId: null,
    currentTaskEndTime: null,
    lastHealthCheckTime: null,
    lastPageCountdown: null,
    stallLevel: 0,
    // 记录剩余时间
    remainingTimeMap: new Map(),
    // 新增属性，用于校准模式
    consecutiveStallCount: 0,
    previousDeviation: 0,
    /**
     * 在后台非阻塞地查找并点击“返回旧版”按钮。
     * 这是一个可选操作，不阻塞主初始化流程。
     */

    /**
     * 工作页面的总入口和初始化函数。
     */
    async init() {
        Utils.log('混合模式工作单元初始化...');
        const roomId = Utils.getCurrentRoomId();
        if (!roomId) {
            Utils.log('无法识别当前房间ID，脚本停止。');
            return;
        }
        GlobalState.updateWorker(roomId, 'OPENING', '页面加载中...', {countdown: null, nickname: null});

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
        Utils.log('正在等待页面关键元素 (#js-player-video) 加载...');
        const criticalElement = await DOM.findElement(SETTINGS.SELECTORS.criticalElement, SETTINGS.ELEMENT_WAIT_TIMEOUT);
        if (!criticalElement) {
            Utils.log('页面关键元素加载超时，此标签页可能无法正常工作，即将关闭。');
            await this.selfClose(roomId);
            return;
        }
        Utils.log('页面关键元素已加载。');

        Utils.log('开始检测 UI 版本 和红包活动...');
        // 保底，防止意外打开新版UI
        if (window.location.href.includes('/beta')) {
            // --- 找到了“/beta”，说明是新版UI ---
            GlobalState.updateWorker(roomId, 'OPENING', '切换旧版UI...');
            localStorage.setItem('newWebLive', 'A');
            window.location.href = window.location.href.replace('/beta', '');
        }
        Utils.log('确认进入稳定工作状态，执行身份核销。');
        const pendingWorkers = GM_getValue('qmx_pending_workers', []);
        const myIndex = pendingWorkers.indexOf(roomId);
        if (myIndex > -1) {
            pendingWorkers.splice(myIndex, 1);
            GM_setValue('qmx_pending_workers', pendingWorkers);
            Utils.log(`房间 ${roomId} 已从待处理列表中移除。`);
        }
        const anchorNameElement = document.querySelector(SETTINGS.SELECTORS.anchorName);
        const nickname = anchorNameElement ? anchorNameElement.textContent.trim() : `房间${roomId}`;
        GlobalState.updateWorker(roomId, 'WAITING', '寻找任务中...', {nickname, countdown: null});

        // 检查每日上限
        const limitState = GlobalState.getDailyLimit();
        if (limitState?.reached) {
            Utils.log('初始化检查：检测到全局上限旗标。');
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

        // 检查每日上限状态
        const limitState = GlobalState.getDailyLimit();
        if (limitState?.reached) {
            Utils.log(`[上限检查] 房间 ${roomId} 检测到已达每日上限。`);
            if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                await this.enterDormantMode();
            } else {
                await this.selfClose(roomId);
            }
            return;
        }

        if (SETTINGS.AUTO_PAUSE_ENABLED) this.autoPauseVideo();

        const redEnvelopeDiv = await DOM.findElement(SETTINGS.SELECTORS.redEnvelopeContainer, SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT);

        if (!redEnvelopeDiv) {
            GlobalState.updateWorker(roomId, 'SWITCHING', '无活动, 切换中', {countdown: null});
            await this.switchRoom();
            return;
        }

        const statusSpan = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
        const statusText = statusSpan ? statusSpan.textContent.trim() : '';

        if (statusText.includes(':')) {
            const [minutes, seconds] = statusText.split(':').map(Number);
            const remainingSeconds = (minutes * 60 + seconds);
            // 维护获得的剩余时间表
            const currentCount = this.remainingTimeMap.get(remainingSeconds) || 0;
            this.remainingTimeMap.set(remainingSeconds, currentCount + 1);
            //console.log(this.remainingTimeMap)
            // 判断是否卡死
            if (Array.from(this.remainingTimeMap.values()).some(value => value > 3)) {
                GlobalState.updateWorker(roomId, 'SWITCHING', '倒计时卡死, 切换中', {countdown: null});
                await this.switchRoom();
                return;
            }

            this.currentTaskEndTime = Date.now() + remainingSeconds * 1000;

            // 为新的哨兵逻辑设置初始状态
            this.lastHealthCheckTime = Date.now();
            this.lastPageCountdown = remainingSeconds;

            Utils.log(`发现新任务：倒计时 ${statusText}。`);
            GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${statusText}`, {countdown: {endTime: this.currentTaskEndTime}});

            const wakeUpDelay = Math.max(0, (remainingSeconds * 1000) - 1500);
            Utils.log(`本单元将在约 ${Math.round(wakeUpDelay / 1000)} 秒后唤醒执行任务。`);
            setTimeout(() => this.claimAndRecheck(roomId), wakeUpDelay);

            this.startHealthChecks(roomId, redEnvelopeDiv);

        } else if (statusText.includes('抢') || statusText.includes('领')) {
            GlobalState.updateWorker(roomId, 'CLAIMING', '立即领取中...');
            await this.claimAndRecheck(roomId);
        } else {
            GlobalState.updateWorker(roomId, 'WAITING', `状态未知, 稍后重试`, {countdown: null});
            setTimeout(() => this.findAndExecuteNextTask(roomId), 30000);
        }
    },

    /**
     * 哨兵观察链。
     * 信任首次获取的倒计时和由HackTimer驱动的主定时器。
     * 哨兵只对比UI和脚本计时器的差异，并报告UI是否被"节流"(显示为STALLED)，但不修改核心的 `currentTaskEndTime`。
     */
    startHealthChecks(roomId, redEnvelopeDiv) {
        const CHECK_INTERVAL = SETTINGS.HEALTHCHECK_INTERVAL;
        const STALL_THRESHOLD = 4;    // UI显示与脚本计时允许的最大偏差

        const check = () => {
            const currentPageStatus = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer)?.textContent.trim();

            if (!currentPageStatus || !currentPageStatus.includes(':')) {
                return; // UI消失，观察结束
            }

            // 1. 计算脚本的精确剩余时间 (这是我们的"真实"时间)
            const scriptRemainingSeconds = (this.currentTaskEndTime - Date.now()) / 1000;

            // 2. 获取页面UI显示的剩余时间 (这是"可能不准"的显示时间)
            const [pMin, pSec] = currentPageStatus.split(':').map(Number);
            const pageRemainingSeconds = pMin * 60 + pSec;

            // 3. 计算两者偏差
            const deviation = Math.abs(scriptRemainingSeconds - pageRemainingSeconds);

            const currentFormattedTime = Utils.formatTime(scriptRemainingSeconds);
            const pageFormattedTime = Utils.formatTime(pageRemainingSeconds);

            // 每次都打印脚本倒计时、UI显示倒计时和差值
            Utils.log(`[哨兵] 脚本倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime} | 差值: ${deviation.toFixed(2)}秒`);
            Utils.log(`校准模式开启状态为 ${SETTINGS.CALIBRATION_MODE_ENABLED ? '开启' : '关闭'}`);

            // 4. 根据是否开启校准模式，处理时间差异
            if (SETTINGS.CALIBRATION_MODE_ENABLED) {
                // 校准模式逻辑
                if (deviation <= STALL_THRESHOLD) {
                    // 在合理范围内，校准脚本倒计时
                    const difference = scriptRemainingSeconds - pageRemainingSeconds;
                    this.currentTaskEndTime = Date.now() + pageRemainingSeconds * 1000;
                    
                    // 只有在偏差大于0.1秒时才显示校准信息
                    if (deviation > 0.1) {
                        const direction = difference > 0 ? '慢' : '快';
                        const calibrationMessage = `${direction}${deviation.toFixed(1)}秒, 已校准`;
                        Utils.log(`[校准] ${calibrationMessage}。新倒计时: ${pageFormattedTime}`);

                        // 发送临时信息，让ControlPage显示
                        GlobalState.updateWorker(roomId, 'WAITING', calibrationMessage, {countdown: {endTime: this.currentTaskEndTime}});

                        // 2.5秒后，发送常规更新，让ControlPage恢复显示倒计时
                        setTimeout(() => {
                            // 检查任务是否还在，防止在延迟期间任务已结束
                            if (this.currentTaskEndTime > Date.now()) {
                                GlobalState.updateWorker(roomId, 'WAITING', `倒计时...`, {countdown: {endTime: this.currentTaskEndTime}});
                            }
                        }, 2500);
                    } else {
                        // 偏差很小，静默校准，直接更新为倒计时状态
                        GlobalState.updateWorker(roomId, 'WAITING', `倒计时...`, {countdown: {endTime: this.currentTaskEndTime}});
                    }
                    
                    // 重置卡顿计数
                    this.consecutiveStallCount = 0;
                    this.previousDeviation = 0;
                    this.stallLevel = 0;
                    
                } else {
                    // 在合理范围外，判断是否卡顿加剧
                    const deviationIncreasing = deviation > this.previousDeviation;

                    this.previousDeviation = deviation;
                    
                    if (deviationIncreasing) {
                        this.consecutiveStallCount++;
                        Utils.log(`[警告] 检测到UI卡顿第 ${this.consecutiveStallCount} 次，差值: ${deviation.toFixed(2)}秒`);
                    } else {
                        // 卡顿没有加剧，可能是暂时性的，重置计数
                        this.consecutiveStallCount = Math.max(0, this.consecutiveStallCount - 1);
                    }
                    
                    if (this.consecutiveStallCount >= 3) {
                        // 连续三次检测到卡顿且差值增大，判定为卡死
                        Utils.log(`[严重] 连续检测到卡顿且差值增大，判定为卡死状态。`);
                        GlobalState.updateWorker(roomId, 'SWITCHING', '倒计时卡死, 切换中', {countdown: null});
                        clearTimeout(this.healthCheckTimeoutId);
                        this.switchRoom();
                        return;
                    }
                    
                    // 显示卡顿状态但继续监控
                    this.stallLevel = 1;
                    GlobalState.updateWorker(roomId, 'ERROR', `UI卡顿 (${deviation.toFixed(1)}秒)`, {countdown: {endTime: this.currentTaskEndTime}});
                }
            } else {
                // 原有逻辑
                if (deviation > STALL_THRESHOLD) {
                    if (this.stallLevel === 0) { // 只在第一次检测到卡顿时记录日志
                        Utils.log(`[哨兵] 检测到UI节流。脚本精确倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime}`);
                    }
                    this.stallLevel = 1;
                    // 只更新状态为STALLED
                    GlobalState.updateWorker(roomId, 'STALLED', `UI节流中...`, {countdown: {endTime: this.currentTaskEndTime}});
                } else {
                    if (this.stallLevel > 0) {
                        Utils.log('[哨兵] UI已从节流中恢复。');
                        this.stallLevel = 0;
                    }
                    GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${currentFormattedTime}`, {countdown: {endTime: this.currentTaskEndTime}});
                }
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

        Utils.log('开始执行领取流程...');
        GlobalState.updateWorker(roomId, 'CLAIMING', '尝试打开红包...', {countdown: null});

        const redEnvelopeDiv = document.querySelector(SETTINGS.SELECTORS.redEnvelopeContainer);
        if (!await DOM.safeClick(redEnvelopeDiv, '右下角红包区域')) {
            Utils.log('点击红包区域失败，重新寻找任务。');
            await Utils.sleep(2000);
            this.findAndExecuteNextTask(roomId);
            return;
        }

        const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, SETTINGS.POPUP_WAIT_TIMEOUT);
        if (!popup) {
            Utils.log('等待红包弹窗超时，重新寻找任务。');
            await Utils.sleep(2000);
            this.findAndExecuteNextTask(roomId);
            return;
        }

        const openBtn = popup.querySelector(SETTINGS.SELECTORS.openButton);
        if (await DOM.safeClick(openBtn, '红包弹窗的打开按钮')) {
            // 检查是否触发上限
            if (await DOM.checkForLimitPopup()) {
                GlobalState.setDailyLimit(true);
                Utils.log('检测到每日上限！');
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
                popup,
            );

            // 根据是否找到成功标志来确定奖励信息
            const reward = successIndicator ? '领取成功 ' : '空包或失败';
            Utils.log(`领取操作完成，结果: ${reward}`);

            GlobalState.updateWorker(roomId, 'WAITING', `领取到: ${reward}`, {countdown: null});
            const closeBtn = document.querySelector(SETTINGS.SELECTORS.closeButton);
            await DOM.safeClick(closeBtn, '领取结果弹窗的关闭按钮');
        } else {
            Utils.log('点击打开按钮失败。');
        }

        STATE.lastActionTime = Date.now();

        // 核心：无论成功与否，等待后都回到起点，寻找下一个任务
        Utils.log('操作完成，2秒后在本房间内寻找下一个任务...');
        await Utils.sleep(2000);
        this.findAndExecuteNextTask(roomId);
    },

    /**
     * 自动暂停视频播放。
     */
    async autoPauseVideo() {
        if (STATE.isSwitchingRoom || Date.now() - STATE.lastActionTime < SETTINGS.AUTO_PAUSE_DELAY_AFTER_ACTION) {
            return;
        }

        // 使用 DOM.findElement 替换 querySelector，给它5秒的等待时间
        Utils.log('正在寻找暂停按钮...');
        const pauseBtn = await DOM.findElement(SETTINGS.SELECTORS.pauseButton, 5000);

        if (pauseBtn) {
            // Utils.log("检测到视频正在播放，尝试自动暂停...");
            if (await DOM.safeClick(pauseBtn, '暂停按钮')) {
                Utils.log('视频已通过脚本暂停。'); // 只有这里出现，才代表真的成功了
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

        Utils.log('开始执行切换房间流程...');
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
                // 保证使用旧版UI
                if (window.location.href.includes('/beta') || localStorage.getItem('newWebLive') !== 'A') {
                    // --- 找到了“/beta”，说明是新版UI ---
                    localStorage.setItem('newWebLive', 'A');
                }
                GM_openInTab(nextUrl, {active: false, setParent: true});
                await Utils.sleep(SETTINGS.CLOSE_TAB_DELAY);
                await this.selfClose(currentRoomId); // 使用统一的"自毁程序"
            } else {
                Utils.log('API未能返回任何新的、未打开的房间，将关闭当前页。');
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
        GlobalState.updateWorker(roomId, 'DORMANT', '休眠中 (等待北京时间0点)', {countdown: null});

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
     * @param {boolean} fromCloseAll - 是否来自"关闭所有"指令。
     */
    async selfClose(roomId, fromCloseAll = false) {
        Utils.log(`本单元任务结束 (房间: ${roomId})，尝试更新状态并关闭。`);

        // 在关闭前，主动清理定时器
        if (this.pauseSentinelInterval) {
            clearInterval(this.pauseSentinelInterval);
        }
        
        // 如果是来自"关闭所有"指令，跳过状态更新，直接移除和关闭
        if (fromCloseAll) {
            Utils.log(`[关闭所有] 跳过状态更新，直接关闭标签页 (房间: ${roomId})`);
            GlobalState.removeWorker(roomId);
            await Utils.sleep(100);
            this.closeTab();
            return;
        }

        // 1. 广播"正在关闭"的状态，让控制中心知道它已收到指令
        GlobalState.updateWorker(roomId, 'SWITCHING', '任务结束，关闭中...');
        await Utils.sleep(100); // 短暂等待确保状态写入

        // 2. 异步地调用状态移除，不阻塞后续的关闭操作
        GlobalState.removeWorker(roomId);
        await Utils.sleep(300);

        // 3. 执行关闭
        this.closeTab();
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
            //window.location.replace('about:blank');
        } catch (e) {
            // 备用关闭方法
            window.location.replace('about:blank');
            Utils.log(`关闭失败，故障为: ${e.message}`);
        }
    },

    /**
     * 检查并处理每日上限状态 - 仅在开发调试时使用
     */
    /*
    async checkAndHandleDailyLimit(roomId) {
        const limitState = GlobalState.getDailyLimit();
        if (limitState?.reached) {
            Utils.log(`[调试] 工作页 ${roomId} 收到上限检查指令，检测到已达上限，进入休眠模式。`);
            if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                await this.enterDormantMode();
            } else {
                await this.selfClose(roomId);
            }
        } else {
            Utils.log(`[调试] 工作页 ${roomId} 收到上限检查指令，当前未达上限，继续正常运行。`);
        }
    },
    */

    startCommandListener(roomId) {
        this.commandChannel = new BroadcastChannel('douyu_qmx_commands');
        Utils.log(`工作页 ${roomId} 已连接到指令广播频道。`);

        this.commandChannel.onmessage = (event) => {
            const {action, target} = event.data;

            // 检查指令是否是给自己的
            if (target === roomId || target === '*') {
                Utils.log(`接收到广播指令: ${action} for target ${target}`);

                if (action === 'CLOSE') {
                    this.selfClose(roomId, false); // 单个关闭
                } else if (action === 'CLOSE_ALL') {
                    this.selfClose(roomId, true); // 批量关闭
                }
                // 调试指令处理 - 仅在开发时启用
                /*
                else if (action === 'CHECK_LIMIT') {
                    // 检查每日上限状态，如果达到上限则进入休眠模式
                    this.checkAndHandleDailyLimit(roomId);
                }
                */
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
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
        GlobalState.updateWorker(roomId, 'WAITING', '寻找任务中...', { nickname, countdown: null });

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
        if (this.healthCheckTimeoutId) {
            clearTimeout(this.healthCheckTimeoutId);
            this.healthCheckTimeoutId = null;
        }
        this.stallLevel = 0;

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

        Utils.log(`[调试] 开始在房间 ${roomId} 寻找红包...`);

        // 1. 查找所有红包外层容器
        const outerContainers = document.querySelectorAll(SETTINGS.SELECTORS.redEnvelopeContainer);
        let redEnvelopeDiv = null;
        let statusText = '';
        let countdownText = '';
        let foundValidContainer = false; // 新增：标记是否找到有效的红包容器

        for (let i = 0; i < outerContainers.length; i++) {
            const outer = outerContainers[i];
            
            // 确认是红包容器（包含红包图标）
            const hasBoxIcon = outer.querySelector(SETTINGS.SELECTORS.boxIcon);
            if (!hasBoxIcon) {
                continue;
            }
            
            // 找到了红包容器
            foundValidContainer = true;
            
            // 获取状态标题（"倒计时" 或 "可领取"）
            const headlineElem = outer.querySelector(SETTINGS.SELECTORS.statusHeadline);
            const headline = headlineElem ? headlineElem.textContent.trim() : '';
            
            // 获取内容（时间或其他）
            const contentElem = outer.querySelector(SETTINGS.SELECTORS.countdownTimer);
            const content = contentElem ? contentElem.textContent.trim() : '';
            
            Utils.log(`[调试] 容器 #${i} 标题: "${headline}" | 内容: "${content}"`);
            
            // 判断是否为有效的红包容器
            if (headline.includes('倒计时') && content.includes(':')) {
                // 倒计时状态
                redEnvelopeDiv = outer;
                statusText = headline;
                countdownText = content;
                break;
            } else if (headline.includes('可领取') || headline.includes('立即')) {
                // 可领取状态
                redEnvelopeDiv = outer;
                statusText = headline;
                countdownText = '';
                break;
            }
            // 如果找到了红包容器但状态不符合，继续保存信息用于后续判断
            if (!redEnvelopeDiv) {
                redEnvelopeDiv = outer;
                statusText = headline;
                countdownText = content;
            }
        }

        // 2. 如果没有找到任何红包容器，等待一次后再判断
        if (!foundValidContainer) {
            Utils.log(`[调试] 初次查找未发现红包容器，等待 ${SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT / 1000} 秒后重新检查...`);
            
            // 核心修复：使用专门的等待逻辑，确保找到的是红包容器
            const waitedDiv = await this.waitForRedEnvelopeContainer(SETTINGS.RED_ENVELOPE_LOAD_TIMEOUT);
            
            if (!waitedDiv) {
                // 超时后仍未找到红包容器
                Utils.log('[判断] 超时未找到红包容器，判定活动已结束。');
                GlobalState.updateWorker(roomId, 'SWITCHING', '活动已结束, 切换中', { countdown: null });
                await this.switchRoom();
                return;
            }
            
            // 找到了红包容器，提取信息
            foundValidContainer = true;
            const headlineElem = waitedDiv.querySelector(SETTINGS.SELECTORS.statusHeadline);
            const contentElem = waitedDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
            statusText = headlineElem ? headlineElem.textContent.trim() : '';
            countdownText = contentElem ? contentElem.textContent.trim() : '';
            redEnvelopeDiv = waitedDiv;
        }

        // 3. 此时确认找到了红包容器，执行状态判断逻辑
        if (countdownText.includes(':')) {
            // 倒计时状态
            const timeMatch = countdownText.match(/(\d+):(\d+)/);
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                const remainingSeconds = minutes * 60 + seconds;
                
                // 防止倒计时卡死检测
                const currentCount = this.remainingTimeMap.get(remainingSeconds) || 0;
                this.remainingTimeMap.set(remainingSeconds, currentCount + 1);
                if (Array.from(this.remainingTimeMap.values()).some((value) => value > 3)) {
                    GlobalState.updateWorker(roomId, 'SWITCHING', '倒计时卡死, 切换中', { countdown: null });
                    await this.switchRoom();
                    return;
                }

                this.currentTaskEndTime = Date.now() + remainingSeconds * 1000;
                Utils.log(`[任务] 识别到倒计时: ${timeMatch[0]}`);
                
                // 新增：提取奖励信息
                const prizes = await this.extractPrizeInfo(redEnvelopeDiv);
                
                GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${timeMatch[0]}`, {
                    countdown: { endTime: this.currentTaskEndTime },
                    prizes: prizes
                });

                const wakeUpDelay = Math.max(0, remainingSeconds * 1000 - 1500);
                setTimeout(() => this.claimAndRecheck(roomId), wakeUpDelay);
                this.startHealthChecks(roomId, redEnvelopeDiv);
            } else {
                Utils.log(`[错误] 无法解析时间: "${countdownText}"`);
                setTimeout(() => this.findAndExecuteNextTask(roomId), 5000);
            }
        } else if (/可领取|立即/.test(statusText)) {
            // 可领取状态
            Utils.log(`[任务] 检测到可领取状态: ${statusText}`);
            GlobalState.updateWorker(roomId, 'CLAIMING', '立即领取中...');
            await this.claimAndRecheck(roomId);
        } else {
            // 找到了红包容器，但状态无法识别
            Utils.log(`[警告] 红包容器存在但状态无法识别 - 标题: "${statusText}" | 内容: "${countdownText}"`);
            
            // 检查是否是"已领完"等结束状态
            if (statusText.includes('已领完') || statusText.includes('已结束') || statusText.includes('已抢完')) {
                Utils.log('[判断] 红包已领完或活动已结束。');
                GlobalState.updateWorker(roomId, 'SWITCHING', '红包已领完, 切换中', { countdown: null });
                await this.switchRoom();
            } else {
                // 其他未知状态，短暂等待后重试
                GlobalState.updateWorker(roomId, 'WAITING', `状态未知, 重试中...`, { countdown: null });
                setTimeout(() => this.findAndExecuteNextTask(roomId), 5000);
            }
        }
    },

    /**
     * 提取奖励信息
     * @param {HTMLElement} redEnvelopeDiv - 红包外层容器
     * @returns {Promise<Array>} - 奖励信息数组
     */
    async extractPrizeInfo(redEnvelopeDiv) {
        try {
            Utils.log('[奖励提取] 开始提取奖励信息...');
            
            // 1. 点击红包容器打开弹窗
            const clickableContainer = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.clickableContainer);
            if (!clickableContainer) {
                Utils.log('[奖励提取] 未找到可点击容器');
                return null;
            }

            if (!(await DOM.safeClick(clickableContainer, '红包容器（提取奖励）'))) {
                Utils.log('[奖励提取] 点击失败');
                return null;
            }

            // 2. 等待弹窗出现
            const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, 3000);
            if (!popup) {
                Utils.log('[奖励提取] 弹窗未出现');
                return null;
            }

            await Utils.sleep(500); // 等待弹窗内容加载

            // 3. 提取奖励信息
            const prizes = [];
            const prizeContainer = popup.querySelector(SETTINGS.SELECTORS.prizeContainer);
            
            if (prizeContainer) {
                const prizeItems = prizeContainer.querySelectorAll(SETTINGS.SELECTORS.prizeItem);
                
                Utils.log(`[奖励提取] 找到 ${prizeItems.length} 个奖励项容器`);
                
                for (const item of prizeItems) {
                    // 核心修复：只提取包含完整信息（图片+数量）的奖励项
                    // 跳过已领取的或不完整的项
                    const imgElement = item.querySelector(SETTINGS.SELECTORS.prizeImage);
                    const countElement = item.querySelector(SETTINGS.SELECTORS.prizeCount);
                    
                    // 只有同时存在图片和数量文本的才是有效奖励
                    if (imgElement && countElement && countElement.textContent.trim()) {
                        const prizeData = {
                            img: imgElement.src,
                            text: countElement.textContent.trim(),
                            name: imgElement.getAttribute('alt') || ''
                        };
                        
                        Utils.log(`[奖励提取] ✓ 提取到奖励: ${prizeData.text}, 名称: ${prizeData.name}`);
                        prizes.push(prizeData);
                    } else {
                        Utils.log(`[奖励提取] ✗ 跳过不完整项 - 图片: ${!!imgElement}, 数量: ${countElement ? `"${countElement.textContent.trim()}"` : 'null'}`);
                    }
                }
            } else {
                Utils.log('[奖励提取] 未找到奖励容器');
            }

            Utils.log(`[奖励提取] 成功提取 ${prizes.length} 个有效奖励`);

            // 4. 关闭弹窗
            const closeBtn = popup.querySelector(SETTINGS.SELECTORS.closeButton);
            if (closeBtn) {
                await DOM.safeClick(closeBtn, '关闭按钮（提取奖励）');
                await Utils.sleep(300);
            }

            return prizes.length > 0 ? prizes : null;
        } catch (error) {
            Utils.log(`[奖励提取] 提取失败: ${error.message}`);
            
            // 确保关闭任何可能打开的弹窗
            try {
                const closeBtn = document.querySelector(SETTINGS.SELECTORS.closeButton);
                if (closeBtn) {
                    await DOM.safeClick(closeBtn, '关闭按钮（异常）');
                }
            } catch {
                // 忽略关闭错误
            }
            
            return null;
        }
    },

    /**
     * 哨兵观察链。
     * 信任首次获取的倒计时和由HackTimer驱动的主定时器。
     * 哨兵只对比UI和脚本计时器的差异，并报告UI是否被"节流"(显示为STALLED)，但不修改核心的 `currentTaskEndTime`。
     */
    startHealthChecks(roomId, redEnvelopeDiv) {
        const CHECK_INTERVAL = SETTINGS.HEALTHCHECK_INTERVAL;
        const STALL_THRESHOLD = 4;

        const check = () => {
            // 获取当前倒计时文本
            const contentElem = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.countdownTimer);
            const headlineElem = redEnvelopeDiv.querySelector(SETTINGS.SELECTORS.statusHeadline);
            
            const currentPageContent = contentElem ? contentElem.textContent.trim() : '';
            const currentPageHeadline = headlineElem ? headlineElem.textContent.trim() : '';
            
            // 检查是否还在倒计时状态
            if (!currentPageHeadline.includes('倒计时') || !currentPageContent.includes(':')) {
                Utils.log('[哨兵] 检测到状态变化，停止监控。');
                return;
            }

            const scriptRemainingSeconds = (this.currentTaskEndTime - Date.now()) / 1000;

            // 解析UI显示的时间
            const timeMatch = currentPageContent.match(/(\d+):(\d+)/);
            if (!timeMatch) {
                Utils.log('[哨兵] 无法解析UI倒计时，跳过本次检查。');
                return;
            }

            const pMin = parseInt(timeMatch[1]);
            const pSec = parseInt(timeMatch[2]);
            const pageRemainingSeconds = pMin * 60 + pSec;

            const deviation = Math.abs(scriptRemainingSeconds - pageRemainingSeconds);

            const currentFormattedTime = Utils.formatTime(scriptRemainingSeconds);
            const pageFormattedTime = Utils.formatTime(pageRemainingSeconds);

            Utils.log(
                `[哨兵] 脚本倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime} | 差值: ${deviation.toFixed(2)}秒`
            );
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
                        GlobalState.updateWorker(roomId, 'WAITING', calibrationMessage, {
                            countdown: { endTime: this.currentTaskEndTime },
                        });

                        // 2.5秒后，发送常规更新，让ControlPage恢复显示倒计时
                        setTimeout(() => {
                            // 检查任务是否还在，防止在延迟期间任务已结束
                            if (this.currentTaskEndTime > Date.now()) {
                                GlobalState.updateWorker(roomId, 'WAITING', `倒计时...`, {
                                    countdown: { endTime: this.currentTaskEndTime },
                                });
                            }
                        }, 2500);
                    } else {
                        // 偏差很小，静默校准，直接更新为倒计时状态
                        GlobalState.updateWorker(roomId, 'WAITING', `倒计时...`, {
                            countdown: { endTime: this.currentTaskEndTime },
                        });
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
                        GlobalState.updateWorker(roomId, 'SWITCHING', '倒计时卡死, 切换中', { countdown: null });
                        clearTimeout(this.healthCheckTimeoutId);
                        this.switchRoom();
                        return;
                    }

                    // 显示卡顿状态但继续监控
                    this.stallLevel = 1;
                    GlobalState.updateWorker(roomId, 'ERROR', `UI卡顿 (${deviation.toFixed(1)}秒)`, {
                        countdown: { endTime: this.currentTaskEndTime },
                    });
                }
            } else {
                // 原有逻辑
                if (deviation > STALL_THRESHOLD) {
                    if (this.stallLevel === 0) {
                        // 只在第一次检测到卡顿时记录日志
                        Utils.log(`[哨兵] 检测到UI节流。脚本精确倒计时: ${currentFormattedTime} | UI显示: ${pageFormattedTime}`);
                    }
                    this.stallLevel = 1;
                    // 只更新状态为STALLED
                    GlobalState.updateWorker(roomId, 'STALLED', `UI节流中...`, {
                        countdown: { endTime: this.currentTaskEndTime },
                    });
                } else {
                    if (this.stallLevel > 0) {
                        Utils.log('[哨兵] UI已从节流中恢复。');
                        this.stallLevel = 0;
                    }
                    GlobalState.updateWorker(roomId, 'WAITING', `倒计时 ${currentFormattedTime}`, {
                        countdown: { endTime: this.currentTaskEndTime },
                    });
                }
            }

            // 5. 只要我们的精确计时器没到终点，就继续观察
            if (scriptRemainingSeconds > CHECK_INTERVAL / 1000 + 1) {
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

        Utils.log(`[领取] 房间 ${roomId} 准备触发红包弹窗...`);
        GlobalState.updateWorker(roomId, 'CLAIMING', '尝试打开红包...', { countdown: null });

        // 1. 查找正确的点击目标
        const outerContainers = document.querySelectorAll(SETTINGS.SELECTORS.redEnvelopeContainer);
        let targetBtn = null;

        for (const outer of outerContainers) {
            // 确认是红包容器
            const hasBoxIcon = outer.querySelector(SETTINGS.SELECTORS.boxIcon);
            if (!hasBoxIcon) {
                continue;
            }
            
            // 获取内层可点击容器
            const innerContainer = outer.querySelector(SETTINGS.SELECTORS.clickableContainer);
            if (!innerContainer) {
                continue;
            }
            
            // 检查是否为有效状态
            const headlineElem = outer.querySelector(SETTINGS.SELECTORS.statusHeadline);
            const contentElem = outer.querySelector(SETTINGS.SELECTORS.countdownTimer);
            const headline = headlineElem ? headlineElem.textContent.trim() : '';
            const content = contentElem ? contentElem.textContent.trim() : '';
            
            // 只点击倒计时或可领取状态的红包
            if ((headline.includes('倒计时') && content.includes(':')) || 
                headline.includes('可领取') || 
                headline.includes('立即')) {
                targetBtn = innerContainer; // 点击内层容器
                Utils.log(`[领取] 锁定点击目标 - 标题: "${headline}" | 内容: "${content}"`);
                break;
            }
        }

        if (!targetBtn) {
            Utils.log('[领取] 未能锁定有效的点击目标，尝试兜底查找...');
            const outerDiv = await DOM.findElement(SETTINGS.SELECTORS.redEnvelopeContainer, 3000);
            if (outerDiv) {
                targetBtn = outerDiv.querySelector(SETTINGS.SELECTORS.clickableContainer) || outerDiv;
            }
        }

        if (!(await DOM.safeClick(targetBtn, '红包内层容器'))) {
            Utils.log('[领取] 点击失败，重新寻找任务。');
            await Utils.sleep(2000);
            this.findAndExecuteNextTask(roomId);
            return;
        }

        // 2. 等待弹窗出现
        const popup = await DOM.findElement(SETTINGS.SELECTORS.popupModal, SETTINGS.POPUP_WAIT_TIMEOUT);
        if (!popup) {
            Utils.log('等待红包弹窗超时，重新寻找任务。');
            await Utils.sleep(2000);
            this.findAndExecuteNextTask(roomId);
            return;
        }

        // 3. 查找打开按钮
        const singleBag = popup.querySelector(SETTINGS.SELECTORS.singleBag);
        const openBtn = singleBag ? singleBag.querySelector(SETTINGS.SELECTORS.openButton) : null;
        
        if (openBtn) {
            const btnText = openBtn.textContent.trim();
            Utils.log(`[领取] 找到打开按钮，文本: "${btnText}"`);
            
            // 检查是否还需要等待
            if (/(\d+)秒后/.test(btnText)) {
                const waitMatch = btnText.match(/(\d+)秒后/);
                if (waitMatch) {
                    const waitSeconds = parseInt(waitMatch[1]);
                    Utils.log(`[领取] 按钮显示还需等待 ${waitSeconds} 秒，等待中...`);
                    GlobalState.updateWorker(roomId, 'CLAIMING', `等待 ${waitSeconds} 秒...`, { countdown: null });
                    await Utils.sleep((waitSeconds + 1) * 1000);
                }
            }
        }
        
        // 4. 执行点击（优先点击按钮，否则点击弹窗）
        const clickTarget = openBtn || singleBag || popup;
        const targetName = openBtn ? '红包打开按钮' : (singleBag ? '红包主体' : '红包弹窗');

        if (await DOM.safeClick(clickTarget, targetName)) {
            // 检查上限
            if (await DOM.checkForLimitPopup()) {
                GlobalState.setDailyLimit(true);
                Utils.log('检测到每日上限！');
                if (SETTINGS.DAILY_LIMIT_ACTION === 'CONTINUE_DORMANT') {
                    await this.enterDormantMode();
                } else {
                    await this.selfClose(roomId);
                }
                return;
            }

            await Utils.sleep(1500);
            
            // 5. 识别结果
            const successIndicator = await DOM.findElement(SETTINGS.SELECTORS.rewardSuccessIndicator, 3000, popup);
            const reward = successIndicator ? '领取成功 ' : '空包或失败';
            Utils.log(`领取操作完成，结果: ${reward}`);

            GlobalState.updateWorker(roomId, 'WAITING', `领取到: ${reward}`, { countdown: null });
            
            // 6. 关闭弹窗
            const closeBtn = document.querySelector(SETTINGS.SELECTORS.closeButton);
            await DOM.safeClick(closeBtn, '关闭按钮');
        } else {
            Utils.log('[领取] 点击打开操作失败。');
        }

        STATE.lastActionTime = Date.now();
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

        // 1. 尝试寻找暂停按钮
        let pauseBtn = document.querySelector(SETTINGS.SELECTORS.pauseButton);

        // 2. 如果找不到，可能是控制栏隐藏了，尝试通过触发播放器 hover 来唤出控制栏
        if (!pauseBtn) {
            const player = document.querySelector('#js-player-video');
            if (player) {
                // 模拟鼠标进入播放器区域
                player.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                await Utils.sleep(500); // 等待控制栏动画显示
                pauseBtn = document.querySelector(SETTINGS.SELECTORS.pauseButton);
            }
        }

        if (pauseBtn) {
            // 检查是否真的是暂停按钮（通过内部 SVG 的 path 特征判断，可选但更稳健）
            const isPauseIcon = pauseBtn.innerHTML.includes('M9.5 7'); 
            
            if (isPauseIcon) {
                if (await DOM.safeClick(pauseBtn, '暂停按钮')) {
                    Utils.log('视频已通过脚本暂停。');
                }
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
            const apiRoomUrls = await DouyuAPI.getRooms(SETTINGS.API_ROOM_FETCH_COUNT, currentRoomId);
            const currentState = GlobalState.get();
            const openedRoomIds = new Set(Object.keys(currentState.tabs));

            // 3. 筛选出未被打开的新房间
            const nextUrl = apiRoomUrls.find((url) => {
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
                GM_openInTab(nextUrl, { active: false, setParent: true });
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
            const { action, target } = event.data;

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

    /**
     * 等待红包容器出现（确保找到的是真正的红包容器）
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<HTMLElement|null>} - 找到的红包容器或 null
     */
    async waitForRedEnvelopeContainer(timeout) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            // 查找所有可能的容器
            const containers = document.querySelectorAll(SETTINGS.SELECTORS.redEnvelopeContainer);
            
            // 遍历找到包含红包图标的容器
            for (const container of containers) {
                const hasBoxIcon = container.querySelector(SETTINGS.SELECTORS.boxIcon);
                if (hasBoxIcon) {
                    Utils.log(`[等待] 找到红包容器，耗时 ${Date.now() - startTime}ms`);
                    return container;
                }
            }
            
            // 没找到，等待一小段时间后重试
            await Utils.sleep(300);
        }
        
        Utils.log(`[等待] 等待红包容器超时（${timeout}ms）`);
        return null;
    },
};

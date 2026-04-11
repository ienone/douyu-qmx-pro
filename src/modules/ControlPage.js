/**
 * @file ControlPage.js
 * @description 负责集成控制页面的UI和交互逻辑。
 */

import '../styles/ControlPanel-refactored.css';
import { mainPanelTemplate, statsPanelTemplate } from '../ui/templates.js';
import { Utils } from '../utils/utils';
import { SETTINGS } from './SettingsManager';
import { ThemeManager } from './ThemeManager';
import { GlobalState } from './GlobalState';
import { DouyuAPI } from '../utils/DouyuAPI';
import { SettingsPanel } from './SettingsPanel.js';
import { FirstTimeNotice } from './FirstTimeNotice.js';
import { StatsInfo } from './StatsInfo';
import { DanmuPro } from './danmu/DanmuPro'; // 1. 添加静态导入
import { PageLoader } from './PageLoader';

// --- 图标常量 ---
const ICONS = {
    GOLD: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA000" stroke-width="2"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="14" fill="#B8860B" font-weight="bold" font-family="Arial">¥</text></svg>`,
    STARLIGHT: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF69B4" stroke="#FF1493" stroke-width="2"/></svg>`,
    GIFT: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="8" width="18" height="12" rx="2" fill="#FF7043"/><rect x="10" y="8" width="4" height="12" fill="#FFCCBC"/><path d="M12 8V4M12 4L8 8M12 4L16 8" stroke="#FF7043" stroke-width="2" stroke-linecap="round"/></svg>`
};

/**
 * =================================================================================
 * 模块：控制页面 (ControlPage)
 * ---------------------------------------------------------------------------------
 * 负责在控制室页面创建和管理仪表盘UI。
 * =================================================================================
 */
export const ControlPage = {
    // --- 模块内部状态 ---
    injectionTarget: null, // 存储被注入的DOM元素引用
    isPanelInjected: false, // 标记是否成功进入注入模式
    commandChannel: null,
    modalContainer: null, // 新增：持有面板引用，防止DOM丢失后无法找回
    openTabTimerId: null,
    
    /**
     * 控制页面的总入口和初始化函数。
     */
    init() {
        Utils.log('当前是控制页面，开始设置UI...');
        this.commandChannel = new BroadcastChannel('douyu_qmx_commands'); // 创建广播频道
        // this.injectCSS();
        ThemeManager.applyTheme(SETTINGS.THEME);
        
        // 重新打开控制页面时先清空列表，避免残留已关闭的直播间信息
        this.clearClosedTabs();
        
        this.createHTML();
        
        // 根据设置决定是否显示统计信息面板
        const qmxModalHeader = document.querySelector('.qmx-modal-header');
        if (SETTINGS.SHOW_STATS_IN_PANEL) {
            // 启用统计信息面板
            if (qmxModalHeader) {
                qmxModalHeader.style.padding = '10px 20px 0px 20px';
            }
            StatsInfo.init();
        } else {
            // 恢复默认控制页面
            const statsContent = document.querySelector('.qmx-stats-container');
            if (statsContent && qmxModalHeader) {
                statsContent.remove();
                qmxModalHeader.style.padding = '10px 20px 4px 20px';
            }
        }
        // applyModalMode 必须在 bindEvents 之前调用，因为它会决定事件如何绑定
        this.applyModalMode();
        this.bindEvents();

        // 监听设置更新事件
        window.addEventListener('qmx-settings-update', (e) => {
            this.handleSettingsUpdate(e.detail);
        });

       setInterval(() => {
            this.renderDashboard();
            this.cleanupAndMonitorWorkers(); // 标签页回收及监控僵尸标签页
            this.checkInjectionState(); // 新增：检查注入状态
        }, 1000);
        this.startOpenTabScheduler();

        // 显示首次使用提示
        FirstTimeNotice.showCalibrationNotice();

        // 确保页面关闭时关闭频道
        window.addEventListener('beforeunload', () => {
            if (this.commandChannel) {
                this.commandChannel.close();
            }
        });
        window.addEventListener('resize', () => {
            this.correctButtonPosition();
            this.correctModalPosition();
        });
    },

    /**
     * 新增：检查注入状态，防止因页面重绘导致面板丢失
     */
    checkInjectionState() {
        // 仅在注入模式且认为已注入的情况下检查
        if (SETTINGS.MODAL_DISPLAY_MODE === 'inject-rank-list' && this.isPanelInjected) {
            // 如果持有引用的元素不再连接到DOM，说明被宿主页面清理了
            if (this.modalContainer && !this.modalContainer.isConnected) {
                Utils.log('[监控] 检测到面板脱离DOM (可能是页面重绘)，正在重新注入...');
                this.isPanelInjected = false; // 重置标志位
                this.applyModalMode(); // 重新执行注入逻辑
            }
        }
    },

    /**
     * 处理设置更新
     */
    async handleSettingsUpdate(newSettings) {
        Utils.log('[ControlPage] 检测到设置更新，正在应用...');

        // 1. 处理显示模式变更
        if (newSettings.MODAL_DISPLAY_MODE) {
            this.applyModalMode();
            this.correctModalPosition();
        }

        // 2. 处理弹幕助手开关 - 添加编译时检查
        if (__ENABLE_DANMU_PRO__ && typeof newSettings.ENABLE_DANMU_PRO !== 'undefined') {
            if (newSettings.ENABLE_DANMU_PRO) {
                DanmuPro.init();
            } else {
                DanmuPro.destroy();
            }
        }

        // 3. 处理统计面板开关
        if (typeof newSettings.SHOW_STATS_IN_PANEL !== 'undefined') {
            this.toggleStatsPanel(newSettings.SHOW_STATS_IN_PANEL);
        }

        // 4. 处理统计更新间隔
        if (newSettings.STATS_UPDATE_INTERVAL && SETTINGS.SHOW_STATS_IN_PANEL) {
            StatsInfo.updateInterval();
        }

        // 5. 开页调度间隔变更后，重建开页定时器
        if (typeof newSettings.OPEN_TAB_INTERVAL !== 'undefined') {
            this.startOpenTabScheduler();
        }
    },

    /**
     * 按设置的间隔调度队列开页。
     */
    startOpenTabScheduler() {
        if (this.openTabTimerId) {
            clearInterval(this.openTabTimerId);
            this.openTabTimerId = null;
        }

        const interval = Math.max(200, Number(SETTINGS.OPEN_TAB_INTERVAL) || 2000);
        this.openTabTimerId = setInterval(() => {
            PageLoader.openNextTab();
        }, interval);
    },

    /**
     * 切换统计面板显示状态
     */
    toggleStatsPanel(show) {
        const qmxModalHeader = document.querySelector('.qmx-modal-header');
        let statsContent = document.querySelector('.qmx-stats-container');

        if (show) {
            if (!statsContent) {
                // 创建并插入统计面板
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = statsPanelTemplate;
                statsContent = tempDiv.firstElementChild;
                qmxModalHeader.after(statsContent);
                
                // 重新绑定统计面板的折叠事件
                const statsToggle = document.getElementById('qmx-stats-toggle');
                const statsContentEl = document.getElementById('qmx-stats-content');
                if (statsToggle && statsContentEl) {
                    statsToggle.addEventListener('click', () => {
                        const isExpanded = statsToggle.classList.contains('expanded');
                        if (isExpanded) {
                            statsToggle.classList.remove('expanded');
                            statsContentEl.classList.remove('expanded');
                        } else {
                            statsToggle.classList.add('expanded');
                            statsContentEl.classList.add('expanded');
                        }
                    });
                }
            }
            
            if (qmxModalHeader) {
                qmxModalHeader.style.padding = '10px 20px 0px 20px';
            }
            StatsInfo.init();
        } else {
            if (statsContent) {
                statsContent.remove();
            }
            if (qmxModalHeader) {
                qmxModalHeader.style.padding = '10px 20px 4px 20px';
            }
            StatsInfo.destroy();
        }
    },

    createHTML() {
        Utils.log('创建UI的HTML结构...');
        const modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'qmx-modal-backdrop';

        const modalContainer = document.createElement('div');
        modalContainer.id = 'qmx-modal-container';
        this.modalContainer = modalContainer; // 保存引用
        modalContainer.innerHTML = mainPanelTemplate(SETTINGS.MAX_WORKER_TABS);
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
                Utils.log(
                    `[监控] 任务 ${roomId} (已断开) 超过 ${SETTINGS.DISCONNECTED_GRACE_PERIOD / 1000} 秒未重连，执行清理。`
                );
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
     * 为所有UI元素绑定事件监听器
     */
    bindEvents() {
        Utils.log('为UI元素绑定事件...');

        const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
        const modalContainer = document.getElementById('qmx-modal-container');
        const modalBackdrop = document.getElementById('qmx-modal-backdrop');

        // --- 统计面板折叠事件 ---
        const statsToggle = document.getElementById('qmx-stats-toggle');
        const statsContent = document.getElementById('qmx-stats-content');
        
        if (statsToggle && statsContent) {
            statsToggle.addEventListener('click', () => {
                const isExpanded = statsToggle.classList.contains('expanded');
                
                if (isExpanded) {
                    // 收起
                    statsToggle.classList.remove('expanded');
                    statsContent.classList.remove('expanded');
                } else {
                    // 展开
                    statsToggle.classList.add('expanded');
                    statsContent.classList.add('expanded');
                }
            });
        }

        // --- 核心交互：主按钮的点击与拖拽 ---
        this.setupDrag(mainButton, SETTINGS.BUTTON_POS_STORAGE_KEY, () => this.showPanel());

        // 核心修复：无论当前是什么模式，都初始化面板拖拽（由CSS控制是否启用位移）
        const modalHeader = modalContainer.querySelector('.qmx-modal-header');
        this.setupDrag(modalContainer, 'douyu_qmx_modal_position', null, modalHeader);

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
        document.getElementById('qmx-modal-settings-btn').onclick = () => SettingsPanel.show();
        document.getElementById('qmx-modal-close-all-btn').onclick = async () => {
            if (confirm('确定要关闭所有工作标签页吗？')) {
                Utils.log('用户请求关闭所有标签页。');

                // 1: 向所有工作页广播关闭指令
                Utils.log('通过 BroadcastChannel 发出 CLOSE_ALL 指令...');
                this.commandChannel.postMessage({ action: 'CLOSE_ALL', target: '*' });

                // 2: 等待一段时间让工作页面有机会响应
                await new Promise((resolve) => setTimeout(resolve, 500));

                // 3: 强制清空全局状态中的所有标签页，无论工作页是否收到指令
                Utils.log('强制清空全局状态中的标签页列表...');
                let state = GlobalState.get();
                if (Object.keys(state.tabs).length > 0) {
                    Utils.log(`清理前还有 ${Object.keys(state.tabs).length} 个标签页残留`);
                    state.tabs = {}; // 直接清空
                    GlobalState.set(state);
                }

                // 4: 重新渲染UI，面板变空
                this.renderDashboard();

                // 5: 额外的清理检查，确保UI彻底清空
                setTimeout(() => {
                    state = GlobalState.get();
                    if (Object.keys(state.tabs).length > 0) {
                        Utils.log('检测到残留标签页，执行二次清理...');
                        state.tabs = {};
                        GlobalState.set(state);
                        this.renderDashboard();
                    }
                }, 1000);
            }
        };
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
        //Utils.log(`[Render] 开始渲染，检测到 ${tabIds.length} 个活动标签页。IDs: [${tabIds.join(', ')}]`); // 新增日志

        document.getElementById('qmx-active-tabs-count').textContent = tabIds.length;

        const statusDisplayMap = {
            OPENING: '加载中',
            WAITING: '等待中',
            CLAIMING: '领取中',
            SWITCHING: '切换中',
            DORMANT: '休眠中',
            ERROR: '出错了',
            UNRESPONSIVE: '无响应',
            DISCONNECTED: '已断开',
            STALLED: 'UI节流',
        };

        const existingRoomIds = new Set(
            Array.from(tabList.children)
                .map((node) => node.dataset.roomId)
                .filter(Boolean)
        );
        //Utils.log(`[Render] 当前UI上显示的IDs: [${Array.from(existingRoomIds).join(', ')}]`); // 新增日志

        // --- 核心更新/创建循环 ---
        tabIds.forEach((roomId) => {
            const tabData = state.tabs[roomId];
            let existingItem = tabList.querySelector(`[data-room-id="${roomId}"]`);

            let currentStatusText = tabData.statusText;

            // 使用 endTime 来计算剩余时间
            // 允许显示自定义文本(如校准)，但如果文本是默认或已经是倒计时格式，则由控制中心接管实时计算
            if (
                tabData.status === 'WAITING' &&
                tabData.countdown?.endTime &&
                (!currentStatusText || currentStatusText.startsWith('倒计时') || currentStatusText === '寻找任务中...')
            ) {
                const remainingSeconds = (tabData.countdown.endTime - Date.now()) / 1000;

                if (remainingSeconds > 0) {
                    currentStatusText = `倒计时 ${Utils.formatTime(remainingSeconds)}`;
                } else {
                    currentStatusText = '等待开抢...';
                }
            }

            if (existingItem) {
                // --- A. 如果条目已存在，则只更新内容 (UPDATE path) ---
                const nicknameEl =
                    existingItem.querySelector('.identity-nickname') ||
                    existingItem.querySelector('.qmx-tab-nickname');
                const statusNameEl = existingItem.querySelector('.qmx-tab-status-name');
                const statusTextEl = existingItem.querySelector('.qmx-tab-status-text');
                const dotEl = existingItem.querySelector('.qmx-tab-status-dot');

                if (tabData.nickname && nicknameEl && nicknameEl.textContent !== tabData.nickname) {
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

                // 更新奖品信息 (适配新布局：奖品独立在右侧)
                let prizesContainer = existingItem.querySelector('.qmx-tab-prizes');
                const newPrizesHtml = this.generatePrizesHTML(tabData.prizes);
                
                if (newPrizesHtml) {
                    // 如果有新的奖励信息
                    if (!prizesContainer) {
                        // 不存在容器，插入到关闭按钮之前
                        const closeBtn = existingItem.querySelector('.qmx-tab-close-btn');
                        if (closeBtn) {
                            closeBtn.insertAdjacentHTML('beforebegin', newPrizesHtml);
                        } else {
                            existingItem.insertAdjacentHTML('beforeend', newPrizesHtml);
                        }
                    } else {
                        // 核心修复：只在内容真正变化时才更新，避免每秒都触发 DOM 重绘
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newPrizesHtml;
                        const newContainer = tempDiv.firstElementChild;
                        
                        // 比较类名和内部文本内容，而不是整个 HTML
                        const oldLayoutClass = prizesContainer.classList.contains('multi-prizes') ? 'multi-prizes' : 'single-prize';
                        const newLayoutClass = newContainer.classList.contains('multi-prizes') ? 'multi-prizes' : 'single-prize';
                        const oldText = prizesContainer.textContent.trim();
                        const newText = newContainer.textContent.trim();
                        
                        if (oldLayoutClass !== newLayoutClass || oldText !== newText) {
                            prizesContainer.outerHTML = newPrizesHtml;
                        }
                    }
                } else if (prizesContainer) {
                    // 没有奖励信息且容器存在，移除容器
                    prizesContainer.remove();
                }
            } else {
                // --- B. 如果条目不存在，则创建并添加 (CREATE path) ---
                const newItem = this.createTaskItem(roomId, tabData, statusDisplayMap, currentStatusText);
                tabList.appendChild(newItem);
                requestAnimationFrame(() => {
                    newItem.classList.add('qmx-item-enter-active');
                    setTimeout(() => newItem.classList.remove('qmx-item-enter'), 300);
                });
            }
        });

        // --- 处理删除 (DELETE path) ---
        existingRoomIds.forEach((roomId) => {
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
        if (
            limitState?.reached &&
            Utils.formatDateAsBeijing(new Date(limitState.timestamp)) !== Utils.formatDateAsBeijing(new Date())
        ) {
            Utils.log('[控制中心] 新的一天，重置每日上限旗标。');
            GlobalState.setDailyLimit(false);
            limitState = null; // 重置后立即生效
        }

        if (limitState?.reached) {
            if (!limitMessageEl) {
                limitMessageEl = document.createElement('div');
                limitMessageEl.id = 'qmx-limit-message';
                limitMessageEl.style.cssText =
                    'padding: 10px 24px; background-color: var(--status-color-error); color: white; font-weight: 500; text-align: center;';
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
            if (limitMessageEl) limitMessageEl.remove();
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
            const newUrl = await DouyuAPI.getRoom(SETTINGS.API_ROOM_FETCH_COUNT, SETTINGS.CONTROL_ROOM_ID);

            if (newUrl) {
                const newRoomId = newUrl.match(/\/(\d+)/)[1];

                const pendingWorkers = GM_getValue('qmx_pending_workers', []);
                pendingWorkers.push(newRoomId);
                GM_setValue('qmx_pending_workers', pendingWorkers);
                Utils.log(`已将房间 ${newRoomId} 加入待处理列表。`);

                GlobalState.updateWorker(newRoomId, 'OPENING', '正在打开...');
                // 保证使用旧版UI
                if (window.location.href.includes('/beta') || localStorage.getItem('newWebLive') !== 'A') {
                    // --- 找到了“/beta”，说明是新版UI ---
                    localStorage.setItem('newWebLive', 'A');
                }
                const queued = PageLoader.enqueue(newUrl);
                if (queued) {
                    Utils.log(`打开请求已入队: ${newUrl}`);
                } else {
                    Utils.log(`打开请求已存在于队列中，跳过重复入队: ${newUrl}`);
                }
            } else {
                Utils.log('未能找到新的、未打开的房间。');
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
     * 设置拖拽功能 (v4: 使用比例定位)
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

        // --- 位置加载与转换逻辑 ---
        const savedPos = GM_getValue(storageKey);
        let currentRatio = null;

        if (savedPos) {
            // 1. 如果是新的比例格式
            if (typeof savedPos.ratioX === 'number' && typeof savedPos.ratioY === 'number') {
                currentRatio = savedPos;
            }
            // 2. 如果是旧的像素格式，并且启用了转换
            else if (SETTINGS.CONVERT_LEGACY_POSITION && typeof savedPos.x === 'number' && typeof savedPos.y === 'number') {
                Utils.log(`[位置迁移] 发现旧的像素位置，正在转换为比例位置...`);
                const movableWidth = window.innerWidth - element.offsetWidth;
                const movableHeight = window.innerHeight - element.offsetHeight;
                currentRatio = {
                    ratioX: Math.max(0, Math.min(1, savedPos.x / movableWidth)),
                    ratioY: Math.max(0, Math.min(1, savedPos.y / movableHeight)),
                };
                GM_setValue(storageKey, currentRatio); // 保存新格式
            }
        }

        if (currentRatio) {
            // 根据比例计算当前位置
            const newX = currentRatio.ratioX * (window.innerWidth - element.offsetWidth);
            const newY = currentRatio.ratioY * (window.innerHeight - element.offsetHeight);
            setPosition(newX, newY);
        } else {
            // --- 默认位置 ---
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

            element.classList.add('is-dragging');
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
                // --- 拖拽结束：保存比例位置 ---
                const finalRect = element.getBoundingClientRect();
                const movableWidth = window.innerWidth - element.offsetWidth;
                const movableHeight = window.innerHeight - element.offsetHeight;

                const ratioX = movableWidth > 0 ? Math.max(0, Math.min(1, finalRect.left / movableWidth)) : 0;
                const ratioY = movableHeight > 0 ? Math.max(0, Math.min(1, finalRect.top / movableHeight)) : 0;

                GM_setValue(storageKey, { ratioX, ratioY });
            } else if (onClick && typeof onClick === 'function') {
                onClick();
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
        Utils.log('控制面板已显示。');
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
        Utils.log('控制面板已隐藏。');
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
        const prizesHtml = this.generatePrizesHTML(tabData.prizes);

        newItem.innerHTML = `
                <div class="qmx-tab-status-dot" style="background-color: ${statusColor};"></div>
                <div class="qmx-tab-info">
                    <div class="qmx-tab-header">
                        <button class="qmx-tab-identity" type="button" data-state="nickname" title="点击切换或复制">
                            <span class="qmx-tab-identity-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" role="img" focusable="false">
                                    <path d="M8 7h3v2H8v9H6V9H3V7h3V4h2v3zm7 0h6v2h-6v9h-2V7h2z" fill="currentColor"></path>
                                </svg>
                            </span>
                            <span class="qmx-tab-identity-text">
                                <span class="identity-nickname">${nickname}</span>
                                <span class="identity-roomid">${roomId}</span>
                            </span>
                        </button>
                    </div>
                    <div class="qmx-tab-details">
                        <span class="qmx-tab-status-name">[${statusName}]</span>
                        <span class="qmx-tab-status-text">${statusText}</span>
                    </div>
                </div>
                ${prizesHtml}
                <button class="qmx-tab-close-btn" title="关闭该标签页">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;

        const identityBtn = newItem.querySelector('.qmx-tab-identity');
        const nicknameSpan = identityBtn.querySelector('.identity-nickname');
        const roomIdSpan = identityBtn.querySelector('.identity-roomid');
        const iconSpan = identityBtn.querySelector('.qmx-tab-identity-icon');

        const setIdentityState = (state) => {
            identityBtn.dataset.state = state;
        };

        const copyIdentityValue = async (state) => {
            const value =
                state === 'room'
                    ? roomIdSpan.textContent.trim()
                    : nicknameSpan.textContent.trim();
            const label = state === 'room' ? '房间号' : '房间名';
            try {
                await navigator.clipboard.writeText(value);
                identityBtn.classList.add('copied');
                setTimeout(() => identityBtn.classList.remove('copied'), 300);
                Utils.log(`[房间号切换] 已复制${label}: ${value}`);
            } catch (err) {
                Utils.log(`[房间号切换] 复制失败: ${err.message}`);
            }
        };

        // 图标区域：点击复制当前显示的值
        iconSpan.addEventListener('click', async (e) => {
            e.stopPropagation();
            const currentState = identityBtn.dataset.state === 'room' ? 'room' : 'nickname';
            await copyIdentityValue(currentState);
        });

        // 按钮其他区域：点击切换显示
        identityBtn.addEventListener('click', (e) => {
            // 如果点击的是图标，不执行切换
            if (e.target.closest('.qmx-tab-identity-icon')) {
                return;
            }
            e.stopPropagation();
            const currentState = identityBtn.dataset.state === 'room' ? 'room' : 'nickname';
            const nextState = currentState === 'nickname' ? 'room' : 'nickname';
            setIdentityState(nextState);
        });

        identityBtn.addEventListener(
            'mouseenter',
            () => Utils.log(`[房间号切换] 鼠标悬停在房间胶囊: ${roomId}`),
            { once: true }
        );

        return newItem;
    },

    /**
     * 生成奖品信息的HTML (使用SVG图标)
     */
    generatePrizesHTML(prizes) {
        if (!prizes || !Array.isArray(prizes) || prizes.length === 0) return '';
        
        // 根据奖励数量决定布局类
        const layoutClass = prizes.length > 1 ? 'multi-prizes' : 'single-prize';
        
        return `<div class="qmx-tab-prizes ${layoutClass}">` +
            prizes.map((p, index) => {
                let icon = ICONS.GOLD;
                if (prizes.length === 2 && index === 1) {
                    icon = ICONS.STARLIGHT;
                }

                return `<div class="qmx-tab-prize-item" title="${p.name || p.text}">
                    ${icon}
                    <span class="qmx-tab-prize-text">${p.text}</span>
                </div>`;
            }).join('') +
            `</div>`;
    },

    /**
     * 应用当前配置的模态框模式
     */
    applyModalMode() {
        const modalContainer = this.modalContainer || document.getElementById('qmx-modal-container');
        if (!modalContainer) return;

        const mode = SETTINGS.MODAL_DISPLAY_MODE;
        const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
        
        Utils.log(`尝试应用模态框模式: ${mode}`);

        // 1. 退出注入模式的清理逻辑
        if (this.isPanelInjected && mode !== 'inject-rank-list') {
            // 核心修复：恢复排行榜显示
            if (this.injectionTarget) {
                this.injectionTarget.classList.remove('qmx-hidden');
            }
            
            document.body.appendChild(modalContainer);
            this.isPanelInjected = false;
            this.injectionTarget = null;
            
            // 清理注入模式特有的类
            modalContainer.classList.remove('mode-inject-rank-list', 'qmx-hidden');
            
            // 状态同步：如果主按钮是隐藏的，说明面板应该处于显示状态
            if (mainButton && mainButton.classList.contains('hidden')) {
                modalContainer.classList.add('visible');
            } else {
                modalContainer.classList.remove('visible');
            }
        }

        // 2. 进入/维持 注入模式
        if (mode === 'inject-rank-list') {
            const waitForTarget = (retries = SETTINGS.INJECT_TARGET_RETRIES, interval = SETTINGS.INJECT_TARGET_INTERVAL) => {
                const target = document.querySelector(SETTINGS.SELECTORS.rankListContainer);
                if (target) {
                    // 如果已经注入且目标没变，不需要重复操作，防止闪烁和状态丢失
                    if (this.isPanelInjected && this.injectionTarget === target && modalContainer.parentNode === target.parentNode) {
                        return;
                    }

                    Utils.log('执行注入逻辑...');
                    
                    // 如果之前已经注入过别的目标，先恢复旧目标
                    if (this.injectionTarget && this.injectionTarget !== target) {
                        this.injectionTarget.classList.remove('qmx-hidden');
                    }

                    this.injectionTarget = target;
                    this.isPanelInjected = true;
                    
                    // 插入 DOM
                    target.parentNode.insertBefore(modalContainer, target.nextSibling);
                    modalContainer.classList.add('mode-inject-rank-list');
                    
                    // 核心修复：进入注入模式时，必须移除其它模式类，防止继承 mode-floating 的 opacity: 0
                    modalContainer.classList.remove('mode-centered', 'mode-floating');
                    
                    // 核心修复：根据主按钮状态决定面板和排行榜的显隐，而不是暴力隐藏
                    if (mainButton && mainButton.classList.contains('hidden')) {
                        // 面板应显示，排行榜应隐藏
                        modalContainer.classList.remove('qmx-hidden');
                        this.injectionTarget.classList.add('qmx-hidden');
                    } else {
                        // 面板应隐藏，排行榜应显示
                        modalContainer.classList.add('qmx-hidden');
                        this.injectionTarget.classList.remove('qmx-hidden');
                    }
                    
                    // 注入模式下不需要 visible 类（该类用于浮动模式的定位）
                    modalContainer.classList.remove('visible');

                } else if (retries > 0) {
                    setTimeout(() => waitForTarget(retries - 1, interval), interval);
                } else {
                    Utils.log(`[注入失败] 未找到目标元素 "${SETTINGS.SELECTORS.rankListContainer}"。`);
                    Utils.log("[降级] 自动切换到 'floating' 备用模式。");
                    SETTINGS.MODAL_DISPLAY_MODE = 'floating';
                    this.applyModalMode();
                }
            };
            waitForTarget();
            return;
        }

        // 3. 普通模式 (centered, floating)
        this.isPanelInjected = false;
        modalContainer.classList.remove('mode-inject-rank-list', 'qmx-hidden');
        // 确保移除所有模式类并添加当前的
        modalContainer.classList.remove('mode-centered', 'mode-floating');
        modalContainer.classList.add(`mode-${mode}`);
    },

    /**
     * 位置校正函数
     * @param {string} elementId - 要校正位置的元素ID
     * @param {string} storageKey - 用于存储位置的键
     */
    correctPosition(elementId, storageKey) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const savedPos = GM_getValue(storageKey);
        if (savedPos && typeof savedPos.ratioX === 'number' && typeof savedPos.ratioY === 'number') {
            const newX = savedPos.ratioX * (window.innerWidth - element.offsetWidth);
            const newY = savedPos.ratioY * (window.innerHeight - element.offsetHeight);

            element.style.setProperty('--tx', `${newX}px`);
            element.style.setProperty('--ty', `${newY}px`);
        }
    },

    /**
     * 校正悬浮按钮位置，确保在屏幕可见区域
     */
    correctButtonPosition() {
        this.correctPosition(SETTINGS.DRAGGABLE_BUTTON_ID, SETTINGS.BUTTON_POS_STORAGE_KEY);
    },

    /**
     * 校正控制中心位置，确保在屏幕可见区域
     */
    correctModalPosition() {
        
        // 不符合浮动模式条件则返回
        if (SETTINGS.MODAL_DISPLAY_MODE !== 'floating' || this.isPanelInjected) {
            return;
        }
        this.correctPosition('qmx-modal-container', 'douyu_qmx_modal_position');
    },

    /**
     * 清空已关闭的标签页，避免重新打开控制页面时残留已关闭的直播间信息
     */
    clearClosedTabs() {
        // 获取当前状态
        const state = GlobalState.get();
        
        // 检查是否有标签页需要清理
        if (state.tabs && Object.keys(state.tabs).length > 0) {
            Utils.log('检测到残留的标签页状态，正在清空...');
            
            // 清空所有标签页状态
            state.tabs = {};
            GlobalState.set(state);
            
            Utils.log('已清空残留的标签页状态');
        }
    },
};

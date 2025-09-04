/**
 * @file ControlPage.js
 * @description 负责集成控制页面的UI和交互逻辑。
 */

import '../styles/ControlPanel-refactored.css';
import { mainPanelTemplate } from '../ui/templates.js'; 
import { Utils } from '../utils/utils';
import { SETTINGS } from './SettingsManager'; 
import { ThemeManager } from './ThemeManager';
import { GlobalState } from './GlobalState';
import { DouyuAPI } from '../utils/DouyuAPI';
import { SettingsPanel } from './SettingsPanel.js'; 
import { FirstTimeNotice } from './FirstTimeNotice.js';

/**
 * =================================================================================
 * 模块：控制页面 (ControlPage)
 * ---------------------------------------------------------------------------------
 * 负责在控制室页面创建和管理仪表盘UI。
 * =================================================================================
 */
export const ControlPage = {
    // --- 模块内部状态 ---
    injectionTarget: null,    // 存储被注入的DOM元素引用
    isPanelInjected: false,   // 标记是否成功进入注入模式
    commandChannel: null,
    /**
     * 控制页面的总入口和初始化函数。
     */
    init() {
        Utils.log('当前是控制页面，开始设置UI...');
        this.commandChannel = new BroadcastChannel('douyu_qmx_commands'); // 创建广播频道
        // this.injectCSS();
        ThemeManager.applyTheme(SETTINGS.THEME);
        this.createHTML();
        // applyModalMode 必须在 bindEvents 之前调用，因为它会决定事件如何绑定
        this.applyModalMode();
        this.bindEvents();
        setInterval(() => {
            this.renderDashboard();
            this.cleanupAndMonitorWorkers(); // 标签页回收及监控僵尸标签页
        }, 1000);
        
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
        });
    },

    createHTML() {
        Utils.log('创建UI的HTML结构...');
        const modalBackdrop = document.createElement('div');
        modalBackdrop.id = 'qmx-modal-backdrop';

        const modalContainer = document.createElement('div');
        modalContainer.id = 'qmx-modal-container';
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
            if (tab.status === 'DISCONNECTED' && timeSinceLastUpdate >
                SETTINGS.DISCONNECTED_GRACE_PERIOD) {
                Utils.log(
                    `[监控] 任务 ${roomId} (已断开) 超过 ${SETTINGS.DISCONNECTED_GRACE_PERIOD /
                    1000} 秒未重连，执行清理。`);
                delete state.tabs[roomId];
                stateModified = true;
                continue; // 处理完这个就检查下一个
            }

            // 规则: 如果一个标签页处于“切换中”状态超过30秒，我们就认为它已经关闭
            if (tab.status === 'SWITCHING' && timeSinceLastUpdate >
                SETTINGS.SWITCHING_CLEANUP_TIMEOUT) {
                Utils.log(
                    `[监控] 任务 ${roomId} (切换中) 已超时，判定为已关闭，执行清理。`);
                delete state.tabs[roomId];
                stateModified = true;
                continue; // 处理完这个就检查下一个
            }

            // 规则：如果一个标签页（无论何种状态）长时间没有任何通信，则判定为失联
            if (timeSinceLastUpdate > SETTINGS.UNRESPONSIVE_TIMEOUT &&
                tab.status !==
                'UNRESPONSIVE') {
                Utils.log(
                    `[监控] 任务 ${roomId} 已失联超过 ${SETTINGS.UNRESPONSIVE_TIMEOUT /
                    60000} 分钟，标记为无响应。`);
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

        // --- 核心交互：主按钮的点击与拖拽 ---
        this.setupDrag(mainButton, SETTINGS.BUTTON_POS_STORAGE_KEY,
            () => this.showPanel());

        // 仅在浮动模式下，插件面板本身才可拖动
        if (SETTINGS.MODAL_DISPLAY_MODE === 'floating') {
            const modalHeader = modalContainer.querySelector(
                '.qmx-modal-header');
            // 面板拖拽不需要点击行为，所以第三个参数留空或不传
            this.setupDrag(modalContainer, 'douyu_qmx_modal_position', null,
                modalHeader);
        }

        // --- 关闭事件 ---
        document.getElementById(
            'qmx-modal-close-btn').onclick = () => this.hidePanel();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' &&
                modalContainer.classList.contains('visible')) {
                this.hidePanel();
            }
        });

        // 只有在非注入模式下才可能有背景，才需要绑定事件
        if (SETTINGS.MODAL_DISPLAY_MODE !== 'inject-rank-list') {
            modalBackdrop.onclick = () => this.hidePanel();
        }

        document.getElementById(
            'qmx-modal-open-btn').onclick = () => this.openOneNewTab();
        document.getElementById(
            'qmx-modal-settings-btn').onclick = () => SettingsPanel.show();
        document.getElementById('qmx-modal-close-all-btn').onclick = async () => {
            if (confirm('确定要关闭所有工作标签页吗？')) {
                Utils.log('用户请求关闭所有标签页。');

                // 1: 向所有工作页广播关闭指令
                Utils.log('通过 BroadcastChannel 发出 CLOSE_ALL 指令...');
                this.commandChannel.postMessage(
                    {action: 'CLOSE_ALL', target: '*'});

                // 2: 等待一段时间让工作页面有机会响应
                await new Promise(resolve => setTimeout(resolve, 500));

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
        document.getElementById('qmx-tab-list').
            addEventListener('click', (e) => {
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
                Utils.log(
                    `通过 BroadcastChannel 向 ${roomId} 发出 CLOSE 指令...`);
                this.commandChannel.postMessage(
                    {action: 'CLOSE', target: roomId}); // 通过广播发送单点指令

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

        document.getElementById(
            'qmx-active-tabs-count').textContent = tabIds.length;

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

        const existingRoomIds = new Set(Array.from(tabList.children).
            map(node => node.dataset.roomId).
            filter(Boolean));
        //Utils.log(`[Render] 当前UI上显示的IDs: [${Array.from(existingRoomIds).join(', ')}]`); // 新增日志

        // --- 核心更新/创建循环 ---
        tabIds.forEach(roomId => {
            const tabData = state.tabs[roomId];
            let existingItem = tabList.querySelector(
                `[data-room-id="${roomId}"]`);

            let currentStatusText = tabData.statusText;

            // 使用 endTime 来计算剩余时间
            // 允许显示自定义文本(如校准)，但如果文本是默认或已经是倒计时格式，则由控制中心接管实时计算
            if (tabData.status === 'WAITING' && tabData.countdown?.endTime && 
                (!currentStatusText || currentStatusText.startsWith('倒计时') || currentStatusText === '寻找任务中...')) {
                const remainingSeconds = (tabData.countdown.endTime -
                        Date.now()) /
                    1000;

                if (remainingSeconds > 0) {
                    currentStatusText = `倒计时 ${Utils.formatTime(
                        remainingSeconds)}`;
                } else {
                    currentStatusText = '等待开抢...';
                }
            }

            if (existingItem) {
                // --- A. 如果条目已存在，则只更新内容 (UPDATE path) ---
                //Utils.log(`[Render] 房间 ${roomId}: UI条目已存在，准备更新。状态: ${tabData.status}, 文本: "${currentStatusText}"`); // 新增日志
                const nicknameEl = existingItem.querySelector(
                    '.qmx-tab-nickname');
                const statusNameEl = existingItem.querySelector(
                    '.qmx-tab-status-name');
                const statusTextEl = existingItem.querySelector(
                    '.qmx-tab-status-text');
                const dotEl = existingItem.querySelector('.qmx-tab-status-dot');

                if (tabData.nickname && nicknameEl.textContent !==
                    tabData.nickname) {
                    nicknameEl.textContent = tabData.nickname;
                }

                const newStatusName = `[${statusDisplayMap[tabData.status] ||
                tabData.status}]`;
                if (statusNameEl.textContent !== newStatusName) {
                    statusNameEl.textContent = newStatusName;
                    dotEl.style.backgroundColor = `var(--status-color-${tabData.status.toLowerCase()}, #9E9E9E)`;
                }
                if (statusTextEl.textContent !== currentStatusText) {
                    statusTextEl.textContent = currentStatusText;
                }
            } else {
                // --- B. 如果条目不存在，则创建并添加 (CREATE path) ---
                //Utils.log(`[Render] 房间 ${roomId}: UI条目不存在，执行创建！状态: ${tabData.status}, 文本: "${currentStatusText}"`); // 新增日志
                const newItem = this.createTaskItem(roomId, tabData,
                    statusDisplayMap,
                    currentStatusText);
                tabList.appendChild(newItem);
                requestAnimationFrame(() => {
                    newItem.classList.add('qmx-item-enter-active');
                    setTimeout(() => newItem.classList.remove('qmx-item-enter'),
                        300);
                });
            }
        });

        // --- 处理删除 (DELETE path) ---
        existingRoomIds.forEach(roomId => {
            if (!state.tabs[roomId]) {
                const itemToRemove = tabList.querySelector(
                    `[data-room-id="${roomId}"]`);
                if (itemToRemove &&
                    !itemToRemove.classList.contains('qmx-item-exit-active')) {
                    Utils.log(
                        `[Render] 房间 ${roomId}: 在最新状态中已消失，执行移除。`); // 新增日志
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
        if (limitState?.reached &&
            Utils.formatDateAsBeijing(new Date(limitState.timestamp)) !==
            Utils.formatDateAsBeijing(new Date())) {
            Utils.log('[控制中心] 新的一天，重置每日上限旗标。');
            GlobalState.setDailyLimit(false);
            limitState = null; // 重置后立即生效
        }

        if (limitState?.reached) {
            if (!limitMessageEl) {
                limitMessageEl = document.createElement('div');
                limitMessageEl.id = 'qmx-limit-message';
                limitMessageEl.style.cssText = 'padding: 10px 24px; background-color: var(--status-color-error); color: white; font-weight: 500; text-align: center;';
                const header = document.querySelector('.qmx-modal-header');
                header.parentNode.insertBefore(limitMessageEl,
                    header.nextSibling); // 确保在标题下方插入
                document.querySelector('.qmx-modal-header').
                    after(limitMessageEl);
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
            const openedRoomIds = new Set(Object.keys(state.tabs));
            const apiRoomUrls = await DouyuAPI.getRooms(
                SETTINGS.API_ROOM_FETCH_COUNT);
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
                // 保证使用旧版UI
                if (window.location.href.includes('/beta') ||
                    localStorage.getItem('newWebLive') !== 'A') {
                    // --- 找到了“/beta”，说明是新版UI ---
                    localStorage.setItem('newWebLive', 'A');
                }
                GM_openInTab(newUrl, {active: false, setParent: true});
                Utils.log(`打开指令已发送: ${newUrl}`);
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
                    ratioY: Math.max(0, Math.min(1, savedPos.y / movableHeight))
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
            document.addEventListener('mouseup', onMouseUp, {once: true});
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
                document.getElementById('qmx-modal-backdrop').
                    classList.
                    add('visible');
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
                document.getElementById('qmx-modal-backdrop').
                    classList.
                    remove('visible');
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
            const waitForTarget = (
                retries = SETTINGS.INJECT_TARGET_RETRIES,
                interval = SETTINGS.INJECT_TARGET_INTERVAL) => {
                const target = document.querySelector(
                    SETTINGS.SELECTORS.rankListContainer);
                if (target) {
                    Utils.log('注入目标已找到，开始注入...');
                    this.injectionTarget = target;
                    this.isPanelInjected = true;
                    target.parentNode.insertBefore(modalContainer,
                        target.nextSibling);
                    modalContainer.classList.add('mode-inject-rank-list',
                        'qmx-hidden');
                } else if (retries > 0) {
                    setTimeout(() => waitForTarget(retries - 1, interval),
                        interval);
                } else {
                    Utils.log(
                        `[注入失败] 未找到目标元素 "${SETTINGS.SELECTORS.rankListContainer}"。`);
                    Utils.log('[降级] 自动切换到 \'floating\' 备用模式。');
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

    /**
     * 校正悬浮按钮位置，确保在屏幕可见区域
     */
    correctButtonPosition() {
        const mainButton = document.getElementById(SETTINGS.DRAGGABLE_BUTTON_ID);
        const storageKey = SETTINGS.BUTTON_POS_STORAGE_KEY;
        if (!mainButton) return;

        const savedPos = GM_getValue(storageKey);
        if (savedPos && typeof savedPos.ratioX === "number" && typeof savedPos.ratioY === "number") {
            const newX = savedPos.ratioX * (window.innerWidth - mainButton.offsetWidth);
            const newY = savedPos.ratioY * (window.innerHeight - mainButton.offsetHeight);
            
            mainButton.style.setProperty('--tx', `${newX}px`);
            mainButton.style.setProperty('--ty', `${newY}px`);
        }
    },  

};

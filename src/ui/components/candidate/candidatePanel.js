/**
 * @file candidatePanel.js
 * @description 主候选项弹窗组件
 */

import { 
    createCandidateItemList, 
    updateCandidateListActiveState, 
    createEmptyStateItem, 
    createLoadingStateItem,
    createAddCandidateItem 
} from './candidateItem.js';

/**
 * 创建候选项面板容器
 * @returns {HTMLElement} - 面板容器元素
 */
export function createCandidatePanel() {
    const panel = document.createElement('div');
    panel.className = 'qmx-candidate-panel-root';
    panel.innerHTML = `
        <div class="qmx-candidate-panel-header">
            <div class="qmx-candidate-panel-title">
                <svg viewBox="0 0 24 24" width="16" height="16" class="qmx-candidate-panel-icon">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span>选择候选项</span>
            </div>
            <div class="qmx-candidate-panel-controls">
                <button class="qmx-candidate-panel-help-btn" data-action="help" title="键盘导航：← → 或 Tab/Shift+Tab 切换，Enter 选择，Esc 关闭">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                    </svg>
                </button>
                <button class="qmx-candidate-panel-close-btn" data-action="close" title="关闭面板">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        </div>
        <div class="qmx-candidate-panel-content">
            <div class="qmx-candidate-panel-list" role="listbox" aria-label="候选项列表">
                <!-- 候选项将动态插入这里 -->
            </div>
        </div>
        <div class="qmx-candidate-panel-footer">
            <div class="qmx-candidate-panel-tips">
                <span class="qmx-candidate-panel-tip-item">
                    <kbd>←</kbd><kbd>→</kbd> 切换
                </span>
                <span class="qmx-candidate-panel-tip-item">
                    <kbd>Enter</kbd> 选择
                </span>
                <span class="qmx-candidate-panel-tip-item">
                    <kbd>Esc</kbd> 关闭
                </span>
            </div>
        </div>
    `;

    return panel;
}

/**
 * 渲染候选项面板内容
 * @param {HTMLElement} panel - 面板元素
 * @param {CandidateItem[]} candidates - 候选项列表
 * @param {number} activeIndex - 当前活动索引
 * @param {Object} options - 渲染选项
 * @param {string} options.filterText - 过滤文本
 * @param {boolean} options.showAddOption - 是否显示添加选项
 * @param {Object} callbacks - 事件回调
 */
export function renderCandidatePanel(panel, candidates, activeIndex = 0, options = {}, callbacks = {}) {
    const {
        filterText = '',
        showAddOption = true
    } = options;
    
    const {
        onCandidateSelect = () => {},
        onCandidateHover = () => {},
        onAddCandidate = () => {}
    } = callbacks;

    const listContainer = panel.querySelector('.qmx-candidate-panel-list');
    
    // 清空现有内容
    listContainer.innerHTML = '';

    if (candidates.length === 0) {
        // 显示空状态
        const emptyMessage = filterText ? 
            `没有找到包含 "${filterText}" 的候选项` : 
            '暂无候选项，输入内容后将自动创建';
        const emptyEl = createEmptyStateItem(emptyMessage);
        listContainer.appendChild(emptyEl);

        // 如果有过滤文本且允许添加，显示添加选项
        if (filterText && showAddOption && filterText.trim().length > 0) {
            const addEl = createAddCandidateItem(filterText.trim(), onAddCandidate);
            listContainer.appendChild(addEl);
        }
    } else {
        // 创建候选项列表
        const itemElements = createCandidateItemList(candidates, activeIndex, {
            onSelect: onCandidateSelect,
            onHover: onCandidateHover
        });

        // 添加到容器
        itemElements.forEach(itemEl => {
            listContainer.appendChild(itemEl);
        });

        // 如果有过滤文本但没有完全匹配的项，显示添加选项
        if (filterText && showAddOption && filterText.trim().length > 0) {
            const exactMatch = candidates.some(c => c.text.toLowerCase() === filterText.toLowerCase().trim());
            if (!exactMatch) {
                const addEl = createAddCandidateItem(filterText.trim(), onAddCandidate);
                listContainer.appendChild(addEl);
            }
        }
    }
}

/**
 * 显示候选项面板
 * @param {HTMLElement} panel - 面板元素
 * @param {Object} position - 显示位置 {x, y}
 * @param {HTMLElement} referenceElement - 参考元素（用于定位）
 */
export function showCandidatePanel(panel, position = null, referenceElement = null) {
    // 设置位置
    if (position) {
        panel.style.left = position.x + 'px';
        panel.style.top = position.y + 'px';
    } else if (referenceElement) {
        const calculatedPosition = calculatePanelPosition(referenceElement, panel);
        panel.style.left = calculatedPosition.x + 'px';
        panel.style.top = calculatedPosition.y + 'px';
    }

    // 显示面板
    panel.classList.add('visible');
    panel.setAttribute('aria-hidden', 'false');

    // 设置焦点到面板以支持键盘导航
    panel.setAttribute('tabindex', '-1');
    panel.focus();
}

/**
 * 隐藏候选项面板
 * @param {HTMLElement} panel - 面板元素
 */
export function hideCandidatePanel(panel) {
    panel.classList.remove('visible');
    panel.setAttribute('aria-hidden', 'true');
    panel.removeAttribute('tabindex');
}

/**
 * 更新面板活动状态
 * @param {HTMLElement} panel - 面板元素
 * @param {number} activeIndex - 新的活动索引
 */
export function updatePanelActiveState(panel, activeIndex) {
    const itemElements = panel.querySelectorAll('.qmx-candidate-item');
    updateCandidateListActiveState([...itemElements], activeIndex);
}

/**
 * 绑定面板事件
 * @param {HTMLElement} panel - 面板元素
 * @param {Object} callbacks - 事件回调
 * @param {Function} callbacks.onClose - 关闭回调
 * @param {Function} callbacks.onHelp - 帮助回调
 */
export function bindPanelEvents(panel, callbacks = {}) {
    const {
        onClose = () => {},
        onHelp = () => {}
    } = callbacks;

    // 处理面板头部按钮点击
    panel.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();

        const action = button.dataset.action;
        switch (action) {
            case 'close':
                onClose();
                break;
            case 'help':
                onHelp();
                break;
        }
    });

    // 阻止面板内部点击事件冒泡
    panel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 处理焦点丢失
    panel.addEventListener('blur', (e) => {
        // 如果焦点移动到面板外部，延迟关闭面板
        setTimeout(() => {
            if (!panel.contains(document.activeElement)) {
                onClose();
            }
        }, 150);
    });
}

/**
 * 计算面板最佳显示位置
 * @param {HTMLElement} referenceElement - 参考元素
 * @param {HTMLElement} panel - 面板元素
 * @returns {Object} - 位置坐标 {x, y}
 */
export function calculatePanelPosition(referenceElement, panel) {
    const refRect = referenceElement.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = refRect.left;
    let y = refRect.bottom + 8; // 8px 间距

    // 检查右侧边界
    if (x + panelRect.width > viewportWidth - 16) {
        x = viewportWidth - panelRect.width - 16;
    }

    // 检查左侧边界
    if (x < 16) {
        x = 16;
    }

    // 检查底部边界，如果超出则显示在参考元素上方
    if (y + panelRect.height > viewportHeight - 16) {
        y = refRect.top - panelRect.height - 8;
    }

    // 检查顶部边界
    if (y < 16) {
        y = 16;
    }

    return { x, y };
}

/**
 * 设置面板加载状态
 * @param {HTMLElement} panel - 面板元素
 * @param {boolean} isLoading - 是否正在加载
 */
export function setPanelLoadingState(panel, isLoading) {
    const listContainer = panel.querySelector('.qmx-candidate-panel-list');
    
    if (isLoading) {
        listContainer.innerHTML = '';
        const loadingEl = createLoadingStateItem();
        listContainer.appendChild(loadingEl);
        panel.classList.add('loading');
    } else {
        panel.classList.remove('loading');
    }
}

/**
 * 获取面板当前显示状态
 * @param {HTMLElement} panel - 面板元素
 * @returns {boolean} - 是否正在显示
 */
export function isPanelVisible(panel) {
    return panel.classList.contains('visible');
}

/**
 * 滚动到指定候选项
 * @param {HTMLElement} panel - 面板元素
 * @param {number} index - 候选项索引
 */
export function scrollToCandidate(panel, index) {
    const items = panel.querySelectorAll('.qmx-candidate-item');
    if (items[index]) {
        items[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    }
}
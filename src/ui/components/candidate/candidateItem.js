/**
 * @file candidateItem.js
 * @description 单个候选项条目组件
 */

/**
 * 创建候选项元素
 * @param {CandidateItem} candidate - 候选项数据
 * @param {boolean} isActive - 是否为当前活动项
 * @param {number} index - 在列表中的索引
 * @returns {HTMLElement} - 候选项DOM元素
 */
export function createCandidateItem(candidate, isActive = false, index = 0) {
    const itemEl = document.createElement('div');
    itemEl.className = `qmx-candidate-item ${isActive ? 'active' : ''}`;
    itemEl.dataset.candidateId = candidate.id;
    itemEl.dataset.index = index;
    
    // 创建内容结构
    itemEl.innerHTML = `
        <div class="qmx-candidate-content">
            <div class="qmx-candidate-text">${escapeHtml(candidate.text)}</div>
            <div class="qmx-candidate-meta">
                <span class="qmx-candidate-category">${escapeHtml(candidate.category)}</span>
                ${candidate.useCount > 0 ? `<span class="qmx-candidate-use-count">使用${candidate.useCount}次</span>` : ''}
            </div>
        </div>
        <div class="qmx-candidate-actions">
            <button class="qmx-candidate-select-btn" data-action="select" title="选择这个候选项">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
            </button>
        </div>
    `;

    return itemEl;
}

/**
 * 更新候选项元素的活动状态
 * @param {HTMLElement} itemEl - 候选项元素
 * @param {boolean} isActive - 是否为活动状态
 */
export function updateCandidateItemActiveState(itemEl, isActive) {
    if (isActive) {
        itemEl.classList.add('active');
        // 滚动到视图中（如果需要）
        itemEl.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    } else {
        itemEl.classList.remove('active');
    }
}

/**
 * 绑定候选项元素的事件
 * @param {HTMLElement} itemEl - 候选项元素
 * @param {CandidateItem} candidate - 候选项数据
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onSelect - 选择回调
 * @param {Function} callbacks.onHover - 悬停回调
 * @param {Function} callbacks.onRemove - 删除回调
 */
export function bindCandidateItemEvents(itemEl, candidate, callbacks = {}) {
    const {
        onSelect = () => {},
        onHover = () => {},
        onRemove = () => {}
    } = callbacks;

    // 鼠标悬停高亮
    itemEl.addEventListener('mouseenter', (e) => {
        const index = parseInt(itemEl.dataset.index);
        onHover(index, candidate, itemEl);
    });

    // 点击选择
    itemEl.addEventListener('click', (e) => {
        // 检查是否点击了特定按钮
        const action = e.target.closest('[data-action]')?.dataset.action;
        
        if (action === 'select' || !action) {
            e.preventDefault();
            e.stopPropagation();
            onSelect(candidate, itemEl);
        }
    });

    // 双击快速选择
    itemEl.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(candidate, itemEl);
    });

    // 阻止右键菜单（可选）
    itemEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // 这里可以显示自定义菜单
    });
}

/**
 * 创建空状态提示元素
 * @param {string} message - 提示消息
 * @returns {HTMLElement} - 空状态元素
 */
export function createEmptyStateItem(message = '暂无候选项') {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'qmx-candidate-empty-state';
    emptyEl.innerHTML = `
        <div class="qmx-candidate-empty-icon">
            <svg viewBox="0 0 24 24" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" opacity="0.3"/>
            </svg>
        </div>
        <div class="qmx-candidate-empty-text">${escapeHtml(message)}</div>
    `;
    return emptyEl;
}

/**
 * 创建加载状态提示元素
 * @returns {HTMLElement} - 加载状态元素
 */
export function createLoadingStateItem() {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'qmx-candidate-loading-state';
    loadingEl.innerHTML = `
        <div class="qmx-candidate-loading-spinner">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" 
                        stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
            </svg>
        </div>
        <div class="qmx-candidate-loading-text">正在加载候选项...</div>
    `;
    return loadingEl;
}

/**
 * 创建候选项添加按钮
 * @param {string} text - 按钮显示的文本
 * @param {Function} onAdd - 添加回调函数
 * @returns {HTMLElement} - 添加按钮元素
 */
export function createAddCandidateItem(text, onAdd = () => {}) {
    const addEl = document.createElement('div');
    addEl.className = 'qmx-candidate-add-item';
    addEl.innerHTML = `
        <div class="qmx-candidate-add-content">
            <div class="qmx-candidate-add-icon">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </div>
            <div class="qmx-candidate-add-text">添加 "${escapeHtml(text)}"</div>
        </div>
    `;

    addEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd(text);
    });

    return addEl;
}

/**
 * HTML 转义函数
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 批量创建候选项列表
 * @param {CandidateItem[]} candidates - 候选项列表
 * @param {number} activeIndex - 当前活动索引
 * @param {Object} callbacks - 事件回调
 * @returns {HTMLElement[]} - 候选项元素列表
 */
export function createCandidateItemList(candidates, activeIndex = 0, callbacks = {}) {
    return candidates.map((candidate, index) => {
        const itemEl = createCandidateItem(candidate, index === activeIndex, index);
        bindCandidateItemEvents(itemEl, candidate, callbacks);
        return itemEl;
    });
}

/**
 * 更新候选项列表的活动状态
 * @param {HTMLElement[]} itemElements - 候选项元素列表
 * @param {number} activeIndex - 新的活动索引
 */
export function updateCandidateListActiveState(itemElements, activeIndex) {
    itemElements.forEach((itemEl, index) => {
        updateCandidateItemActiveState(itemEl, index === activeIndex);
    });
}
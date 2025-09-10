/**
 * @file inputPreview.js
 * @description 输入框预览内容组件
 */

/**
 * 创建输入预览容器
 * @returns {HTMLElement} - 预览容器元素
 */
export function createInputPreviewContainer() {
    const container = document.createElement('div');
    container.className = 'qmx-input-preview-container';
    container.innerHTML = `
        <div class="qmx-input-preview-content">
            <div class="qmx-input-preview-text" role="textbox" aria-readonly="true"></div>
            <div class="qmx-input-preview-actions">
                <button class="qmx-input-preview-edit-btn" data-action="edit" title="编辑内容">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="qmx-input-preview-send-btn" data-action="send" title="发送内容">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    <span class="qmx-input-preview-send-text">发送</span>
                </button>
            </div>
        </div>
        <div class="qmx-input-preview-footer">
            <div class="qmx-input-preview-info">
                <span class="qmx-input-preview-char-count">0</span>
                <span class="qmx-input-preview-separator">·</span>
                <span class="qmx-input-preview-source">候选项</span>
            </div>
            <button class="qmx-input-preview-close-btn" data-action="close" title="关闭预览">
                <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;
    return container;
}

/**
 * 渲染输入预览内容
 * @param {HTMLElement} container - 预览容器
 * @param {string} previewText - 预览文本
 * @param {CandidateItem} selectedCandidate - 选中的候选项
 */
export function renderInputPreview(container, previewText, selectedCandidate = null) {
    const textEl = container.querySelector('.qmx-input-preview-text');
    const charCountEl = container.querySelector('.qmx-input-preview-char-count');
    const sourceEl = container.querySelector('.qmx-input-preview-source');
    
    if (textEl) {
        textEl.textContent = previewText;
        textEl.title = previewText; // 悬停显示完整内容
    }
    
    if (charCountEl) {
        charCountEl.textContent = previewText.length;
    }
    
    if (sourceEl && selectedCandidate) {
        sourceEl.textContent = selectedCandidate.category || '候选项';
    }
}

/**
 * 显示输入预览
 * @param {HTMLElement} container - 预览容器
 * @param {string} previewText - 预览文本
 * @param {CandidateItem} selectedCandidate - 选中的候选项
 * @param {Object} position - 显示位置
 */
export function showInputPreview(container, previewText, selectedCandidate = null, position = null) {
    renderInputPreview(container, previewText, selectedCandidate);
    
    container.classList.add('visible');
    
    if (position) {
        container.style.left = position.x + 'px';
        container.style.top = position.y + 'px';
    }
}

/**
 * 隐藏输入预览
 * @param {HTMLElement} container - 预览容器
 */
export function hideInputPreview(container) {
    container.classList.remove('visible');
}

/**
 * 绑定预览容器事件
 * @param {HTMLElement} container - 预览容器
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onSend - 发送回调
 * @param {Function} callbacks.onEdit - 编辑回调
 * @param {Function} callbacks.onClose - 关闭回调
 */
export function bindPreviewEvents(container, callbacks = {}) {
    const {
        onSend = () => {},
        onEdit = () => {},
        onClose = () => {}
    } = callbacks;

    // 事件委托处理所有按钮点击
    container.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();

        const action = button.dataset.action;
        const previewText = container.querySelector('.qmx-input-preview-text').textContent;

        switch (action) {
            case 'send':
                onSend(previewText);
                break;
            case 'edit':
                onEdit(previewText);
                break;
            case 'close':
                onClose();
                break;
        }
    });

    // 键盘快捷键支持
    container.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Enter':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const previewText = container.querySelector('.qmx-input-preview-text').textContent;
                    onSend(previewText);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    });
}

/**
 * 创建可编辑的预览组件
 * @param {string} initialText - 初始文本
 * @returns {HTMLElement} - 可编辑预览容器
 */
export function createEditablePreviewContainer(initialText = '') {
    const container = document.createElement('div');
    container.className = 'qmx-editable-preview-container';
    container.innerHTML = `
        <div class="qmx-editable-preview-header">
            <span class="qmx-editable-preview-title">编辑内容</span>
            <button class="qmx-editable-preview-close-btn" data-action="close" title="关闭编辑">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
        <div class="qmx-editable-preview-content">
            <textarea class="qmx-editable-preview-textarea" placeholder="请输入内容...">${escapeHtml(initialText)}</textarea>
        </div>
        <div class="qmx-editable-preview-footer">
            <div class="qmx-editable-preview-info">
                <span class="qmx-editable-preview-char-count">${initialText.length}</span> 字符
            </div>
            <div class="qmx-editable-preview-actions">
                <button class="qmx-editable-preview-cancel-btn" data-action="cancel">取消</button>
                <button class="qmx-editable-preview-confirm-btn" data-action="confirm">确认</button>
            </div>
        </div>
    `;
    
    // 绑定字符计数更新
    const textarea = container.querySelector('.qmx-editable-preview-textarea');
    const charCount = container.querySelector('.qmx-editable-preview-char-count');
    
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });
    
    // 自动聚焦和选中
    setTimeout(() => {
        textarea.focus();
        textarea.select();
    }, 100);
    
    return container;
}

/**
 * 绑定可编辑预览的事件
 * @param {HTMLElement} container - 可编辑预览容器
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onConfirm - 确认回调
 * @param {Function} callbacks.onCancel - 取消回调
 */
export function bindEditablePreviewEvents(container, callbacks = {}) {
    const {
        onConfirm = () => {},
        onCancel = () => {}
    } = callbacks;

    const textarea = container.querySelector('.qmx-editable-preview-textarea');

    container.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();

        const action = button.dataset.action;

        switch (action) {
            case 'confirm':
                onConfirm(textarea.value);
                break;
            case 'cancel':
            case 'close':
                onCancel();
                break;
        }
    });

    // 键盘快捷键
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            onConfirm(textarea.value);
        }
    });
}

/**
 * HTML转义函数
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 计算预览容器的最佳显示位置
 * @param {HTMLElement} inputElement - 输入框元素
 * @param {HTMLElement} container - 预览容器
 * @returns {Object} - 位置坐标 {x, y}
 */
export function calculatePreviewPosition(inputElement, container) {
    const inputRect = inputElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = inputRect.left;
    let y = inputRect.bottom + 8; // 8px间距

    // 检查右侧边界
    if (x + containerRect.width > viewportWidth - 16) {
        x = viewportWidth - containerRect.width - 16;
    }

    // 检查左侧边界
    if (x < 16) {
        x = 16;
    }

    // 检查底部边界，如果超出则显示在输入框上方
    if (y + containerRect.height > viewportHeight - 16) {
        y = inputRect.top - containerRect.height - 8;
    }

    // 检查顶部边界
    if (y < 16) {
        y = 16;
    }

    return { x, y };
}
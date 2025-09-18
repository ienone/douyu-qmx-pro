/**
 * =================================================================================
 * 斗鱼弹幕助手 - 工具提示组件
 * ---------------------------------------------------------------------------------
 * 负责全局工具提示的显示和管理
 * =================================================================================
 */

// 模块级变量，用于存储全局唯一的 tooltip 元素引用
let tooltipElement = null;

/**
 * 确保全局 tooltip 的 DOM 元素存在于页面上
 * @private
 */
function _ensureTooltipElement() {
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'dda-global-tooltip';
        tooltipElement.className = 'dda-tooltip';
        document.body.appendChild(tooltipElement);
    }
}

/**
 * 激活指定父元素内的工具提示功能
 * @param {HTMLElement} parentElement - 需要监听 tooltip 触发器的容器元素
 * @param {Object<string, string>} tooltipData - 键值对对象，key对应data-tooltip-key的值，value是要显示的文本
 */
export function activateToolTips(parentElement, tooltipData) {
    if (!parentElement || typeof tooltipData !== 'object') {
        console.warn('[ToolTip] 调用失败：必须提供 parentElement 和 tooltipData');
        return;
    }

    _ensureTooltipElement();

    // 在父元素上绑定 mouseover 事件委托
    parentElement.addEventListener('mouseover', (e) => {
        const trigger = e.target.closest('.dda-tooltip-trigger');
        if (!trigger) return;

        const key = trigger.dataset.tooltipKey;
        const text = tooltipData[key];

        // 如果找到了对应的文本内容
        if (text) {
            showTooltip(text, trigger);
        }
    });

    // 在父元素上绑定 mouseout 事件委托
    parentElement.addEventListener('mouseout', (e) => {
        const trigger = e.target.closest('.dda-tooltip-trigger');
        if (trigger) {
            hideTooltip();
        }
    });
}

/**
 * 显示工具提示
 * @param {string} text - 提示文本
 * @param {HTMLElement} trigger - 触发元素
 */
export function showTooltip(text, trigger) {
    _ensureTooltipElement();
    
    tooltipElement.textContent = text;

    // 计算定位
    const triggerRect = trigger.getBoundingClientRect();
    const left = triggerRect.left + triggerRect.width / 2;
    const top = triggerRect.top;

    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.transform = `translate(-50%, calc(-100% - 8px))`;

    // 显示提示
    tooltipElement.classList.add('dda-tooltip-visible');
}

/**
 * 隐藏工具提示
 */
export function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.classList.remove('dda-tooltip-visible');
    }
}

/**
 * 移除工具提示元素
 */
export function destroyTooltips() {
    if (tooltipElement && tooltipElement.parentNode) {
        tooltipElement.parentNode.removeChild(tooltipElement);
        tooltipElement = null;
    }
}

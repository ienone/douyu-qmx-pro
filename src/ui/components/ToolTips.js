/**
 * @file Tooltips.js
 * @description 负责全局工具提示的显示和管理(不含提示文本，那个在SettingsPanel.js中)
 */

// 模块级变量，用于存储全局唯一的 tooltip 元素引用。
let tooltipElement = null;

/**
 * 确保全局 tooltip 的 DOM 元素存在于页面上。
 * @private
 */
function _ensureTooltipElement() {
    // 检查模块级变量，而不是每次都查询 DOM
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'qmx-global-tooltip'; // ID 必须与 CSS 中的选择器匹配
        document.body.appendChild(tooltipElement);
    }
}

/**
 * 激活指定父元素内的工具提示功能。
 *
 * @param {HTMLElement} parentElement - 需要监听 tooltip 触发器的容器元素。
 * @param {Object<string, string>} tooltipData - 一个键值对对象，key 对应 `data-tooltip-key` 的值，value 是要显示的文本。
 */
export function activateToolTips(parentElement, tooltipData) {
    // 参数校验，确保调用正确
    if (!parentElement || typeof tooltipData !== 'object') {
        console.warn('[Tooltip] 调用失败：必须提供 parentElement 和 tooltipData。');
        return;
    }

    _ensureTooltipElement();

    // 在父元素上绑定 mouseover 事件委托
    parentElement.addEventListener('mouseover', (e) => {
        const trigger = e.target.closest('.qmx-tooltip-icon');
        // 如果鼠标没有悬停在指定的触发器上，则不做任何事
        if (!trigger) return;

        const key = trigger.dataset.tooltipKey;
        const text = tooltipData[key];

        // 如果找到了对应的文本内容
        if (text) {
            tooltipElement.textContent = text;

            // --- 定位逻辑 ---
            const triggerRect = trigger.getBoundingClientRect();

            // 计算定位，使其在触发器正上方居中
            const left = triggerRect.left + triggerRect.width / 2;
            const top = triggerRect.top;

            tooltipElement.style.left = `${left}px`;
            tooltipElement.style.top = `${top}px`;
            // 使用 transform 将其向上移动自身高度外加 8px 间距，并水平居中
            tooltipElement.style.transform = `translate(-50%, calc(-100% - 8px))`;

            // 添加 .visible 类来触发 CSS 中的显示动画
            tooltipElement.classList.add('visible');
        }
    });

    // 在父元素上绑定 mouseout 事件委托
    parentElement.addEventListener('mouseout', (e) => {
        const trigger = e.target.closest('.qmx-tooltip-icon');
        // 如果鼠标移出了触发器
        if (trigger) {
            // 移除 .visible 类来触发 CSS 中的隐藏动画
            tooltipElement.classList.remove('visible');
        }
    });
}

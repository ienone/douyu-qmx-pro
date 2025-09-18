/**
 * =================================================================================
 * 斗鱼弹幕助手 - 单个候选项组件
 * ---------------------------------------------------------------------------------
 * 创建和管理单个候选项DOM元素
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';

/**
 * 候选项组件
 */
export const CandidateItem = {
    
    /**
     * 创建单个候选项元素
     * @param {Object} candidate - 候选项数据
     * @param {number} index - 候选项索引
     * @param {boolean} isActive - 是否为活跃状态
     * @returns {HTMLElement} 候选项DOM元素
     */
    createCandidateItem(candidate, index, isActive = false) {
        const item = document.createElement('div');
        item.className = SETTINGS.CSS_CLASSES.POPUP_ITEM;
        item.dataset.index = index;
        
        if (isActive) {
            item.classList.add(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
        }
        
        // 创建文本内容
        const textElement = document.createElement('div');
        textElement.className = SETTINGS.CSS_CLASSES.POPUP_ITEM_TEXT;
        textElement.textContent = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
        
        // 添加元数据（可选）
        if (candidate.useCount > 0) {
            textElement.title = `使用次数: ${candidate.useCount}`;
        }
        
        item.appendChild(textElement);
        
        // 绑定事件
        this.bindItemEvents(item, candidate, index);
        
        return item;
    },
    
    /**
     * 绑定候选项事件
     * @param {HTMLElement} itemEl - 候选项DOM元素
     * @param {Object} candidate - 候选项数据
     * @param {number} index - 候选项索引
     */
    bindItemEvents(itemEl, candidate, index) {
        // 鼠标点击选择
        this.bindItemClick(itemEl, candidate, index);
        
        // 鼠标悬停高亮
        this.bindItemHover(itemEl, index);
    },
    
    /**
     * 绑定鼠标点击事件
     * @param {HTMLElement} itemEl - 候选项DOM元素
     * @param {Object} candidate - 候选项数据
     * @param {number} index - 候选项索引
     */
    bindItemClick(itemEl, candidate, index) {
        itemEl.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // 触发选择事件
            this._emitSelectEvent(candidate, index, 'click');
        });
    },
    
    /**
     * 绑定鼠标悬停事件
     * @param {HTMLElement} itemEl - 候选项DOM元素
     * @param {number} index - 候选项索引
     */
    bindItemHover(itemEl, index) {
        let previewTimer = null;
        
        itemEl.addEventListener('mouseenter', () => {
            // 触发鼠标悬停高亮事件
            this._emitHoverEvent(index);
            
            // 延迟显示悬浮预览
            previewTimer = setTimeout(() => {
                this._showPreview(itemEl);
            }, SETTINGS.capsule?.preview?.showDelay || 500);
        });
        
        itemEl.addEventListener('mouseleave', () => {
            // 清除预览定时器
            if (previewTimer) {
                clearTimeout(previewTimer);
                previewTimer = null;
            }
            
            // 隐藏悬浮预览
            this._hidePreview();
        });
    },
    
    /**
     * 更新候选项活跃状态
     * @param {HTMLElement} itemEl - 候选项DOM元素
     * @param {boolean} isActive - 是否为活跃状态
     */
    updateActiveState(itemEl, isActive) {
        if (isActive) {
            itemEl.classList.add(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
        } else {
            itemEl.classList.remove(SETTINGS.CSS_CLASSES.POPUP_ITEM_ACTIVE);
        }
    },
    
    /**
     * 批量更新候选项列表的活跃状态
     * @param {HTMLElement} container - 容器元素
     * @param {number} activeIndex - 活跃索引
     */
    updateActiveStates(container, activeIndex) {
        const items = container.querySelectorAll(`.${SETTINGS.CSS_CLASSES.POPUP_ITEM}`);
        
        items.forEach((item, index) => {
            this.updateActiveState(item, index === activeIndex);
        });
    },
    
    /**
     * 触发选择事件
     * @param {Object} candidate - 候选项数据
     * @param {number} index - 候选项索引
     * @param {string} trigger - 触发方式
     * @private
     */
    _emitSelectEvent(candidate, index, trigger) {
        const event = new CustomEvent('candidateSelected', {
            detail: { candidate, index, trigger }
        });
        document.dispatchEvent(event);
    },
    
    /**
     * 触发悬停事件
     * @param {number} index - 候选项索引
     * @private
     */
    _emitHoverEvent(index) {
        const event = new CustomEvent('candidateHovered', {
            detail: { index }
        });
        document.dispatchEvent(event);
    },
    
    /**
     * 显示悬浮预览
     * @param {HTMLElement} itemEl - 候选项DOM元素
     * @private
     */
    _showPreview(itemEl) {
        // 实现悬浮预览显示逻辑
        const previewElement = document.createElement('div');
        previewElement.className = SETTINGS.CSS_CLASSES.PREVIEW_POPUP;
        previewElement.textContent = itemEl.textContent; // 示例：显示相同内容
        
        document.body.appendChild(previewElement);
        
        // 计算并设置预览位置 - 优先显示在上方
        const itemRect = itemEl.getBoundingClientRect();
        const previewWidth = 200;
        const previewHeight = 100;
        const verticalOffset = SETTINGS.capsule?.preview?.verticalOffset || 8;
        
        let left = itemRect.left + window.scrollX;
        let top = itemRect.top + window.scrollY - previewHeight - verticalOffset; // 默认显示在上方
        
        // 边界检测
        const rightEdge = left + previewWidth;
        
        if (rightEdge > window.innerWidth) {
            left = window.innerWidth - previewWidth - 10;
        }
        
        // 如果上方空间不足，显示在下方
        if (top < window.scrollY) {
            top = itemRect.bottom + window.scrollY + verticalOffset;
        }
        
        previewElement.style.left = `${left}px`;
        previewElement.style.top = `${top}px`;
        
        // 可选：添加动画效果
        previewElement.classList.add('fade-in');
    },
    
    /**
     * 隐藏悬浮预览
     * @private
     */
    _hidePreview() {
        const previewElement = document.querySelector(`.${SETTINGS.CSS_CLASSES.PREVIEW_POPUP}`);
        if (previewElement) {
            // 可选：添加动画效果
            previewElement.classList.add('fade-out');
            
            // 动画结束后移除元素
            previewElement.addEventListener('animationend', () => {
                previewElement.remove();
            }, { once: true });
        }
    },
    
    /**
     * 获取候选项的预期高度
     * @returns {number} 高度像素值
     */
    getItemHeight() {
        return SETTINGS.ITEM_HEIGHT;
    }
};
/**
 * =================================================================================
 * 斗鱼弹幕助手 - 主候选项弹窗组件
 * ---------------------------------------------------------------------------------
 * 渲染和管理候选项弹窗，支持高亮、导航和动画
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';
import { CandidateItem } from './candidateItem.js';

/**
 * 候选项弹窗组件
 */
export const CandidatePanel = {
    
    // 弹窗DOM元素
    panelElement: null,
    
    // 内容容器
    contentElement: null,
    
    // 当前候选项列表
    currentCandidates: [],
    
    // 当前活跃索引
    currentActiveIndex: -1,
    
    // 显示/隐藏定时器
    showTimer: null,
    hideTimer: null,
    
    /**
     * 初始化弹窗组件
     */
    init() {
        this.createPanelDOM();
        this.bindPanelEvents();
        console.log('CandidatePanel initialized');
    },
    
    /**
     * 创建弹窗DOM结构
     */
    createPanelDOM() {
        // 创建主弹窗容器
        this.panelElement = document.createElement('div');
        this.panelElement.className = SETTINGS.CSS_CLASSES.POPUP;
        this.panelElement.style.display = 'none';
        
        // 添加调试信息
        console.log('创建弹窗元素:', this.panelElement);
        console.log('弹窗CSS类名:', SETTINGS.CSS_CLASSES.POPUP);
        
        // 创建内容容器
        this.contentElement = document.createElement('div');
        this.contentElement.className = SETTINGS.CSS_CLASSES.POPUP_CONTENT;
        
        this.panelElement.appendChild(this.contentElement);
        
        // 添加到页面
        document.body.appendChild(this.panelElement);
        
        // 验证元素是否成功添加
        const addedElement = document.querySelector(`.${SETTINGS.CSS_CLASSES.POPUP}`);
        console.log('弹窗是否成功添加到DOM:', !!addedElement);
        console.log('添加的弹窗元素:', addedElement);
    },
    
    /**
     * 渲染候选项弹窗
     * @param {Array} candidates - 候选项列表
     * @param {number} activeIndex - 活跃索引
     */
    renderCandidatePanel(candidates, activeIndex = 0) {
        this.currentCandidates = candidates || [];
        this.currentActiveIndex = activeIndex;
        
        // 清空内容
        this.contentElement.innerHTML = '';
        
        if (this.currentCandidates.length === 0) {
            this._renderEmptyState();
            return;
        }
        
        // 渲染候选项
        this.currentCandidates.forEach((candidate, index) => {
            const isActive = index === activeIndex;
            const itemElement = CandidateItem.createCandidateItem(candidate, index, isActive);
            this.contentElement.appendChild(itemElement);
        });
        
        // 设置最大高度
        this._updatePanelHeight();
    },
    
    /**
     * 显示弹窗
     * @param {HTMLElement} targetInput - 目标输入框元素
     */
    showPanel(targetInput) {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        this.showTimer = setTimeout(() => {
            this._positionPanel(targetInput);
            this.panelElement.style.display = 'block';
            
            // 强制重绘后添加显示类
            requestAnimationFrame(() => {
                this.panelElement.classList.add(SETTINGS.CSS_CLASSES.POPUP_SHOW);
            });
            
            this._emitPanelEvent('panelShown');
        }, SETTINGS.POPUP_SHOW_DELAY);
    },
    
    /**
     * 隐藏弹窗
     */
    hidePanel() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        this.hideTimer = setTimeout(() => {
            this.panelElement.classList.remove(SETTINGS.CSS_CLASSES.POPUP_SHOW);
            
            // 等待动画完成后隐藏
            setTimeout(() => {
                this.panelElement.style.display = 'none';
            }, SETTINGS.ANIMATION_DURATION);
            
            this._emitPanelEvent('panelHidden');
        }, SETTINGS.POPUP_HIDE_DELAY);
    },
    
    /**
     * 更新活跃项
     * @param {number} newActiveIndex - 新的活跃索引
     */
    setActiveIndex(newActiveIndex) {
        if (newActiveIndex === this.currentActiveIndex) return;
        
        this.currentActiveIndex = newActiveIndex;
        CandidateItem.updateActiveStates(this.contentElement, newActiveIndex);
        
        this._emitPanelEvent('activeIndexChanged', {
            activeIndex: newActiveIndex,
            candidate: this.currentCandidates[newActiveIndex] || null
        });
    },
    
    /**
     * 获取当前活跃的候选项
     * @returns {Object|null} 活跃的候选项
     */
    getActiveCandidate() {
        if (this.currentActiveIndex >= 0 && this.currentActiveIndex < this.currentCandidates.length) {
            return this.currentCandidates[this.currentActiveIndex];
        }
        return null;
    },
    
    /**
     * 检查弹窗是否可见
     * @returns {boolean} 是否可见
     */
    isVisible() {
        return this.panelElement.style.display !== 'none' && 
               this.panelElement.classList.contains(SETTINGS.CSS_CLASSES.POPUP_SHOW);
    },
    
    /**
     * 绑定弹窗事件
     */
    bindPanelEvents() {
        // 绑定候选项选择事件
        document.addEventListener('candidateSelected', (event) => {
            const { candidate, index } = event.detail;
            this._handleCandidateSelected(candidate, index);
        });
        
        // 绑定候选项悬停事件
        document.addEventListener('candidateHovered', (event) => {
            const { index } = event.detail;
            this.setActiveIndex(index);
        });
        
        // 防止弹窗内部点击事件冒泡
        this.panelElement.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    },
    
    /**
     * 渲染空状态
     * @private
     */
    _renderEmptyState() {
        // 清空内容容器
        this.contentElement.innerHTML = '';
        
        // 添加空状态类到面板
        this.panelElement.classList.add(SETTINGS.CSS_CLASSES.POPUP_EMPTY);
        
        const emptyElement = document.createElement('div');
        emptyElement.className = SETTINGS.CSS_CLASSES.EMPTY_MESSAGE;
        emptyElement.textContent = '暂无匹配的弹幕模板';
        
        this.contentElement.appendChild(emptyElement);
        
        // 确保面板高度适配空状态
        this.contentElement.style.maxHeight = '60px';
    },
    
    /**
     * 定位弹窗位置
     * @param {HTMLElement} targetInput - 目标输入框
     * @private
     */
    _positionPanel(targetInput) {
        if (!targetInput) return;
        
        const inputRect = targetInput.getBoundingClientRect();
        const panelRect = this.panelElement.getBoundingClientRect();
        
        // 计算位置
        let left = inputRect.left;
        let top = inputRect.bottom + 5; // 输入框下方5px
        
        // 边界检查
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 水平边界检查
        if (left + panelRect.width > windowWidth - 20) {
            left = windowWidth - panelRect.width - 20;
        }
        if (left < 20) {
            left = 20;
        }
        
        // 垂直边界检查
        if (top + panelRect.height > windowHeight - 20) {
            top = inputRect.top - panelRect.height - 5; // 输入框上方
        }
        
        // 应用位置
        this.panelElement.style.left = `${left}px`;
        this.panelElement.style.top = `${top}px`;
    },
    
    /**
     * 更新弹窗高度
     * @private
     */
    _updatePanelHeight() {
        const itemCount = this.currentCandidates.length;
        const itemHeight = CandidateItem.getItemHeight();
        const maxHeight = SETTINGS.MAX_POPUP_HEIGHT;
        
        let height = Math.min(itemCount * itemHeight, maxHeight);
        this.contentElement.style.maxHeight = `${height}px`;
        
        // 移除空状态类
        this.panelElement.classList.remove(SETTINGS.CSS_CLASSES.POPUP_EMPTY);
    },
    
    /**
     * 处理候选项选择
     * @param {Object} candidate - 选中的候选项
     * @param {number} index - 候选项索引
     * @private
     */
    _handleCandidateSelected(candidate, index) {
        this._emitPanelEvent('candidateSelected', { candidate, index });
    },
    
    /**
     * 触发弹窗事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     * @private
     */
    _emitPanelEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    },
    
    /**
     * 销毁弹窗
     */
    destroy() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        
        if (this.panelElement && this.panelElement.parentNode) {
            this.panelElement.parentNode.removeChild(this.panelElement);
        }
        
        this.panelElement = null;
        this.contentElement = null;
        this.currentCandidates = [];
        this.currentActiveIndex = -1;
    }
};
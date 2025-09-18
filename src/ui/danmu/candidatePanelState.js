/**
 * =================================================================================
 * 斗鱼弹幕助手 - 候选项弹窗状态管理
 * ---------------------------------------------------------------------------------
 * 管理弹窗状态、键盘事件处理和选择逻辑
 * =================================================================================
 */

import { PanelState, SelectionMode } from './candidateType.js';

/**
 * 候选项弹窗状态管理器
 */
export const CandidatePanelState = {
    
    // 当前状态
    currentState: PanelState.HIDDEN,
    
    // 候选项列表
    candidates: [],
    
    // 当前活跃索引
    activeIndex: 0,
    
    // 选择模式
    selectionMode: SelectionMode.KEYBOARD,
    
    // 弹窗元素引用
    panelElement: null,
    
    // 目标输入框引用
    targetInput: null,
    
    // 事件监听器
    listeners: new Map(),
    
    /**
     * 获取当前弹窗状态
     * @returns {Object} 状态对象
     */
    getPanelState() {
        return {
            state: this.currentState,
            activeIndex: this.activeIndex,
            candidateCount: this.candidates.length,
            isVisible: this.currentState === PanelState.VISIBLE,
            hasSelection: this.activeIndex >= 0 && this.activeIndex < this.candidates.length
        };
    },
    
    /**
     * 设置候选项列表
     * @param {Array} candidates - 候选项列表
     */
    setCandidates(candidates) {
        this.candidates = candidates || [];
        this.activeIndex = this.candidates.length > 0 ? 0 : -1;
    },
    
    /**
     * 向左导航（上一个候选项）
     */
    navigateLeft() {
        if (this.candidates.length === 0) return;
        
        this.activeIndex = this.activeIndex > 0 
            ? this.activeIndex - 1 
            : this.candidates.length - 1;
            
        this.selectionMode = SelectionMode.KEYBOARD;
        this._updateActiveItem();
        this._emitNavigationEvent('left');
    },
    
    /**
     * 向右导航（下一个候选项）
     */
    navigateRight() {
        if (this.candidates.length === 0) return;
        
        this.activeIndex = this.activeIndex < this.candidates.length - 1 
            ? this.activeIndex + 1 
            : 0;
            
        this.selectionMode = SelectionMode.KEYBOARD;
        this._updateActiveItem();
        this._emitNavigationEvent('right');
    },
    
    /**
     * 向上导航（上一个候选项）
     */
    navigateUp() {
        this.navigateLeft();
        this._emitNavigationEvent('up');
    },
    
    /**
     * 向下导航（下一个候选项）
     */
    navigateDown() {
        this.navigateRight();
        this._emitNavigationEvent('down');
    },
    
    /**
     * 选择当前高亮的候选项
     * @returns {Object|null} 选中的候选项
     */
    selectActiveCandidate() {
        if (this.activeIndex >= 0 && this.activeIndex < this.candidates.length) {
            const selected = this.candidates[this.activeIndex];
            // 更新使用统计
            if (selected && typeof selected.updateUsage === 'function') {
                selected.updateUsage();
            }
            return selected;
        }
        return null;
    },
    
    /**
     * 通过鼠标设置活跃项
     * @param {number} index - 候选项索引
     */
    setActiveByMouse(index) {
        if (index >= 0 && index < this.candidates.length) {
            this.activeIndex = index;
            this.selectionMode = SelectionMode.MOUSE;
            this._updateActiveItem();
        }
    },
    
    /**
     * 重置选择
     */
    resetSelection() {
        this.activeIndex = this.candidates.length > 0 ? 0 : -1;
        this.selectionMode = SelectionMode.KEYBOARD;
        this._updateActiveItem();
    },
    
    /**
     * 设置弹窗状态
     * @param {string} newState - 新状态
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        // 触发状态变化回调
        this._onStateChange(oldState, newState);
    },
    
    /**
     * 设置弹窗元素引用
     * @param {HTMLElement} element - 弹窗DOM元素
     */
    setPanelElement(element) {
        this.panelElement = element;
    },
    
    /**
     * 设置目标输入框
     * @param {HTMLElement} input - 输入框元素
     */
    setTargetInput(input) {
        this.targetInput = input;
    },
    
    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    },
    
    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    },
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     * @private
     */
    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    },
    
    /**
     * 更新活跃项视觉状态
     * @private
     */
    _updateActiveItem() {
        this._emit('activeIndexChanged', {
            activeIndex: this.activeIndex,
            selectionMode: this.selectionMode,
            candidate: this.candidates[this.activeIndex] || null
        });
    },
    
    /**
     * 状态变化回调
     * @param {string} oldState - 旧状态
     * @param {string} newState - 新状态
     * @private
     */
    _onStateChange(oldState, newState) {
        this._emit('stateChanged', {
            oldState,
            newState,
            panelState: this.getPanelState()
        });
    },
    
    /**
     * 触发导航事件
     * @param {string} direction - 导航方向
     * @private
     */
    _emitNavigationEvent(direction) {
        this._emit('navigation', {
            direction,
            activeIndex: this.activeIndex,
            candidate: this.candidates[this.activeIndex] || null
        });
    }
};
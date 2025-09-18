/**
 * =================================================================================
 * 斗鱼弹幕助手 - 输入框交互逻辑
 * ---------------------------------------------------------------------------------
 * 处理输入框联动逻辑，协调输入框与候选项弹窗的交互
 * =================================================================================
 */

import { NativeSetter } from '../utils/nativeSetter.js';

/**
 * 输入框交互管理器
 */
export const InputInteraction = {
    
    // 当前活跃的输入框
    activeInput: null,
    
    // 输入框事件监听器映射
    inputListeners: new Map(),
    
    /**
     * 初始化输入框交互
     */
    init() {
        this.bindGlobalEvents();
        console.log('InputInteraction initialized');
    },
    
    /**
     * 绑定输入框事件
     * @param {HTMLElement} inputEl - 输入框元素
     */
    bindInputEvents(inputEl) {
        if (!inputEl || this.inputListeners.has(inputEl)) {
            return; // 已经绑定过或元素无效
        }
        
        // 创建事件监听器
        const listeners = {
            focus: (event) => this._handleInputFocus(event, inputEl),
            blur: (event) => this._handleInputBlur(event, inputEl),
            input: (event) => this._handleInputChange(event, inputEl),
            keydown: (event) => this._handleInputKeyDown(event, inputEl)
        };
        
        // 绑定事件
        Object.entries(listeners).forEach(([eventName, listener]) => {
            inputEl.addEventListener(eventName, listener);
        });
        
        // 保存监听器引用，用于后续清理
        this.inputListeners.set(inputEl, listeners);
    },
    
    /**
     * 解绑输入框事件
     * @param {HTMLElement} inputEl - 输入框元素
     */
    unbindInputEvents(inputEl) {
        if (!this.inputListeners.has(inputEl)) return;
        
        const listeners = this.inputListeners.get(inputEl);
        
        // 移除事件监听器
        Object.entries(listeners).forEach(([eventName, listener]) => {
            inputEl.removeEventListener(eventName, listener);
        });
        
        // 清理引用
        this.inputListeners.delete(inputEl);
    },
    
    /**
     * 直接替换输入框内容
     * @param {HTMLElement} inputEl - 输入框元素
     * @param {string} text - 要设置的文本
     */
    replaceInputWithText(inputEl, text) {
        if (!inputEl) return;
        
        // 使用原生Setter设置文本
        NativeSetter.setValue(inputEl, text);
        
        // 设置光标到末尾
        this._setCursorToEnd(inputEl);
        
        // 触发input事件，让页面知道内容已改变
        this._triggerInputEvent(inputEl);
    },
    
    /**
     * 获取当前活跃的输入框
     * @returns {HTMLElement|null} 活跃的输入框元素
     */
    getActiveInput() {
        return this.activeInput;
    },
    
    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听候选项选择事件
        document.addEventListener('candidateSelected', (event) => {
            const { candidate } = event.detail;
            this._handleCandidateSelected(candidate);
        });
    },
    
    /**
     * 处理输入框获得焦点
     * @param {Event} event - 焦点事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _handleInputFocus(event, inputEl) {
        this.activeInput = inputEl;
        
        // 触发焦点获得事件
        this._emitInputEvent('inputFocused', { inputEl, event });
    },
    
    /**
     * 处理输入框失去焦点
     * @param {Event} event - 失焦事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _handleInputBlur(event, inputEl) {
        // 延迟处理，给候选项点击事件一些时间
        setTimeout(() => {
            if (this.activeInput === inputEl) {
                this.activeInput = null;
                
                // 触发失焦事件
                this._emitInputEvent('inputBlurred', { inputEl, event });
            }
        }, 200);
    },
    
    /**
     * 处理输入框内容变化
     * @param {Event} event - 输入事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _handleInputChange(event, inputEl) {
        // 触发输入变化事件
        this._emitInputEvent('inputChanged', { 
            inputEl, 
            value: inputEl.value, 
            event 
        });
    },
    
    /**
     * 处理输入框按键事件
     * @param {KeyboardEvent} event - 键盘事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _handleInputKeyDown(event, inputEl) {
        // 触发按键事件
        this._emitInputEvent('inputKeyDown', { 
            inputEl, 
            key: event.key, 
            event 
        });
    },
    
    /**
     * 处理候选项选择
     * @param {Object} candidate - 选中的候选项
     * @private
     */
    _handleCandidateSelected(candidate) {
        if (this.activeInput && candidate) {
            const text = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
            this.replaceInputWithText(this.activeInput, text);
        }
    },
    
    /**
     * 触发输入框事件
     * @param {string} eventName - 事件名称
     * @param {Object} detail - 事件详情
     * @private
     */
    _emitInputEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    },
    
    /**
     * 触发input事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _triggerInputEvent(inputEl) {
        const inputEvent = new Event('input', { bubbles: true });
        inputEl.dispatchEvent(inputEvent);
    },
    
    /**
     * 设置光标到输入框末尾
     * @param {HTMLElement} inputEl - 输入框元素
     * @private
     */
    _setCursorToEnd(inputEl) {
        if (inputEl.setSelectionRange) {
            const len = inputEl.value.length;
            inputEl.setSelectionRange(len, len);
        }
    },
    
    /**
     * 清理所有事件监听器
     */
    cleanup() {
        // 清理所有输入框事件监听器
        for (const inputEl of this.inputListeners.keys()) {
            this.unbindInputEvents(inputEl);
        }
        
        this.activeInput = null;
    }
};
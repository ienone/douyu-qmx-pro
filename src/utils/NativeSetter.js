/**
 * =================================================================================
 * 斗鱼弹幕助手 - 原生Setter工具
 * ---------------------------------------------------------------------------------
 * 提供绕过框架管理的原生方式设置输入框值的工具方法
 * =================================================================================
 */

/**
 * 原生Setter工具
 */
export const NativeSetter = {
    
    // 缓存原生descriptor
    inputValueDescriptor: null,
    textareaValueDescriptor: null,
    
    /**
     * 初始化原生Setter
     */
    init() {
        // 获取并缓存原生的value descriptor
        this.inputValueDescriptor = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype, 
            'value'
        );
        
        this.textareaValueDescriptor = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype, 
            'value'
        );
        
        console.log('NativeSetter initialized');
    },
    
    /**
     * 使用原生Setter设置输入框值
     * @param {HTMLElement} element - 输入框元素
     * @param {string} value - 要设置的值
     * @returns {boolean} 是否设置成功
     */
    setValue(element, value) {
        if (!element) return false;
        
        try {
            // 根据元素类型选择合适的descriptor
            let descriptor = null;
            
            if (element.tagName === 'INPUT') {
                descriptor = this.inputValueDescriptor;
            } else if (element.tagName === 'TEXTAREA') {
                descriptor = this.textareaValueDescriptor;
            }
            
            if (!descriptor || !descriptor.set) {
                // 降级到直接赋值
                element.value = value;
                return true;
            }
            
            // 使用原生setter
            descriptor.set.call(element, value);
            
            // 立即派发input事件以通知框架
            this.dispatchInputEvent(element);
            
            return true;
            
        } catch (error) {
            console.warn('NativeSetter failed, falling back to direct assignment:', error);
            element.value = value;
            this.dispatchInputEvent(element);
            return false;
        }
    },
    
    /**
     * 派发input事件
     * @param {HTMLElement} element - 目标元素
     */
    dispatchInputEvent(element) {
        try {
            // 创建并派发input事件
            const inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true
            });
            
            element.dispatchEvent(inputEvent);
            
            // 对于某些框架，还需要派发change事件
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true
            });
            
            element.dispatchEvent(changeEvent);
            
        } catch (error) {
            console.warn('Failed to dispatch input event:', error);
        }
    },
    
    /**
     * 检查元素是否被框架管理
     * @param {HTMLElement} element - 输入框元素
     * @returns {boolean} 是否被框架管理
     */
    isFrameworkManaged(element) {
        return element && (
            element.dataset.frameworkManaged === 'true' ||
            element.hasAttribute('v-model') ||     // Vue
            element.hasAttribute('ng-model') ||    // Angular
            element._valueTracker ||               // React
            element.__reactInternalFiber ||        // React Fiber
            element.__reactInternalInstance        // React
        );
    },
    
    /**
     * 智能设置输入框值（根据是否被框架管理选择策略）
     * @param {HTMLElement} element - 输入框元素
     * @param {string} value - 要设置的值
     * @param {Object} options - 选项
     * @returns {boolean} 是否设置成功
     */
    smartSetValue(element, value, options = {}) {
        const { 
            forceNative = false,     // 强制使用原生setter
            skipEvents = false       // 跳过事件派发
        } = options;
        
        if (!element) return false;
        
        try {
            if (forceNative || this.isFrameworkManaged(element)) {
                // 使用原生setter
                const result = this.setValue(element, value);
                
                if (!skipEvents && result) {
                    // 额外派发一些可能需要的事件
                    this.dispatchAdditionalEvents(element);
                }
                
                return result;
            } else {
                // 直接赋值
                element.value = value;
                
                if (!skipEvents) {
                    this.dispatchInputEvent(element);
                }
                
                return true;
            }
            
        } catch (error) {
            console.error('SmartSetValue failed:', error);
            return false;
        }
    },
    
    /**
     * 派发额外的事件（某些框架可能需要）
     * @param {HTMLElement} element - 目标元素
     */
    dispatchAdditionalEvents(element) {
        try {
            // 派发keydown和keyup事件模拟用户输入
            ['keydown', 'keyup'].forEach(eventType => {
                const keyEvent = new KeyboardEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    key: 'Unidentified'
                });
                element.dispatchEvent(keyEvent);
            });
            
            // 派发focus和blur事件
            if (document.activeElement !== element) {
                const focusEvent = new FocusEvent('focus', {
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(focusEvent);
            }
            
        } catch (error) {
            console.warn('Failed to dispatch additional events:', error);
        }
    },
    
    /**
     * 获取输入框的当前值（绕过可能的框架代理）
     * @param {HTMLElement} element - 输入框元素
     * @returns {string} 当前值
     */
    getValue(element) {
        if (!element) return '';
        
        try {
            // 根据元素类型选择合适的descriptor
            let descriptor = null;
            
            if (element.tagName === 'INPUT') {
                descriptor = this.inputValueDescriptor;
            } else if (element.tagName === 'TEXTAREA') {
                descriptor = this.textareaValueDescriptor;
            }
            
            if (descriptor && descriptor.get) {
                return descriptor.get.call(element) || '';
            }
            
            return element.value || '';
            
        } catch (error) {
            console.warn('Failed to get value using native getter:', error);
            return element.value || '';
        }
    }
};

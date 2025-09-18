/**
 * =================================================================================
 * 斗鱼弹幕助手 - 输入框检测器
 * ---------------------------------------------------------------------------------
 * 根据斗鱼页面结构，检测和处理不同类型的输入框
 * =================================================================================
 */

import { SETTINGS } from '../modules/SettingsManager';

/**
 * 输入框类型枚举
 */
export const INPUT_TYPES = {
    MAIN_CHAT: 'main_chat',           // 主聊天区输入框
    FULLSCREEN_FLOAT: 'fullscreen',   // 全屏浮动输入框
    UNKNOWN: 'unknown'                // 未知类型
};

/**
 * 输入框检测器
 */
export const InputDetector = {
    
    // MutationObserver 实例
    mutationObserver: null,
    
    // 已检测到的输入框缓存
    detectedInputs: new WeakSet(),
    
    // 输入框变化回调
    onInputDetected: null,
    onInputRemoved: null,
    
    /**
     * 初始化检测器
     */
    init(callbacks = {}) {
        this.onInputDetected = callbacks.onInputDetected || (() => {});
        this.onInputRemoved = callbacks.onInputRemoved || (() => {});
        
        // 检测现有输入框
        this.detectExistingInputs();
        
        // 启动动态检测
        this.startMutationObserver();
        
        console.log('InputDetector initialized');
    },
    
    /**
     * 检测现有的输入框
     */
    detectExistingInputs() {
        // 检测主聊天区输入框
        this.detectMainChatInput();
        
        // 检测全屏浮动输入框（如果存在）
        this.detectFullscreenInput();
    },
    
    /**
     * 检测主聊天区输入框
     */
    detectMainChatInput() {
        // 使用轮询的方式确保元素已加载
        const checkMainInput = () => {
            const mainInput = document.querySelector('.ChatSend-txt');
            if (mainInput && !this.detectedInputs.has(mainInput)) {
                this.handleInputDetected(mainInput, INPUT_TYPES.MAIN_CHAT);
                return true;
            }
            return false;
        };
        
        // 立即检查一次
        if (!checkMainInput()) {
            // 如果没找到，轮询检查（最多10秒）
            let attempts = 0;
            const maxAttempts = 50; // 10秒 / 200ms
            
            const pollInterval = setInterval(() => {
                attempts++;
                if (checkMainInput() || attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                }
            }, 200);
        }
    },
    
    /**
     * 检测全屏浮动输入框
     */
    detectFullscreenInput() {
        // 全屏输入框是动态创建的，主要通过 MutationObserver 检测
        const fullscreenInput = document.querySelector('.inputView-2a65aa');
        if (fullscreenInput && !this.detectedInputs.has(fullscreenInput)) {
            this.handleInputDetected(fullscreenInput, INPUT_TYPES.FULLSCREEN_FLOAT);
        }
    },
    
    /**
     * 启动DOM变化监听
     */
    startMutationObserver() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // 检查新增的节点
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.checkNodeForInputs(node, true);
                    }
                });
                
                // 检查移除的节点
                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.checkNodeForInputs(node, false);
                    }
                });
            });
        });
        
        // 监听播放器容器的变化（全屏输入框会在这里出现）
        const playerContainer = document.querySelector('#js-player-video-case') || document.body;
        this.mutationObserver.observe(playerContainer, {
            childList: true,
            subtree: true
        });
    },
    
    /**
     * 检查节点中的输入框
     * @param {Element} node - 要检查的节点
     * @param {boolean} isAdded - 是否是新增节点
     */
    checkNodeForInputs(node, isAdded) {
        // 检查节点本身
        const inputType = this.getInputType(node);
        if (inputType !== INPUT_TYPES.UNKNOWN) {
            if (isAdded) {
                this.handleInputDetected(node, inputType);
            } else {
                this.handleInputRemoved(node, inputType);
            }
            return;
        }
        
        // 检查子节点
        const selectors = [
            '.ChatSend-txt',      // 主聊天区
            '.inputView-2a65aa'   // 全屏浮动（注意：哈希可能变化）
        ];
        
        selectors.forEach(selector => {
            const inputs = node.querySelectorAll(selector);
            inputs.forEach(input => {
                const type = this.getInputType(input);
                if (type !== INPUT_TYPES.UNKNOWN) {
                    if (isAdded) {
                        this.handleInputDetected(input, type);
                    } else {
                        this.handleInputRemoved(input, type);
                    }
                }
            });
        });
    },
    
    /**
     * 处理检测到新输入框
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    handleInputDetected(input, type) {
        if (this.detectedInputs.has(input)) return;
        
        this.detectedInputs.add(input);
        console.log(`Detected ${type} input:`, input);
        
        // 根据类型进行特殊处理
        this.setupInputSpecialHandling(input, type);
        
        // 通知回调
        this.onInputDetected(input, type);
    },
    
    /**
     * 处理输入框移除
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    handleInputRemoved(input, type) {
        if (!this.detectedInputs.has(input)) return;
        
        this.detectedInputs.delete(input);
        console.log(`Removed ${type} input:`, input);
        
        // 通知回调
        this.onInputRemoved(input, type);
    },
    
    /**
     * 根据输入框类型进行特殊设置
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    setupInputSpecialHandling(input, type) {
        switch (type) {
            case INPUT_TYPES.MAIN_CHAT:
                this.setupMainChatInput(input);
                break;
            case INPUT_TYPES.FULLSCREEN_FLOAT:
                this.setupFullscreenInput(input);
                break;
        }
    },
    
    /**
     * 设置主聊天区输入框
     * @param {HTMLElement} input - 输入框元素
     */
    setupMainChatInput(input) {
        // 主聊天区输入框的特殊处理
        // 由于被框架持续管理，需要在 focus 时才处理
        let hasSetupFocusHandler = false;
        
        const setupFocusHandler = () => {
            if (hasSetupFocusHandler) return;
            hasSetupFocusHandler = true;
            
            input.addEventListener('focus', () => {
                console.log('Main chat input focused');
                // 标记为框架管理的输入框
                input.dataset.frameworkManaged = 'true';
            }, { once: true });
        };
        
        // 立即设置或延迟设置
        if (document.readyState === 'complete') {
            setupFocusHandler();
        } else {
            document.addEventListener('DOMContentLoaded', setupFocusHandler);
        }
    },
    
    /**
     * 设置全屏浮动输入框
     * @param {HTMLElement} input - 输入框元素
     */
    setupFullscreenInput(input) {
        // 全屏浮动输入框的特殊处理
        // 这类输入框是动态创建的，需要立即处理
        console.log('Fullscreen input detected and ready');
        input.dataset.frameworkManaged = 'true';
        input.dataset.dynamicCreated = 'true';
    },
    
    /**
     * 获取输入框类型
     * @param {HTMLElement} element - 元素
     * @returns {string} 输入框类型
     */
    getInputType(element) {
        if (!element || (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA')) {
            return INPUT_TYPES.UNKNOWN;
        }
        
        // 主聊天区输入框
        if (element.classList.contains('ChatSend-txt')) {
            return INPUT_TYPES.MAIN_CHAT;
        }
        
        // 暂时禁用全屏浮动输入框识别
        // // 全屏浮动输入框（支持哈希值变化）
        // if (element.classList.contains('inputView-2a65aa') || 
        //     (element.type === 'text' && element.closest('.fullScreenSendor-e3061e'))) {
        //     return INPUT_TYPES.FULLSCREEN_FLOAT;
        // }
        
        return INPUT_TYPES.UNKNOWN;
    },
    
    /**
     * 检查元素是否是聊天输入框
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 是否是聊天输入框
     */
    isChatInput(element) {
        return this.getInputType(element) !== INPUT_TYPES.UNKNOWN;
    },
    
    /**
     * 获取输入框的发送按钮
     * @param {HTMLElement} input - 输入框元素
     * @returns {HTMLElement|null} 发送按钮元素
     */
    getSendButton(input) {
        const type = this.getInputType(input);
        
        switch (type) {
            case INPUT_TYPES.MAIN_CHAT:
                // 在 .ChatSend 父容器中查找发送按钮
                const chatSend = input.closest('.ChatSend');
                return chatSend ? chatSend.querySelector('.ChatSend-button') : null;
                
            case INPUT_TYPES.FULLSCREEN_FLOAT:
                // 在 .fullScreenSendor-* 父容器中查找发送按钮
                const fullscreenSendor = input.closest('[class*="fullScreenSendor-"]');
                return fullscreenSendor ? 
                    fullscreenSendor.querySelector('.sendDanmu-592760, [class*="sendDanmu-"]') : null;
                
            default:
                return null;
        }
    },
    
    /**
     * 销毁检测器
     */
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        this.detectedInputs = new WeakSet();
        this.onInputDetected = null;
        this.onInputRemoved = null;
        
        console.log('InputDetector destroyed');
    }
};

/**
 * =================================================================================
 * 斗鱼弹幕助手 - 输入管理器（中央状态机）
 * ---------------------------------------------------------------------------------
 * 统一管理用户交互流程：IDLE -> TYPING -> SELECTING
 * =================================================================================
 */

import { CONFIG } from '../utils/CONFIG.js';
import { Utils } from '../utils/utils.js';
import { DanmukuDB } from './DanmukuDB.js';
import { UIManager } from './UIManager.js';
import { InputDetector, INPUT_TYPES } from './InputDetector.js';
import { NativeSetter } from '../utils/nativeSetter.js';
import { SettingsManager } from './SettingsManager.js';

/**
 * 应用状态枚举
 */
export const APP_STATES = {
    IDLE: 'idle',           // 空闲状态，等待用户输入
    TYPING: 'typing',       // 用户正在输入，候选项可见但未进入选择模式
    SELECTING: 'selecting'  // 用户进入候选项选择模式
};

/**
 * 输入管理器 - 中央状态机
 */
export const InputManager = {
    
    // 当前状态
    currentState: APP_STATES.IDLE,
    
    // 当前输入框元素
    currentInput: null,
    
    // 当前候选项列表
    currentSuggestions: [],
    
    // 当前激活的索引
    activeIndex: -1,
    
    // 是否处于选择模式
    isInSelectionMode: false,
    
    // 添加防抖定时器
    debounceTimer: null,
    
    // 已处理的输入框
    processedInputs: new WeakSet(),
    
    /**
     * 初始化输入管理器
     */
    async init() {
        // 初始化NativeSetter
        NativeSetter.init();
        
        // 初始化UIManager
        await UIManager.init();
        
        // 初始化InputDetector
        InputDetector.init({
            onInputDetected: this.handleInputDetected.bind(this),
            onInputRemoved: this.handleInputRemoved.bind(this)
        });
        
        this.bindInputEvents();
        console.log('InputManager initialized');
    },
    
    /**
     * 绑定输入框事件
     */
    bindInputEvents() {
        // 监听所有输入框的焦点事件
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
        
        // 监听键盘事件（使用捕获阶段，以便更早拦截）
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('input', this.handleInput.bind(this));
        
        // 监听输入框值的变化（包括程序化的清空）
        this.startInputValueWatcher();
    },
    
    /**
     * 启动输入框值监听器
     */
    startInputValueWatcher() {
        setInterval(() => {
            if (this.currentInput && this.currentSuggestions.length > 0) {
                const currentValue = this.currentInput.value;
                if (currentValue.length === 0) {
                    // 输入框被清空了，立即隐藏候选项
                    this.hidePopup();
                    this.setState(APP_STATES.IDLE);
                    this.isInSelectionMode = false;
                    this.activeIndex = -1;
                }
            }
        }, 100); // 每100ms检查一次
    },
    
    /**
     * 处理检测到新输入框
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    handleInputDetected(input, type) {
        if (this.processedInputs.has(input)) return;
        
        this.processedInputs.add(input);
        console.log(`Processing detected input of type: ${type}`);
        
        // 根据类型进行特殊处理
        this.setupInputByType(input, type);
    },
    
    /**
     * 处理输入框移除
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    handleInputRemoved(input, type) {
        if (!this.processedInputs.has(input)) return;
        
        this.processedInputs.delete(input);
        
        // 如果是当前活跃输入框，清理状态
        if (this.currentInput === input) {
            this.currentInput = null;
            this.setState(APP_STATES.IDLE);
            UIManager.hidePopup();
        }
        
        console.log(`Removed input of type: ${type}`);
    },
    
    /**
     * 根据输入框类型进行设置
     * @param {HTMLElement} input - 输入框元素
     * @param {string} type - 输入框类型
     */
    setupInputByType(input, type) {
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
        // 主聊天区输入框需要在focus时才处理，避免与框架冲突
        const focusHandler = (event) => {
            this.currentInput = input;
            this.setState(APP_STATES.IDLE);
            console.log('Main chat input focused and activated');
        };
        
        input.addEventListener('focus', focusHandler, { once: true });
        
        // 重新绑定focus事件，确保每次focus都能激活
        input.addEventListener('blur', () => {
            setTimeout(() => {
                input.addEventListener('focus', focusHandler, { once: true });
            }, 100);
        });
    },
    
    /**
     * 设置全屏浮动输入框
     * @param {HTMLElement} input - 输入框元素
     */
    setupFullscreenInput(input) {
        // 全屏浮动输入框可以立即处理
        console.log('Fullscreen input setup completed');
        
        const focusHandler = (event) => {
            this.currentInput = input;
            this.setState(APP_STATES.IDLE);
            console.log('Fullscreen input focused and activated');
        };
        
        input.addEventListener('focus', focusHandler);
    },
    
    /**
     * 处理输入框获得焦点
     */
    handleFocusIn(event) {
        const target = event.target;
        
        // 检查是否是我们识别的聊天输入框
        if (InputDetector.isChatInput(target)) {
            this.currentInput = target;
            this.setState(APP_STATES.IDLE);
        }
    },
    
    /**
     * 处理输入框失去焦点
     */
    handleFocusOut(event) {
        console.log('=== InputManager.handleFocusOut 被调用 ===');
        console.log('失焦的元素:', event.target.className, 'value:', event.target.value);
        
        if (event.target === this.currentInput) {
            console.log('当前输入框失焦，检查焦点转移目标...');
            
            // 判断 event.relatedTarget 是否在插件UI内
            const related = event.relatedTarget;
            const isPluginUI = related && (
                related.closest('.dda-popup') || 
                related.closest('.ddp-candidate-capsules')
            );
            
            if (!isPluginUI) {
                // 焦点转移到非插件UI，延迟检查输入框状态
                setTimeout(() => {
                    // 检查输入框内容
                    const hasContent = this.currentInput && 
                        this.currentInput.value && 
                        this.currentInput.value.trim().length > 0;
                    
                    console.log('焦点转移到非插件UI，输入框有内容:', hasContent);
                    
                    this.setState(APP_STATES.IDLE);
                    this.currentInput = null;
                    
                    // 只有在输入框为空时才隐藏候选项
                    if (!hasContent) {
                        console.log('输入框为空，隐藏候选项');
                        this.hidePopup();
                    } else {
                        console.log('输入框有内容，保持候选项显示');
                    }
                }, 150); // 延迟150ms，给其他事件处理时间
            } else {
                console.log('焦点转移到插件UI内，保持候选项显示');
            }
        }
    },
    
    /**
     * 处理输入事件
     */
    handleInput(event) {
        if (event.target !== this.currentInput) return;
        
        const inputValue = event.target.value;
        
        // 如果输入为空，立即隐藏候选项
        if (inputValue.length === 0) {
            this.hidePopup();
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.activeIndex = -1;
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            return;
        }

        // 正常防抖处理输入
        this.debounceProcessInput(inputValue);
    },

    /**
     * 防抖处理输入
     * @param {string} inputValue - 输入值
     */
    debounceProcessInput(inputValue) {
        // 清除之前的定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // 设置新的定时器
        const settings = SettingsManager.getSettings();
        this.debounceTimer = setTimeout(() => {
            this.processInput(inputValue);
        }, settings.debounceDelay);
    },
    
    /**
     * 处理键盘按下事件 - 统一处理所有状态下的键盘事件
     */
    handleKeyDown(event) {
        if (event.target !== this.currentInput) return;
        
        const key = event.key;
        const settings = SettingsManager.getSettings();
        
        // 检查是否有候选项可见
        const hasVisibleCandidates = UIManager.isPopupVisible();
        
        if (hasVisibleCandidates) {
            if (this.isInSelectionMode) {
                // 选择模式下的按键处理
                if (key === CONFIG.KEYBOARD.ARROW_UP) {
                    event.preventDefault();
                    this.navigateUp();
                } else if (key === CONFIG.KEYBOARD.ARROW_DOWN) {
                    // 按下键退出选择模式，返回输入模式
                    event.preventDefault();
                    this.exitSelectionMode();
                } else if (key === CONFIG.KEYBOARD.ARROW_LEFT) {
                    event.preventDefault();
                    this.navigateLeft();
                } else if (key === CONFIG.KEYBOARD.ARROW_RIGHT) {
                    event.preventDefault();
                    this.navigateRight();
                } else if (key === CONFIG.KEYBOARD.ENTER && !event.shiftKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.selectActiveCandidate();
                    this.exitSelectionMode();
                } else if (key === CONFIG.KEYBOARD.ESCAPE) {
                    event.preventDefault();
                    this.exitSelectionMode();
                    this.hidePopup();
                }
            } else {
                // 输入模式下有候选项可见时的按键处理
                if (key === CONFIG.KEYBOARD.ARROW_UP) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.enterSelectionMode();
                }
            }
        }
    },
    
    /**
     * 进入选择模式
     */
    enterSelectionMode() {
        this.isInSelectionMode = true;
        this.setState(APP_STATES.SELECTING);
        UIManager.setSelectionModeActive(true);
        if (this.currentSuggestions.length > 0) {
            this.setActiveIndex(0);
        }
        Utils.log('进入候选项选择模式');
    },
    
    /**
     * 退出选择模式
     */
    exitSelectionMode() {
        this.isInSelectionMode = false;
        this.setState(APP_STATES.TYPING);
        UIManager.setSelectionModeActive(false);
        this.setActiveIndex(-1);
        Utils.log('退出候选项选择模式');
    },
    
    /**
     * 向上导航
     */
    navigateUp() {
        if (this.currentSuggestions.length === 0) return;
        let newIndex = this.activeIndex - 1;
        if (newIndex < 0) {
            newIndex = this.currentSuggestions.length - 1;
        }
        this.setActiveIndex(newIndex);
    },
    
    /**
     * 向下导航
     */
    navigateDown() {
        if (this.currentSuggestions.length === 0) return;
        let newIndex = this.activeIndex + 1;
        if (newIndex >= this.currentSuggestions.length) {
            newIndex = 0;
        }
        this.setActiveIndex(newIndex);
    },
    
    /**
     * 向左导航
     */
    navigateLeft() {
        this.navigateUp();
    },
    
    /**
     * 向右导航
     */
    navigateRight() {
        this.navigateDown();
    },
    
    /**
     * 设置活跃索引
     */
    setActiveIndex(index) {
        if (index < -1 || (index >= this.currentSuggestions.length && index !== -1)) {
            return;
        }
        this.activeIndex = index;
        UIManager.setActiveIndex(index);
    },
    
    /**
     * 选择当前活跃的候选项
     */
    selectActiveCandidate() {
        if (this.activeIndex >= 0 && this.activeIndex < this.currentSuggestions.length) {
            const selectedCandidate = this.currentSuggestions[this.activeIndex];
            this.selectCandidate(selectedCandidate);
        }
    },
    
    /**
     * 选择指定候选项
     */
    selectCandidate(candidate) {
        if (!candidate || !this.currentInput) return;
        
        const text = candidate.getDisplayText ? candidate.getDisplayText() : candidate.text;
        
        // 更新使用统计
        if (typeof candidate.updateUsage === "function") {
            candidate.updateUsage();
        } else if (candidate.id) {
            DanmukuDB.updateUsage(candidate.id);
        }
        
        // 填入输入框
        NativeSetter.setValue(this.currentInput, text);
        
        // 隐藏弹窗
        this.hidePopup();
        this.setState(APP_STATES.IDLE);
        this.isInSelectionMode = false;
        this.activeIndex = -1;
        
        Utils.log(`候选项已选择并填入输入框: ${text}`);
    },
    
    /**
     * 隐藏弹窗
     */
    hidePopup() {
        UIManager.hidePopup();
        this.currentSuggestions = [];
        this.activeIndex = -1;
    },
    
    /**
     * 处理输入内容
     */
    async processInput(inputValue) {
        const settings = SettingsManager.getSettings();
        
        if (inputValue.length < settings.minSearchLength) {
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.activeIndex = -1;
            this.hidePopup();
            return;
        }
        
        // 从数据库搜索匹配的弹幕模板
        let suggestions = await DanmukuDB.search(inputValue);
        
        this.currentSuggestions = suggestions;
        
        if (suggestions.length > 0) {
            // 有候选项时设置为TYPING状态，等待用户按上键进入SELECTING模式
            this.setState(APP_STATES.TYPING);
            this.isInSelectionMode = false;
            UIManager.showPopup(suggestions, this.currentInput);
        } else {
            this.setState(APP_STATES.IDLE);
            this.isInSelectionMode = false;
            this.hidePopup();
        }
    },
    
    /**
     * 设置当前状态
     */
    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        console.log(`State changed: ${oldState} -> ${newState}`);
        
        // 触发状态变化事件
        this.onStateChange(oldState, newState);
    },
    
    /**
     * 状态变化回调
     */
    onStateChange(oldState, newState) {
        console.log(`=== onStateChange: ${oldState} -> ${newState} ===`);
        
        switch (newState) {
            case APP_STATES.IDLE:
                // 不要在这里无条件隐藏弹窗
                // 让具体的调用场景来决定是否隐藏
                console.log('状态变为IDLE，但不自动隐藏弹窗');
                break;
            case APP_STATES.TYPING:
                // 保持当前UI状态
                console.log('状态变为TYPING');
                break;
            case APP_STATES.SELECTING:
                // 高亮第一个候选项
                console.log('状态变为SELECTING，设置活跃索引');
                if (this.activeIndex === -1 && this.currentSuggestions.length > 0) {
                    this.setActiveIndex(0);
                }
                break;
        }
    },
    
    /**
     * 判断元素是否是聊天输入框
     */
    isChatInput(element) {
        // 使用InputDetector进行精确判断
        return InputDetector.isChatInput(element);
    }
};

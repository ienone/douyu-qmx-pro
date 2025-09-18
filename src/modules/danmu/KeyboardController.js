/**
 * =================================================================================
 * 斗鱼弹幕助手 - 键盘控制器
 * ---------------------------------------------------------------------------------
 * 处理所有键盘导航逻辑，将底层按键事件转换为高层应用指令
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';
import { APP_STATES } from './InputManager.js';
import { UIManager } from './UIManager.js';

/**
 * 键盘控制器
 */
export const KeyboardController = {
    
    // 当前活跃的候选项索引
    activeIndex: 0,
    
    // 是否启用键盘控制
    enabled: true,
    
    /**
     * 初始化键盘控制器
     */
    init() {
        console.log('KeyboardController initialized');
    },
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} event - 键盘事件
     * @param {string} currentState - 当前应用状态
     */
    handleKeyDown(event, currentState) {
        if (!this.enabled) return;
        
        const key = event.code || event.key;
        
        switch (currentState) {
            case APP_STATES.IDLE:
                this.handleIdleState(event, key);
                break;
            case APP_STATES.TYPING:
                this.handleTypingState(event, key);
                break;
            case APP_STATES.SELECTING:
                this.handleSelectingState(event, key);
                break;
        }
    },
    
    /**
     * 处理空闲状态的按键
     */
    handleIdleState(event, key) {
        // 在空闲状态下，主要监听触发键
        if (this.isTriggerKey(key)) {
            // TODO: 触发自动完成
            // InputManager.triggerAutoComplete();
            event.preventDefault();
        }
    },
    
    /**
     * 处理输入状态的按键
     */
    handleTypingState(event, key) {
        if (this.isTriggerKey(key)) {
            // 在输入状态下触发选择模式
            // InputManager.setState(APP_STATES.SELECTING);
            event.preventDefault();
        } else if (this.isCancelKey(key)) {
            // 取消自动完成
            // InputManager.setState(APP_STATES.IDLE);
            event.preventDefault();
        }
    },
    
    /**
     * 处理选择状态的按键
     */
    handleSelectingState(event, key) {
        if (this.isNavigationKey(key)) {
            this.handleNavigation(event, key);
        } else if (this.isSelectKey(key)) {
            this.handleSelection(event);
        } else if (this.isCancelKey(key)) {
            this.handleCancel(event);
        }
    },
    
    /**
     * 处理导航按键
     */
    handleNavigation(event, key) {
        event.preventDefault();
        
        const direction = this.getNavigationDirection(key);
        if (direction === 'up') {
            this.moveSelection(-1);
        } else if (direction === 'down') {
            this.moveSelection(1);
        }
    },
    
    /**
     * 处理选择按键
     */
    handleSelection(event) {
        event.preventDefault();
        // 通知UIManager选择当前项
        if (UIManager) {
            UIManager.selectActiveCandidate();
        }
    },
    
    /**
     * 处理取消按键
     */
    handleCancel(event) {
        event.preventDefault();
        // 通知UIManager取消选择
        if (UIManager) {
            UIManager.hidePopup();
        }
    },
    
    /**
     * 移动选择项
     * @param {number} delta - 移动方向，-1为上，1为下
     */
    moveSelection(delta) {
        if (UIManager) {
            if (delta < 0) {
                UIManager.navigateUp();
            } else {
                UIManager.navigateDown();
            }
        }
    },
    
    /**
     * 重置选择索引
     */
    resetSelection() {
        this.activeIndex = 0;
    },
    
    /**
     * 判断是否是触发键
     */
    isTriggerKey(key) {
        return SETTINGS.TRIGGER_KEYS.includes(key) || 
               (key === 'Tab' && SETTINGS.TRIGGER_KEYS.includes('Tab'));
    },
    
    /**
     * 判断是否是导航键
     */
    isNavigationKey(key) {
        return SETTINGS.NAVIGATION_KEYS.includes(key) ||
               ['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(key);
    },
    
    /**
     * 判断是否是选择键
     */
    isSelectKey(key) {
        return SETTINGS.SELECT_KEYS.includes(key) ||
               ['Enter', 'Tab'].includes(key);
    },
    
    /**
     * 判断是否是取消键
     */
    isCancelKey(key) {
        return SETTINGS.CANCEL_KEYS.includes(key) ||
               key === 'Escape';
    },
    
    /**
     * 获取导航方向
     */
    getNavigationDirection(key) {
        switch (key) {
            case 'ArrowUp':
            case 'KeyW':
                return 'up';
            case 'ArrowDown':
            case 'KeyS':
                return 'down';
            default:
                return null;
        }
    },
    
    /**
     * 启用键盘控制
     */
    enable() {
        this.enabled = true;
    },
    
    /**
     * 禁用键盘控制
     */
    disable() {
        this.enabled = false;
    }
};

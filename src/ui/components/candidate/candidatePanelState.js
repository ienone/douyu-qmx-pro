/**
 * @file candidatePanelState.js
 * @description 弹窗状态管理和键盘事件处理
 */

import { PanelState, PreviewState, filterCandidates, sortCandidates } from './candidateType.js';

/**
 * 候选项面板状态管理器
 */
class CandidatePanelStateManager {
    constructor() {
        this.panelState = new PanelState();
        this.previewState = new PreviewState();
        this.callbacks = {
            onStateChange: [],
            onCandidateSelect: [],
            onPanelShow: [],
            onPanelHide: []
        };
        this.keyboardHandler = null;
        this.isKeyboardListenerActive = false;
    }

    /**
     * 获取当前面板状态
     * @returns {PanelState} - 当前面板状态
     */
    getPanelState() {
        return { ...this.panelState };
    }

    /**
     * 获取当前预览状态
     * @returns {PreviewState} - 当前预览状态
     */
    getPreviewState() {
        return { ...this.previewState };
    }

    /**
     * 设置候选项列表
     * @param {CandidateItem[]} candidates - 候选项列表
     * @param {string} filterText - 过滤文本
     */
    setCandidates(candidates, filterText = '') {
        // 过滤和排序候选项
        let filteredCandidates = filterCandidates(candidates, filterText);
        filteredCandidates.sort(sortCandidates);

        this.panelState.candidates = filteredCandidates;
        this.panelState.filterText = filterText;
        
        // 重置活动索引
        if (this.panelState.activeIndex >= filteredCandidates.length) {
            this.panelState.activeIndex = Math.max(0, filteredCandidates.length - 1);
        }

        this._triggerStateChange();
    }

    /**
     * 显示面板
     * @param {Object} position - 显示位置 {x, y}
     */
    showPanel(position = null) {
        this.panelState.isVisible = true;
        if (position) {
            this.panelState.position = { ...position };
        }
        
        this._enableKeyboardNavigation();
        this._triggerCallback('onPanelShow', this.panelState);
        this._triggerStateChange();
    }

    /**
     * 隐藏面板
     */
    hidePanel() {
        this.panelState.isVisible = false;
        this.panelState.activeIndex = 0;
        
        this._disableKeyboardNavigation();
        this._triggerCallback('onPanelHide', this.panelState);
        this._triggerStateChange();
    }

    /**
     * 设置面板位置
     * @param {Object} position - 位置 {x, y}
     */
    setPanelPosition(position) {
        this.panelState.position = { ...position };
        this._triggerStateChange();
    }

    /**
     * 向左导航
     */
    navigateLeft() {
        if (!this.panelState.isVisible || this.panelState.candidates.length === 0) {
            return false;
        }

        this.panelState.activeIndex = Math.max(0, this.panelState.activeIndex - 1);
        this._triggerStateChange();
        return true;
    }

    /**
     * 向右导航
     */
    navigateRight() {
        if (!this.panelState.isVisible || this.panelState.candidates.length === 0) {
            return false;
        }

        this.panelState.activeIndex = Math.min(
            this.panelState.candidates.length - 1, 
            this.panelState.activeIndex + 1
        );
        this._triggerStateChange();
        return true;
    }

    /**
     * 设置活动索引
     * @param {number} index - 索引
     */
    setActiveIndex(index) {
        if (index >= 0 && index < this.panelState.candidates.length) {
            this.panelState.activeIndex = index;
            this._triggerStateChange();
            return true;
        }
        return false;
    }

    /**
     * 选择当前活动候选项
     * @returns {CandidateItem|null} - 选中的候选项
     */
    selectActiveCandidate() {
        if (!this.panelState.isVisible || this.panelState.candidates.length === 0) {
            return null;
        }

        const activeCandidate = this.panelState.candidates[this.panelState.activeIndex];
        if (activeCandidate) {
            this.previewState.selectedCandidate = activeCandidate;
            this.previewState.text = activeCandidate.text;
            this.previewState.isVisible = true;
            
            this._triggerCallback('onCandidateSelect', activeCandidate);
            this._triggerStateChange();
        }

        return activeCandidate;
    }

    /**
     * 通过索引选择候选项
     * @param {number} index - 候选项索引
     * @returns {CandidateItem|null} - 选中的候选项
     */
    selectCandidateByIndex(index) {
        if (this.setActiveIndex(index)) {
            return this.selectActiveCandidate();
        }
        return null;
    }

    /**
     * 清除预览状态
     */
    clearPreview() {
        this.previewState.isVisible = false;
        this.previewState.text = '';
        this.previewState.selectedCandidate = null;
        this._triggerStateChange();
    }

    /**
     * 设置预览文本
     * @param {string} text - 预览文本
     */
    setPreviewText(text) {
        this.previewState.text = text;
        this.previewState.isVisible = text.trim().length > 0;
        this._triggerStateChange();
    }

    /**
     * 启用键盘导航
     */
    _enableKeyboardNavigation() {
        if (this.isKeyboardListenerActive) {
            return;
        }

        this.keyboardHandler = (event) => {
            if (!this.panelState.isVisible) {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.navigateLeft();
                    break;
                    
                case 'ArrowRight':
                    event.preventDefault();
                    this.navigateRight();
                    break;
                    
                case 'Tab':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.navigateLeft();
                    } else {
                        this.navigateRight();
                    }
                    break;
                    
                case 'Enter':
                    event.preventDefault();
                    this.selectActiveCandidate();
                    break;
                    
                case 'Escape':
                    event.preventDefault();
                    this.hidePanel();
                    break;
            }
        };

        document.addEventListener('keydown', this.keyboardHandler);
        this.isKeyboardListenerActive = true;
    }

    /**
     * 禁用键盘导航
     */
    _disableKeyboardNavigation() {
        if (this.keyboardHandler && this.isKeyboardListenerActive) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
            this.isKeyboardListenerActive = false;
        }
    }

    /**
     * 注册状态变化回调
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    /**
     * 移除状态变化回调
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    /**
     * 触发状态变化事件
     */
    _triggerStateChange() {
        this._triggerCallback('onStateChange', {
            panel: this.getPanelState(),
            preview: this.getPreviewState()
        });
    }

    /**
     * 触发回调函数
     * @param {string} event - 事件名称
     * @param {*} data - 传递的数据
     */
    _triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`CandidatePanelState: 回调函数执行错误 (${event})`, error);
                }
            });
        }
    }

    /**
     * 销毁状态管理器
     */
    destroy() {
        this._disableKeyboardNavigation();
        this.callbacks = {
            onStateChange: [],
            onCandidateSelect: [],
            onPanelShow: [],
            onPanelHide: []
        };
    }
}

// 创建单例实例
const candidatePanelState = new CandidatePanelStateManager();

export { candidatePanelState as default, CandidatePanelStateManager };
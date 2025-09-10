/**
 * @file inputInteraction.js
 * @description 输入框联动及预览逻辑
 */

import candidateDB from './candidateDB.js';
import candidatePanelState from './candidatePanelState.js';
import { createCandidatePanel, renderCandidatePanel, showCandidatePanel, hideCandidatePanel, bindPanelEvents, updatePanelActiveState, setPanelLoadingState } from './candidatePanel.js';
import { createInputPreviewContainer, showInputPreview, hideInputPreview, bindPreviewEvents, createEditablePreviewContainer, bindEditablePreviewEvents, calculatePreviewPosition } from './inputPreview.js';
import { createCandidate, sortCandidates } from './candidateType.js';

/**
 * 输入框候选项管理器
 */
class InputCandidateManager {
    constructor() {
        this.inputElements = new WeakMap(); // 存储已绑定的输入框和相关数据
        this.panel = null;
        this.previewContainer = null;
        this.isInitialized = false;
        this.currentInput = null;
        this.debounceTimer = null;
        this.candidates = [];
    }

    /**
     * 初始化管理器
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // 初始化数据库
            await candidateDB.init();
            
            // 创建UI组件
            this.createUIComponents();
            
            // 绑定状态管理事件
            this.bindStateEvents();
            
            // 加载候选项数据
            await this.loadCandidates();
            
            this.isInitialized = true;
            console.log('InputCandidateManager: 初始化完成');
        } catch (error) {
            console.error('InputCandidateManager: 初始化失败', error);
        }
    }

    /**
     * 创建UI组件
     */
    createUIComponents() {
        // 创建候选项面板
        this.panel = createCandidatePanel();
        this.panel.style.position = 'fixed';
        this.panel.style.zIndex = '10002';
        document.body.appendChild(this.panel);

        // 创建预览容器
        this.previewContainer = createInputPreviewContainer();
        this.previewContainer.style.position = 'fixed';
        this.previewContainer.style.zIndex = '10001';
        document.body.appendChild(this.previewContainer);

        // 绑定面板事件
        bindPanelEvents(this.panel, {
            onClose: () => this.hidePanel(),
            onHelp: () => this.showHelp()
        });

        // 绑定预览事件
        bindPreviewEvents(this.previewContainer, {
            onSend: (text) => this.sendMessage(text),
            onEdit: (text) => this.editPreview(text),
            onClose: () => this.hidePreview()
        });
    }

    /**
     * 绑定状态管理事件
     */
    bindStateEvents() {
        candidatePanelState.on('onStateChange', (state) => {
            this.onStateChange(state);
        });

        candidatePanelState.on('onCandidateSelect', (candidate) => {
            this.onCandidateSelect(candidate);
        });

        candidatePanelState.on('onPanelShow', () => {
            this.renderPanelContent();
        });

        candidatePanelState.on('onPanelHide', () => {
            hideCandidatePanel(this.panel);
        });
    }

    /**
     * 加载候选项数据
     */
    async loadCandidates() {
        try {
            this.candidates = await candidateDB.getCandidates();
            this.candidates.sort(sortCandidates);
            console.log(`InputCandidateManager: 已加载 ${this.candidates.length} 个候选项`);
        } catch (error) {
            console.error('InputCandidateManager: 加载候选项失败', error);
            this.candidates = [];
        }
    }

    /**
     * 绑定输入框事件
     * @param {HTMLElement} inputEl - 输入框元素
     * @param {Object} options - 配置选项
     */
    bindInputEvents(inputEl, options = {}) {
        if (!inputEl || this.inputElements.has(inputEl)) {
            return; // 已绑定或无效元素
        }

        const config = {
            triggerOnFocus: true,
            triggerOnInput: true,
            minLength: 1,
            debounceDelay: 300,
            autoComplete: true,
            customSender: null, // 自定义发送函数
            ...options
        };

        // 存储配置
        this.inputElements.set(inputEl, config);

        // 绑定事件
        if (config.triggerOnFocus) {
            inputEl.addEventListener('focus', (e) => this.onInputFocus(e, inputEl));
        }

        if (config.triggerOnInput) {
            inputEl.addEventListener('input', (e) => this.onInputChange(e, inputEl));
        }

        inputEl.addEventListener('blur', (e) => this.onInputBlur(e, inputEl));
        inputEl.addEventListener('keydown', (e) => this.onInputKeyDown(e, inputEl));

        console.log('InputCandidateManager: 已绑定输入框', inputEl);
    }

    /**
     * 解绑输入框事件
     * @param {HTMLElement} inputEl - 输入框元素
     */
    unbindInputEvents(inputEl) {
        if (this.inputElements.has(inputEl)) {
            this.inputElements.delete(inputEl);
            console.log('InputCandidateManager: 已解绑输入框', inputEl);
        }
    }

    /**
     * 输入框获得焦点事件
     * @param {Event} e - 事件对象
     * @param {HTMLElement} inputEl - 输入框元素
     */
    async onInputFocus(e, inputEl) {
        await this.init();
        this.currentInput = inputEl;
        
        const text = inputEl.value.trim();
        if (text.length > 0) {
            this.showCandidatesForInput(inputEl, text);
        }
    }

    /**
     * 输入框内容变化事件
     * @param {Event} e - 事件对象
     * @param {HTMLElement} inputEl - 输入框元素
     */
    onInputChange(e, inputEl) {
        const config = this.inputElements.get(inputEl);
        if (!config) return;

        // 防抖处理
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            const text = inputEl.value.trim();
            if (text.length >= config.minLength) {
                this.showCandidatesForInput(inputEl, text);
            } else {
                this.hidePanel();
            }
        }, config.debounceDelay);
    }

    /**
     * 输入框失去焦点事件
     * @param {Event} e - 事件对象
     * @param {HTMLElement} inputEl - 输入框元素
     */
    onInputBlur(e, inputEl) {
        // 延迟隐藏面板，给用户时间点击候选项
        setTimeout(() => {
            if (!this.panel.contains(document.activeElement) && 
                !this.previewContainer.contains(document.activeElement)) {
                this.hidePanel();
                this.hidePreview();
            }
        }, 150);
    }

    /**
     * 输入框键盘事件
     * @param {Event} e - 事件对象
     * @param {HTMLElement} inputEl - 输入框元素
     */
    onInputKeyDown(e, inputEl) {
        // 如果面板可见，某些按键由状态管理器处理
        if (candidatePanelState.getPanelState().isVisible) {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'Tab':
                case 'Enter':
                case 'Escape':
                    // 这些按键由状态管理器的键盘事件处理
                    return;
            }
        }
    }

    /**
     * 为输入框显示候选项
     * @param {HTMLElement} inputEl - 输入框元素
     * @param {string} text - 输入文本
     */
    async showCandidatesForInput(inputEl, text) {
        this.currentInput = inputEl;
        
        // 设置加载状态
        setPanelLoadingState(this.panel, true);
        showCandidatePanel(this.panel, null, inputEl);
        
        // 更新候选项状态
        candidatePanelState.setCandidates(this.candidates, text);
        candidatePanelState.showPanel(this.calculatePanelPosition(inputEl));
    }

    /**
     * 状态变化处理
     * @param {Object} state - 状态对象
     */
    onStateChange(state) {
        const { panel, preview } = state;
        
        if (panel.isVisible) {
            this.renderPanelContent();
            updatePanelActiveState(this.panel, panel.activeIndex);
        }

        if (preview.isVisible && preview.text) {
            this.showPreviewForInput(preview.text, preview.selectedCandidate);
        } else {
            hideInputPreview(this.previewContainer);
        }
    }

    /**
     * 候选项选择处理
     * @param {CandidateItem} candidate - 选中的候选项
     */
    async onCandidateSelect(candidate) {
        try {
            // 增加使用次数
            await candidateDB.incrementUseCount(candidate.id);
            
            // 重新加载候选项以更新排序
            await this.loadCandidates();
            
            // 隐藏面板
            this.hidePanel();
            
            console.log('InputCandidateManager: 候选项已选择', candidate.text);
        } catch (error) {
            console.error('InputCandidateManager: 选择候选项时出错', error);
        }
    }

    /**
     * 渲染面板内容
     */
    renderPanelContent() {
        const panelState = candidatePanelState.getPanelState();
        
        renderCandidatePanel(
            this.panel, 
            panelState.candidates, 
            panelState.activeIndex,
            {
                filterText: panelState.filterText,
                showAddOption: true
            },
            {
                onCandidateSelect: (candidate) => {
                    candidatePanelState.selectActiveCandidate();
                },
                onCandidateHover: (index) => {
                    candidatePanelState.setActiveIndex(index);
                },
                onAddCandidate: (text) => {
                    this.addNewCandidate(text);
                }
            }
        );
        
        setPanelLoadingState(this.panel, false);
    }

    /**
     * 显示预览
     * @param {string} text - 预览文本
     * @param {CandidateItem} candidate - 候选项
     */
    showPreviewForInput(text, candidate) {
        if (!this.currentInput) return;
        
        const position = calculatePreviewPosition(this.currentInput, this.previewContainer);
        showInputPreview(this.previewContainer, text, candidate, position);
    }

    /**
     * 添加新候选项
     * @param {string} text - 候选项文本
     */
    async addNewCandidate(text) {
        try {
            const candidate = createCandidate(text);
            await candidateDB.addCandidate(candidate);
            await this.loadCandidates();
            
            // 选择新添加的候选项
            candidatePanelState.selectActiveCandidate();
            
            console.log('InputCandidateManager: 新候选项已添加', text);
        } catch (error) {
            console.error('InputCandidateManager: 添加候选项失败', error);
        }
    }

    /**
     * 发送消息
     * @param {string} text - 消息内容
     */
    async sendMessage(text) {
        if (!this.currentInput || !text.trim()) return;

        const config = this.inputElements.get(this.currentInput);
        
        try {
            if (config?.customSender) {
                // 使用自定义发送函数
                await config.customSender(text, this.currentInput);
            } else {
                // 默认发送逻辑：填充输入框并触发发送
                this.replaceInputWithPreview(this.currentInput, text);
                this.simulateSend(this.currentInput);
            }
            
            this.hidePreview();
            this.hidePanel();
            
            console.log('InputCandidateManager: 消息已发送', text);
        } catch (error) {
            console.error('InputCandidateManager: 发送消息失败', error);
        }
    }

    /**
     * 编辑预览
     * @param {string} text - 当前文本
     */
    editPreview(text) {
        const editContainer = createEditablePreviewContainer(text);
        editContainer.style.position = 'fixed';
        editContainer.style.zIndex = '10003';
        
        // 计算位置
        const previewRect = this.previewContainer.getBoundingClientRect();
        editContainer.style.left = previewRect.left + 'px';
        editContainer.style.top = previewRect.top + 'px';
        
        document.body.appendChild(editContainer);
        
        bindEditablePreviewEvents(editContainer, {
            onConfirm: (newText) => {
                candidatePanelState.setPreviewText(newText);
                document.body.removeChild(editContainer);
            },
            onCancel: () => {
                document.body.removeChild(editContainer);
            }
        });
    }

    /**
     * 替换输入框内容为预览内容
     * @param {HTMLElement} inputEl - 输入框元素
     * @param {string} previewText - 预览文本
     */
    replaceInputWithPreview(inputEl, previewText) {
        inputEl.value = previewText;
        inputEl.focus();
        
        // 触发输入事件
        const inputEvent = new Event('input', { bubbles: true });
        inputEl.dispatchEvent(inputEvent);
    }

    /**
     * 模拟发送操作
     * @param {HTMLElement} inputEl - 输入框元素
     */
    simulateSend(inputEl) {
        // 查找发送按钮
        const sendButton = this.findSendButton(inputEl);
        if (sendButton) {
            sendButton.click();
        } else {
            // 模拟按Enter键
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                keyCode: 13,
                bubbles: true
            });
            inputEl.dispatchEvent(enterEvent);
        }
    }

    /**
     * 查找发送按钮
     * @param {HTMLElement} inputEl - 输入框元素
     * @returns {HTMLElement|null} - 发送按钮元素
     */
    findSendButton(inputEl) {
        const container = inputEl.closest('form') || inputEl.parentElement;
        if (!container) return null;
        
        // 常见的发送按钮选择器
        const selectors = [
            'button[type="submit"]',
            '.send-button',
            '.submit-button',
            'button:contains("发送")',
            'button:contains("Send")'
        ];
        
        for (const selector of selectors) {
            const button = container.querySelector(selector);
            if (button) return button;
        }
        
        return null;
    }

    /**
     * 计算面板位置
     * @param {HTMLElement} inputEl - 输入框元素
     * @returns {Object} - 位置坐标
     */
    calculatePanelPosition(inputEl) {
        const rect = inputEl.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.bottom + 8
        };
    }

    /**
     * 隐藏面板
     */
    hidePanel() {
        candidatePanelState.hidePanel();
    }

    /**
     * 隐藏预览
     */
    hidePreview() {
        candidatePanelState.clearPreview();
    }

    /**
     * 显示帮助
     */
    showHelp() {
        console.log('InputCandidateManager: 键盘导航帮助');
        // 这里可以实现帮助弹窗
    }

    /**
     * 销毁管理器
     */
    destroy() {
        if (this.panel) {
            document.body.removeChild(this.panel);
        }
        if (this.previewContainer) {
            document.body.removeChild(this.previewContainer);
        }
        
        candidatePanelState.destroy();
        this.inputElements = new WeakMap();
        this.isInitialized = false;
    }
}

// 创建单例实例
const inputCandidateManager = new InputCandidateManager();

export { inputCandidateManager as default, InputCandidateManager };

// 便利方法导出
export const bindInputEvents = (inputEl, options) => inputCandidateManager.bindInputEvents(inputEl, options);
export const unbindInputEvents = (inputEl) => inputCandidateManager.unbindInputEvents(inputEl);
export const replaceInputWithPreview = (inputEl, previewText) => inputCandidateManager.replaceInputWithPreview(inputEl, previewText);
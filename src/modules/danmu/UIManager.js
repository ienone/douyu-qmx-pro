/**
 * =================================================================================
 * 斗鱼弹幕助手 - UI管理器
 * ---------------------------------------------------------------------------------
 * 统一管理所有UI组件，协调候选项弹窗和输入框交互
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';
import { Utils } from '../../utils/utils.js';
import { CandidatePanel } from '../../ui/danmu/candidatePanel.js';
import { InputInteraction } from '../../ui/danmu/inputInteraction.js';
import { CandidatePanelState } from '../../ui/danmu/candidatePanelState.js';
import { CapsulePreview } from '../../ui/danmu/capsulePreview.js';


/**
 * UI管理器
 */
export const UIManager = {
    
    // 初始化状态
    initialized: false,
    
    // 当前状态
    currentState: 'idle',
    
    // 当前目标输入框
    currentTargetInput: null,
    
    // 当前候选项列表
    currentSuggestions: [],
    
    // 当前活跃索引
    activeIndex: 0,
    
    // 是否处于选择模式
    isSelectionModeActive: false,
    
    /**
     * 初始化UI管理器
     */
    async init() {
        if (this.initialized) {
            return true;
        }
        
        try {
            // 初始化各个组件
            CandidatePanel.init();
            InputInteraction.init();
            CapsulePreview.init(); // 初始化悬浮框预览
            
            // 绑定组件间的事件通信
            this.bindComponentEvents();
            
            this.initialized = true;
            Utils.log('UI管理器初始化成功');
            return true;
        } catch (error) {
            Utils.log(`UI管理器初始化失败: ${error.message}`, 'error');
            return false;
        }
    },
    /**
     * 显示候选项弹窗
     * @param {Array} suggestions - 候选项列表
     * @param {HTMLElement} targetInput - 目标输入框
     */
    showPopup(suggestions, targetInput) {
        if (!this.initialized) {
            Utils.log('UIManager未初始化', 'warn');
            return;
        }
        
        this.currentSuggestions = suggestions || [];
        this.currentTargetInput = targetInput;
        // 在普通输入模式下不设置活跃索引，只有进入选择模式时才设置
        this.activeIndex = -1;
        
        if (this.currentSuggestions.length === 0) {
            this.hidePopup();
            return;
        }
        
        // 立即设置状态为 showing，避免竞态条件
        this.currentState = 'showing';
        
        // 设置候选项面板状态
        CandidatePanelState.setCandidates(this.currentSuggestions);
        CandidatePanelState.setTargetInput(targetInput);
        CandidatePanelState.resetSelection();
        
        // 检查是否为聊天输入框，使用不同的显示方式
        const isChatInput = targetInput && targetInput.closest('.ChatSend');
        
        if (isChatInput) {
            // 为聊天输入框显示横向胶囊候选列表
            this.showChatCandidateList(this.currentSuggestions, targetInput);
        } else {
            // 渲染候选项弹窗
            CandidatePanel.renderCandidatePanel(this.currentSuggestions, this.activeIndex);
            // 显示弹窗
            CandidatePanel.showPanel(targetInput);
        }
        
        // 绑定输入框交互事件
        if (targetInput) {
            InputInteraction.bindInputEvents(targetInput);
        }
        
        // 延迟设置为 selecting 状态，确保弹窗完全显示
        setTimeout(() => {
            if (this.currentState === 'showing') {
                this.currentState = 'selecting';
            }
        }, 100);
        
        Utils.log(`弹窗已显示，包含 ${this.currentSuggestions.length} 个候选项`);
    },
    
    /**
     * 为聊天输入框显示横向胶囊候选列表
     * @param {Array} suggestions - 候选项列表
     * @param {HTMLElement} targetInput - 目标输入框
     * @param {boolean} multiRow - 是否启用多行模式
     */
    showChatCandidateList(suggestions, targetInput, multiRow = false) {
        // 首先设置CSS变量，确保样式与配置同步
        const capsuleConfig = SETTINGS.capsule;

        
        document.documentElement.style.setProperty('--ddp-capsule-item-height', `${capsuleConfig.height}px`); // 24px
        document.documentElement.style.setProperty('--ddp-capsule-padding', '8px'); // 容器上下padding 8px (原值)
        document.documentElement.style.setProperty('--ddp-capsule-margin', '8px'); // margin 8px (会计入测量高度)
        document.documentElement.style.setProperty('--ddp-capsule-item-padding', '3px'); // 胶囊内padding 3px (原值)
        
        Utils.log(`CSS变量已设置 (margin会计入高度):`);
        Utils.log(`--ddp-capsule-item-height: 24px (胶囊高度)`);
        Utils.log(`--ddp-capsule-padding: 8px (容器padding，计入高度)`);
        Utils.log(`--ddp-capsule-margin: 8px (容器margin，计入高度)`);
        Utils.log(`--ddp-capsule-item-padding: 3px (胶囊内padding)`);
        Utils.log(`预期测量高度: 24px + 3*2 + 8*2 + 8*2 = 62px (margin计入高度)`);
        
        // 查找 Chat 容器（正确的父级容器）
        const chat = document.querySelector('.layout-Player-chat .Chat');
        if (!chat) {
            Utils.log('未找到 Chat 容器，回退到普通弹窗模式');
            CandidatePanel.renderCandidatePanel(suggestions, this.activeIndex);
            CandidatePanel.showPanel(targetInput);
            return;
        }

        // --- 新增：每次显示前重置 paddingBottom，防止累加 ---
        chat.style.paddingBottom = '';

        // 立即应用CSS布局修复，确保输入框定位生效
        this.applyChatLayoutFix();
        
        // 移除可能存在的旧候选列表
        const existingList = document.querySelector('.ddp-candidate-capsules');
        if (existingList) {
            // 清理动态样式
            if (existingList._dynamicStyle) {
                existingList._dynamicStyle.remove();
            }
            existingList.remove();
        }
        
        // 创建候选列表容器
        const candidateList = document.createElement('div');
        candidateList.className = `ddp-candidate-capsules ${multiRow ? 'multi-row' : ''}`;
        
        // 根据模式决定显示的候选项数量
        const maxItems = multiRow ? 
            suggestions.length : // 多行模式显示所有
            Math.min(suggestions.length, SETTINGS?.capsule?.singleRowMaxItems || 8); // 单行模式限制数量
        
        const displaySuggestions = suggestions.slice(0, maxItems);
        
        // 添加候选项胶囊
        displaySuggestions.forEach((suggestion, index) => {
            const capsule = document.createElement('div');
            capsule.className = `ddp-candidate-capsule ${index === this.activeIndex ? 'active' : ''}`;
            capsule.dataset.index = index;
            
            const text = suggestion.getDisplayText ? suggestion.getDisplayText() : suggestion.text;
            
            // 简化胶囊内容 - 统一处理，不再区分显示模式
            capsule.textContent = text;
            // 移除原生 title 设置，避免双重预览
            // capsule.title = text; // 注释掉这行
            
            // 添加悬浮框预览事件
            this.bindCapsulePreviewEvents(capsule, suggestion, text);
            
            // 添加点击事件
            capsule.addEventListener('click', () => {
                this.selectCandidate(suggestion);
            });
            
            candidateList.appendChild(capsule);
        });
        
        // 将候选列表插入到 ChatToolBar 之后、ChatSpeak 之前
        // 这样 ChatToolBar 保持在顶部，ChatSpeak（输入框）保持在底部不动
        const chatSpeak = chat.querySelector('.ChatSpeak');
        if (chatSpeak) {
            chatSpeak.parentNode.insertBefore(candidateList, chatSpeak);
        } else {
            chat.appendChild(candidateList);
        }

        // 更新布局以适应候选框高度
        this.updateChatLayoutForCandidates(candidateList);
        
        // 存储当前模式状态
        this.currentCandidateMode = multiRow ? 'multi-row' : 'single-row';
        
        Utils.log(`胶囊候选列表已显示 (${this.currentCandidateMode})，包含 ${displaySuggestions.length}/${suggestions.length} 个候选项，布局已调整`);
        Utils.log(`DOM结构: Chat > [ChatToolBar, ddp-candidate-capsules, ChatSpeak]`);
    },
    
    /**
     * 隐藏候选项弹窗
     */
    hidePopup() {
        if (!this.initialized) return;
        
        // 强制显示调用栈追踪
        console.log('=== HIDEOPOPUP 被调用 ===');
        console.log(`当前状态: ${this.currentState}`);
        console.log('完整调用栈:');
        console.trace('hidePopup调用追踪');
        
        Utils.log(`隐藏弹窗，当前状态: ${this.currentState}`);
        
        // 隐藏悬浮框预览 - 强制隐藏所有类型的预览
        CapsulePreview.hidePreview(0, 'keyboard');
        CapsulePreview.hidePreview(0, 'mouse');
        
        CandidatePanel.hidePanel();
        
        // 清理聊天胶囊列表和布局恢复
        const existingList = document.querySelector('.ddp-candidate-capsules');
        if (existingList) {
            // 清理动态样式
            if (existingList._dynamicStyle) {
                existingList._dynamicStyle.remove();
            }
            existingList.remove();
        }

        // 恢复聊天布局（移除CSS类）
        this.removeChatLayoutFix();
        
        // 重置状态
        this.currentSuggestions = [];
        this.currentTargetInput = null;
        this.activeIndex = -1;
        this.currentState = 'idle';
        this.currentCandidateMode = null;
        
        Utils.log('弹窗已隐藏，布局已恢复');
    },
    
    /**
     * 应用聊天布局修复 - 只用CSS类控制，避免内联样式冲突
     */
    applyChatLayoutFix() {
        Utils.log('=== 应用CSS布局修复 ===');
        
        const chatArea = document.querySelector('.layout-Player-chat');
        
        if (!chatArea) {
            Utils.log('未找到聊天区域，跳过布局修复');
            return;
        }
        
        // 只添加CSS类，让CSS样式控制一切
        chatArea.classList.add('ddp-candidates-visible');
        
        Utils.log('已添加 ddp-candidates-visible 类，CSS样式将控制布局');
        Utils.log('=== CSS布局修复完成 ===');
    },


    /**
     * 更新聊天布局以适应候选框高度
     * @param {HTMLElement} candidateList - 候选列表元素
     */
    updateChatLayoutForCandidates(candidateList) {
        const chat = document.querySelector('.layout-Player-chat .Chat');
        if (!chat || !candidateList) {
            Utils.log('缺少必要元素，跳过padding更新');
            return;
        }

        // --- 新增：每次更新前重置 paddingBottom，防止累加 ---
        chat.style.paddingBottom = '';

        // 记录调试信息
        const beforeHeight = chat.getBoundingClientRect().height;
        const currentPadding = getComputedStyle(chat).paddingBottom;
        const initialPaddingValue = parseFloat(currentPadding) || 0;
        
        Utils.log(`=== 更新候选框布局开始 ===`);
        Utils.log(`Chat当前高度: ${beforeHeight}px`);
        Utils.log(`Chat初始paddingBottom: ${initialPaddingValue}px (必须保留)`);
        
        // 使用配置的精确高度值
        const configuredHeight = SETTINGS.capsule.totalHeight;

        // 获取 margin 值（上下合计）
        const marginTop = parseFloat(getComputedStyle(candidateList).marginTop) || 0;
        const marginBottom = parseFloat(getComputedStyle(candidateList).marginBottom) || 0;
        const totalMargin = marginTop + marginBottom;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 获取实际渲染高度进行验证
                const actualHeight = Math.round(candidateList.getBoundingClientRect().height);

                // 计算候选区总高度（内容高度 + margin）
                const candidateHeightWithMargin = actualHeight + totalMargin;

                // 决定候选项实际需要的高度
                const heightDifference = Math.abs(candidateHeightWithMargin - configuredHeight);
                const candidateHeight = heightDifference <= 2 ? configuredHeight : candidateHeightWithMargin;

                // 核心修复：最终的padding = 初始padding + 候选项高度（含margin）
                const finalPadding =  initialPaddingValue + candidateHeight;

                // “拉”力：向上移动的距离应该精确等于为候选项腾出的空间
                document.documentElement.style.setProperty('--ddp-candidate-height', `${candidateHeight}px`);
                
                // “推”力：设置能容纳“候选项+初始间距”的总padding
                chat.style.paddingBottom = `${finalPadding}px`;
                
                // --- 日志验证 ---
                const afterHeight = chat.getBoundingClientRect().height;
                const actualPaddingBottom = getComputedStyle(chat).paddingBottom;
                const heightIncrease = afterHeight - beforeHeight;
                
                Utils.log(`候选项所需高度(含margin): ${candidateHeight}px`);
                Utils.log(`最终设置padding: ${finalPadding}px (初始${initialPaddingValue}px + 候选项${candidateHeight}px)`);
                Utils.log(`transform向上移动距离: ${candidateHeight}px`);
                Utils.log(`实际应用padding: ${actualPaddingBottom}`);
                Utils.log(`Chat更新后高度: ${afterHeight}px`);
                Utils.log(`实际高度增加: ${heightIncrease}px (应约等于${candidateHeight}px)`);
                Utils.log(`=== 候选框布局更新完成 ===`);
            });
        });
    },
    
    /**
     * 移除聊天布局修复 - 恢复原始布局
     */
    removeChatLayoutFix() {
        Utils.log('=== 移除CSS布局修复 ===');
        
        const chatArea = document.querySelector('.layout-Player-chat');
        const chat = chatArea ? chatArea.querySelector('.Chat') : null;
        
        if (!chatArea) {
            Utils.log('未找到聊天区域，跳过布局恢复');
            return;
        }
        
        // 移除CSS类，让元素恢复原始布局
        chatArea.classList.remove('ddp-candidates-visible');
        
        // 清除所有相关CSS变量
        document.documentElement.style.removeProperty('--ddp-candidate-height');
        document.documentElement.style.removeProperty('--ddp-capsule-item-height');
        document.documentElement.style.removeProperty('--ddp-capsule-padding');
        document.documentElement.style.removeProperty('--ddp-capsule-margin');
        document.documentElement.style.removeProperty('--ddp-capsule-total-height');
        document.documentElement.style.removeProperty('--ddp-capsule-item-padding');
        
        // 重置padding为空字符串，恢复CSS默认值
        if (chat) {
            chat.style.paddingBottom = '';
        }
        
        Utils.log('已移除 ddp-candidates-visible 类，清理所有CSS变量和padding，布局已恢复');
        Utils.log('=== CSS布局恢复完成 ===');
    },
    
    /**
     * 设置活跃候选项索引
     * @param {number} index - 新的活跃索引
     */
    setActiveIndex(index) {
        if (!this.initialized || 
            index < 0 || 
            index >= this.currentSuggestions.length) {
            return;
        }
        
        const oldIndex = this.activeIndex;
        this.activeIndex = index;
        
        // 检查是否为聊天输入框模式
        const isChatInput = this.currentTargetInput && this.currentTargetInput.closest('.ChatSend');
        
        if (isChatInput) {
            // 更新胶囊样式
            this.updateChatCandidateStyles(oldIndex, index);
        } else {
            // 普通弹窗模式
            CandidatePanel.setActiveIndex(index);
            CandidatePanelState.setActiveByMouse(index);
        }
    },
    
    /**
     * 更新聊天候选胶囊样式
     * @param {number} oldIndex - 旧的活跃索引
     * @param {number} newIndex - 新的活跃索引
     */
    updateChatCandidateStyles(oldIndex, newIndex) {
        const candidateList = document.querySelector('.ddp-candidate-capsules');
        if (!candidateList) return;
        
        Utils.log(`=== 更新胶囊样式 ===`);
        Utils.log(`从索引 ${oldIndex} 切换到索引 ${newIndex}`);
        
        // 重置旧的活跃项
        if (oldIndex >= 0) {
            const oldCapsule = candidateList.querySelector(`[data-index="${oldIndex}"]`);
            if (oldCapsule) {
                oldCapsule.classList.remove('active');
                Utils.log(`已移除旧胶囊 ${oldIndex} 的活跃状态`);
            }
        }
        
        // 设置新的活跃项
        const newCapsule = candidateList.querySelector(`[data-index="${newIndex}"]`);
        if (newCapsule) {
            newCapsule.classList.add('active');
            Utils.log(`已设置新胶囊 ${newIndex} 为活跃状态`);
            
            // 先处理滚动，确保胶囊可见，然后再显示预览框
            if (!candidateList.classList.contains('multi-row')) {
                this.scrollCapsuleIntoView(candidateList, newCapsule);
                
                // 等待滚动完成后再显示预览框
                setTimeout(() => {
                    this.showPreviewForCapsule(newCapsule, newIndex);
                }, 400 );
            } else {
                newCapsule.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'center' 
                });
                
                // 等待滚动完成后再显示预览框
                setTimeout(() => {
                    this.showPreviewForCapsule(newCapsule, newIndex);
                }, 150);
            }
        } else {
            // 如果没有找到新的胶囊，隐藏预览
            Utils.log(`未找到索引为 ${newIndex} 的胶囊元素，隐藏预览框`);
            CapsulePreview.hidePreview(0, 'keyboard');
        }
        
        Utils.log(`=== 胶囊样式更新完成 ===`);
    },
    
    /**
     * 在单行模式下将胶囊滚动到可见区域
     * @param {HTMLElement} candidateList - 候选列表容器
     * @param {HTMLElement} capsule - 要滚动到的胶囊元素
     */
    scrollCapsuleIntoView(candidateList, capsule) {
        if (!candidateList || !capsule) {
            Utils.log('scrollCapsuleIntoView: 缺少必要元素');
            return;
        }
        
        try {
            const listRect = candidateList.getBoundingClientRect();
            const capsuleRect = capsule.getBoundingClientRect();
            const scrollLeft = candidateList.scrollLeft;
            
            // 计算胶囊相对于容器的位置
            const capsuleRelativeLeft = capsule.offsetLeft;
            const capsuleWidth = capsule.offsetWidth;
            const listWidth = candidateList.offsetWidth;
            const capsuleIndex = parseInt(capsule.dataset.index) || 0;
            
            Utils.log(`滚动检查: 胶囊索引=${capsuleIndex}, 位置=${capsuleRelativeLeft}px, 宽度=${capsuleWidth}px, 容器宽度=${listWidth}px, 当前滚动=${scrollLeft}px`);
            
            // 检查是否为循环导航（从最后回到第一个，或从第一个到最后）
            const isCircularNavigation = (capsuleIndex === 0 && scrollLeft > listWidth) || 
                                       (capsuleIndex === this.currentSuggestions.length - 1 && scrollLeft === 0);
                                       
            // 确定滚动行为：循环导航时使用瞬间跳转，避免错位
            const scrollBehavior = isCircularNavigation ? 'instant' : 'smooth';
            
            Utils.log(`循环导航检测: ${isCircularNavigation}, 滚动行为: ${scrollBehavior}`);
            
            // 如果胶囊在右侧不可见区域
            if (capsuleRelativeLeft + capsuleWidth > scrollLeft + listWidth) {
                const newScrollLeft = capsuleRelativeLeft + capsuleWidth - listWidth + 20;
                Utils.log(`向右滚动到: ${newScrollLeft}px`);
                candidateList.scrollTo({
                    left: newScrollLeft,
                    behavior: scrollBehavior
                });
            }
            // 如果胶囊在左侧不可见区域
            else if (capsuleRelativeLeft < scrollLeft) {
                const newScrollLeft = Math.max(0, capsuleRelativeLeft - 20);
                Utils.log(`向左滚动到: ${newScrollLeft}px`);
                candidateList.scrollTo({
                    left: newScrollLeft,
                    behavior: scrollBehavior
                });
            } else {
                Utils.log('胶囊已在可见区域，无需滚动');
            }
        } catch (error) {
            Utils.log(`滚动出错: ${error.message}`, 'error');
            console.error('scrollCapsuleIntoView error:', error);
        }
    },
    
    /**
     * 为胶囊绑定悬浮框预览事件
     * @param {HTMLElement} capsule - 胶囊元素
     * @param {Object} suggestion - 候选项数据
     * @param {string} text - 显示文本
     */
    bindCapsulePreviewEvents(capsule, suggestion, text) {
        // 彻底移除原生 title 属性，避免双重预览
        capsule.removeAttribute('title');
        
        // 确保不会再被意外设置
        Object.defineProperty(capsule, 'title', {
            set: function() {
                // 忽略任何设置 title 的尝试
                Utils.log('阻止设置title属性，避免双重预览');
            },
            get: function() {
                return '';
            },
            configurable: true
        });
        
        // 使用悬浮框预览组件
        CapsulePreview.bindCapsuleEvents(capsule, text);
    },
    
    /**
     * 为指定胶囊显示预览框（在滚动完成后调用）
     * @param {HTMLElement} capsule - 胶囊元素
     * @param {number} index - 胶囊索引
     */
    showPreviewForCapsule(capsule, index) {
        if (!capsule || index < 0 || index >= this.currentSuggestions.length) {
            Utils.log(`无法为胶囊显示预览: 胶囊=${!!capsule}, 索引=${index}, 总数=${this.currentSuggestions.length}`);
            return;
        }
        
        // 获取候选项文本
        const candidate = this.currentSuggestions[index];
        const text = candidate ? (candidate.getDisplayText ? candidate.getDisplayText() : candidate.text) : capsule.textContent;
        
        Utils.log(`胶囊文本: "${text}", 长度: ${text ? text.length : 0}`);
        
        // 获取胶囊当前位置（滚动后的位置）
        const capsuleRect = capsule.getBoundingClientRect();
        Utils.log(`滚动后胶囊位置: left=${capsuleRect.left}px, top=${capsuleRect.top}px, 可见=${capsuleRect.left >= 0 && capsuleRect.left < window.innerWidth}`);
        
        // 键盘导航时显示预览框
        if (text && text.length > 8) {
            Utils.log(`键盘选中胶囊，显示预览: ${text.substring(0, 20)}...`);
            CapsulePreview.showPreview(capsule, text, true, 'keyboard');
        } else {
            // 如果文本不符合条件，隐藏预览框
            Utils.log(`文本过短或不存在，隐藏预览框`);
            CapsulePreview.hidePreview(0, 'keyboard');
        }
    },

    /**
     * 导航到上一个候选项
     */
    navigateUp() {
        if (!this.initialized || this.currentSuggestions.length === 0) return;
        
        // 检查是否为聊天输入框模式
        const isChatInput = this.currentTargetInput && this.currentTargetInput.closest('.ChatSend');
        
        if (isChatInput) {
            // 对于聊天输入框，上键相当于左键
            this.navigateLeft();
        } else {
            // 确保进入选择模式
            if (!this.isSelectionModeActive) {
                this.setSelectionModeActive(true);
            }
            
            CandidatePanelState.navigateUp();
            const newIndex = CandidatePanelState.activeIndex;
            this.setActiveIndex(newIndex);
        }
    },
    
    /**
     * 导航到下一个候选项
     */
    navigateDown() {
        if (!this.initialized || this.currentSuggestions.length === 0) return;
        
        // 检查是否为聊天输入框模式
        const isChatInput = this.currentTargetInput && this.currentTargetInput.closest('.ChatSend');
        
        if (isChatInput) {
            // 对于聊天输入框，下键相当于右键
            this.navigateRight();
        } else {
            // 确保进入选择模式
            if (!this.isSelectionModeActive) {
                this.setSelectionModeActive(true);
            }
            
            CandidatePanelState.navigateDown();
            const newIndex = CandidatePanelState.activeIndex;
            this.setActiveIndex(newIndex);
        }
    },
    
    /**
     * 导航到左侧候选项
     */
    navigateLeft() {
        if (!this.initialized || this.currentSuggestions.length === 0) return;
        
        // 确保进入选择模式
        if (!this.isSelectionModeActive) {
            this.setSelectionModeActive(true);
        }
        
        let newIndex = this.activeIndex - 1;
        if (newIndex < 0) {
            newIndex = this.currentSuggestions.length - 1; // 循环到最后一个
        }
        this.setActiveIndex(newIndex);
    },
    
    /**
     * 导航到右侧候选项
     */
    navigateRight() {
        if (!this.initialized || this.currentSuggestions.length === 0) return;
        
        // 确保进入选择模式
        if (!this.isSelectionModeActive) {
            this.setSelectionModeActive(true);
        }
        
        let newIndex = this.activeIndex + 1;
        if (newIndex >= this.currentSuggestions.length) {
            newIndex = 0; // 循环到第一个
        }
        this.setActiveIndex(newIndex);
    },
    
    /**
     * 选择当前活跃的候选项
     */
    selectActiveCandidate() {
        if (!this.initialized || 
            this.activeIndex < 0 || 
            this.activeIndex >= this.currentSuggestions.length) {
            return;
        }
        
        const selectedCandidate = this.currentSuggestions[this.activeIndex];
        this.selectCandidate(selectedCandidate);
    },
    
    /**
     * 选择指定的候选项
     * @param {Object} candidate - 要选择的候选项
     */
    selectCandidate(candidate) {
        if (!candidate || !this.currentTargetInput) return;
        
        const text = candidate.getDisplayText ? 
            candidate.getDisplayText() : candidate.text;
            
        // 更新使用统计
        if (typeof candidate.updateUsage === 'function') {
            candidate.updateUsage();
        }
        
        // 直接替换输入框内容
        InputInteraction.replaceInputWithText(this.currentTargetInput, text);
        
        // 隐藏候选项弹窗
        this.hidePopup();
        
        // 重置状态为空闲
        this.currentState = 'idle';
        
        Utils.log(`候选项已选择并填入输入框: ${text}`);
    },
    
    /**
     * 检查弹窗是否可见
     * @returns {boolean} 是否可见
     */
    isPopupVisible() {
        // 检查胶囊列表是否可见
        const chatCandidateList = document.querySelector('.ddp-candidate-capsules');
        if (chatCandidateList && chatCandidateList.style.display !== 'none') {
            return true;
        }
        
        // 检查传统弹窗是否可见
        return this.initialized && CandidatePanel.isVisible();
    },
    
    /**
     * 清除活跃候选项索引和样式
     */
    clearActiveIndex() {
        this.activeIndex = -1;
        
        // 退出选择模式（这会自动隐藏预览框）
        if (this.isSelectionModeActive) {
            this.setSelectionModeActive(false);
        }
        
        // 清除所有候选项的活跃样式
        const chatCandidateList = document.querySelector('.ddp-candidate-capsules');
        if (chatCandidateList) {
            const capsules = chatCandidateList.querySelectorAll('.ddp-candidate-capsule');
            capsules.forEach(capsule => {
                capsule.classList.remove('active');
            });
        }
        
        // 清除传统弹窗中的活跃样式
        if (CandidatePanel.panelElement) {
            const items = CandidatePanel.panelElement.querySelectorAll('.dda-popup-item');
            items.forEach(item => {
                item.classList.remove('dda-popup-item-active');
            });
        }
    },
    
    /**
     * 设置选择模式状态
     * @param {boolean} active - 是否激活选择模式
     */
    setSelectionModeActive(active) {
        this.isSelectionModeActive = active;
        
        if (active) {
            // 进入选择模式
            CapsulePreview.enterSelectionMode();
            
            // 如果没有活跃索引，设置第一个为活跃
            if (this.activeIndex === -1 && this.currentSuggestions.length > 0) {
                this.setActiveIndex(0);
            }
        } else {
            // 退出选择模式
            CapsulePreview.exitSelectionMode();
            this.clearActiveIndex();
        }
        
        // 更新候选项容器的选择模式样式
        const chatCandidateList = document.querySelector('.ddp-candidate-capsules');
        if (chatCandidateList) {
            if (active) {
                chatCandidateList.classList.add('selection-mode-active');
            } else {
                chatCandidateList.classList.remove('selection-mode-active');
            }
        }
        
        // 更新传统弹窗的选择模式样式
        if (CandidatePanel.panelElement) {
            if (active) {
                CandidatePanel.panelElement.classList.add('selection-mode-active');
            } else {
                CandidatePanel.panelElement.classList.remove('selection-mode-active');
            }
        }
        
        Utils.log(`选择模式: ${active ? '激活' : '关闭'}`);
    },
    
    /**
     * 更新候选项列表
     * @param {Array} suggestions - 新的候选项列表
     */
    updateCandidates(suggestions) {
        this.currentSuggestions = suggestions;
        
        // 重新渲染候选项
        if (this.currentTargetInput) {
            const isChatInput = this.currentTargetInput.closest('.ChatSend');
            
            if (isChatInput) {
                this.showChatCandidateList(suggestions, this.currentTargetInput);
            } else {
                CandidatePanel.renderCandidatePanel(suggestions, this.activeIndex);
            }
        }
    },
    
    /**
     * 获取当前状态
     * @returns {string} 当前状态
     */
    getCurrentState() {
        return this.currentState;
    },
    
    /**
     * 绑定组件间事件通信
     */
    bindComponentEvents() {
        // 全局监控所有失焦事件
        document.addEventListener('blur', (event) => {
            if (event.target && event.target.matches && event.target.matches('input, textarea')) {
                console.log('🔍 全局检测到输入框失焦:', event.target.className, 'value:', event.target.value);
            }
        }, true);
        
        // 全局监控所有自定义事件
        const originalDispatchEvent = document.dispatchEvent;
        document.dispatchEvent = function(event) {
            if (event.type.includes('input') || event.type.includes('blur') || event.type.includes('focus')) {
                console.log('🎯 自定义事件被触发:', event.type, event.detail);
            }
            return originalDispatchEvent.call(this, event);
        };
        
        // 监听候选项选择事件
        document.addEventListener('candidateSelected', (event) => {
            const { candidate } = event.detail;
            this.selectCandidate(candidate);
        });
        
        // 监听候选项悬停事件
        document.addEventListener('candidateHovered', (event) => {
            const { index } = event.detail;
            this.setActiveIndex(index);
        });
        
        // 监听输入框焦点事件
        document.addEventListener('inputFocused', (event) => {
            const { inputEl } = event.detail;
            this.currentTargetInput = inputEl;
        });
        
        // 监听输入框失焦事件 - 完全禁用隐藏逻辑以测试
        document.addEventListener('inputBlurred', (event) => {
            Utils.log('=== 输入框失焦事件触发（已完全禁用隐藏逻辑） ===');
            // 完全禁用隐藏逻辑，看看是否还有其他地方调用 hidePopup
            return;
        });
        
        // 监听弹窗状态变化
        document.addEventListener('panelShown', () => {
            this.currentState = 'selecting';
        });
        
        document.addEventListener('panelHidden', () => {
            this.currentState = 'idle';
        });
    },
    
    /**
     * 销毁UI管理器
     */
    destroy() {
        if (!this.initialized) return;
        
        // 销毁组件
        CandidatePanel.destroy();
        InputInteraction.cleanup();
        CapsulePreview.destroy(); // 销毁悬浮框预览
        
        // 重置状态
        this.initialized = false;
        this.currentState = 'idle';
        this.currentTargetInput = null;
        this.currentSuggestions = [];
        this.activeIndex = 0;
        
        Utils.log('UI管理器已销毁');
    },
    
    /**
     * 计算候选列表高度
     * @param {Array} suggestions - 候选项列表
     * @returns {number} 计算出的高度
     */
    calculateCandidateListHeight(suggestions) {
        // 基础高度：容器padding + margin
        const baseHeight = 12; // 上下padding/margin
        
        // 单个胶囊高度（包括margin）
        const capsuleHeight = 32; // 高度 + margin
        
        // 计算行数（假设每行最多显示的胶囊数）
        const maxCapsulesPerRow = Math.floor(window.innerWidth * 0.6 / 120); // 每个胶囊约120px宽
        const rows = Math.ceil(suggestions.length / maxCapsulesPerRow);
        
        const calculatedHeight = baseHeight + (rows * capsuleHeight);
        
        Utils.log(`计算候选列表高度:`);
        Utils.log(`- 建议数量: ${suggestions.length}`);
        Utils.log(`- 窗口宽度: ${window.innerWidth}px`);
        Utils.log(`- 每行最大胶囊数: ${maxCapsulesPerRow}`);
        Utils.log(`- 计算行数: ${rows}`);
        Utils.log(`- 基础高度: ${baseHeight}px`);
        Utils.log(`- 胶囊高度: ${capsuleHeight}px`);
        Utils.log(`- 计算总高度: ${calculatedHeight}px`);
        
        return calculatedHeight;
    },

    calculateCandidateListHeight(suggestions) {
        // 基础高度：容器padding + margin
        const baseHeight = 12; // 上下padding/margin
        
        // 单个胶囊高度（包括margin）
        const capsuleHeight = 32; // 高度 + margin
        
        // 计算行数（假设每行最多显示的胶囊数）
        const maxCapsulesPerRow = Math.floor(window.innerWidth * 0.6 / 120); // 每个胶囊约120px宽
        const rows = Math.ceil(suggestions.length / maxCapsulesPerRow);
        
        const calculatedHeight = baseHeight + (rows * capsuleHeight);
        
        Utils.log(`计算候选列表高度:`);
        Utils.log(`- 建议数量: ${suggestions.length}`);
        Utils.log(`- 窗口宽度: ${window.innerWidth}px`);
        Utils.log(`- 每行最大胶囊数: ${maxCapsulesPerRow}`);
        Utils.log(`- 计算行数: ${rows}`);
        Utils.log(`- 基础高度: ${baseHeight}px`);
        Utils.log(`- 胶囊高度: ${capsuleHeight}px`);
        Utils.log(`- 计算总高度: ${calculatedHeight}px`);
        
        return calculatedHeight;
    },
};

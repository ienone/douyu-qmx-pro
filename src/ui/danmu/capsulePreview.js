/**
 * =================================================================================
 * 斗鱼弹幕助手 - 胶囊悬浮框预览组件
 * ---------------------------------------------------------------------------------
 * 为胶囊候选项提供悬浮框预览功能
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';
import { Utils } from '../../utils/utils.js';

/**
 * 胶囊悬浮框预览组件
 */
export const CapsulePreview = {
    
    // 预览框元素
    previewElement: null,
    
    // 当前显示的胶囊
    currentCapsule: null,
    
    // 显示/隐藏定时器
    showTimer: null,
    hideTimer: null,
    
    // 当前预览的触发源（keyboard 或 mouse）
    currentTriggerSource: null,
    
    // 选择模式状态
    isInSelectionMode: false,
    
    // 是否已初始化
    initialized: false,
    
    /**
     * 进入选择模式 - 预览框将持续显示
     */
    enterSelectionMode() {
        this.isInSelectionMode = true;
        Utils.log('预览框进入选择模式，将持续显示');
    },
    
    /**
     * 退出选择模式 - 隐藏预览框
     */
    exitSelectionMode() {
        this.isInSelectionMode = false;
        this.hidePreview(0, 'keyboard');
        Utils.log('预览框退出选择模式');
    },
    
    /**
     * 更新选择模式下的预览内容
     * @param {HTMLElement} capsule - 新的活跃胶囊
     * @param {string} text - 新的预览文本
     */
    updateSelectionModePreview(capsule, text) {
        if (!this.isInSelectionMode || !capsule || !text) return;
        
        // 清除所有定时器
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // 更新当前胶囊和内容
        this.currentCapsule = capsule;
        this.currentTriggerSource = 'keyboard';
        
        // 立即更新内容和位置
        this.previewElement.textContent = text;
        this.previewElement.classList.add('active');
        this.positionPreview(capsule);
        
        // 确保预览框可见
        if (this.previewElement.style.display !== 'block') {
            this.previewElement.style.display = 'block';
            requestAnimationFrame(() => {
                this.previewElement.classList.add('show');
            });
        }
        
        Utils.log(`选择模式预览已更新: ${text.substring(0, 20)}...`);
    },

    /**
     * 初始化悬浮框预览
     */
    init() {
        if (this.initialized) return;
        
        this.createPreviewElement();
        this.bindGlobalEvents();
        this.initialized = true;
        
        Utils.log('胶囊悬浮框预览组件已初始化');
    },
    
    /**
     * 创建预览框DOM元素
     */
    createPreviewElement() {
        this.previewElement = document.createElement('div');
        this.previewElement.className = 'ddp-capsule-preview';
        this.previewElement.style.display = 'none';
        
        document.body.appendChild(this.previewElement);
        Utils.log('预览框 DOM 元素已创建'); // 确认 DOM 创建日志
    },
    
    /**
     * 显示预览框
     * @param {HTMLElement} capsule - 胶囊元素
     * @param {string} text - 预览文本
     * @param {boolean} isActive - 是否为活跃状态
     * @param {string} triggerSource - 触发源：'keyboard' 或 'mouse'
     */
    showPreview(capsule, text, isActive = false, triggerSource = 'mouse') {

        Utils.log(`调用 showPreview: 触发源=${triggerSource}, 文本=${text}`); // 确认调用日志

        if (!this.initialized || !text || text.length <= 15) {
            // 短文本不显示预览
            return;
        }
        
        // 如果当前是键盘触发的预览，鼠标事件不应该干扰
        if (this.currentTriggerSource === 'keyboard' && triggerSource === 'mouse') {
            Utils.log('键盘预览活跃中，忽略鼠标悬停事件');
            return;
        }
        
        // 清除隐藏定时器
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        const config = SETTINGS.capsule.preview;
        const delay = (triggerSource === 'keyboard') ? 0 : config.showDelay; // 键盘选中时立即显示
        
        // 统一的显示逻辑，不区分选择模式
        Utils.log(`显示预览框: 触发源=${triggerSource}, 文本=${text.substring(0, 20)}...`);
        
        this.showTimer = setTimeout(() => {
            this.currentCapsule = capsule;
            this.currentTriggerSource = triggerSource;
            this.previewElement.textContent = text;
            
            // 设置样式状态
            if (isActive || triggerSource === 'keyboard') {
                this.previewElement.classList.add('active');
            } else {
                this.previewElement.classList.remove('active');
            }
            
            // 定位预览框
            this.positionPreview(capsule);
            
            // 显示预览框
            this.previewElement.style.display = 'block';
            
            requestAnimationFrame(() => {
                this.previewElement.classList.add('show');
            });
            
            Utils.log(`悬浮框预览已显示 (${triggerSource}): ${text.substring(0, 20)}...`);
            
        }, delay);
    },
    
    /**
     * 隐藏预览框
     * @param {number} delay - 延迟时间（可选）
     * @param {string} triggerSource - 触发源：'keyboard' 或 'mouse'
     */
    hidePreview(delay = null, triggerSource = 'mouse') {
       
        // Utils.log(`调用 hidePreview: 触发源=${triggerSource}`);

        if (!this.initialized) return;
        
        // 如果当前是键盘触发的预览，只有键盘事件才能隐藏
        if (this.currentTriggerSource === 'keyboard' && triggerSource === 'mouse') {
            Utils.log('键盘预览活跃中，忽略鼠标离开事件');
            return;
        }
        
        // 清除显示定时器
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        const config = SETTINGS.capsule.preview;
        const hideDelay = delay !== null ? delay : config.hideDelay;
        
        // Utils.log(`隐藏预览框: 触发源=${triggerSource}, 延迟=${hideDelay}ms`);
        
        this.hideTimer = setTimeout(() => {
            this.previewElement.classList.remove('show');
            
            setTimeout(() => {
                this.previewElement.style.display = 'none';
                this.previewElement.classList.remove('active');
                this.previewElement.classList.remove('show-below'); // 清理位置类
                this.currentCapsule = null;
                this.currentTriggerSource = null; // 重置触发源
            }, config.animationDuration);
            
        }, hideDelay);
    },
    
    /**
     * 定位预览框 - 智能显示在胶囊上方，避免遮挡
     * @param {HTMLElement} capsule - 胶囊元素
     */
    positionPreview(capsule) {
        const capsuleRect = capsule.getBoundingClientRect();
        
        Utils.log(`=== 预览框定位(强制上方) ===`);
        Utils.log(`胶囊位置: top=${capsuleRect.top}px, left=${capsuleRect.left}px, width=${capsuleRect.width}px`);
        
        // 获取预览框的实际尺寸（先设置内容，测量尺寸）
        this.previewElement.style.visibility = 'hidden';
        this.previewElement.style.display = 'block';
        const previewRect = this.previewElement.getBoundingClientRect();
        const previewWidth = previewRect.width || 300; // 实际宽度或默认300px
        const previewHeight = previewRect.height || 40; // 实际高度或默认40px
        this.previewElement.style.visibility = '';
        
        Utils.log(`预览框尺寸: width=${previewWidth}px, height=${previewHeight}px`);
        
        // 水平居中对齐胶囊
        let left = capsuleRect.left + (capsuleRect.width / 2) - (previewWidth / 2);
        
        // 垂直位置：预览框始终显示在胶囊上方
        const verticalGap = 8; // 预览框与胶囊之间的间距
        let top = capsuleRect.top - previewHeight - verticalGap;
        // let showAbove = true; // 始终显示在上方              未使用变量
        
        Utils.log(`强制上方显示: top=${top}px (胶囊顶部${capsuleRect.top} - 预览框高度${previewHeight} - 间距${verticalGap})`);
        
        // 水平边界检查
        const windowWidth = window.innerWidth;
        const horizontalPadding = 10;
        
        if (left < horizontalPadding) {
            left = horizontalPadding;
        } else if (left + previewWidth > windowWidth - horizontalPadding) {
            left = windowWidth - previewWidth - horizontalPadding;
        }
        
        // 无垂直边界检查 - 始终显示在上方
        
        // 始终显示在上方，不需要切换箭头方向
        this.previewElement.classList.remove('show-below');
        
        // 应用位置
        this.previewElement.style.left = `${left}px`;
        this.previewElement.style.top = `${top}px`;
        
        Utils.log(`最终位置: left=${left}px, top=${top}px, 显示位置: 上方`);
        Utils.log(`=== 预览框定位完成 ===`);
    },
    
    /**
     * 更新预览框状态
     * @param {boolean} isActive - 是否为活跃状态
     */
    updateActiveState(isActive) {
        if (!this.initialized || !this.currentCapsule) return;
        
        if (isActive) {
            this.previewElement.classList.add('active');
        } else {
            this.previewElement.classList.remove('active');
        }
    },
    
    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听滚动事件，隐藏预览
        document.addEventListener('scroll', () => {
            this.hidePreview(0);
        }, true);
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            if (this.currentCapsule) {
                this.positionPreview(this.currentCapsule);
            }
        });
    },
    
    /**
     * 为胶囊绑定预览事件
     * @param {HTMLElement} capsule - 胶囊元素
     * @param {string} text - 预览文本
     */
    bindCapsuleEvents(capsule, text) {
        if (!capsule || !text) return;

        Utils.log(`绑定预览事件: ${text}`); // 确认事件绑定日志
        
        // 鼠标悬停显示
        capsule.addEventListener('mouseenter', () => {
            this.showPreview(capsule, text, false, 'mouse');
        });
        
        // 鼠标离开隐藏
        capsule.addEventListener('mouseleave', () => {
            this.hidePreview(null, 'mouse');
        });
    },
    
    /**
     * 销毁预览组件
     */
    destroy() {
        if (!this.initialized) return;
        
        if (this.showTimer) {
            clearTimeout(this.showTimer);
        }
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        
        if (this.previewElement && this.previewElement.parentNode) {
            this.previewElement.parentNode.removeChild(this.previewElement);
        }
        
        this.previewElement = null;
        this.currentCapsule = null;
        this.currentTriggerSource = null;
        this.isInSelectionMode = false;
        this.initialized = false;
        
        Utils.log('胶囊悬浮框预览组件已销毁');
    }
};

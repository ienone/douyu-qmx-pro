/**
 * @file FirstTimeNotice.js
 * @description 负责处理首次使用提示相关功能
 */

import { SettingsPanel } from './SettingsPanel.js';

/**
 * 首次使用提示模块
 */
export const FirstTimeNotice = {
    /**
     * 显示首次使用校准模式的提示
     * 仅在首次打开控制页面直播间时显示
     */
    showCalibrationNotice() {
        const NOTICE_SHOWN_KEY = 'douyu_qmx_calibration_notice_shown';
        const hasShownNotice = GM_getValue(NOTICE_SHOWN_KEY, false);
        
        if (!hasShownNotice) {
            const noticeHTML = `
                <div class="qmx-modal-header">
                    <h3>星推荐助手提示</h3>
                    <button id="qmx-notice-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <p>新增功能：控制面板现在会显示每个红包的具体奖励信息🎁</p>
                    <p>弹幕助手功能持续优化中😋，使用方法详见设置->弹幕助手</p>
                    <p>如需关闭弹幕助手，关闭'设置->基本设置->启用弹幕助手😋'即可</p>
                    <h4>项目地址<a href="https://github.com/ienone/douyu-qmx-pro" target="_blank" rel="noopener noreferrer">douyu-qmx-pro</a>，求个star🌟~~</h4>
                </div>
                <div class="qmx-modal-footer">
                    <button id="qmx-notice-settings-btn" class="qmx-modal-btn">前往设置</button>
                    <button id="qmx-notice-ok-btn" class="qmx-modal-btn primary">我知道了</button>
                </div>
            `;
                
            // 创建提示元素，复用模态框样式
            const noticeContainer = document.createElement('div');
            noticeContainer.id = 'qmx-notice-modal';
            noticeContainer.className = 'visible mode-centered';
            noticeContainer.innerHTML = noticeHTML;
            
            // 创建背景遮罩，复用已有样式
            const backdrop = document.createElement('div');
            backdrop.id = 'qmx-notice-backdrop';
            backdrop.className = 'visible';
            
            // 添加到页面
            document.body.appendChild(backdrop);
            document.body.appendChild(noticeContainer);
            
            // 绑定事件
            const closeNotice = () => {
                noticeContainer.classList.remove('visible');
                backdrop.classList.remove('visible');
                
                // 动画结束后移除元素
                setTimeout(() => {
                    noticeContainer.remove();
                    backdrop.remove();
                }, 300);
                
                GM_setValue(NOTICE_SHOWN_KEY, true);
            };
            
            document.getElementById('qmx-notice-close-btn').onclick = closeNotice;
            document.getElementById('qmx-notice-ok-btn').onclick = closeNotice;
            document.getElementById('qmx-notice-settings-btn').onclick = () => {
                closeNotice();
                SettingsPanel.show();
            };
        }
    }
};

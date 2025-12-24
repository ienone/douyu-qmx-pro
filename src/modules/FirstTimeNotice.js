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
                    <h3>⚠️ 重要更新提示</h3>
                    <button id="qmx-notice-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <h4 style="color: var(--accent-color, #ff6b6b); margin-top: 0;">斗鱼网页UI更新说明</h4>
                    <p>斗鱼已更新直播间界面，脚本正在适配中。目前基本功能可用，但请注意：</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>控制面板"替换排行榜"模式暂不可用</strong>，请使用"浮动窗口"或"屏幕居中"模式</li>
                        <li><strong>刚开始打开的几个工作标签页</strong>可能需要手动切换激活一下才能正常加载</li>
                        <li><strong>弹幕助手功能</strong>正在适配中，暂时可能无法使用</li>
                    </ul>
                    
                    <h4 style="color: var(--accent-color, #ff6b6b);">⚠️使用前必读</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>斗鱼Ex插件冲突</strong>：如需使用本脚本抢红包，请暂时关闭斗鱼Ex插件，否则红包会消失。后续会尝试沟通解决此问题</li>
                        <li><strong>浏览器DNS设置</strong>：请在浏览器设置中搜索"DNS"，将"使用安全的DNS"选项关闭，否则红包也会消失</li>
                    </ul>
                    
                    <h4 style="color: var(--status-color-success, #4CAF50);">✨ 新增功能</h4>
                    <p>控制面板现在会显示每个红包的具体奖励信息🎁</p>
                    <p>启用统计功能需要把"油猴管理面板->设置->安全->允许脚本访问 Cookie"改为ALL！！</p>
                    
                    <h4 style="margin-bottom: 5px;">⭐️点点star吧~</h4>
                    <p style="margin-top: 5px;">项目地址：<a href="https://github.com/ienone/douyu-qmx-pro" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color, #ff6b6b);">douyu-qmx-pro</a>，觉得好用请给个star🌟~~</p>
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

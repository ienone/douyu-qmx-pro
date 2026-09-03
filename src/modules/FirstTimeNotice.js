/**
 * @file FirstTimeNotice.js
 * @description 负责处理首次使用提示相关功能
 */

import { SettingsPanel } from './SettingsPanel.js';
import { GM_getValue, GM_setValue } from '$';

/**
 * 首次使用提示模块
 */
export const FirstTimeNotice = {
    /** 仅在首次打开控制室时显示一次。 */
    showFirstUseNotice() {
        const NOTICE_SHOWN_KEY = 'douyu_qmx_first_use_notice_v2_1_shown';
        const hasShownNotice = GM_getValue(NOTICE_SHOWN_KEY, false);
        
        if (!hasShownNotice) {
            const noticeHTML = `
                <div class="qmx-modal-header">
                    <h3>使用说明</h3>
                    <button id="qmx-notice-close-btn" class="qmx-modal-close-icon" title="关闭"></button>
                </div>
                <div class="qmx-modal-content">
                    <h4 style="color: var(--status-color-error, #f44336); margin-top: 0;">账号风险提示</h4>
                    <p><strong>自动领取很可能触发斗鱼活动风控，即使领取数量不多也可能被限制。</strong>风控提示只负责提醒，不会自动停止领取。</p>

                    <h4 style="color: var(--status-color-success, #4CAF50); margin-top: 0;">星推荐领取方式</h4>
                    <p>领取任务由控制页统一执行，工作直播间只用于获取必要信息，不需要持续保留：</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>脚本会在后台短暂打开候选直播间，完成初始化后自动关闭</li>
                        <li>控制页根据红包等待时长安排最多 5 次领取请求</li>
                        <li>红包是否可领以斗鱼接口响应为准，不依赖页面倒计时和模拟点击</li>
                    </ul>

                    <h4 style="color: var(--accent-color, #ff6b6b);">使用前确认</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>请保持控制室页面登录斗鱼账号</li>
                        <li>如出现鉴权失败，请先检查登录状态和油猴脚本权限</li>
                        <li>控制室房间号可在设置中修改，真实 RID 会自动关联，不需要手动填写</li>
                    </ul>

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

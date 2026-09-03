/**
 * @file    SettingsPanel.js
 * @description 负责设置面板的UI和交互逻辑。
 */

import { settingsPanelTemplate } from '../ui/templates';
import { activateCustomSelects } from '../ui/components/CustomSelect';
import { SETTINGS, SettingsManager } from './SettingsManager';
import { DouyuAPI } from '../utils/DouyuAPI';
import { Utils } from '../utils/utils';
// import { GlobalState } from './GlobalState'; // 仅在开发调试时需要

/**
 * 设置面板的UI、提示文本和部分交互逻辑
 */
export const SettingsPanel = {
    /**
     * 显示设置面板
     */
    show() {
        const modal = document.getElementById('qmx-settings-modal');

        // 1. 调用模版函数，传入SETTINGS填充默认值
        modal.innerHTML = settingsPanelTemplate(SETTINGS);

        // 2. 激活所有交互式组件
        activateCustomSelects(modal);

        // 3. 绑定面板事件
        this.bindPanelEvents(modal);

        // 4. 显示面板
        document.getElementById('qmx-modal-backdrop').classList.add('visible');
        modal.classList.add('visible');
        document.body.classList.add('qmx-modal-open-scroll-lock');
        
        // 初始化按钮状态
        this.updateSaveButtonState();
    },

    /**
     * 隐藏设置面板
     */
    hide() {
        const modal = document.getElementById('qmx-settings-modal');
        modal.classList.remove('visible');
        document.body.classList.remove('qmx-modal-open-scroll-lock');
        // 如果主面板不是居中模式，则背景遮罩也应该隐藏
        if (
            SETTINGS.MODAL_DISPLAY_MODE !== 'centered' ||
            !document.getElementById('qmx-modal-container').classList.contains('visible')
        ) {
            document.getElementById('qmx-modal-backdrop').classList.remove('visible');
        }
    },

    /**
     * 从UI读取当前设置
     */
    getSettingsFromUI() {
        return {
            // 星推荐
            CONTROL_ROOM_ID: document.getElementById('setting-control-room-id').value,
            ROOM_PREWARM_DURATION: Math.round(
                Math.min(15, Math.max(0.5, Number(document.getElementById('setting-prewarm-duration').value) || 3)) * 1000
            ),
            DAILY_LIMIT_ACTION: document.getElementById('setting-daily-limit-action').value,
            MODAL_DISPLAY_MODE: document.getElementById('setting-modal-mode').value,

            // 弹幕助手
            ...(__ENABLE_DANMU_PRO__ ? {
                ENABLE_DANMU_PRO: document.getElementById('setting-danmupro-mode').checked,
                ENABLE_THEATER_COMPOSER: document.getElementById('setting-theater-composer').checked,
            } : {}),
        };
    },

    /**
     * 检查是否需要刷新，并更新按钮文本
     */
    updateSaveButtonState() {
        const newSettings = this.getSettingsFromUI();
        const saveBtn = document.getElementById('qmx-settings-save-btn');
        if (saveBtn) {
            saveBtn.textContent = '保存';
            if (saveBtn.dataset.state !== 'saving') {
                delete saveBtn.dataset.state;
                saveBtn.removeAttribute('title');
            }
        }
        return { newSettings };
    },

    /**
     * 从UI读取并保存设置
     */
    async save() {
        const { newSettings } = this.updateSaveButtonState();
        const saveBtn = document.getElementById('qmx-settings-save-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.dataset.state = 'saving';
            saveBtn.title = '正在保存';
        }

        try {
            const enteredRoomId = String(newSettings.CONTROL_ROOM_ID || '').trim();
            const mappingIsCurrent = enteredRoomId === String(SETTINGS.CONTROL_ROOM_RESOLVED_FROM || '') &&
                Boolean(SETTINGS.TEMP_CONTROL_ROOM_RID);
            if (mappingIsCurrent) {
                newSettings.TEMP_CONTROL_ROOM_RID = SETTINGS.TEMP_CONTROL_ROOM_RID;
                newSettings.CONTROL_ROOM_RESOLVED_FROM = SETTINGS.CONTROL_ROOM_RESOLVED_FROM;
            } else {
                const identity = await DouyuAPI.resolveRoomIdentity(enteredRoomId);
                newSettings.CONTROL_ROOM_ID = identity.controlRoomId;
                newSettings.TEMP_CONTROL_ROOM_RID = identity.realRoomId;
                newSettings.CONTROL_ROOM_RESOLVED_FROM = identity.controlRoomId;
            }
            SettingsManager.update(newSettings);
        } catch (error) {
            Utils.log(`[设置] 控制室房间号校验失败: ${String(error?.message || error)}`);
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.dataset.state = 'error';
                saveBtn.title = '控制室校验失败';
                setTimeout(() => {
                    delete saveBtn.dataset.state;
                    saveBtn.removeAttribute('title');
                }, 1400);
            }
            return;
        }

        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.dataset.state = 'saved';
            saveBtn.title = '已保存';
            setTimeout(() => {
                this.hide();
            }, 600);
        } else {
            this.hide();
        }
    },

    /**
     * 绑定设置面板内部的所有事件监听器。
     * @param {HTMLElement} modal - 设置面板的根元素。
     */
    bindPanelEvents(modal) {
        // 绑定底部按钮事件
        modal.querySelector('#qmx-settings-cancel-btn').onclick = () => this.hide();
        modal.querySelector('#qmx-settings-save-btn').onclick = () => void this.save();
        modal.querySelector('#qmx-settings-reset-btn').onclick = () => {
            if (confirm('确定要恢复所有默认设置吗？此操作会刷新页面。')) {
                SettingsManager.reset();
                window.location.reload();
            }
        };

        // 监听所有输入变化以更新保存按钮状态
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.updateSaveButtonState());
            input.addEventListener('input', () => this.updateSaveButtonState());
        });

        // 监听自定义下拉菜单的变化
        const customOptions = modal.querySelectorAll('.qmx-select-options div');
        customOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                // 延时一点点以确保值已更新
                setTimeout(() => this.updateSaveButtonState(), 10);
            });
        });

        // 绑定标签页切换事件
        modal.querySelectorAll('.tab-link').forEach((button) => {
            button.onclick = (e) => {
                const tabId = e.target.dataset.tab;
                modal.querySelector('.tab-link.active')?.classList.remove('active');
                modal.querySelector('.tab-content.active')?.classList.remove('active');
                e.target.classList.add('active');
                modal.querySelector(`#tab-${tabId}`).classList.add('active');
            };
        });
    },
};

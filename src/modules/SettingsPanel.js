/**
 * @file    SettingsPanel.js
 * @description 负责设置面板的UI和交互逻辑。
 */

import { settingsPanelTemplate } from '../ui/templates';
import { activateCustomSelects } from '../ui/components/CustomSelect';
import { activateRangeSlider } from '../ui/components/RangeSlider';
import { activateToolTips } from '../ui/components/ToolTips';
import { SETTINGS, SettingsManager } from './SettingsManager';
import { ThemeManager } from './ThemeManager';
// import { GlobalState } from './GlobalState'; // 仅在开发调试时需要

/**
 * 设置面板的UI、提示文本和部分交互逻辑
 */
export const SettingsPanel = {
    // 定义需要刷新的配置项
    // 保留此机制以应对未来可能出现的必须在初始化阶段生效的配置（如底层Hook开关）
    RELOAD_REQUIRED_KEYS: [
        // 'INITIAL_SCRIPT_DELAY',  // 示例：只在启动时生效的配置，如果修改后想立即看效果，通常需要刷新
    ],

    /**
     * 显示设置面板
     */
    show() {
        const modal = document.getElementById('qmx-settings-modal');

        // 1. 所有工具提示的文本
        const allTooltips = {
            'control-room': '只有在此房间号的直播间中才能看到插件面板，看准了再改！(修改后不会立即刷新，下次进入该房间生效)',
            'temp-control-room': '备用的控制室房间号（真实RID），用于兼容特殊活动页或Topic页面。', // 新增提示
            'auto-pause': '自动暂停非控制直播间的视频播放，大幅降低资源占用。',
            'initial-script-delay': '页面加载后等待多久再运行脚本，可适当增加以确保页面完全加载。',
            'auto-pause-delay': '领取红包后等待多久再次尝试暂停视频。',
            'unresponsive-timeout': '工作页多久未汇报任何状态后，在面板上标记为“无响应”。',
            'red-envelope-timeout': '进入直播间后，最长等待多久来寻找红包活动，超时后将切换房间。',
            'popup-wait-timeout': '点击红包后，等待领取弹窗出现的最长时间。',
            'worker-loading-timeout': '新开的直播间卡在加载状态多久还没显示播放组件，被判定为加载失败或缓慢。',
            'range-delay': '脚本在每次点击等操作前后随机等待的时间范围，模拟真人行为。',
            'close-tab-delay': '旧页面在打开新页面后，等待多久再关闭自己，确保新页面已接管。',
            'switching-cleanup-timeout': '处于“切换中”状态的标签页，超过此时间后将被强行清理，避免残留。',
            'max-worker-tabs': '同时运行的直播间数量上限。',
            'api-room-fetch-count': '每次从API获取的房间数。增加可提高找到新房间的几率。',
            'api-retry-count': '获取房间列表失败时的重试次数。',
            'api-retry-delay': 'API请求失败后，等待多久再重试。',
            'healthcheck-interval': '哨兵检查后台UI的频率。值越小，UI节流越快，但会增加资源占用。',
            'disconnected-grace-period': '刷新或关闭的标签页，在被彻底清理前等待重连的宽限时间。',
            'calibration-mode': '启用校准模式可提高倒计时精准度。注意：启用此项前请先关闭DouyuEx的 阻止P2P上传 功能',
            'stats-info':
                '此功能需要把"油猴管理面板->设置->安全->允许脚本访问 Cookie"改为ALL！！ 在控制面板中显示统计信息标签页，记录每日领取的红包数量和金币总额。',
            'stats-update-interval': '统计信息面板中数据更新的频率，值越小更新越及时，但会增加API使用次数。',
            'danmupro-mode': '启用斗鱼弹幕助手功能，可以在弹幕输入框中使用自动弹幕推荐等功能。',
        };

        // 2. 调用模版函数，传入SETTINGS填充默认值
        modal.innerHTML = settingsPanelTemplate(SETTINGS);

        // 3. 激活所有交互式组件
        activateToolTips(modal, allTooltips);
        activateCustomSelects(modal);
        activateRangeSlider(modal);

        // 4. 绑定面板事件
        this.bindPanelEvents(modal);

        // 5. 显示面板
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
            // Tab 1: 基本设置
            CONTROL_ROOM_ID: document.getElementById('setting-control-room-id').value,
            TEMP_CONTROL_ROOM_RID: document.getElementById('setting-temp-control-room-id').value,
            AUTO_PAUSE_ENABLED: document.getElementById('setting-auto-pause').checked,
            ENABLE_DANMU_PRO: document.getElementById('setting-danmupro-mode').checked,
            DAILY_LIMIT_ACTION: document.getElementById('setting-daily-limit-action').value,
            MODAL_DISPLAY_MODE: document.getElementById('setting-modal-mode').value,
            SHOW_STATS_IN_PANEL: document.getElementById('setting-stats-info').checked,
            THEME: document.getElementById('setting-theme-mode').checked ? 'dark' : 'light', // 保存主题设置

            // Tab 2: 性能与延迟 (单位转换：从 秒/分钟 转为 毫秒)
            INITIAL_SCRIPT_DELAY: parseFloat(document.getElementById('setting-initial-script-delay').value) * 1000,
            AUTO_PAUSE_DELAY_AFTER_ACTION: parseFloat(document.getElementById('setting-auto-pause-delay').value) * 1000,
            SWITCHING_CLEANUP_TIMEOUT: parseFloat(document.getElementById('setting-switching-cleanup-timeout').value) * 1000,
            UNRESPONSIVE_TIMEOUT: parseInt(document.getElementById('setting-unresponsive-timeout').value, 10) * 60000,
            RED_ENVELOPE_LOAD_TIMEOUT: parseFloat(document.getElementById('setting-red-envelope-timeout').value) * 1000,
            POPUP_WAIT_TIMEOUT: parseFloat(document.getElementById('setting-popup-wait-timeout').value) * 1000,
            CALIBRATION_MODE_ENABLED: document.getElementById('setting-calibration-mode').checked,
            ELEMENT_WAIT_TIMEOUT: parseFloat(document.getElementById('setting-worker-loading-timeout').value) * 1000,
            MIN_DELAY: parseFloat(document.getElementById('setting-min-delay').value) * 1000,
            MAX_DELAY: parseFloat(document.getElementById('setting-max-delay').value) * 1000,
            CLOSE_TAB_DELAY: parseFloat(document.getElementById('setting-close-tab-delay').value) * 1000,
            HEALTHCHECK_INTERVAL: parseFloat(document.getElementById('setting-healthcheck-interval').value) * 1000,
            DISCONNECTED_GRACE_PERIOD: parseFloat(document.getElementById('setting-disconnected-grace-period').value) * 1000,
            STATS_UPDATE_INTERVAL: parseFloat(document.getElementById('setting-stats-update-interval').value) * 1000,

            // Tab 3: 高级设置
            MAX_WORKER_TABS: parseInt(document.getElementById('setting-max-tabs').value, 10),
            API_ROOM_FETCH_COUNT: parseInt(document.getElementById('setting-api-fetch-count').value, 10),
            API_RETRY_COUNT: parseInt(document.getElementById('setting-api-retry-count').value, 10),
            API_RETRY_DELAY: parseFloat(document.getElementById('setting-api-retry-delay').value) * 1000,
        };
    },

    /**
     * 检查是否需要刷新，并更新按钮文本
     */
    updateSaveButtonState() {
        const newSettings = this.getSettingsFromUI();
        let needReload = false;
        
        for (const key of Object.keys(newSettings)) {
            if (SETTINGS[key] !== newSettings[key]) {
                if (this.RELOAD_REQUIRED_KEYS.includes(key)) {
                    needReload = true;
                    break;
                }
            }
        }
        
        const saveBtn = document.getElementById('qmx-settings-save-btn');
        if (saveBtn) {
            // 如果按钮正在显示"已保存"，不要覆盖它
            if (saveBtn.textContent.includes('已保存')) return { newSettings, needReload };

            if (needReload) {
                saveBtn.textContent = '保存并刷新';
            } else {
                saveBtn.textContent = '保存';
            }
        }
        
        return { newSettings, needReload };
    },

    /**
     * 从UI读取并保存设置
     */
    save() {
        const { newSettings, needReload } = this.updateSaveButtonState();

        // 获取所有已存在的用户设置，以保留那些未在UI中暴露的设置
        const existingUserSettings = GM_getValue(SettingsManager.STORAGE_KEY, {});
        // 将未在UI中暴露的旧设置与新设置合并
        const finalSettingsToSave = Object.assign(existingUserSettings, newSettings);

        // 删除已废弃的 OPEN_TAB_DELAY，以防旧配置残留
        delete finalSettingsToSave.OPEN_TAB_DELAY;

        SettingsManager.save(finalSettingsToSave);

        if (needReload) {
            // 如果按钮已经提示了"保存并刷新"，则直接刷新
            window.location.reload();
        } else {
            // 更新内存中的设置
            SettingsManager.update(newSettings);

            // 视觉反馈
            const saveBtn = document.getElementById('qmx-settings-save-btn');
            if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '已保存~';
                saveBtn.style.backgroundColor = 'var(--status-color-success, #4CAF50)';
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.style.backgroundColor = '';
                    this.hide();
                    // 恢复按钮状态检查
                    this.updateSaveButtonState();
                }, 600);
            } else {
                this.hide();
            }
        }
    },

    /**
     * 绑定设置面板内部的所有事件监听器。
     * @param {HTMLElement} modal - 设置面板的根元素。
     */
    bindPanelEvents(modal) {
        // 绑定底部按钮事件
        modal.querySelector('#qmx-settings-cancel-btn').onclick = () => this.hide();
        modal.querySelector('#qmx-settings-save-btn').onclick = () => this.save();
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

        // 绑定主题切换开关事件
        const themeToggle = modal.querySelector('#setting-theme-mode');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'dark' : 'light';
                ThemeManager.applyTheme(newTheme);
                this.updateSaveButtonState();
            });
        }

        // 绑定调试按钮事件 - 仅在开发时启用
        // this.bindDebugButtons(modal);
    },

    /**
     * 绑定调试按钮的事件处理器 - 仅在开发时使用
     */
    /*
    bindDebugButtons(modal) {
        // 模拟达到每日上限按钮
        const testLimitBtn = modal.querySelector('#test-daily-limit-btn');
        if (testLimitBtn) {
            testLimitBtn.onclick = () => {
                if (confirm('确定要模拟达到每日上限吗？这将触发所有工作页面进入休眠模式。')) {
                    GlobalState.setDailyLimit(true);
                    alert('已设置为达到每日上限！现有工作页面将进入休眠模式。');
                    // 通知所有工作页面检查上限状态
                    const channel = new BroadcastChannel('douyu_qmx_commands');
                    channel.postMessage({action: 'CHECK_LIMIT', target: '*'});
                    channel.close();
                }
            };
        }

        // 重置每日上限按钮
        const resetLimitBtn = modal.querySelector('#reset-daily-limit-btn');
        if (resetLimitBtn) {
            resetLimitBtn.onclick = () => {
                if (confirm('确定要重置每日上限状态吗？这将允许继续领取红包。')) {
                    GlobalState.setDailyLimit(false);
                    alert('已重置每日上限状态！可以继续领取红包。');
                }
            };
        }
    },
    */
};

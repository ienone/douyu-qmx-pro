/**
 * @file    SettingsManager.js
 * @description 负责加载、合并和保存用户配置。
 */

import { CONFIG } from '../utils/CONFIG';

/**
 * =================================================================================
 * 模块：设置管理器 (SettingsManager)
 * ---------------------------------------------------------------------------------
 * 负责加载、合并和保存用户配置。
 * =================================================================================
 */
const SettingsManager = {
    STORAGE_KEY: 'douyu_qmx_user_settings',

    /**
     * 获取最终的运行时配置。
     * 它会加载用户保存的设置，并用其覆盖默认的 CONFIG。
     * @returns {object} - 合并后的配置对象。
     */
    get() {
        const userSettings = GM_getValue(this.STORAGE_KEY, {});
        const themeSetting = GM_getValue('douyu_qmx_theme',
            CONFIG.DEFAULT_THEME);

        // 合并用户设置，并强制包含主题设置
        return Object.assign({}, CONFIG, userSettings, {THEME: themeSetting});
    },

    /**
     * 保存用户的自定义设置。
     * @param {object} settingsToSave - 只包含用户修改过的设置的对象。
     */
    save(settingsToSave) {
        // 在保存时，将主题设置单独存储，因为它需要实时应用
        if (Object.hasOwn(settingsToSave, 'THEME')) {
            const theme = settingsToSave.THEME;
            GM_setValue('douyu_qmx_theme', theme);
            delete settingsToSave.THEME;
        }

        // 清理废弃的键
        delete settingsToSave.OPEN_TAB_DELAY;

        GM_setValue(this.STORAGE_KEY, settingsToSave);
    },

    /**
     * 更新并保存设置，同时更新内存中的 SETTINGS 对象
     * @param {object} newSettings - 新的设置对象
     */
    update(newSettings) {
        // 1. 更新内存中的 SETTINGS
        Object.assign(SETTINGS, newSettings);
        
        // 2. 保存到存储
        // 获取当前存储的设置（避免覆盖未在 newSettings 中的项）
        const currentStored = GM_getValue(this.STORAGE_KEY, {});
        const mergedToSave = Object.assign({}, currentStored, newSettings);
        
        this.save(mergedToSave);

        // 3. 派发设置更新事件
        window.dispatchEvent(new CustomEvent('qmx-settings-update', { detail: newSettings }));
    },

    /**
     * 重置为默认设置。
     */
    reset() {
        GM_deleteValue(this.STORAGE_KEY);
        GM_deleteValue('douyu_qmx_theme'); // 重置主题设置
    },
};

/**
 * =================================================================================
 * 运行时配置 (SETTINGS)
 * ---------------------------------------------------------------------------------
 * 脚本实际使用的配置对象，合并用户设置。
 * =================================================================================
 */
const SETTINGS = SettingsManager.get();
SETTINGS.THEME = GM_getValue('douyu_qmx_theme', SETTINGS.DEFAULT_THEME);

/**
 * =================================================================================
 * 模块：运行时状态 (STATE)
 * ---------------------------------------------------------------------------------
 * 存储脚本运行期间会动态变化的变量。
 * =================================================================================
 */
const STATE = {
    isSwitchingRoom: false,
    lastActionTime: 0,
};

export { SETTINGS, STATE, SettingsManager};

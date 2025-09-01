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
        const theme = settingsToSave.THEME;
        delete settingsToSave.THEME;
        GM_setValue('douyu_qmx_theme', theme);

        GM_setValue(this.STORAGE_KEY, settingsToSave);
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

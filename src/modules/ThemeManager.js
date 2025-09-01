/**
 * @file ThemeManager.js
 * @description 负责管理页面的日夜主题设置。
 */
import { SETTINGS } from './SettingsManager';

/**
 * =================================================================================
 * 模块：主题管理器 (ThemeManager)
 * ---------------------------------------------------------------------------------
 */
export const ThemeManager = {
    /**
     * 将主题应用到 body 元素上。
     * @param {string} theme - 'light' or 'dark'.
     */
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // 也更新 SETTINGS 对象，以便脚本内部逻辑知道当前主题
        SETTINGS.THEME = theme;
        GM_setValue('douyu_qmx_theme', theme);
    }
};
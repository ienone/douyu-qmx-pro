/**
 * =================================================================================
 * 斗鱼弹幕助手 - 设置管理器
 * ---------------------------------------------------------------------------------
 * 负责加载、保存和管理用户设置
 * =================================================================================
 */

import { CONFIG, DEFAULT_SETTINGS } from '../utils/CONFIG.js';

/**
 * 设置管理器
 */
export const SettingsManager = {
    
    // 存储键前缀
    STORAGE_KEY_PREFIX: CONFIG.SETTINGS_KEY_PREFIX,
    
    /**
     * 获取设置值
     * @param {string} key - 设置键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 设置值
     */
    get(key, defaultValue = null) {
        const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
        return GM_getValue(storageKey, defaultValue);
    },
    
    /**
     * 设置值
     * @param {string} key - 设置键名
     * @param {*} value - 设置值
     */
    set(key, value) {
        const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
        GM_setValue(storageKey, value);
    },
    
    /**
     * 删除设置
     * @param {string} key - 设置键名
     */
    remove(key) {
        const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
        GM_deleteValue(storageKey);
    },
    
    /**
     * 获取所有设置
     * @returns {object} 所有设置的键值对
     */
    getAll() {
        const allKeys = GM_listValues();
        const settings = {};
        
        allKeys.forEach(key => {
            if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                const settingKey = key.replace(this.STORAGE_KEY_PREFIX, '');
                settings[settingKey] = GM_getValue(key);
            }
        });
        
        return settings;
    },
    
    /**
     * 获取完整的设置对象（合并默认设置和用户设置）
     * @returns {object} 合并后的设置对象
     */
    getSettings() {
        const userSettings = this.getAll();
        // 使用默认设置作为基础，用户设置覆盖
        return { ...DEFAULT_SETTINGS, ...userSettings };
    },
    
    /**
     * 批量设置
     * @param {object} settings - 设置对象
     */
    setAll(settings) {
        Object.entries(settings).forEach(([key, value]) => {
            this.set(key, value);
        });
    },
    
    /**
     * 重置所有设置
     */
    reset() {
        const allKeys = GM_listValues();
        allKeys.forEach(key => {
            if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
                GM_deleteValue(key);
            }
        });
    },
    
    /**
     * 获取默认设置
     * @returns {object} 默认设置对象
     */
    getDefaults() {
        return {
            maxSuggestions: CONFIG.MAX_SUGGESTIONS,
            minSearchLength: CONFIG.MIN_SEARCH_LENGTH,
            enableSync: false,
            triggerKeys: CONFIG.TRIGGER_KEYS,
            navigationKeys: CONFIG.NAVIGATION_KEYS,
            debounceDelay: CONFIG.DEBOUNCE_DELAY,
            sortBy: 'relevance',
            autoImport: {
                maxPages: 5,
                pageSize: 50,
                sortByPopularity: true
            }
        };
    },
    
    /**
     * 应用默认设置（如果设置不存在）
     */
    applyDefaults() {
        const defaults = this.getDefaults();
        Object.entries(defaults).forEach(([key, value]) => {
            if (this.get(key) === null) {
                this.set(key, value);
            }
        });
    }
};

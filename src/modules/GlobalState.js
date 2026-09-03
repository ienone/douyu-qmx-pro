/**
 * @file    GlobalState.js
 * @description 负责管理控制页领取任务和每日上限状态。
 */

import { SETTINGS } from './SettingsManager';
import { GM_getValue, GM_setValue } from '$';

/**
 * =================================================================================
 * 模块：控制页任务状态管理器 (GlobalState)
 * ---------------------------------------------------------------------------------
 * 封装所有对 GM_setValue 和 GM_getValue 的操作。
 * =================================================================================
 */
export const GlobalState = {
    /**
     * 获取完整的共享状态对象。
     * @returns {{tasks: object}} - 控制页任务状态。
     */
    get() {
        let state = GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tasks: {} });
        if (!state || typeof state !== 'object') {
            state = { tasks: {} };
        }
        if (!state.tasks || typeof state.tasks !== 'object') state.tasks = {};
        if (Object.hasOwn(state, 'tabs')) {
            delete state.tabs;
            GM_setValue(SETTINGS.STATE_STORAGE_KEY, state);
        }
        return state;
    },

    /**
     * 保存完整的共享状态对象。
     * @param {object} state - 要保存的状态。
     */
    set(state) {
        GM_setValue(SETTINGS.STATE_STORAGE_KEY, state);
    },

    /**
     * 更新单个领取任务的状态，支持附加数据
     * @param {string} roomId - 房间ID。
     * @param {string} status - 状态标识。 
     * @param {string} statusText - 状态描述文本。
     * @param {object} [options={}] - 可选的附加数据，如 { nickname: '主播名' }。
     */
    updateTask(roomId, status, statusText, options = {}) {
        if (!roomId) return;

        const state = this.get();
        const oldTaskData = state.tasks[roomId] || {};

        // 1. 创建一个包含所有新数据的临时对象
        const updates = {
            status,
            statusText,
            lastUpdateTime: Date.now(),
            ...options,
        };

        // 2. 将旧数据和新数据合并到一个全新的对象中
        const newTaskData = { ...oldTaskData, ...updates };

        // 3. 在这个新对象上清理所有值为 null 的键
        for (const key in newTaskData) {
            if (newTaskData[key] === null) {
                delete newTaskData[key];
            }
        }

        // 4. 将处理干净的新对象赋给状态树
        state.tasks[roomId] = newTaskData;

        this.set(state);
    },

    /**
     * 从状态中移除一个领取任务。
     * @param {string} roomId - 房间ID。
     */
    removeTask(roomId) {
        if (!roomId) return;
        const state = this.get();
        delete state.tasks[roomId];
        this.set(state);
    },

    /**
     * 设置每日上限状态。
     * @param {boolean} reached - 是否已达到上限。
     */
    setDailyLimit(reached) {
        GM_setValue(SETTINGS.DAILY_LIMIT_REACHED_KEY, { reached, timestamp: Date.now() });
    },

    /**
     * 获取每日上限状态。
     * @returns {{reached: boolean, timestamp: number}|undefined}
     */
    getDailyLimit() {
        return GM_getValue(SETTINGS.DAILY_LIMIT_REACHED_KEY);
    },

    setAccountRisk(suspected, details = {}) {
        const state = this.get();
        if (suspected) {
            state.accountRisk = { ...details, suspected: true, timestamp: Date.now() };
        } else {
            delete state.accountRisk;
        }
        this.set(state);
    },

    getAccountRisk() {
        const risk = this.get().accountRisk;
        if (!risk?.suspected) return undefined;
        if (Number(risk.expiresAt) > Date.now()) return risk;
        this.setAccountRisk(false);
        return undefined;
    },
};

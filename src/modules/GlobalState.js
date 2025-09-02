/**
 * @file    GlobalState.js
 * @description 负责管理页面的全局状态，包括标签页状态信息等。
 */

import { Utils } from '../utils/utils';
import { SETTINGS } from './SettingsManager';

/**
 * =================================================================================
 * 模块：跨页面状态管理器 (GlobalState)
 * ---------------------------------------------------------------------------------
 * 封装所有对 GM_setValue 和 GM_getValue 的操作，用于页面间通信。
 * 增加了详细的日志输出，用于追踪数据流。
 * =================================================================================
 */
export const GlobalState = {
    /**
     * 获取完整的共享状态对象。
     * @returns {{tabs: object, rewards: Array, command: object|null}} - 共享状态。
     */
    get() {
        const state = GM_getValue(SETTINGS.STATE_STORAGE_KEY, { tabs: {} });
        // 日志：记录每次读取操作，以及读取到了什么
        return state;
    },

    /**
     * 保存完整的共享状态对象。
     * @param {object} state - 要保存的状态。
     */
    set(state) {

        // --- 防冲突锁机制 ---
        const lockKey = 'douyu_qmx_state_lock';
        if (GM_getValue(lockKey, false)) {
            // 如果发现有锁，则延迟50毫秒后重试，避免冲突
            setTimeout(() => this.set(state), 50);
            return;
        }

        try {
            // 上锁
            GM_setValue(lockKey, true);

            // 执行写入操作
            GM_setValue(SETTINGS.STATE_STORAGE_KEY, state);
        } catch (e) {
            Utils.log(`[全局状态-写] 严重错误：GM_setValue 写入失败！ 错误信息: ${e.message}`);
        } finally {
            // 无论成功与否，最后都要解锁
            GM_setValue(lockKey, false);
        }
    },

    /**
     * 更新单个工作标签页的状态，支持附加数据
     * @param {string} roomId - 房间ID。
     * @param {string} status - 状态标识。
     * @param {string} statusText - 状态描述文本。
     * @param {object} [options={}] - 可选的附加数据，如 { nickname: '主播名' }。
     */
    updateWorker(roomId, status, statusText, options = {}) {
        if (!roomId) return;

        const state = this.get();
        const oldTabData = state.tabs[roomId] || {};

        // --- 状态流转逻辑补丁 ---
        if (status === 'DISCONNECTED' && oldTabData.status === 'SWITCHING') {
            Utils.log(`[状态管理] 检测到正在切换的标签页已断开连接，判定为成功关闭，立即清理。`);
            this.removeWorker(roomId); // 直接调用清理函数
            return; // 任务完成，提前退出
        }

        // --- 防止在"关闭所有"操作后重新添加标签页 ---
        // 如果当前状态中没有任何标签页，且这是一个SWITCHING状态的更新，
        // 很可能是在"关闭所有"操作后的残留更新，应该忽略
        if (Object.keys(state.tabs).length === 0 && status === 'SWITCHING') {
            Utils.log(`[状态管理] 检测到全局状态已清空，忽略残留的SWITCHING状态更新 (房间: ${roomId})`);
            return;
        }

        // 1. 创建一个包含所有新数据的临时对象
        const updates = {
            status,
            statusText,
            lastUpdateTime: Date.now(),
            ...options
        };

        // 2. 将旧数据和新数据合并到一个全新的对象中
        const newTabData = { ...oldTabData, ...updates };

        // 3. 在这个新对象上清理所有值为 null 的键
        for (const key in newTabData) {
            if (newTabData[key] === null) {
                delete newTabData[key];
            }
        }

        // 4. 将处理干净的新对象赋给状态树
        state.tabs[roomId] = newTabData;

        this.set(state);
    },

    /**
     * 从状态中移除一个工作标签页。
     * @param {string} roomId - 房间ID。
     */
    removeWorker(roomId) {
        if (!roomId) return;
        const state = this.get();
        delete state.tabs[roomId];
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
    }
};

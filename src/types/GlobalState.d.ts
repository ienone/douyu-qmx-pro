/**
 * 全局状态管理的类型定义
 * @module GlobalState
 */

export interface GlobalStateData {
    tasks: { [roomID: string]: TaskData };
    accountRisk?: {
        suspected: boolean;
        timestamp: number;
        expiresAt: number;
        count: number;
    };
}

export interface TaskData {
    status: string;
    statusText: string;
    lastUpdateTime: number;
    nickname?: string;
    [key: string]: unknown; // 允许其他动态属性，使用 unknown 而不是 any
}

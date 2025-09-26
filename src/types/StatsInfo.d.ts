/**
 * 统计信息相关类型定义
 * @module StatsInfo
 */

interface AllStatsData {
    [date: string]: DailyStatsData;
}

interface DailyStatsData {
    receivedCount: number;
    total: number;
    avg: number;
}

interface globalValue {
    currentDatePage: string;
    updateIntervalID: NodeJS.Timeout | undefined;
}
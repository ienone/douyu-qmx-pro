/**
 * 配置文件的类型定义, 详细注释在src\utils\CONFIG.js
 * @module CONFIG
 */
export interface Config {
    // --- 核心标识 ---
    SCRIPT_PREFIX: string;
    CONTROL_ROOM_ID: string;
    TEMP_CONTROL_ROOM_RID: string;
    CONTROL_ROOM_RESOLVED_FROM: string;

    // --- 时间控制 (ms) ---
    INITIAL_SCRIPT_DELAY: number;
    ROOM_PREWARM_DURATION: number;

    // --- UI 与交互 ---
    DRAGGABLE_BUTTON_ID: string;
    BUTTON_POS_STORAGE_KEY: string;
    MODAL_DISPLAY_MODE: string;

    // --- API 相关 ---
    API_URL: string;
    COIN_LIST_URL: string;
    API_RETRY_COUNT: number;
    API_RETRY_DELAY: number;
    API_ROOM_PROBE_CONCURRENCY: number;
    API_ROOM_PROBE_TIMEOUT: number;

    // --- 业务逻辑配置 ---
    MAX_CONCURRENT_TASKS: number;
    DAILY_LIMIT_ACTION: string;

    // --- 存储键名 ---
    STATE_STORAGE_KEY: string;
    DAILY_LIMIT_REACHED_KEY: string;
    STATS_INFO_STORAGE_KEY: string;

    // --- UI 与 API ---
    DEFAULT_THEME: string;
    INJECT_TARGET_RETRIES: number;
    INJECT_TARGET_INTERVAL: number;
    API_ROOM_FETCH_COUNT: number;
    UI_FEEDBACK_DELAY: number;
    DRAG_BUTTON_DEFAULT_PADDING: number;
    CONVERT_LEGACY_POSITION: boolean;
}

export interface RuntimeSettings extends Config {
    THEME: string;
}

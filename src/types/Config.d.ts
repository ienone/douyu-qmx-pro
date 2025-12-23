/**
 * 配置文件的类型定义, 详细注释在src\utils\CONFIG.js
 * @module CONFIG
 */
export interface Config {
    // --- 核心标识 ---
    SCRIPT_PREFIX: string;
    CONTROL_ROOM_ID: string;
    TEMP_CONTROL_ROOM_RID: string;

    // --- 时间控制 (ms) ---
    POPUP_WAIT_TIMEOUT: number;
    PANEL_WAIT_TIMEOUT: number;
    ELEMENT_WAIT_TIMEOUT: number;
    RED_ENVELOPE_LOAD_TIMEOUT: number;
    MIN_DELAY: number;
    MAX_DELAY: number;
    CLOSE_TAB_DELAY: number;
    INITIAL_SCRIPT_DELAY: number;
    UNRESPONSIVE_TIMEOUT: number;
    SWITCHING_CLEANUP_TIMEOUT: number;
    HEALTHCHECK_INTERVAL: number;
    DISCONNECTED_GRACE_PERIOD: number;
    STATS_UPDATE_INTERVAL: number;

    // --- UI 与交互 ---
    DRAGGABLE_BUTTON_ID: string;
    BUTTON_POS_STORAGE_KEY: string;
    MODAL_DISPLAY_MODE: string;

    // --- API 相关 ---
    API_URL: string;
    COIN_LIST_URL: string;
    API_RETRY_COUNT: number;
    API_RETRY_DELAY: number;

    // --- 业务逻辑配置 ---
    MAX_WORKER_TABS: number;
    DAILY_LIMIT_ACTION: string;
    AUTO_PAUSE_ENABLED: boolean;
    AUTO_PAUSE_DELAY_AFTER_ACTION: number;
    CALIBRATION_MODE_ENABLED: boolean;
    SHOW_STATS_IN_PANEL: boolean;
    ENABLE_DANMU_PRO: boolean;

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

    // --- 选择器 ---
    SELECTORS: {
        redEnvelopeContainer: string;
        countdownTimer: string;
        popupModal: string;
        openButton: string;
        closeButton: string;
        criticalElement: string;
        pauseButton: string;
        playButton: string;
        rewardSuccessIndicator: string;
        limitReachedPopup: string;
        rankListContainer: string;
        anchorName: string;
        boxIcon: string;
        statusHeadline: string;
        clickableContainer: string;
        singleBag: string;
        prizeContainer: string;
        prizeItem: string;
        prizeImage: string;
        prizeCount: string;
    };
    
    // =======================================================
    // 弹幕助手模块配置
    // =======================================================

    // 数据库配置
    DB_NAME: string;
    DB_VERSION: number;
    DB_STORE_NAME: string;
    
    // 设置存储前缀
    SETTINGS_KEY_PREFIX: string;
    
    // CSS类名
    CSS_CLASSES: {
        POPUP: string;
        POPUP_SHOW: string;
        POPUP_CONTENT: string;
        POPUP_ITEM: string;
        POPUP_ITEM_ACTIVE: string;
        POPUP_ITEM_TEXT: string;
        POPUP_EMPTY: string;
        EMPTY_MESSAGE: string;
    };
    
    // 键盘事件配置
    KEYBOARD: {
        ENTER: string;
        ESCAPE: string;
        ARROW_UP: string;
        ARROW_DOWN: string;
        ARROW_LEFT: string;
        ARROW_RIGHT: string;
        TAB: string;
        BACKSPACE: string;
    };
    
    // API配置（开发者配置）
    API: {
        BASE_URL: string;
        TIMEOUT: number;
        RETRY_ATTEMPTS: number;
    };
    
    // 开发配置
    DEBUG: boolean;
    LOG_LEVEL: string;

    // 默认用户设置（用户可配置）

    // 搜索配置
    minSearchLength: number;
    maxSuggestions: number;
    debounceDelay: number;
    
    // 排序配置
    sortBy: string;
    autoImportMaxPages: number;
    autoImportPageSize: number;
    autoImportSortByPopularity: boolean;
    
    // 键盘快捷键配置
    enterSelectionModeKey: string;
    exitSelectionModeKey: string;
    expandCandidatesKey: string;
    navigationLeftKey: string;
    navigationRightKey: string;
    selectKey: string;
    cancelKey: string;
    
    // UI时间配置
    popupShowDelay: number;
    popupHideDelay: number;
    animationDuration: number;
    
    // UI尺寸配置
    maxPopupHeight: number;
    itemHeight: number;
    maxCandidateWidth: number;
    
    // 胶囊候选项配置
    capsule: {
        maxWidth: number;
        height: number;
        padding: number;
        margin: number;
        totalHeight: number;
        fontSize: number;
        itemsPerRow: number;
        singleRowMaxItems: number;
        
        // 悬浮框预览配置
        preview: {
            enabled: boolean;
            showDelay: number;
            hideDelay: number;
            maxWidth: number;
            animationDuration: number;
            keyboardShowDelay: number;
            verticalOffset: number;
            horizontalOffset: number;
            preferredPosition: string;
        };
    };

    // 功能开关
    enableAutoComplete: boolean;
    enableKeyboardShortcuts: boolean;
    enableSelectionMode: boolean;
    enableSound: boolean;
    
    // 同步配置
    enableSync: boolean;
    syncInterval: number;
    
    // 性能配置
    maxCacheSize: number;
    cacheExpireTime: number;
}

export interface RuntimeSettings extends Config {
    THEME: string;
}

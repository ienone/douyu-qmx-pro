/**
 * =================================================================================
 * 模块：配置 (CONFIG)
 * ---------------------------------------------------------------------------------
 * 存储所有硬编码的、不应在运行时改变的常量和设置。
 * 未来设置界面的功能就是读取和修改这个模块中的值。
 * =================================================================================
 */
export const CONFIG = {

    // =======================================================
    // 全民星助手模块配置
    // =======================================================

    // --- 核心标识 ---
    SCRIPT_PREFIX: '[全民星推荐助手]', // 脚本在控制台输出日志时使用的前缀，便于识别和过滤。
    CONTROL_ROOM_ID: '6657', // 控制室的房间号，只有在此房间页面，脚本的控制面板UI才会加载。
    TEMP_CONTROL_ROOM_RID: '6979222', // 由控制室房间号自动解析出的真实 RID，不直接暴露给用户。
    CONTROL_ROOM_RESOLVED_FROM: '6657', // 标记真实 RID 对应的可见控制室房间号，用于自动迁移旧设置。

    // --- 时间控制 (ms) ---
    INITIAL_SCRIPT_DELAY: 3000, // 页面加载完成后，脚本延迟多久再开始执行，以避开页面初始化时的高资源占用期。
    ROOM_PREWARM_DURATION: 3000, // 实测 2.2 秒可完成服务端初始化，统一留出 3 秒安全窗口。

    // --- UI 与交互 ---
    DRAGGABLE_BUTTON_ID: 'douyu-qmx-starter-button', // 主悬浮按钮的HTML ID。
    BUTTON_POS_STORAGE_KEY: 'douyu_qmx_button_position', // 用于在油猴存储中记录主悬浮按钮位置的键名。
    MODAL_DISPLAY_MODE: 'floating', // 控制面板的显示模式。可选值: 'floating'(浮动窗口), 'centered'(屏幕居中), 'inject-rank-list'(注入到排行榜)。

    // --- API 相关 ---
    API_URL: 'https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list', // 获取可领取红包直播间列表的官方API地址。
    COIN_LIST_URL: 'https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/coin/record/list', // 获取金币历史的API地址
    API_RETRY_COUNT: 3, // 内部 API 请求失败时的最大重试次数。
    API_RETRY_DELAY: 5000, // 每次API请求重试之间的等待时间。
    API_ROOM_PROBE_CONCURRENCY: 6, // 并发查询候选房间 room/list 的上限，用于按奖池大小排序。
    API_ROOM_PROBE_TIMEOUT: 5000, // 单个候选房间奖池查询的超时时间。
    // --- 业务逻辑配置 ---
    MAX_CONCURRENT_TASKS: 24, // 允许同时运行的控制页领取任务数量。
    DAILY_LIMIT_ACTION: 'CONTINUE_DORMANT', // 当达到每日领取上限时的处理策略。可选值: 'STOP_ALL'(停止所有任务), 'CONTINUE_DORMANT'(进入休眠等待第二天)。

    // --- 存储键名 ---
    STATE_STORAGE_KEY: 'douyu_qmx_dashboard_state', // 用于记录控制页任务状态的键名。
    DAILY_LIMIT_REACHED_KEY: 'douyu_qmx_daily_limit_reached', // 用于在油猴存储中记录“每日上限”状态的键名。
    STATS_INFO_STORAGE_KEY: 'douyu_qmx_stats', // 存储统计信息的键名

    // --- UI 与 API ---
    DEFAULT_THEME: 'dark',
    INJECT_TARGET_RETRIES: 10, // 在“注入模式”下，尝试寻找并注入UI到侧边栏排行榜的重试次数。
    INJECT_TARGET_INTERVAL: 500, // 每次尝试注入UI到侧边栏之间的间隔时间。
    API_ROOM_FETCH_COUNT: 10, // 单次调用API时，期望获取的直播间数量建议值。
    UI_FEEDBACK_DELAY: 2000, // UI上临时反馈信息（如“无新房间”）的显示时长。
    DRAG_BUTTON_DEFAULT_PADDING: 20, // 主悬浮按钮距离屏幕边缘的默认像素间距。
    CONVERT_LEGACY_POSITION: true, // 是否自动将旧的像素位置转换为新的比例位置，仅执行一次。
};

// 弹幕助手恢复构建时再合并；独立导出可让当前星推荐包完整摇树移除。
export const DANMU_CONFIG = {
    ENABLE_DANMU_PRO: true,
    ENABLE_THEATER_COMPOSER: true,
    DANMU_REMOTE_BASE_URL: 'https://hguofichp.cn:10086',
    DANMU_REMOTE_ENABLED: true,

    // 静态配置常量

    // 脚本标识
    //SCRIPT_PREFIX: '[斗鱼弹幕助手]',
    
    // 数据库配置
    DB_NAME: 'DouyuDanmukuPro',
    DB_VERSION: 2,
    DB_STORE_NAME: 'danmuku_templates',
    
    // 设置存储前缀
    SETTINGS_KEY_PREFIX: 'dda_',
    
    // CSS类名
    CSS_CLASSES: {
        POPUP: 'dda-popup',
        POPUP_SHOW: 'show',
        POPUP_CONTENT: 'dda-popup-content',
        POPUP_ITEM: 'dda-popup-item',
        POPUP_ITEM_ACTIVE: 'dda-popup-item-active',
        POPUP_ITEM_TEXT: 'dda-popup-item-text',
        POPUP_EMPTY: 'dda-popup-empty',
        EMPTY_MESSAGE: 'dda-empty-message'
    },
    
    // 键盘事件配置
    KEYBOARD: {
        ENTER: 'Enter',
        ESCAPE: 'Escape',
        ARROW_UP: 'ArrowUp',
        ARROW_DOWN: 'ArrowDown',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_RIGHT: 'ArrowRight',
        TAB: 'Tab',
        BACKSPACE: 'Backspace'
    },
    
    // API配置（开发者配置）
    API: {
        BASE_URL: 'https://api.example.com',
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3
    },
    
    // 开发配置
    DEBUG: false,                   // 调试模式
    LOG_LEVEL: 'info',              // 日志级别

    // 默认用户设置（用户可配置）

    // 搜索配置
    minSearchLength: 1,             // 最小搜索长度
    maxSuggestions: 10,             // 最大建议数量
    debounceDelay: 300,             // 防抖延迟（毫秒）
    
    // 排序配置
    sortBy: 'relevance',             // 默认排序方式
    autoImportMaxPages: 5,          // 自动导入最大页数
    autoImportPageSize: 50,         // 自动导入每页条目数
    autoImportSortByPopularity: true, // 自动导入时按人气排序
    
    // 键盘快捷键配置
    enterSelectionModeKey: 'ArrowUp',               // 进入选择模式的键
    exitSelectionModeKey: 'ArrowDown',              // 退出选择模式的键
    expandCandidatesKey: 'ArrowUp',                 // 扩展候选项的键（在选择模式下）
    navigationLeftKey: 'ArrowLeft',                 // 向左导航键（在选择模式下）
    navigationRightKey: 'ArrowRight',               // 向右导航键（在选择模式下）
    selectKey: 'Enter',                             // 选择候选项的键
    cancelKey: 'Escape',                            // 取消选择的键
    
    // UI时间配置
    popupShowDelay: 100,            // 弹窗显示延迟（毫秒）
    popupHideDelay: 200,            // 弹窗隐藏延迟（毫秒）
    animationDuration: 200,         // 动画持续时间（毫秒）
    
    // UI尺寸配置
    maxPopupHeight: 300,            // 弹窗最大高度（像素）
    itemHeight: 40,                 // 候选项高度（像素）
    maxCandidateWidth: 200,         // 候选项最大宽度（像素）
    
    // 胶囊候选项配置
    capsule: {
        maxWidth: 150,              // 胶囊最大宽度（像素）- 统一设置
        height: 24,                 // 胶囊内容高度（像素）
        padding: 16,                // 容器上下内边距总和 (8px * 2)
        margin: 16,                 // 容器外边距总和 (8px * 2)
        totalHeight: 40,            // 总体高度 (24 + 16) - 用于布局计算
        fontSize: 12,               // 胶囊字体大小（像素）
        itemsPerRow: 4,             // 多行模式下每行显示的候选项数量
        singleRowMaxItems: 8,       // 单行模式下最大显示数量
        
        // 悬浮框预览配置
        preview: {
            enabled: true,          // 启用悬浮框预览
            showDelay: 500,         // 显示延迟（毫秒）
            hideDelay: 100,         // 隐藏延迟（毫秒）
            maxWidth: 300,          // 最大宽度（像素）
            animationDuration: 200, // 动画持续时间（毫秒）
            keyboardShowDelay: 150, // 键盘导航时的显示延迟（稍微增加避免闪烁）
            verticalOffset: 8,      // 垂直偏移量（像素）
            horizontalOffset: 0,    // 水平偏移量（像素）
            preferredPosition: 'top' // 首选位置：'top' | 'bottom' | 'auto'
        }
    },

    // 功能开关
    enableAutoComplete: true,       // 启用自动补全
    enableKeyboardShortcuts: true, // 启用键盘快捷键
    enableSelectionMode: true,      // 启用选择模式
    enableSound: false,             // 启用音效
    
    // 同步配置
    enableSync: false,              // 启用云同步
    syncInterval: 300000,           // 同步间隔（毫秒，5分钟）
    
    // 性能配置
    maxCacheSize: 1000,             // 最大缓存条目数
    cacheExpireTime: 86400000       // 缓存过期时间（毫秒，24小时）
};

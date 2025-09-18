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
    TEMP_CONTROL_ROOM_RID: '6979222', // 备用的控制室房间号（例如斗鱼官方活动页的RID），用于兼容特殊页面。

    // --- 时间控制 (ms) ---
    POPUP_WAIT_TIMEOUT: 20000, // 点击红包后，等待领取弹窗出现的最长超时时间。
    PANEL_WAIT_TIMEOUT: 10000, // 查找通用UI面板或元素、等待失联的默认等待超时时间。
    ELEMENT_WAIT_TIMEOUT: 30000, // 等待播放器加载完成的超时时间，用以判断页面是否可用。
    RED_ENVELOPE_LOAD_TIMEOUT: 15000, // 在工作标签页中，等待右下角红包活动区域加载的超时时间。
    MIN_DELAY: 1000, // 模拟人类操作的随机延迟时间范围的最小值，用于点击等操作，避免行为过于机械。
    MAX_DELAY: 2500, // 模拟人类操作的随机延迟时间范围的最大值。
    CLOSE_TAB_DELAY: 1500, // 旧标签页在打开新标签页后，等待多久再关闭自己，以确保新页面已成功接管任务。
    INITIAL_SCRIPT_DELAY: 3000, // 页面加载完成后，脚本延迟多久再开始执行，以避开页面初始化时的高资源占用期。
    UNRESPONSIVE_TIMEOUT: 15 * 60 * 1000, // 工作标签页多久未向控制中心汇报心跳后，在面板上被标记为“无响应”状态。
    SWITCHING_CLEANUP_TIMEOUT: 30000, // 处于“切换中”状态的标签页，超过此时间后将被自动清理，防止卡死。
    HEALTHCHECK_INTERVAL: 10000, // 工作页中，哨兵检查UI倒计时的时间间隔。
    DISCONNECTED_GRACE_PERIOD: 10000, // 已断开的标签页在被清理前，等待其重连的宽限时间。
    STATS_UPDATE_INTERVAL: 4000, // 统计信息更新的时间间隔，单位为毫秒。

    // --- UI 与交互 ---
    DRAGGABLE_BUTTON_ID: 'douyu-qmx-starter-button', // 主悬浮按钮的HTML ID。
    BUTTON_POS_STORAGE_KEY: 'douyu_qmx_button_position', // 用于在油猴存储中记录主悬浮按钮位置的键名。
    MODAL_DISPLAY_MODE: 'floating', // 控制面板的显示模式。可选值: 'floating'(浮动窗口), 'centered'(屏幕居中), 'inject-rank-list'(注入到排行榜)。

    // --- API 相关 ---
    API_URL: 'https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list', // 获取可领取红包直播间列表的官方API地址。
    COIN_LIST_URL: 'https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/coin/record/list', // 获取金币历史的API地址
    API_RETRY_COUNT: 3, // API请求失败时的最大重试次数。
    API_RETRY_DELAY: 5000, // 每次API请求重试之间的等待时间。

    // --- 业务逻辑配置 ---
    MAX_WORKER_TABS: 24, // 允许同时运行的最大工作标签页（直播间）数量。
    DAILY_LIMIT_ACTION: 'CONTINUE_DORMANT', // 当达到每日领取上限时的处理策略。可选值: 'STOP_ALL'(停止所有任务), 'CONTINUE_DORMANT'(进入休眠等待第二天)。
    AUTO_PAUSE_ENABLED: true, // 是否启用在工作标签页中自动暂停视频播放的功能，以节省系统资源。
    AUTO_PAUSE_DELAY_AFTER_ACTION: 5000, // 在执行领取等操作后，需要等待多久才能再次尝试自动暂停视频。
    CALIBRATION_MODE_ENABLED: false, // 是否启用校准模式，提高倒计时精准度，尤其适用于禁用P2P的环境。
    SHOW_STATS_IN_PANEL: false, // 是否在控制面板中显示统计信息标签页。

    // --- 存储键名 ---
    STATE_STORAGE_KEY: 'douyu_qmx_dashboard_state', // 用于在油猴存储中记录脚本核心状态（如所有工作标签页信息）的键名。
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

    // --- 选择器 ---
    // 存储所有脚本需要操作的页面元素的CSS选择器，便于统一管理和修改。
    SELECTORS: {
        redEnvelopeContainer: '#layout-Player-aside div.LiveNewAnchorSupportT-enter', // 右下角红包活动的总容器。
        countdownTimer: 'span.LiveNewAnchorSupportT-enter--bottom', // 红包容器内显示倒计时的元素。
        popupModal: 'body > div.LiveNewAnchorSupportT-pop', // 点击红包后弹出的主模态框（弹窗）。
        openButton: 'div.LiveNewAnchorSupportT-singleBag--btnOpen', // 弹窗内的“开”或“抢”按钮。
        closeButton: 'div.LiveNewAnchorSupportT-pop--close', // 领取奖励后，弹窗上的关闭按钮。
        criticalElement: '#js-player-video', // 用于判断页面是否加载成功的关键元素（如此处的视频播放器）。
        pauseButton: 'div.pause-c594e8:not(.removed-9d4c42)', // 播放器上的暂停按钮。
        playButton: 'div.play-8dbf03:not(.removed-9d4c42)', // 播放器上的播放按钮。
        rewardSuccessIndicator: '.LiveNewAnchorSupportT-singleBagOpened', // 成功状态的弹窗
        limitReachedPopup: 'div.dy-Message-custom-content.dy-Message-info', // 斗鱼官方弹出的“今日已达上限”的提示信息元素。
        rankListContainer: '#layout-Player-aside > div.layout-Player-asideMainTop > div.layout-Player-rank', // 注入模式下，脚本面板要替换的目标容器。
        anchorName: 'div.Title-anchorName > h2.Title-anchorNameH2', // 直播间页面中显示主播昵称的元素。
    },
    
    // =======================================================
    // 弹幕助手模块配置
    // =======================================================

    // 静态配置常量

    // 脚本标识
    SCRIPT_PREFIX: '[斗鱼弹幕助手]',
    
    // 数据库配置
    DB_NAME: 'DouyuDanmukuAssistant',
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
    autoImportEnabled: false,        // 启用自动导入
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

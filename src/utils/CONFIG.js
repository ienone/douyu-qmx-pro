/**
 * =================================================================================
 * 模块：配置 (CONFIG)
 * ---------------------------------------------------------------------------------
 * 存储所有硬编码的、不应在运行时改变的常量和设置。
 * 未来设置界面的功能就是读取和修改这个模块中的值。
 * =================================================================================
 */
export const CONFIG = {
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

    // --- UI 与交互 ---
    DRAGGABLE_BUTTON_ID: 'douyu-qmx-starter-button', // 主悬浮按钮的HTML ID。
    BUTTON_POS_STORAGE_KEY: 'douyu_qmx_button_position', // 用于在油猴存储中记录主悬浮按钮位置的键名。
    MODAL_DISPLAY_MODE: 'floating', // 控制面板的显示模式。可选值: 'floating'(浮动窗口), 'centered'(屏幕居中), 'inject-rank-list'(注入到排行榜)。

    // --- API 相关 ---
    API_URL: 'https://www.douyu.com/japi/livebiznc/web/anchorstardiscover/redbag/square/list', // 获取可领取红包直播间列表的官方API地址。
    API_RETRY_COUNT: 3, // API请求失败时的最大重试次数。
    API_RETRY_DELAY: 5000, // 每次API请求重试之间的等待时间。

    // --- 业务逻辑配置 ---
    MAX_WORKER_TABS: 24, // 允许同时运行的最大工作标签页（直播间）数量。
    DAILY_LIMIT_ACTION: 'CONTINUE_DORMANT', // 当达到每日领取上限时的处理策略。可选值: 'STOP_ALL'(停止所有任务), 'CONTINUE_DORMANT'(进入休眠等待第二天)。
    AUTO_PAUSE_ENABLED: true, // 是否启用在工作标签页中自动暂停视频播放的功能，以节省系统资源。
    AUTO_PAUSE_DELAY_AFTER_ACTION: 5000, // 在执行领取等操作后，需要等待多久才能再次尝试自动暂停视频。
    CALIBRATION_MODE_ENABLED: false, // 是否启用校准模式，提高倒计时精准度，尤其适用于禁用P2P的环境。

    // --- 存储键名 ---
    STATE_STORAGE_KEY: 'douyu_qmx_dashboard_state', // 用于在油猴存储中记录脚本核心状态（如所有工作标签页信息）的键名。
    DAILY_LIMIT_REACHED_KEY: 'douyu_qmx_daily_limit_reached', // 用于在油猴存储中记录“每日上限”状态的键名。

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
        rankListContainer: '#layout-Player-aside > div.layout-Player-asideMainTop > div.layout-Player-rank', // 在“注入模式”下，用作UI注入目标的侧边栏排行榜容器。
        anchorName: 'div.Title-anchorName > h2.Title-anchorNameH2', // 直播间页面中显示主播昵称的元素。
    },
};
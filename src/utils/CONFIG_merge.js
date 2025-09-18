/**     
 * ---------------------------------------------------------------------------------
 * 应用程序的所有配置常量定义
 * =================================================================================
 */

// 静态配置常量（不可变）
export const CONFIG = {
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

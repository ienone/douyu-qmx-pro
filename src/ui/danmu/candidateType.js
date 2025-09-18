/**
 * =================================================================================
 * 斗鱼弹幕助手 - 候选项类型定义
 * ---------------------------------------------------------------------------------
 * 候选项相关的数据结构和类型定义
 * =================================================================================
 */

/**
 * 候选项数据结构
 * @param {number|string} id - 候选项唯一标识
 * @param {string} text - 候选项文本内容
 * @param {Object} options - 可选配置参数
 */
export function CandidateItem(id, text, options = {}) {
    this.id = id;
    this.text = text;
    
    // 扩展属性
    this.tags = options.tags || [];           // 标签
    this.useCount = options.useCount || 0;    // 使用次数
    this.lastUsed = options.lastUsed || Date.now(); // 最后使用时间
    this.createdAt = options.createdAt || Date.now(); // 创建时间
    this.syncState = options.syncState || 'local'; // 同步状态
    this.category = options.category || 'default'; // 分类
    
    // 方法：获取显示文本
    this.getDisplayText = function() {
        return this.text;
    };
    
    // 方法：更新使用统计
    this.updateUsage = function() {
        this.useCount++;
        this.lastUsed = Date.now();
    };
    
    // 方法：转换为存储对象
    this.toStorageObject = function() {
        return {
            id: this.id,
            text: this.text,
            tags: this.tags,
            useCount: this.useCount,
            lastUsed: this.lastUsed,
            createdAt: this.createdAt,
            syncState: this.syncState,
            category: this.category
        };
    };
}

/**
 * 从存储对象创建候选项实例
 * @param {Object} storageObj - 存储对象
 * @returns {CandidateItem} 候选项实例
 */
export function createCandidateFromStorage(storageObj) {
    return new CandidateItem(storageObj.id, storageObj.text, {
        tags: storageObj.tags,
        useCount: storageObj.useCount,
        lastUsed: storageObj.lastUsed,
        createdAt: storageObj.createdAt,
        syncState: storageObj.syncState,
        category: storageObj.category
    });
}

/**
 * 面板状态枚举
 */
export const PanelState = {
    HIDDEN: 'hidden',     // 隐藏状态
    SHOWING: 'showing',   // 显示中
    VISIBLE: 'visible',   // 可见状态
    HIDING: 'hiding'      // 隐藏中
};

/**
 * 选择模式枚举
 */
export const SelectionMode = {
    KEYBOARD: 'keyboard', // 键盘选择
    MOUSE: 'mouse'        // 鼠标选择
};
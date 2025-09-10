/**
 * @file candidateType.js
 * @description 候选项类型定义和相关工具函数
 */

/**
 * 候选项类型定义
 * @param {string|number} id - 候选项唯一标识符
 * @param {string} text - 候选项显示文本
 * @param {Object} options - 可选参数
 * @param {number} options.priority - 优先级，数字越小优先级越高
 * @param {string} options.category - 分类标签
 * @param {number} options.useCount - 使用次数
 * @param {Date} options.lastUsed - 最后使用时间
 */
export function CandidateItem(id, text, options = {}) {
    this.id = id;
    this.text = text;
    this.priority = options.priority || 0;
    this.category = options.category || 'default';
    this.useCount = options.useCount || 0;
    this.lastUsed = options.lastUsed || new Date();
    this.createdAt = options.createdAt || new Date();
}

/**
 * 候选项面板状态类型定义
 */
export function PanelState() {
    this.isVisible = false;
    this.activeIndex = 0;
    this.candidates = [];
    this.filterText = '';
    this.position = { x: 0, y: 0 };
}

/**
 * 预览状态类型定义
 */
export function PreviewState() {
    this.isVisible = false;
    this.text = '';
    this.selectedCandidate = null;
}

/**
 * 候选项工厂函数
 * @param {string} text - 候选项文本
 * @param {Object} options - 可选参数
 * @returns {CandidateItem} - 创建的候选项实例
 */
export function createCandidate(text, options = {}) {
    const id = options.id || `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new CandidateItem(id, text, options);
}

/**
 * 验证候选项数据有效性
 * @param {Object} candidate - 要验证的候选项数据
 * @returns {boolean} - 是否有效
 */
export function validateCandidate(candidate) {
    return candidate && 
           typeof candidate.id !== 'undefined' && 
           typeof candidate.text === 'string' && 
           candidate.text.trim().length > 0;
}

/**
 * 候选项排序比较函数
 * @param {CandidateItem} a - 候选项A
 * @param {CandidateItem} b - 候选项B
 * @returns {number} - 比较结果
 */
export function sortCandidates(a, b) {
    // 优先按优先级排序
    if (a.priority !== b.priority) {
        return a.priority - b.priority;
    }
    // 其次按使用次数排序（降序）
    if (a.useCount !== b.useCount) {
        return b.useCount - a.useCount;
    }
    // 最后按最后使用时间排序（降序）
    return new Date(b.lastUsed) - new Date(a.lastUsed);
}

/**
 * 过滤候选项
 * @param {CandidateItem[]} candidates - 候选项列表
 * @param {string} filterText - 过滤文本
 * @returns {CandidateItem[]} - 过滤后的候选项列表
 */
export function filterCandidates(candidates, filterText) {
    if (!filterText || filterText.trim() === '') {
        return candidates.slice();
    }
    
    const searchText = filterText.toLowerCase().trim();
    return candidates.filter(candidate => 
        candidate.text.toLowerCase().includes(searchText) ||
        candidate.category.toLowerCase().includes(searchText)
    );
}
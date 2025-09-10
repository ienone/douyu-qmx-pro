/**
 * @file index.js
 * @description 候选项组件系统入口和便利导出
 */

// 核心组件导出
export { default as candidateDB, getCandidates, addCandidate, removeCandidate, updateCandidate, incrementUseCount, clearAllCandidates } from './candidateDB.js';
export { default as candidatePanelState } from './candidatePanelState.js';
export { default as inputCandidateManager, bindInputEvents, unbindInputEvents, replaceInputWithPreview } from './inputInteraction.js';

// UI组件导出
export * from './candidatePanel.js';
export * from './candidateItem.js';
export * from './inputPreview.js';

// 类型定义导出
export * from './candidateType.js';

/**
 * 快速初始化候选项系统
 * @param {Object} options - 配置选项
 * @param {string[]} options.defaultCandidates - 默认候选项文本列表
 * @param {HTMLElement[]} options.inputElements - 要绑定的输入框元素
 * @param {Object} options.inputConfig - 输入框配置
 * @returns {Promise<Object>} - 初始化结果和管理器实例
 */
export async function initializeCandidateSystem(options = {}) {
    const {
        defaultCandidates = [],
        inputElements = [],
        inputConfig = {}
    } = options;

    try {
        // 导入管理器
        const { default: inputCandidateManager } = await import('./inputInteraction.js');
        const { default: candidateDB } = await import('./candidateDB.js');
        
        // 初始化管理器
        await inputCandidateManager.init();
        
        // 添加默认候选项（如果数据库为空）
        const existingCandidates = await candidateDB.getCandidates();
        if (existingCandidates.length === 0 && defaultCandidates.length > 0) {
            for (const text of defaultCandidates) {
                try {
                    await candidateDB.addCandidate(text);
                } catch (error) {
                    console.warn('Failed to add default candidate:', text, error);
                }
            }
        }
        
        // 绑定输入框
        for (const inputEl of inputElements) {
            if (inputEl && inputEl.tagName) {
                inputCandidateManager.bindInputEvents(inputEl, inputConfig);
            }
        }
        
        console.log('CandidateSystem: 初始化完成', {
            defaultCandidates: defaultCandidates.length,
            boundInputs: inputElements.length
        });
        
        return {
            success: true,
            manager: inputCandidateManager,
            database: candidateDB
        };
        
    } catch (error) {
        console.error('CandidateSystem: 初始化失败', error);
        return {
            success: false,
            error
        };
    }
}

/**
 * 斗鱼直播间候选项预设
 */
export const DOUYU_PRESETS = {
    // 常用回复
    COMMON_REPLIES: [
        '666',
        '牛逼',
        '厉害了',
        '哈哈哈',
        '可以的',
        '不错不错',
        '支持',
        '赞',
        '👍',
        '🔥'
    ],
    
    // 打赏相关
    GIFT_RESPONSES: [
        '感谢老板的礼物！',
        '谢谢老板！',
        '老板大气！',
        '感谢支持！',
        '老板666！',
        '谢谢各位老板的支持！'
    ],
    
    // 互动回复
    INTERACTIVE: [
        '主播辛苦了',
        '什么时候下播？',
        '玩得不错',
        '继续加油',
        '期待下次直播',
        '主播注意休息'
    ],
    
    // 游戏相关（可根据具体游戏调整）
    GAMING: [
        '操作秀起来',
        '这波可以',
        '稳住',
        '别送',
        '上高地',
        'GG',
        'Nice!'
    ]
};

/**
 * 为斗鱼直播间快速设置候选项系统
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} - 初始化结果
 */
export async function setupDouyuCandidateSystem(options = {}) {
    const {
        enableCommonReplies = true,
        enableGiftResponses = true,
        enableInteractive = true,
        enableGaming = false,
        customCandidates = [],
        inputSelectors = ['input[type="text"]', 'textarea'],
        ...otherOptions
    } = options;
    
    // 收集默认候选项
    const defaultCandidates = [];
    
    if (enableCommonReplies) {
        defaultCandidates.push(...DOUYU_PRESETS.COMMON_REPLIES);
    }
    if (enableGiftResponses) {
        defaultCandidates.push(...DOUYU_PRESETS.GIFT_RESPONSES);
    }
    if (enableInteractive) {
        defaultCandidates.push(...DOUYU_PRESETS.INTERACTIVE);
    }
    if (enableGaming) {
        defaultCandidates.push(...DOUYU_PRESETS.GAMING);
    }
    
    defaultCandidates.push(...customCandidates);
    
    // 查找输入框
    const inputElements = [];
    for (const selector of inputSelectors) {
        const elements = document.querySelectorAll(selector);
        inputElements.push(...elements);
    }
    
    // 初始化系统
    return initializeCandidateSystem({
        defaultCandidates,
        inputElements,
        inputConfig: {
            triggerOnFocus: true,
            triggerOnInput: true,
            minLength: 0, // 斗鱼场景下即使没有输入也可能需要候选项
            debounceDelay: 200,
            autoComplete: true
        },
        ...otherOptions
    });
}

/**
 * 自动检测并绑定页面中的输入框
 * @param {Object} options - 配置选项
 * @returns {Promise<number>} - 绑定的输入框数量
 */
export async function autoBindInputElements(options = {}) {
    const {
        selectors = [
            'input[type="text"]',
            'textarea',
            '.chat-input',
            '.message-input',
            '[contenteditable="true"]'
        ],
        excludeSelectors = [
            '.qmx-editable-preview-textarea' // 排除我们自己的组件
        ],
        inputConfig = {}
    } = options;
    
    try {
        const { default: inputCandidateManager } = await import('./inputInteraction.js');
        await inputCandidateManager.init();
        
        let boundCount = 0;
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            
            for (const element of elements) {
                // 检查是否应该排除
                const shouldExclude = excludeSelectors.some(excludeSelector => 
                    element.matches(excludeSelector)
                );
                
                if (!shouldExclude) {
                    inputCandidateManager.bindInputEvents(element, inputConfig);
                    boundCount++;
                }
            }
        }
        
        console.log(`CandidateSystem: 自动绑定了 ${boundCount} 个输入框`);
        return boundCount;
        
    } catch (error) {
        console.error('CandidateSystem: 自动绑定失败', error);
        return 0;
    }
}
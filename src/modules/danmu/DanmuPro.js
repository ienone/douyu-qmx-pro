/*
 * =================================================================================
 * 斗鱼弹幕助手 - 主模块
 * --------------------------------------------------------------------------------
 * 负责初始化和协调各子模块 
 * ================================================================================
 */
import { Utils } from '../../utils/utils.js'; 
import { DanmukuDB } from './DanmukuDB.js'; 
import { InputManager } from './InputManager.js';
import { KeyboardController } from './KeyboardController.js';

// 导入弹幕助手所需的样式
import '../../styles/danmuku-popup.css'; // 注意路径调整
import '../../styles/candidate-capsules.css';

/**
 * 斗鱼弹幕助手主模块
 * 负责初始化所有相关子模块
 */
export const DanmuPro = {
    initialized: false,

    /**
     * 初始化弹幕助手功能
     */
    async init() {
        if (this.initialized) {
            Utils.log('弹幕助手已经初始化，跳过。', 'warn');
            return;
        }

        try {
            Utils.log('[弹幕助手] 模块开始初始化...');

            // 初始化数据库
            const dbSuccess = await DanmukuDB.init();
            if (!dbSuccess) {
                Utils.log('[弹幕助手] 数据库初始化失败，功能可能受限。', 'warn');
            }

            // 检查并执行首次数据导入
            await this.firstTimeImport();

            // 初始化键盘控制器
            KeyboardController.init();

            // 初始化输入管理器
            await InputManager.init();

            this.initialized = true;
            Utils.log('[弹幕助手] 模块初始化完成！');

        } catch (error) {
            Utils.log(`[弹幕助手] 初始化失败: ${error.message}`, 'error');
        }
    },

    /**
     * 检查并执行首次数据导入
     */
    async firstTimeImport() {
        try {
            const dataCount = await DanmukuDB.getDataCount();
            if (dataCount === 0) {
                Utils.log('[弹幕助手] 数据库为空，开始首次数据导入...');
                const result = await DanmukuDB.autoImportData();
                if (result && result.successCount > 0) {
                    Utils.log(`[弹幕助手] 首次数据导入成功 ${result.successCount} 条。`);
                } else {
                    Utils.log('[弹幕助手] 首次数据导入失败。', 'warn');
                }
            }
        } catch (error) {
            Utils.log(`[弹幕助手] 检查首次导入时发生错误: ${error.message}`, 'error');
        }
    }
};
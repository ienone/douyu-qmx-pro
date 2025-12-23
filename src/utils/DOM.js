import { Utils } from './utils';
import { SETTINGS } from '../modules/SettingsManager';

/**
 * =================================================================================
 * 模块：DOM 操作 (DOM)
 * ---------------------------------------------------------------------------------
 * 封装所有查找、点击和操作页面元素的方法。
 * =================================================================================
 */
export const DOM = {
    /**
     * 异步查找一个元素，直到超时。
     * @param {string} selector - CSS选择器。
     * @param {number} [timeout=SETTINGS.PANEL_WAIT_TIMEOUT] - 超时时间。
     * @param {Document|HTMLElement} [parent=document] - 父元素。
     * @param {Function} [validator=null] - 验证函数，返回 true 表示元素有效
     * @returns {Promise<HTMLElement|null>} - 找到的元素或 null。
     */
    async findElement(selector, timeout = SETTINGS.PANEL_WAIT_TIMEOUT, parent = document, validator = null) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const elements = parent.querySelectorAll(selector);
            
            for (const element of elements) {
                // 检查元素是否可见
                if (window.getComputedStyle(element).display === 'none') {
                    continue;
                }
                
                // 如果提供了验证函数，使用它进一步验证
                if (validator && !validator(element)) {
                    continue;
                }
                
                // 找到有效元素
                return element;
            }
            
            await Utils.sleep(300);
        }
        Utils.log(`查找元素超时: ${selector}`);
        return null;
    },

    /**
     * 安全地模拟点击一个元素。
     * @param {HTMLElement|null} element - 要点击的元素。
     * @param {string} description - 元素描述，用于日志。
     * @returns {Promise<boolean>} - 是否点击成功。
     */
    async safeClick(element, description) {
        if (!element) {
            return false;
        }
        try {
            if (window.getComputedStyle(element).display === 'none') {
                return false;
            }
            await Utils.sleep(Utils.getRandomDelay(SETTINGS.MIN_DELAY / 2, SETTINGS.MAX_DELAY / 2));
            element.click();
            await Utils.sleep(Utils.getRandomDelay());
            return true;
        } catch (error) {
            Utils.log(`[点击异常] ${description} 时发生错误: ${error.message}`);
            return false;
        }
    },

    /**
     * 检查是否存在每日上限弹窗。
     * @returns {Promise<boolean>}
     */
    async checkForLimitPopup() {
        const limitPopup = await this.findElement(SETTINGS.SELECTORS.limitReachedPopup, 3000);
        if (limitPopup && limitPopup.textContent.includes('已达上限')) {
            Utils.log('捕获到“已达上限”弹窗！');
            return true;
        }
        return false;
    },
};

/**
 * @file PageLoader.js
 * @description 统一管理待打开页面队列，并在控制页按节奏逐个打开。
 */

import { Utils } from '../utils/utils';
import { SETTINGS } from './SettingsManager';

const QUEUE_KEY = 'douyu_qmx_page_open_queue';

export const PageLoader = {
    /**
     * 获取待打开页面队列。
     * @returns {string[]}
     */
    getQueue() {
        const queue = GM_getValue(QUEUE_KEY, []);
        return Array.isArray(queue) ? queue : [];
    },

    /**
     * 保存待打开页面队列。
     * @param {string[]} queue
     */
    setQueue(queue) {
        GM_setValue(QUEUE_KEY, Array.isArray(queue) ? queue : []);
    },

    /**
     * 入队一个待打开URL（默认去重）。
     * @param {string} url
     * @param {{dedupe?: boolean}} [options]
     * @returns {boolean} 是否成功入队
     */
    enqueue(url, options = {}) {
        if (!url || typeof url !== 'string') return false;

        const normalizedUrl = url.trim();
        if (!normalizedUrl) return false;

        const { dedupe = true } = options;
        const queue = this.getQueue();

        if (dedupe && queue.includes(normalizedUrl)) {
            return false;
        }

        queue.push(normalizedUrl);
        this.setQueue(queue);
        return true;
    },

    /**
     * 出队并返回一个URL。
     * @returns {string|null}
     */
    dequeue() {
        const queue = this.getQueue();
        if (queue.length === 0) return null;

        const nextUrl = queue.shift() || null;
        this.setQueue(queue);
        return nextUrl;
    },

    /**
     * 从队列打开一个新标签页。
     * @returns {string|null} 本次打开的URL
     */
    openNextTab() {
        const nextUrl = this.dequeue();
        if (!nextUrl) return null;

        const shouldForegroundOpen = SETTINGS.PRELOAD_MODE_ENABLED !== false;
        const active = shouldForegroundOpen;
        GM_openInTab(nextUrl, { active, setParent: true });
        Utils.log(
            `[PageLoader] 已从队列打开新标签页(${shouldForegroundOpen ? '前台直切' : '后台打开'}): ${nextUrl}`
        );
        return nextUrl;
    },
};

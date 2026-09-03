/**
 * @file PageLoader.js
 * @description 管理领取任务所需的短时后台开页。
 */

import { Utils } from '../utils/utils';
import { GM_openInTab } from '$';

const closeTabHandle = (tab) => {
    try {
        tab?.close?.();
    } catch (error) {
        Utils.log(`[PageLoader] 关闭短时工作页失败: ${String(error?.message || error)}`);
    }
};

export const PageLoader = {
    /**
     * 后台打开一个短时工作页。调用方负责在初始化窗口结束后关闭。
     * @param {string} url
     * @returns {{url: string, roomId: string|null, openedAt: number, close: () => void}}
     */
    openPrewarmTab(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('短时工作页 URL 无效');
        }

        const targetUrl = new URL(url, 'https://www.douyu.com');
        targetUrl.searchParams.set('qmxPrewarm', '1');
        const tab = GM_openInTab(targetUrl.href, { active: false, setParent: true });
        const openedAt = Date.now();
        const roomId = url.match(/\/(\d+)/)?.[1] || null;
        let closed = false;

        Utils.log(`[PageLoader] 已后台打开短时工作页: ${url}`);
        return {
            url: targetUrl.href,
            roomId,
            openedAt,
            close() {
                if (closed) return;
                closed = true;
                closeTabHandle(tab);
                Utils.log(`[PageLoader] 已关闭短时工作页: ${url}`);
            },
        };
    },
};

/**
 * 新版斗鱼页面布局适配层。
 *
 * 业务模块只通过这里访问斗鱼 DOM，避免散落哈希类名和重复的重挂载逻辑。
 */
export const DOUYU_SELECTORS = Object.freeze({
    playerMain: '#js-player-main',
    playerVideo: '#js-player-video-case',
    playerToolbar: '#js-player-toolbar',
    giftSlot: '#js-giftList-area',
    aside: '#js-player-asideMain',
    asideTop: '.layout-Player-asideMainTop',
    rank: '.layout-Player-rank',
    chat: '.layout-Player-chat',
    chatComposer: '.ChatSend',
    chatInput: '.ChatSend-txt[contenteditable="true"], textarea.ChatSend-txt, input.ChatSend-txt, .ChatSend-txt',
    chatSendButton: '.ChatSend-button',
});

const query = (selector, root = document) => root?.querySelector?.(selector) || null;

export const DouyuLayoutAdapter = {
    observer: null,
    resizeObserver: null,
    callbacks: new Set(),
    scheduled: false,

    getPlayerMain() {
        return query(DOUYU_SELECTORS.playerMain);
    },

    getAsideSlot() {
        return query(DOUYU_SELECTORS.asideTop);
    },

    getGiftSlot() {
        return query(DOUYU_SELECTORS.giftSlot);
    },

    getChatComposer() {
        const container = query(DOUYU_SELECTORS.chatComposer) || query(DOUYU_SELECTORS.chat);
        if (!container) return null;

        const input = query(DOUYU_SELECTORS.chatInput, container);
        const sendButton = query(DOUYU_SELECTORS.chatSendButton, container);
        return input ? { container, input, sendButton } : null;
    },

    isTheaterMode() {
        return Boolean(
            document.body?.classList.contains('is-fullScreenPage') &&
            this.getPlayerMain() &&
            this.getGiftSlot()
        );
    },

    isLiveLayout() {
        return Boolean(this.getPlayerMain() && this.getChatComposer());
    },

    getSnapshot() {
        const composer = this.getChatComposer();
        return {
            theater: this.isTheaterMode(),
            liveLayout: this.isLiveLayout(),
            playerMain: this.getPlayerMain(),
            asideSlot: this.getAsideSlot(),
            giftSlot: this.getGiftSlot(),
            composer,
        };
    },

    scheduleNotify() {
        if (this.scheduled) return;
        this.scheduled = true;
        requestAnimationFrame(() => {
            this.scheduled = false;
            const snapshot = this.getSnapshot();
            this.callbacks.forEach((callback) => callback(snapshot));
            this.refreshResizeTargets(snapshot);
        });
    },

    refreshResizeTargets(snapshot = this.getSnapshot()) {
        if (typeof ResizeObserver === 'undefined') return;
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(() => this.scheduleNotify());
        }
        this.resizeObserver.disconnect();
        [snapshot.playerMain, snapshot.asideSlot, snapshot.giftSlot]
            .filter(Boolean)
            .forEach((element) => this.resizeObserver.observe(element));
    },

    ensureObserver() {
        if (this.observer || typeof MutationObserver === 'undefined') return;
        this.observer = new MutationObserver(() => this.scheduleNotify());
        this.observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });
        this.refreshResizeTargets();
    },

    observe(callback, { immediate = true } = {}) {
        if (typeof callback !== 'function') return () => {};
        this.callbacks.add(callback);
        this.ensureObserver();
        if (immediate) callback(this.getSnapshot());

        return () => {
            this.callbacks.delete(callback);
            if (this.callbacks.size === 0) {
                this.observer?.disconnect();
                this.resizeObserver?.disconnect();
                this.observer = null;
                this.resizeObserver = null;
            }
        };
    },
};

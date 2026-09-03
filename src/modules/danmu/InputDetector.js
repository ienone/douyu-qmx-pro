/**
 * 斗鱼官方输入框检测器。
 *
 * 新版网页全屏仍使用右侧 ChatSend 输入区，因此不再依赖带构建哈希的全屏类名。
 */
import { DouyuLayoutAdapter, DOUYU_SELECTORS } from '../../platform/douyu/DouyuLayoutAdapter.js';

export const INPUT_TYPES = {
    MAIN_CHAT: 'main_chat',
    FULLSCREEN_FLOAT: 'fullscreen',
    UNKNOWN: 'unknown',
};
export const InputDetector = {
    detectedInputs: new Set(),
    onInputDetected: null,
    onInputRemoved: null,
    stopObserving: null,

    init(callbacks = {}) {
        this.onInputDetected = callbacks.onInputDetected || (() => {});
        this.onInputRemoved = callbacks.onInputRemoved || (() => {});
        this.stopObserving = DouyuLayoutAdapter.observe((snapshot) => {
            this.syncComposer(snapshot.composer?.input || null);
        });
    },

    syncComposer(input) {
        for (const detected of this.detectedInputs) {
            if (!detected.isConnected || detected !== input) {
                this.detectedInputs.delete(detected);
                this.onInputRemoved?.(detected, INPUT_TYPES.MAIN_CHAT);
            }
        }

        if (input && !this.detectedInputs.has(input)) {
            this.detectedInputs.add(input);
            input.dataset.frameworkManaged = 'true';
            this.onInputDetected?.(input, INPUT_TYPES.MAIN_CHAT);
        }
    },

    detectExistingInputs() {
        this.syncComposer(DouyuLayoutAdapter.getChatComposer()?.input || null);
    },

    getInputType(element) {
        if (!element?.matches?.(DOUYU_SELECTORS.chatInput)) return INPUT_TYPES.UNKNOWN;
        const isEditable = element.matches('input, textarea') ||
            element.isContentEditable ||
            element.getAttribute('contenteditable') === 'true';
        return isEditable ? INPUT_TYPES.MAIN_CHAT : INPUT_TYPES.UNKNOWN;
    },

    isChatInput(element) {
        return this.getInputType(element) !== INPUT_TYPES.UNKNOWN;
    },

    getSendButton(input) {
        if (this.getInputType(input) === INPUT_TYPES.UNKNOWN) return null;
        const composer = input.closest(DOUYU_SELECTORS.chatComposer);
        return composer?.querySelector(DOUYU_SELECTORS.chatSendButton) || null;
    },

    destroy() {
        this.stopObserving?.();
        this.stopObserving = null;
        this.detectedInputs.clear();
        this.onInputDetected = null;
        this.onInputRemoved = null;
    },
};

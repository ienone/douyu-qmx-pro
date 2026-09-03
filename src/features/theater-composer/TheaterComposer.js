import { DouyuLayoutAdapter } from '../../platform/douyu/DouyuLayoutAdapter.js';
import { ChatComposerAdapter } from '../../platform/douyu/ChatComposerAdapter.js';
import { DanmuDataSource } from '../danmu/DanmuDataSource.js';
import { DanmukuDB } from '../../modules/danmu/DanmukuDB.js';
import { SETTINGS } from '../../modules/SettingsManager.js';

const MAX_LENGTH = 100;

export const TheaterComposer = {
    root: null,
    host: null,
    stopObserving: null,
    debounceTimer: null,
    composing: false,
    suggestions: [],
    activeIndex: -1,

    init() {
        if (this.stopObserving) return;
        this.stopObserving = DouyuLayoutAdapter.observe((snapshot) => this.sync(snapshot));
    },

    sync(snapshot) {
        const shouldMount = SETTINGS.ENABLE_THEATER_COMPOSER &&
            snapshot.theater && snapshot.liveLayout && snapshot.giftSlot;
        if (!shouldMount) {
            this.unmount();
            return;
        }

        if (this.host !== snapshot.giftSlot || !this.root?.isConnected) {
            this.mount(snapshot.giftSlot);
        }
    },

    mount(host) {
        this.unmount();
        this.host = host;
        this.root = document.createElement('section');
        this.root.id = 'qmx-theater-composer';
        this.root.setAttribute('aria-label', '弹幕工作台');
        this.root.innerHTML = `
            <div class="qmx-theater-suggestions" role="listbox"></div>
            <div class="qmx-theater-toolbar">
                <span class="qmx-theater-state" data-state="ready" title="弹幕助手已连接"></span>
                <button type="button" data-action="hot" title="24小时热门">热门</button>
                <button type="button" data-action="random" title="随机一条弹幕">随机</button>
                <div class="qmx-theater-candidates" aria-live="polite"></div>
            </div>
            <div class="qmx-theater-editor-row">
                <input class="qmx-theater-editor" type="text" maxlength="${MAX_LENGTH}" autocomplete="off" placeholder="搜索或输入弹幕" />
                <span class="qmx-theater-counter">0/${MAX_LENGTH}</span>
                <button class="qmx-theater-send" type="button" title="发送弹幕" aria-label="发送弹幕">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l17 8-17 8 3-7 8-1-8-1-3-7z" fill="currentColor"/></svg>
                </button>
            </div>
        `;
        host.classList.add('qmx-theater-host-active');
        host.appendChild(this.root);
        this.bindEvents();
        this.loadFeatured();
    },

    bindEvents() {
        const editor = this.root.querySelector('.qmx-theater-editor');
        const sendButton = this.root.querySelector('.qmx-theater-send');

        editor.addEventListener('compositionstart', () => { this.composing = true; });
        editor.addEventListener('compositionend', () => {
            this.composing = false;
            this.handleInput(editor.value);
        });
        editor.addEventListener('input', () => {
            this.updateCounter(editor.value.length);
            if (!this.composing) this.handleInput(editor.value);
        });
        editor.addEventListener('keydown', (event) => this.handleKeyDown(event));
        sendButton.addEventListener('click', () => this.send());

        this.root.querySelector('[data-action="hot"]').addEventListener('click', () => this.loadFeatured());
        this.root.querySelector('[data-action="random"]').addEventListener('click', async () => {
            const featured = await DanmuDataSource.getFeatured('7d', 20);
            if (featured.length === 0) return;
            const candidate = featured[Math.floor(Math.random() * featured.length)];
            this.applyCandidate(candidate, false);
        });
    },

    handleInput(value) {
        clearTimeout(this.debounceTimer);
        const query = value.trim();
        if (!query) {
            this.loadFeatured();
            return;
        }
        this.setState('loading');
        this.debounceTimer = setTimeout(async () => {
            const results = await DanmuDataSource.search(query, { limit: 8 });
            this.renderSuggestions(results, true);
            this.setState(results.length ? 'ready' : 'empty');
        }, 220);
    },

    async loadFeatured() {
        if (!this.root) return;
        this.setState('loading');
        const results = await DanmuDataSource.getFeatured('24h', 8);
        if (!this.root) return;
        this.renderSuggestions(results, false);
        this.setState(results.length ? 'ready' : 'empty');
    },

    renderSuggestions(items, expanded) {
        if (!this.root) return;
        this.suggestions = items || [];
        this.activeIndex = -1;
        const candidates = this.root.querySelector('.qmx-theater-candidates');
        const panel = this.root.querySelector('.qmx-theater-suggestions');
        const visible = this.suggestions.slice(0, 4);

        candidates.replaceChildren(...visible.map((item, index) => this.createCandidate(item, index, 'chip')));
        panel.replaceChildren(...this.suggestions.map((item, index) => this.createCandidate(item, index, 'result')));
        panel.classList.toggle('visible', Boolean(expanded && this.suggestions.length));
    },

    createCandidate(item, index, variant) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `qmx-theater-${variant}`;
        button.textContent = item.text;
        button.title = item.text;
        button.dataset.index = String(index);
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => this.applyCandidate(item));
        return button;
    },

    applyCandidate(candidate, focus = true) {
        const editor = this.root?.querySelector('.qmx-theater-editor');
        if (!editor || !candidate?.text) return;
        editor.value = candidate.text.slice(0, MAX_LENGTH);
        this.updateCounter(editor.value.length);
        this.root.querySelector('.qmx-theater-suggestions')?.classList.remove('visible');
        if (focus) editor.focus();
        if (candidate.id && !String(candidate.id).startsWith('sb6657-')) {
            DanmukuDB.updateUsage(candidate.id);
        }
    },

    handleKeyDown(event) {
        if (this.composing) return;
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
            return;
        }
        if (event.key === 'Escape') {
            this.root.querySelector('.qmx-theater-suggestions')?.classList.remove('visible');
        }
    },

    send() {
        const editor = this.root?.querySelector('.qmx-theater-editor');
        const value = editor?.value.trim();
        if (!value) return;
        this.setState('sending');
        const sent = ChatComposerAdapter.send(value);
        if (sent) {
            editor.value = '';
            this.updateCounter(0);
            this.setState('sent');
            setTimeout(() => this.root && this.setState('ready'), 700);
            this.loadFeatured();
        } else {
            this.setState('error');
        }
    },

    updateCounter(length) {
        const counter = this.root?.querySelector('.qmx-theater-counter');
        if (counter) counter.textContent = `${length}/${MAX_LENGTH}`;
    },

    setState(state) {
        const indicator = this.root?.querySelector('.qmx-theater-state');
        if (indicator) indicator.dataset.state = state;
    },

    unmount() {
        clearTimeout(this.debounceTimer);
        this.root?.remove();
        this.host?.classList.remove('qmx-theater-host-active');
        this.root = null;
        this.host = null;
        this.suggestions = [];
    },

    destroy() {
        this.stopObserving?.();
        this.stopObserving = null;
        this.unmount();
    },
};

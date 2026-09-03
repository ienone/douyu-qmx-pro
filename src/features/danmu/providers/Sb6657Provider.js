import { GM_xmlhttpRequest } from '$';

const DEFAULT_BASE_URL = 'https://hguofichp.cn:10086';
const CACHE_TTL = 5 * 60 * 1000;

const normalizeTags = (tags) => String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const normalizeRecord = (item = {}) => ({
    id: `sb6657-${item.id ?? item.barrageId ?? item.barrage}`,
    originalId: item.id ?? item.barrageId,
    text: String(item.barrage || '').trim(),
    tags: normalizeTags(item.tags),
    popularity: Number(item.cnt) || 0,
    likes: Number(item.likes) || 0,
    submitTime: item.submitTime || null,
    hotDateTime: item.hotDateTime || null,
    source: 'sb6657',
});

const requestJson = (url, options = {}) => new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    const requestOptions = {
        method,
        url,
        headers,
        data: options.body,
        timeout: options.timeout || 6000,
        onload: (response) => {
            if (response.status < 200 || response.status >= 300) {
                reject(new Error(`sb6657 HTTP ${response.status}`));
                return;
            }
            try {
                resolve(JSON.parse(response.responseText));
            } catch (error) {
                reject(new Error(`sb6657 响应解析失败: ${error.message}`));
            }
        },
        onerror: () => reject(new Error('sb6657 网络请求失败')),
        ontimeout: () => reject(new Error('sb6657 请求超时')),
    };

    if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest(requestOptions);
        return;
    }

    fetch(url, {
        method,
        headers,
        body: options.body,
    }).then((response) => {
        if (!response.ok) throw new Error(`sb6657 HTTP ${response.status}`);
        return response.json();
    }).then(resolve, reject);
});

export const Sb6657Provider = {
    baseUrl: DEFAULT_BASE_URL,
    cache: new Map(),

    setBaseUrl(baseUrl) {
        if (baseUrl) this.baseUrl = String(baseUrl).replace(/\/$/, '');
    },

    async cached(key, loader, ttl = CACHE_TTL) {
        const current = this.cache.get(key);
        if (current && current.expiresAt > Date.now()) return current.value;
        const value = await loader();
        this.cache.set(key, { value, expiresAt: Date.now() + ttl });
        return value;
    },

    async search(query, { limit = 10, page = 1, tags = '' } = {}) {
        const keyword = String(query || '').trim();
        if (!keyword) return [];
        const cacheKey = `search:${keyword}:${tags}:${limit}:${page}`;
        return this.cached(cacheKey, async () => {
            const body = await requestJson(`${this.baseUrl}/machine/pageSearch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barrage: keyword,
                    tags,
                    submitTime: '',
                    sort: 'cnt',
                    pageSize: limit,
                    pageNum: page,
                }),
            });
            const list = body?.data?.list || body?.data?.records || body?.data || [];
            return (Array.isArray(list) ? list : [])
                .map(normalizeRecord)
                .filter((item) => item.text);
        });
    },

    async getHot(period = '24h', limit = 12) {
        const endpoint = period === '7d'
            ? '/machine/hotBarrageOf7Day'
            : '/machine/hotBarrageOf24H';
        return this.cached(`hot:${period}:${limit}`, async () => {
            const body = await requestJson(`${this.baseUrl}${endpoint}`);
            const list = Array.isArray(body?.data) ? body.data : [];
            return list.map(normalizeRecord).filter((item) => item.text).slice(0, limit);
        });
    },

    async getRandom() {
        const body = await requestJson(`${this.baseUrl}/machine/getRandOne`);
        const item = body?.data;
        if (!item) return null;
        const normalized = normalizeRecord(item);
        return normalized.text ? normalized : null;
    },
};

import { DanmukuDB } from '../../modules/danmu/DanmukuDB.js';
import { Sb6657Provider } from './providers/Sb6657Provider.js';

const deduplicate = (items, limit) => {
    const seen = new Set();
    return items.filter((item) => {
        const text = String(item?.text || '').trim();
        if (!text || seen.has(text)) return false;
        seen.add(text);
        return true;
    }).slice(0, limit);
};

export const DanmuDataSource = {
    remoteAvailable: true,
    remoteEnabled: true,

    async warmup() {
        try {
            await Sb6657Provider.getHot('24h', 10);
            this.remoteAvailable = true;
        } catch {
            this.remoteAvailable = false;
        }
    },

    async search(query, { limit = 10, sortBy = 'relevance' } = {}) {
        const keyword = String(query || '').trim();
        if (!keyword) return [];

        const localPromise = DanmukuDB.search(keyword, limit, sortBy);
        const remotePromise = this.remoteEnabled && keyword.length >= 2
            ? Sb6657Provider.search(keyword, { limit }).catch(() => [])
            : Promise.resolve([]);
        const [local, remote] = await Promise.all([localPromise, remotePromise]);
        return deduplicate([...(local || []), ...(remote || [])], limit);
    },

    async getFeatured(period = '24h', limit = 10) {
        try {
            if (!this.remoteEnabled) throw new Error('remote disabled');
            const remote = await Sb6657Provider.getHot(period, limit);
            if (remote.length > 0) return remote;
        } catch {
            this.remoteAvailable = false;
        }

        const local = await DanmukuDB.getAll();
        return deduplicate(
            local.sort((a, b) => (b.popularity || b.useCount || 0) - (a.popularity || a.useCount || 0)),
            limit
        );
    },
};

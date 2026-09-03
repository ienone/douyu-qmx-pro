import { GM_getValue, GM_setValue } from '$';

const STORAGE_KEY = 'douyu_qmx_claim_events_v1';
const LOCK_KEY = 'douyu_qmx_claim_events_lock';
const MAX_EVENTS = 2000;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const readEvents = () => {
    const value = GM_getValue(STORAGE_KEY, []);
    return Array.isArray(value) ? value : [];
};

const prune = (events, now = Date.now()) => events
    .filter((event) => Number(event.timestamp) >= now - RETENTION_MS)
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, MAX_EVENTS);

const getAttemptKey = (event) => {
    if (event.bagKey) return String(event.bagKey);
    if (event.bagId !== undefined && event.bagId !== null && event.bagId !== '') {
        return `${String(event.roomId || 'unknown')}:${String(event.bagId)}`;
    }
    return String(event.id || `legacy-${event.timestamp}-${Math.random()}`);
};

export const ClaimEventStore = {
    record(event) {
        const payload = {
            id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
            result: 'unknown',
            ...event,
        };

        const commit = () => {
            if (GM_getValue(LOCK_KEY, false)) {
                setTimeout(commit, 40);
                return;
            }
            GM_setValue(LOCK_KEY, true);
            try {
                GM_setValue(STORAGE_KEY, prune([payload, ...readEvents()]));
            } finally {
                GM_setValue(LOCK_KEY, false);
            }
            window.dispatchEvent(new CustomEvent('qmx-claim-event', { detail: payload }));
        };

        commit();
        return payload;
    },

    list({ days = 30 } = {}) {
        const threshold = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
        return prune(readEvents()).filter((event) => Number(event.timestamp) >= threshold);
    },

    summarize({ days = 7 } = {}) {
        const events = this.list({ days });
        const attemptMap = events
            .filter((event) => event.phase === 'claim')
            .reduce((map, event) => {
                const key = getAttemptKey(event);
                const attempt = map.get(key) || { key, events: [] };
                attempt.events.push(event);
                map.set(key, attempt);
                return map;
            }, new Map());
        const attemptList = Array.from(attemptMap.values());
        const successfulAttempts = attemptList.filter((attempt) =>
            attempt.events.some((event) => event.result === 'success')
        );
        const success = successfulAttempts.length;
        const attempts = attemptList.length;
        const byResult = events.reduce((acc, event) => {
            acc[event.result] = (acc[event.result] || 0) + 1;
            return acc;
        }, {});
        const successBySource = successfulAttempts.reduce((acc, attempt) => {
            const successEvent = attempt.events.find((event) => event.result === 'success');
            const source = String(successEvent?.source || 'legacy');
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        return {
            events,
            success,
            attempts,
            successRate: attempts ? Math.round((success / attempts) * 100) : 0,
            byResult,
            successBySource,
        };
    },
};

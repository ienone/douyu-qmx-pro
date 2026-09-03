export const SNATCH_OUTCOME = Object.freeze({
    SUCCESS: 'success',
    NOT_READY: 'not_ready',
    EXHAUSTED: 'exhausted',
    DAILY_LIMIT: 'daily_limit',
    AUTH_FAILED: 'auth_failed',
    ALREADY_CLAIMED: 'already_claimed',
    UNKNOWN: 'unknown',
});

const asNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

export const getRedBagKey = (bag, roomId = bag?.rid) => [
    String(roomId || ''),
    String(bag?.id || ''),
    String(bag?.code || ''),
].join(':');

export const normalizeRedBag = (bag, roomId) => ({
    rid: String(roomId || bag?.rid || ''),
    id: asNumber(bag?.id),
    code: String(bag?.code || ''),
    status: asNumber(bag?.status, -1),
    waitSec: Math.max(0, asNumber(bag?.waitSec)),
    createTime: asNumber(bag?.createTime),
    rbType: asNumber(bag?.rbType),
    prizeList: Array.isArray(bag?.prizeList) ? bag.prizeList : [],
});

export const summarizePrizePool = (prizeList) => (Array.isArray(prizeList) ? prizeList : [])
    .reduce((summary, prize) => {
        const amount = Math.max(0, asNumber(prize?.num));
        const prizeType = asNumber(prize?.ptype ?? prize?.prizeType, -1);
        if (prizeType === 9) summary.coins += amount;
        if (prizeType === 2) summary.starlight += amount;
        summary.total = summary.coins + summary.starlight;
        return summary;
    }, { coins: 0, starlight: 0, total: 0 });

export const summarizeRedBagPrizePool = (bag) => summarizePrizePool(bag?.prizeList);

export const compareRedBagPrizeValue = (left, right) => {
    const leftPool = summarizeRedBagPrizePool(left);
    const rightPool = summarizeRedBagPrizePool(right);
    if (leftPool.total !== rightPool.total) return rightPool.total - leftPool.total;
    if (leftPool.coins !== rightPool.coins) return rightPool.coins - leftPool.coins;
    return rightPool.starlight - leftPool.starlight;
};

export const selectActiveRedBag = ({
    redBagList,
    roomId,
    completedKeys = new Set(),
}) => {
    const active = (Array.isArray(redBagList) ? redBagList : [])
        .map((bag) => normalizeRedBag(bag, roomId))
        .filter((bag) => bag.id && bag.code && bag.status === 0)
        .filter((bag) => !completedKeys.has(getRedBagKey(bag)));

    active.sort((left, right) => {
        const prizeOrder = compareRedBagPrizeValue(left, right);
        if (prizeOrder !== 0) return prizeOrder;
        if (left.waitSec !== right.waitSec) return left.waitSec - right.waitSec;
        if (left.createTime !== right.createTime) return left.createTime - right.createTime;
        return left.id - right.id;
    });

    return active[0] || null;
};

export const createRedBagBinding = (bag, receivedAt = Date.now()) => {
    const normalized = normalizeRedBag(bag, bag?.rid);
    return {
        key: getRedBagKey(normalized),
        bag: normalized,
        firstReceivedAt: receivedAt,
    };
};

/** 返回从工作直播间打开时刻起计算的五次领取尝试偏移。 */
export const getSnatchAttemptOffsets = (waitSec) => {
    const wait = Math.max(30, Math.round(asNumber(waitSec)));
    const first = Math.round(wait * (wait >= 300 ? 2 / 3 : 1 / 2));
    const nearEnd = Math.max(first + 10, wait - 20);
    return [first, nearEnd, wait, wait + 20, wait + 50].map((seconds) => seconds * 1000);
};

export const classifySnatchResponse = (response) => {
    const error = Number(response?.error);
    const message = String(response?.msg || '');

    if (error === 0) return SNATCH_OUTCOME.SUCCESS;
    if (error === 12006) return SNATCH_OUTCOME.NOT_READY;
    if (error === 12001 || /已派完|已抢完|已结束|已过期/.test(message)) {
        return SNATCH_OUTCOME.EXHAUSTED;
    }
    if (error === -1 && /上限|次数/.test(message)) return SNATCH_OUTCOME.DAILY_LIMIT;
    if (/登录|鉴权|csrf|token|凭证/i.test(message)) return SNATCH_OUTCOME.AUTH_FAILED;
    if (/已领取|领取过|重复领取/.test(message)) return SNATCH_OUTCOME.ALREADY_CLAIMED;
    return SNATCH_OUTCOME.UNKNOWN;
};

export const countConsecutiveImmediate12001 = (events, now = Date.now()) => {
    const bagKeys = new Set();
    const cutoff = now - 30 * 60 * 1000;

    for (const event of Array.isArray(events) ? events : []) {
        const timestamp = Number(event?.timestamp);
        if (!Number.isFinite(timestamp) || timestamp < cutoff) break;
        if (event?.phase !== 'claim') continue;
        if (
            event.result !== 'exhausted' ||
            Number(event.error) !== 12001 ||
            Number(event.attemptCount) !== 1
        ) break;

        const bagKey = String(event.bagKey || `${event.roomId || ''}:${event.bagId || ''}`);
        if (bagKey !== ':') bagKeys.add(bagKey);
    }

    return bagKeys.size;
};

export const toDisplayPrizes = (prizeList) => (Array.isArray(prizeList) ? prizeList : [])
    .filter((prize) => Number(prize?.num) > 0)
    .map((prize) => ({
        img: String(prize?.img || ''),
        name: String(prize?.name || ''),
        text: `×${Number(prize.num)}`,
    }));

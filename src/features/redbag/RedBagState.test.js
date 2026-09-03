import assert from 'node:assert/strict';
import test from 'node:test';
import {
    SNATCH_OUTCOME,
    classifySnatchResponse,
    countConsecutiveImmediate12001,
    createRedBagBinding,
    getRedBagKey,
    getSnatchAttemptOffsets,
    selectActiveRedBag,
    summarizePrizePool,
} from './RedBagState.js';

test('binds one active API bag without deriving a page countdown deadline', () => {
    const bags = [
        { id: 2, code: 'later', status: 0, waitSec: 600, createTime: 20 },
        { id: 1, code: 'near', status: 0, waitSec: 90, createTime: 10 },
        { id: 3, code: 'ended', status: 3, waitSec: 1, createTime: 1 },
    ];
    const selected = selectActiveRedBag({ redBagList: bags, roomId: '100' });
    const binding = createRedBagBinding(selected, 1_000);

    assert.equal(getRedBagKey(selected), '100:1:near');
    assert.equal(binding.firstReceivedAt, 1_000);
    assert.equal(Object.hasOwn(binding, 'estimatedClaimAt'), false);
});

test('limits each bag to five waitSec-aware snatch attempts', () => {
    assert.deepEqual(getSnatchAttemptOffsets(90), [45, 70, 90, 110, 140].map((value) => value * 1000));
    assert.deepEqual(getSnatchAttemptOffsets(300), [200, 280, 300, 320, 350].map((value) => value * 1000));
    assert.deepEqual(getSnatchAttemptOffsets(600), [400, 580, 600, 620, 650].map((value) => value * 1000));
});

test('prioritizes the largest active prize pool', () => {
    const bags = [
        {
            id: 1,
            code: 'near-small',
            status: 0,
            waitSec: 10,
            prizeList: [{ ptype: 9, num: 100 }],
        },
        {
            id: 2,
            code: 'later-large',
            status: 0,
            waitSec: 300,
            prizeList: [
                { ptype: 9, num: 2000 },
                { ptype: 2, num: 500 },
            ],
        },
        {
            id: 3,
            code: 'ended-largest',
            status: 3,
            waitSec: 1,
            prizeList: [{ ptype: 9, num: 9999 }],
        },
    ];

    const selected = selectActiveRedBag({
        redBagList: bags,
        roomId: '100',
    });

    assert.equal(selected.id, 2);
    assert.deepEqual(summarizePrizePool(selected.prizeList), {
        coins: 2000,
        starlight: 500,
        total: 2500,
    });
});

test('summarizes snatch response prizeType values for reward statistics', () => {
    assert.deepEqual(summarizePrizePool([
        { prizeType: 2, num: 12 },
        { prizeType: 9, num: 37 },
        { prizeType: 2, num: 3 },
    ]), {
        coins: 37,
        starlight: 15,
        total: 52,
    });
});

test('maps known snatch business responses to state-machine outcomes', () => {
    assert.equal(classifySnatchResponse({ error: 0, msg: 'success' }), SNATCH_OUTCOME.SUCCESS);
    assert.equal(classifySnatchResponse({ error: 12006, msg: '请稍后重试' }), SNATCH_OUTCOME.NOT_READY);
    assert.equal(classifySnatchResponse({ error: 12001, msg: '' }), SNATCH_OUTCOME.EXHAUSTED);
    assert.equal(classifySnatchResponse({ error: -1, msg: '已达到每日领取上限' }), SNATCH_OUTCOME.DAILY_LIMIT);
    assert.equal(classifySnatchResponse({ error: 401, msg: '登录状态失效' }), SNATCH_OUTCOME.AUTH_FAILED);
    assert.equal(classifySnatchResponse({ error: 999, msg: '已经领取过' }), SNATCH_OUTCOME.ALREADY_CLAIMED);
    assert.equal(classifySnatchResponse({ error: 999, msg: 'unexpected' }), SNATCH_OUTCOME.UNKNOWN);
});

test('flags only consecutive first-attempt 12001 responses from distinct bags', () => {
    const now = Date.now();
    const event = (bagKey, overrides = {}) => ({
        timestamp: now,
        phase: 'claim',
        result: 'exhausted',
        error: 12001,
        attemptCount: 1,
        bagKey,
        ...overrides,
    });

    assert.equal(countConsecutiveImmediate12001([
        event('room-3:bag-3'),
        event('room-2:bag-2'),
        event('room-1:bag-1'),
    ], now), 3);
    assert.equal(countConsecutiveImmediate12001([
        event('room-3:bag-3'),
        event('room-2:bag-2', { attemptCount: 4 }),
        event('room-1:bag-1'),
    ], now), 1);
    assert.equal(countConsecutiveImmediate12001([
        event('room-1:bag-1'),
        event('room-1:bag-1'),
        event('room-1:bag-1'),
    ], now), 1);
    assert.equal(countConsecutiveImmediate12001([
        event('room-3:bag-3'),
        event('room-2:bag-2', { timestamp: now - 31 * 60 * 1000 }),
        event('room-1:bag-1'),
    ], now), 1);
});

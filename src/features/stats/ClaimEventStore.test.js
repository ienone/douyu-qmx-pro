import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '$') {
            return {
                url: new URL('../../test/GmApiMock.js', import.meta.url).href,
                shortCircuit: true,
            };
        }
        return nextResolve(specifier, context);
    },
});

const storage = new Map();
globalThis.GM_getValue = (key, fallback) => storage.has(key) ? storage.get(key) : fallback;
globalThis.GM_setValue = (key, value) => storage.set(key, value);
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class CustomEvent {
    constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
    }
};

const { ClaimEventStore } = await import('./ClaimEventStore.js');

test('claim event store keeps recent events and summarizes attempts', () => {
    storage.clear();
    const now = Date.now();
    ClaimEventStore.record({ timestamp: now - 1000, roomId: '100', phase: 'claim', result: 'success', source: 'snatch' });
    ClaimEventStore.record({ timestamp: now - 500, roomId: '100', phase: 'claim', result: 'unknown', source: 'snatch' });
    ClaimEventStore.record({ timestamp: now - 40 * 86_400_000, roomId: 'old', phase: 'claim', result: 'success' });

    const summary = ClaimEventStore.summarize({ days: 7 });
    assert.equal(summary.attempts, 2);
    assert.equal(summary.success, 1);
    assert.equal(summary.successRate, 50);
    assert.deepEqual(summary.byResult, { success: 1, unknown: 1 });
    assert.deepEqual(summary.successBySource, { snatch: 1 });
});

test('counts multiple API responses for one bag as one attempt', () => {
    storage.clear();
    const now = Date.now();
    ClaimEventStore.record({
        timestamp: now - 1000,
        roomId: '100',
        bagId: 88,
        phase: 'claim',
        result: 'unknown',
        source: 'snatch',
    });
    ClaimEventStore.record({
        timestamp: now - 500,
        roomId: '100',
        bagId: 88,
        phase: 'claim',
        result: 'success',
        source: 'snatch',
    });

    const summary = ClaimEventStore.summarize({ days: 7 });
    assert.equal(summary.attempts, 1);
    assert.equal(summary.success, 1);
    assert.equal(summary.successRate, 100);
    assert.deepEqual(summary.successBySource, { snatch: 1 });
});

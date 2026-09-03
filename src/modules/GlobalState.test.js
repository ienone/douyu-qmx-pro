import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '$') {
            return {
                url: new URL('../test/GmApiMock.js', import.meta.url).href,
                shortCircuit: true,
            };
        }
        if (specifier.startsWith('.') && !specifier.endsWith('.js')) {
            return nextResolve(`${specifier}.js`, context);
        }
        return nextResolve(specifier, context);
    },
});

const storage = new Map([
    ['douyu_qmx_dashboard_state', { tabs: { 100: { status: 'WAITING' } } }],
]);

globalThis.GM_getValue = (key, fallback) => storage.has(key) ? storage.get(key) : fallback;
globalThis.GM_setValue = (key, value) => storage.set(key, value);
globalThis.GM_deleteValue = (key) => storage.delete(key);
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class CustomEvent {};

const { GlobalState } = await import('./GlobalState.js');

test('drops obsolete tab state and stores control-page tasks only', () => {
    const state = GlobalState.get();
    assert.deepEqual(state, { tasks: {} });
    assert.deepEqual(storage.get('douyu_qmx_dashboard_state'), { tasks: {} });

    GlobalState.updateTask('200', 'WAITING', '倒计时', {
        countdown: { endTime: 1234 },
        prizes: null,
    });
    assert.deepEqual(GlobalState.get().tasks['200'], {
        status: 'WAITING',
        statusText: '倒计时',
        lastUpdateTime: GlobalState.get().tasks['200'].lastUpdateTime,
        countdown: { endTime: 1234 },
    });

    GlobalState.removeTask('200');
    assert.deepEqual(GlobalState.get().tasks, {});

    GlobalState.setAccountRisk(true, { count: 3, expiresAt: Date.now() + 60_000 });
    assert.equal(GlobalState.getAccountRisk().count, 3);
    GlobalState.setAccountRisk(true, { count: 3, expiresAt: Date.now() - 1 });
    assert.equal(GlobalState.getAccountRisk(), undefined);
    GlobalState.setAccountRisk(false);
    assert.equal(GlobalState.getAccountRisk(), undefined);
});

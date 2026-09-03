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
    ['douyu_qmx_user_settings', {
        CONTROL_ROOM_ID: '777',
        TEMP_CONTROL_ROOM_RID: 'stale-rid',
        AUTO_PAUSE: true,
    }],
]);

globalThis.GM_getValue = (key, fallback) => storage.has(key) ? storage.get(key) : fallback;
globalThis.GM_setValue = (key, value) => storage.set(key, value);
globalThis.GM_deleteValue = (key) => storage.delete(key);
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class CustomEvent {
    constructor(type, options) {
        this.type = type;
        this.detail = options?.detail;
    }
};

const { SETTINGS, SettingsManager } = await import('./SettingsManager.js');

test('removes obsolete compatibility settings and marks old room mappings for migration', () => {
    assert.equal(SETTINGS.CONTROL_ROOM_ID, '777');
    assert.equal(SETTINGS.TEMP_CONTROL_ROOM_RID, 'stale-rid');
    assert.equal(SETTINGS.CONTROL_ROOM_RESOLVED_FROM, '');
    assert.deepEqual(storage.get('douyu_qmx_user_settings'), {
        CONTROL_ROOM_ID: '777',
        TEMP_CONTROL_ROOM_RID: 'stale-rid',
    });
});

test('persists only supported settings and keeps room mapping metadata internal', () => {
    SettingsManager.update({
        CONTROL_ROOM_ID: '6657',
        TEMP_CONTROL_ROOM_RID: '6979222',
        CONTROL_ROOM_RESOLVED_FROM: '6657',
        ROOM_PREWARM_DURATION: 7_000,
        ENABLE_DANMU_PRO: false,
        AUTO_PAUSE: true,
    });

    assert.deepEqual(storage.get('douyu_qmx_user_settings'), {
        CONTROL_ROOM_ID: '6657',
        TEMP_CONTROL_ROOM_RID: '6979222',
        CONTROL_ROOM_RESOLVED_FROM: '6657',
        ROOM_PREWARM_DURATION: 7_000,
    });
});

test('clamps the user-facing background page duration', () => {
    SettingsManager.update({ ROOM_PREWARM_DURATION: 99_000 });
    assert.equal(storage.get('douyu_qmx_user_settings').ROOM_PREWARM_DURATION, 15_000);
    assert.equal(SETTINGS.ROOM_PREWARM_DURATION, 15_000);
});

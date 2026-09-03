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

const opened = [];

globalThis.GM_getValue = (_key, fallback) => fallback;
globalThis.GM_setValue = () => {};
globalThis.GM_deleteValue = () => {};
globalThis.GM_log = () => {};
globalThis.GM_openInTab = (url, options) => {
    const record = { url, options, closeCount: 0 };
    opened.push(record);
    return { close: () => { record.closeCount += 1; } };
};

const { PageLoader } = await import('./PageLoader.js');

test('opens one background prewarm tab and closes it idempotently', () => {
    opened.length = 0;
    const session = PageLoader.openPrewarmTab('https://www.douyu.com/100');

    assert.equal(opened.length, 1);
    assert.equal(opened[0].options.active, false);
    assert.equal(opened[0].options.setParent, true);
    assert.match(opened[0].url, /\/100\?qmxPrewarm=1$/);
    assert.equal(session.roomId, '100');

    session.close();
    session.close();
    assert.equal(opened[0].closeCount, 1);
});

test('rejects an empty prewarm URL', () => {
    assert.throws(() => PageLoader.openPrewarmTab(''), /URL 无效/);
});

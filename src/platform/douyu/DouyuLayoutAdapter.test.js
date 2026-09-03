import test from 'node:test';
import assert from 'node:assert/strict';

import { DouyuLayoutAdapter, DOUYU_SELECTORS } from './DouyuLayoutAdapter.js';

test('layout adapter detects the stable live theater slots', () => {
    const input = { id: 'input' };
    const sendButton = { id: 'send' };
    const composer = {
        querySelector(selector) {
            if (selector === DOUYU_SELECTORS.chatInput) return input;
            if (selector === DOUYU_SELECTORS.chatSendButton) return sendButton;
            return null;
        },
    };
    const nodes = new Map([
        [DOUYU_SELECTORS.playerMain, { id: 'player' }],
        [DOUYU_SELECTORS.giftSlot, { id: 'gift' }],
        [DOUYU_SELECTORS.asideTop, { id: 'aside' }],
        [DOUYU_SELECTORS.chatComposer, composer],
    ]);
    globalThis.document = {
        body: { classList: { contains: (name) => name === 'is-fullScreenPage' } },
        querySelector: (selector) => nodes.get(selector) || null,
    };

    const snapshot = DouyuLayoutAdapter.getSnapshot();
    assert.equal(snapshot.theater, true);
    assert.equal(snapshot.liveLayout, true);
    assert.equal(snapshot.giftSlot.id, 'gift');
    assert.equal(snapshot.asideSlot.id, 'aside');
    assert.deepEqual(snapshot.composer, { container: composer, input, sendButton });
});

import { DouyuLayoutAdapter } from './DouyuLayoutAdapter.js';

const isContentEditable = (element) => Boolean(
    element?.isContentEditable || element?.getAttribute?.('contenteditable') === 'true'
);

export const ChatComposerAdapter = {
    getComposer() {
        return DouyuLayoutAdapter.getChatComposer();
    },

    getValue(input = this.getComposer()?.input) {
        if (!input) return '';
        return isContentEditable(input) ? (input.textContent || '') : (input.value || '');
    },

    setValue(value, input = this.getComposer()?.input) {
        if (!input) return false;
        const nextValue = String(value ?? '');
        input.focus();

        if (isContentEditable(input)) {
            input.textContent = nextValue;
        } else {
            const prototype = input.tagName === 'TEXTAREA'
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
            if (descriptor?.set) descriptor.set.call(input, nextValue);
            else input.value = nextValue;
        }

        input.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: false,
            data: nextValue,
            inputType: 'insertText',
        }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    },

    send(value) {
        const composer = this.getComposer();
        if (!composer?.sendButton || !this.setValue(value, composer.input)) return false;
        composer.sendButton.click();
        return true;
    },
};

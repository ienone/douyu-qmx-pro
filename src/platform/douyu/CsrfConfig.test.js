import assert from 'node:assert/strict';
import test from 'node:test';
import { extractDouyuCsrfConfig } from './CsrfConfig.js';

test('extracts dynamic csrf field and cookie names from embedded SYS config', () => {
    assert.deepEqual(
        extractDouyuCsrfConfig('window.__INIT__={};var $SYS={"tn":"ctn","tvk":"ccn"};'),
        { fieldName: 'ctn', cookieName: 'ccn' },
    );
    assert.deepEqual(
        extractDouyuCsrfConfig("var $SYS = { tn: 'dynamic_field', tvk: 'dynamic_cookie' }"),
        { fieldName: 'dynamic_field', cookieName: 'dynamic_cookie' },
    );
    assert.deepEqual(
        extractDouyuCsrfConfig(
            'var $SYS = { "tvk":"ccn", "tn":"ctn", "cookie_pre":"acf_" };'
        ),
        { fieldName: 'ctn', cookieName: 'acf_ccn' },
    );
    assert.deepEqual(
        extractDouyuCsrfConfig(
            'self.__next_f.push([1,"var $SYS={\\"tn\\":\\"ctn\\",\\"tvk\\":\\"ccn\\",\\"cookie_pre\\":\\"acf_\\"}"])'
        ),
        { fieldName: 'ctn', cookieName: 'acf_ccn' },
    );
});

import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({

            systemjs:'inline',

            entry: 'src/main.js',
            userscript: {
                name: '斗鱼全民星推荐自动领取pro',
                namespace: 'http://tampermonkey.net/',
                description: '原版《斗鱼全民星推荐自动领取》的增强版(应该增强了……)在保留核心功能的基础上，引入了可视化管理面板。',
                version: '2.0.8',
                author: 'ienone&Truthss',
                match: [
                    '*://www.douyu.com/*',
                ],
                connect: [
                    'list-www.douyu.com',   
                    'data.ienone.top',  // 弹幕数据源域名
                    'localhost:*'       // 开发环境                
                ],
                'run-at': 'document-idle',
                license: 'MIT',
                noframes: true,
                grant: [
                    'GM_addStyle',
                    'GM_getValue',
                    'GM_setValue',
                    'GM_deleteValue',
                    'GM_listValues',
                    'GM_xmlhttpRequest',
                    'GM_notification'
                ],
                $extra: [['original-author', 'ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)']],
            },
            build: {
                fileName: '星推荐v2.user.js',
                sourcemap: false,
            },
            server: {
                mountGmApi: true,
            }
        }),
    ],
});

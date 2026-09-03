import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig(() => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const buildFlavor = 'star-only';
    const buildChannel = (process.env.BUILD_CHANNEL || 'beta').trim(); // beta | release
    const versionBase = (process.env.VERSION_SUFFIX || '2.1.0').trim();
    const channelSuffix = buildChannel === 'beta' ? `-beta` : '';
    const metadataVersion = buildChannel === 'beta' ? `${versionBase}-beta.1` : versionBase;
    const fileName = `星推荐v2${channelSuffix}.user.js`;
    const scriptName = `斗鱼全民星推荐助手${channelSuffix}`;
    const description = '斗鱼全民星推荐自动领取脚本 - 控制页服务端领取、收益统计与可视化任务面板';

    return {
        resolve: {
            alias: {
                './modules/danmu/DanmuPro': path.resolve(__dirname, 'src/utils/empty.js'),
                './danmu/DanmuPro': path.resolve(__dirname, 'src/utils/empty.js'),
            },
        },
        build: {
            emptyOutDir: true,
        },
        plugins: [
            monkey({
                systemjs: false, // 显式禁用 SystemJS
                entry: 'src/main.js',
                userscript: {
                    name: scriptName,
                    namespace: 'http://tampermonkey.net/',
                    description: description,
                    version: metadataVersion,
                    author: 'ienone&Truthss',
                    match: [
                        '*://www.douyu.com/*',
                    ],
                    connect: [
                        'www.douyu.com',
                    ],
                    'run-at': 'document-idle',
                    license: 'MIT',
                    noframes: true,
                    $extra: [['original-author', 'ysl-ovo (https://greasyfork.org/zh-CN/users/1453821-ysl-ovo)']],
                },
                build: {
                    fileName,
                    sourcemap: false,
                    autoGrant: true,
                },
            }),
        ],
        define: {
            __BUILD_FLAVOR__: JSON.stringify(buildFlavor),
            __BUILD_CHANNEL__: JSON.stringify(buildChannel),
            __ENABLE_DANMU_PRO__: 'false',
            __ENABLE_STAR_CORE__: 'true',
        },
    };
});

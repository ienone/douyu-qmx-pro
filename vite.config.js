import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig(() => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const buildFlavor = (process.env.BUILD_FLAVOR || 'full').trim(); // full | star-only | danmu-only
    const buildChannel = (process.env.BUILD_CHANNEL || 'beta').trim(); // beta | release
    const versionBase = (process.env.VERSION_SUFFIX || '2.0.8').trim();
    const channelSuffix = buildChannel === 'beta' ? `-beta` : '';
    const flavorSuffix = buildFlavor === 'full' ? '' : `-${buildFlavor}`;
    const fileName = `星推荐v2${flavorSuffix}${channelSuffix}.user.js`;
    const scriptName = `斗鱼全民星推荐${buildFlavor === 'danmu-only' ? '弹幕助手' : 'pro'}${channelSuffix}`;
    const enableDanmu = buildFlavor !== 'star-only';
    const enableStar = buildFlavor !== 'danmu-only';

    return {
        resolve: {
            alias: {
                flexsearch: path.resolve(__dirname, 'node_modules/flexsearch/dist/flexsearch.bundle.min.js'),
                // 根据构建版本，将不需要的模块替换为空文件
                ...(buildFlavor === 'star-only' ? {
                    './modules/danmu/DanmuPro': path.resolve(__dirname, 'src/utils/empty.js'),
                } : {}),
                ...(buildFlavor === 'danmu-only' ? {
                    './modules/ControlPage': path.resolve(__dirname, 'src/utils/empty.js'),
                    './modules/WorkerPage': path.resolve(__dirname, 'src/utils/empty.js'),
                    './modules/GlobalState': path.resolve(__dirname, 'src/utils/empty.js'),
                } : {}),
            },
        },
        build: {
            emptyOutDir: false,
        },
        plugins: [
            monkey({
                systemjs: false, // 显式禁用 SystemJS
                entry: 'src/main.js',
                userscript: {
                    name: scriptName,
                    namespace: 'http://tampermonkey.net/',
                    description: enableStar
                        ? '星推荐自动领取脚本'
                        : '斗鱼弹幕助手独立版',
                    version: versionBase + channelSuffix,
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
                    fileName,
                    sourcemap: false,
                },
                server: {
                    mountGmApi: true,
                }
            }),
        ],
        define: {
            __BUILD_FLAVOR__: JSON.stringify(buildFlavor),
            __BUILD_CHANNEL__: JSON.stringify(buildChannel),
            __ENABLE_DANMU_PRO__: JSON.stringify(enableDanmu),
            __ENABLE_STAR_CORE__: JSON.stringify(enableStar),
        },
    };
});

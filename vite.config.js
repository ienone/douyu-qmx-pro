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
    
    // 更清晰的脚本名称
    let scriptName;
    if (buildFlavor === 'danmu-only') {
        scriptName = `斗鱼弹幕助手${channelSuffix}`;
    } else if (buildFlavor === 'star-only') {
        scriptName = `斗鱼全民星推荐助手${channelSuffix}`;
    } else {
        scriptName = `斗鱼全民星推荐助手+弹幕助手${channelSuffix}`;
    }
    
    // 更详细的描述
    let description;
    if (buildFlavor === 'danmu-only') {
        description = '斗鱼弹幕智能补全助手 - 提供弹幕模板自动补全、全键盘操作等功能';
    } else if (buildFlavor === 'star-only') {
        description = '斗鱼全民星推荐自动领取脚本 - 自动领取红包奖励，支持多标签页管理与可视化面板';
    } else {
        description = '斗鱼全民星推荐自动领取 + 弹幕智能助手 - 集成红包自动领取与弹幕补全功能的完整版';
    }
    
    const enableDanmu = buildFlavor !== 'star-only';
    const enableStar = buildFlavor !== 'danmu-only';

    return {
        resolve: {
            alias: {
                flexsearch: path.resolve(__dirname, 'node_modules/flexsearch/dist/flexsearch.bundle.min.js'),
                // 根据构建版本，将不需要的模块替换为空文件
                ...(buildFlavor === 'star-only' ? {
                    './modules/danmu/DanmuPro': path.resolve(__dirname, 'src/utils/empty.js'),
                    './danmu/DanmuPro': path.resolve(__dirname, 'src/utils/empty.js'),
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
                    description: description,
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

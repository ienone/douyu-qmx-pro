// postbuild.js
// 这是一个 Node.js 脚本，用于在 vite-plugin-monkey 构建后强行内联 @require 依赖

const fs = require('fs');
const path = require('path');
const https = require('https');

// --- 配置 ---
// 最终输出文件名，请确保和 vite.config.js 中的 build.fileName 一致
const userscriptPath = path.join(__dirname, 'dist', '星推荐v2.user.js');
// --- 配置结束 ---

/**
 * 通过 HTTPS GET 请求获取一个 URL 的内容
 * @param {string} url
 * @returns {Promise<string>}
 */
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`请求失败，状态码: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

/**
 * 主函数，读取用户脚本，找到所有 @require，下载内容，然后替换掉原始行
 */
async function inlineRequires() {
    if (!fs.existsSync(userscriptPath)) {
        console.error(`\x1b[31m[错误]\x1b[0m 脚本文件未找到: ${userscriptPath}`);
        process.exit(1);
    }

    console.log(`[信息] 开始处理文件: ${userscriptPath}`);

    let content = fs.readFileSync(userscriptPath, 'utf-8');
    const requireRegex = /^\s*\/\/\s*@require\s+(https?:\/\/.+)\s*$/gm;
    const matches = [...content.matchAll(requireRegex)];

    if (matches.length === 0) {
        console.log('\x1b[32m[成功]\x1b[0m 没有找到 @require 语句，无需内联。');
        return;
    }

    console.log(`[信息] 找到了 ${matches.length} 个 @require 依赖，正在下载...`);
    
    try {
        const requiredScripts = await Promise.all(
            matches.map(async (match, index) => {
                const url = match[1];
                console.log(`  -> 下载中 (${index + 1}/${matches.length}): ${url}`);
                const scriptContent = await fetchUrl(url);
                return `// @require ${url}\n${scriptContent}`;
            })
        );

        // 从原始内容中移除所有的 @require 行
        content = content.replace(requireRegex, '').replace(/^\s*[\r\n]/gm, '');

        // 将下载的脚本内容合并，并在 Userscript Header 之后、主代码之前注入
        const injection = '\n\n// -------- Inlined Dependencies --------\n' + requiredScripts.join('\n\n') + '\n// ------ End Inlined Dependencies ------\n\n';
        
        const headerEndMarker = '==/UserScript==';
        const headerEndIndex = content.indexOf(headerEndMarker);
        
        if (headerEndIndex === -1) {
            console.error(`\x1b[31m[错误]\x1b[0m 未找到 UserScript 头部结束标记 "==/UserScript=="`);
            process.exit(1);
        }

        const finalContent = content.slice(0, headerEndIndex + headerEndMarker.length) + injection + content.slice(headerEndIndex + headerEndMarker.length);

        fs.writeFileSync(userscriptPath, finalContent, 'utf-8');
        console.log(`\x1b[32m[成功]\x1b[0m 所有 ${matches.length} 个 @require 依赖已成功内联到脚本中！`);

    } catch (error) {
        console.error('\x1b[31m[错误]\x1b[0m 内联处理失败:', error);
        process.exit(1);
    }
}

// 执行主函数
inlineRequires();
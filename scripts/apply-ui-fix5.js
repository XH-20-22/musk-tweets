#!/usr/bin/env node
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('🔧 更新图标样式...\n');

// 1. 修改 HTML 模板 - 替换图标为外部链接和分享图标
html = html.replace(
  /<a href="https:\/\/twitter\.com\/intent\/tweet\?url=\$\{encodeURIComponent\(tweet\.link\)\}" target="_blank" class="action-icon" title="分享推文">[\s\S]*?<\/a>\s*<a href="\$\{tweet\.link\}" target="_blank" class="action-icon" title="查看原文">[\s\S]*?<\/a>/,
  `<a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(tweet.link)}" target="_blank" class="action-icon" title="分享推文">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                  </svg>
                </a>
                <a href="\${tweet.link}" target="_blank" class="action-icon" title="查看原文">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path>
                  </svg>
                </a>`
);

fs.writeFileSync('index.html', html);

console.log('✅ 修改完成！\n');
console.log('修改内容：');
console.log('1. ✅ 第一个图标：分享/上传图标（向上箭头）');
console.log('2. ✅ 第二个图标：外部链接图标（链接符号）');
console.log('\n预览: open index.html');

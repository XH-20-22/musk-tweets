#!/usr/bin/env node
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('🔧 修改操作图标为推特原生风格...\n');

// 1. 修改图标样式 - 改为推特原生风格的图标按钮
const twitterIconsCSS = `
    
    .tweet-actions-inline {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .action-icon {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      text-decoration: none;
      color: #536471;
    }
    
    body.night-mode .action-icon {
      color: #71767b;
    }
    
    .action-icon:hover {
      background-color: rgba(29, 155, 240, 0.1);
      color: #1d9bf0;
    }
    
    body.night-mode .action-icon:hover {
      background-color: rgba(29, 155, 240, 0.1);
      color: #1d9bf0;
    }`;

// 替换原来的 .tweet-actions-inline 和 .action-icon 样式
html = html.replace(
  /\.tweet-actions-inline \{[^}]+\}[\s\S]*?\.action-icon:hover \{[^}]+\}/g,
  twitterIconsCSS
);

// 2. 修改 HTML 模板 - 使用 SVG 风格的图标（用 emoji 模拟）
html = html.replace(
  /<a href="https:\/\/twitter\.com\/intent\/tweet\?url=\$\{encodeURIComponent\(tweet\.link\)\}" target="_blank" class="action-icon" title="分享推文">📤<\/a>\s*<a href="\$\{tweet\.link\}" target="_blank" class="action-icon" title="查看原文">🔗<\/a>/,
  `<a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(tweet.link)}" target="_blank" class="action-icon" title="分享推文">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
                  </svg>
                </a>
                <a href="\${tweet.link}" target="_blank" class="action-icon" title="查看原文">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                  </svg>
                </a>`
);

fs.writeFileSync('index.html', html);

console.log('✅ 修改完成！\n');
console.log('修改内容：');
console.log('1. ✅ 操作图标改为推特原生风格');
console.log('2. ✅ 圆形按钮 + 灰色图标');
console.log('3. ✅ 悬停变蓝色背景 + 蓝色图标');
console.log('4. ✅ 使用 SVG 图标（推特风格）');
console.log('\n预览: open index.html');

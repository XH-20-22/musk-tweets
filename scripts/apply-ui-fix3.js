#!/usr/bin/env node
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('🔧 优化统计和操作按钮...\n');

// 1. 修改统计数据样式 - 改为灰色文字，去掉背景
const statsCSS = `
    
    .tweet-stats-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 10px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85rem;
      color: #666;
    }
    
    body.night-mode .tweet-stats-row {
      border-color: #333;
      color: #888;
    }
    
    .tweet-stats-row .stats-group {
      display: flex;
      gap: 20px;
      flex: 1;
    }
    
    .tweet-stats-row span {
      font-weight: normal;
      color: #666;
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 0.85rem;
    }
    
    body.night-mode .tweet-stats-row span {
      color: #888;
      background: none;
    }
    
    .tweet-stats-row .likes-count {
      color: #666;
      background: none;
    }
    
    body.night-mode .tweet-stats-row .likes-count {
      color: #888;
    }
    
    .tweet-actions-inline {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    
    .action-icon {
      font-size: 1.2rem;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
      opacity: 0.6;
      text-decoration: none;
    }
    
    .action-icon:hover {
      transform: scale(1.2);
      opacity: 1;
    }`;

// 替换原来的 .tweet-stats-row 样式
html = html.replace(
  /\.tweet-stats-row \{[^}]+\}[\s\S]*?\.tweet-stats-row \.likes-count \{[^}]+\}/g,
  statsCSS
);

// 2. 删除 .tweet-footer 相关样式
html = html.replace(
  /\.tweet-footer \{[^}]+\}[\s\S]*?\.tweet-share::before \{[^}]+\}/g,
  ''
);

// 3. 修改 HTML 模板 - 统计数据行包含图标按钮
html = html.replace(
  /<div class="tweet-stats-row">[\s\S]*?<\/div>/,
  `<div class="tweet-stats-row">
              <div class="stats-group">
                <span>\${stats.views} Views</span>
                <span>\${stats.retweets} Retweets</span>
                <span class="likes-count">\${stats.likes} Likes</span>
                <span>\${stats.bookmarks} Bookmarks</span>
              </div>
              <div class="tweet-actions-inline">
                <a href="https://twitter.com/intent/tweet?url=\${encodeURIComponent(tweet.link)}" target="_blank" class="action-icon" title="分享推文">📤</a>
                <a href="\${tweet.link}" target="_blank" class="action-icon" title="查看原文">🔗</a>
              </div>
            </div>`
);

// 4. 删除 .tweet-footer HTML 部分
html = html.replace(
  /<div class="tweet-footer">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `</div>
        </div>`
);

fs.writeFileSync('index.html', html);

console.log('✅ 优化完成！\n');
console.log('修改内容：');
console.log('1. ✅ 统计数据改为灰色文字，去掉背景色');
console.log('2. ✅ 删除底部操作按钮栏');
console.log('3. ✅ 在统计数据行右侧添加图标按钮：📤 分享 + 🔗 查看原文');
console.log('4. ✅ 图标悬停放大 + 透明度变化');
console.log('\n预览: open index.html');

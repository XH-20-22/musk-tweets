#!/usr/bin/env node
/**
 * 精确修改 musk-tweets index.html
 * 只修改用户要求的部分，保留所有其他功能
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

console.log('🔧 开始精确修改...\n');

// 1. 添加未读指示器的 CSS（在 .tweet-card 相关样式后）
const readIndicatorCSS = `
    /* 未读指示器 - 右上角圆点 */
    .tweet-card::after {
      content: '';
      position: absolute;
      top: 15px;
      right: 15px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #1DA1F2;
      box-shadow: 0 0 8px rgba(29, 161, 242, 0.5);
      transition: background-color 0.3s;
    }
    
    .tweet-card.viewed::after {
      background-color: #999;
      box-shadow: none;
    }
`;

// 在 .tweet-card 定义后插入
html = html.replace(
  /\.tweet-card \{([^}]+)\}/,
  (match) => match + readIndicatorCSS
);

// 2. 修改 tweet-content 和 translation 之间添加分割线
// 找到生成 HTML 的部分，在 translation 前添加 <hr>
html = html.replace(
  /\$\{tweet\.translation \? `<div class="tweet-translation">译：\$\{tweet\.translation\}<\/div>` : ''\}/g,
  `\${tweet.translation ? \`<hr class="translation-divider"><div class="tweet-translation">译：\${tweet.translation}</div>\` : ''}`
);

// 3. 添加分割线样式
const dividerCSS = `
    .translation-divider {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 12px 0;
    }
    
    body.night-mode .translation-divider {
      border-color: #333;
    }
`;

html = html.replace(
  /\.tweet-translation \{/,
  dividerCSS + '\n    .tweet-translation {'
);

// 4. 修改 tweet-footer 布局 - 分两行显示
// 第一行：时间戳 + 统计数据
// 第二行：查看原推 + 分享推文
html = html.replace(
  /<div class="tweet-timestamp">\$\{detailedTime\}<\/div>/g,
  '' // 移除原来的 timestamp 位置
);

html = html.replace(
  /<div class="tweet-footer">/g,
  `<div class="tweet-meta-row">
              <div class="tweet-timestamp-inline">\${detailedTime}</div>
              <div class="tweet-stats-inline">
                <span>\${stats.views} Views</span>
                <span>\${stats.retweets} Retweets</span>
                <span>\${stats.likes} Likes</span>
              </div>
            </div>
            <div class="tweet-footer">`
);

// 5. 修改统计数据为英文格式（在模板字符串中）
html = html.replace(
  /<div class="stat-item">[\s\S]*?<\/div>\s*<\/div>\s*<a href="\$\{tweet\.link\}"/g,
  `<a href="\${tweet.link}"`
);

// 6. 修改链接文字和样式
html = html.replace(/查看原推/g, 'View Original Tweet');
html = html.replace(/分享推文/g, 'Share Tweet');

// 7. 添加新的样式
const newStyles = `
    .tweet-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85rem;
      color: #666;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    body.night-mode .tweet-meta-row {
      border-color: #333;
      color: #888;
    }
    
    .tweet-timestamp-inline {
      font-size: 0.85rem;
    }
    
    .tweet-stats-inline {
      display: flex;
      gap: 12px;
    }
    
    .tweet-stats-inline span {
      font-weight: normal;
    }
    
    .tweet-footer {
      display: flex;
      gap: 15px;
      padding: 10px 0 0 0;
      border-top: none;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .tweet-link, .tweet-share {
      font-weight: normal !important;
    }
`;

html = html.replace(
  /\.tweet-footer \{[^}]+\}/,
  newStyles
);

// 保存文件
fs.writeFileSync(indexPath, html);

console.log('✅ 修改完成！\n');
console.log('修改内容：');
console.log('1. ✅ 右上角添加未读/已读指示器（蓝色/灰色圆点）');
console.log('2. ✅ 译文前添加分割线');
console.log('3. ✅ 时间和统计数据改用英文');
console.log('4. ✅ 统计和操作分两行显示');
console.log('5. ✅ 链接文字改为英文');
console.log('6. ✅ 链接字体改为常规字体');
console.log('\n预览: open ../index.html');

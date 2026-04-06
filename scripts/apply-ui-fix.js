#!/usr/bin/env node
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('🔧 开始精确修改 musk-tweets UI...\n');

// 1. 修改 .tweet-card - 添加 position: relative
html = html.replace(
  /\.tweet-card \{\s+background: white;/,
  `.tweet-card {
      position: relative;
      background: white;`
);

// 2. 在 .tweet-card:hover 后添加未读指示器样式
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
    }`;

html = html.replace(
  /(\.tweet-card:hover \{[^}]+\})/,
  `$1${readIndicatorCSS}`
);

// 3. 修改 .tweet-translation - 改用 HR 分割线
html = html.replace(
  /\.tweet-translation \{([^}]+)border-top: 1px dashed #e0e0e0;/,
  `.tweet-translation {$1`
);

// 4. 在 .tweet-translation 前添加 content-divider 样式
const dividerCSS = `
    .content-divider {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 12px 0;
    }
    
    body.night-mode .content-divider {
      border-color: #333;
    }
    
    `;

html = html.replace(
  /(\.tweet-translation \{)/,
  `${dividerCSS}$1`
);

// 5. 隐藏原 .tweet-timestamp
html = html.replace(
  /\.tweet-timestamp \{/,
  `.tweet-timestamp {
      display: none;`
);

// 6. 添加新的样式
const newStyles = `
    
    /* 时间行 */
    .tweet-time-row {
      padding: 10px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85rem;
      color: #666;
    }
    
    body.night-mode .tweet-time-row {
      border-color: #333;
      color: #888;
    }
    
    /* 统计数据行 */
    .tweet-stats-row {
      display: flex;
      gap: 15px;
      padding: 10px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 0.85rem;
      color: #666;
    }
    
    body.night-mode .tweet-stats-row {
      border-color: #333;
      color: #888;
    }
    
    .tweet-stats-row span {
      font-weight: normal;
    }`;

html = html.replace(
  /(\.tweet-footer \{)/,
  `${newStyles}\n    \n    $1`
);

// 7. 修改 .tweet-footer 样式
html = html.replace(
  /\.tweet-footer \{[^}]+\}/,
  `.tweet-footer {
      display: flex;
      gap: 15px;
      padding: 10px 0 0 0;
      border-top: none;
      align-items: center;
      flex-wrap: wrap;
    }`
);

// 8. 修改链接样式为常规字体
const linkStyles = `
    
    .tweet-link, .tweet-share {
      font-weight: normal !important;
    }`;

html = html.replace(
  /(\.tweet-share \{[^}]+\})/,
  `$1${linkStyles}`
);

// 9. 隐藏 stat-item
const hideStatItem = `
    
    .stat-item {
      display: none;
    }`;

html = html.replace(
  /(\.stat-count \{[^}]+\})/,
  `$1${hideStatItem}`
);

// 10. 修改 HTML 模板生成部分
html = html.replace(
  /\$\{tweet\.translation \? `<div class="tweet-translation">译：\$\{tweet\.translation\}<\/div>` : ''\}/,
  `\${tweet.translation ? \`<hr class="content-divider"><div class="tweet-translation">译：\${tweet.translation}</div>\` : ''}`
);

// 11. 修改时间和统计的布局
html = html.replace(
  /<div class="tweet-timestamp">\$\{detailedTime\}<\/div>\s+<div class="tweet-footer">/,
  `<div class="tweet-time-row">\${detailedTime}</div>
            <div class="tweet-stats-row">
              <span>\${stats.views} Views</span>
              <span>\${stats.retweets} Retweets</span>
              <span>\${stats.likes} Likes</span>
              <span>\${stats.bookmarks} Bookmarks</span>
            </div>
            <div class="tweet-footer">`
);

// 12. 移除 stat-item 并修改链接文字
html = html.replace(
  /<div class="stat-item">[\s\S]*?<\/div>\s+<\/div>\s+<a href="\$\{tweet\.link\}"/g,
  `<a href="\${tweet.link}"`
);

html = html.replace(/查看原推/g, 'View Original Tweet');
html = html.replace(/分享推文/g, 'Share Tweet');

fs.writeFileSync('index.html', html);

console.log('✅ 修改完成！\n');
console.log('修改内容：');
console.log('1. ✅ 右上角添加未读/已读指示器（蓝色/灰色圆点）');
console.log('2. ✅ 译文前添加分割线（HR）');
console.log('3. ✅ 时间单独一行');
console.log('4. ✅ 统计数据单独一行（英文：Views/Retweets/Likes/Bookmarks）');
console.log('5. ✅ 操作链接单独一行（英文：View Original Tweet / Share Tweet）');
console.log('6. ✅ 链接字体改为常规字体');
console.log('\n预览: open index.html');

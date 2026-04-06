#!/usr/bin/env node
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

console.log('🔧 继续优化 UI...\n');

// 1. 移除 .tweet-card.viewed 的其他样式变化，只保留圆点颜色变化
// 查找并移除 viewed 相关的透明度变化
html = html.replace(
  /\.tweet-card\.viewed \{[\s\S]*?\}/g,
  ''
);

// 确保只有 ::after 的颜色变化
const viewedStyle = `
    /* 已读推文 - 只改变右上角圆点颜色 */
    .tweet-card.viewed::after {
      background-color: #999;
      box-shadow: none;
    }`;

// 移除旧的 viewed::after 样式
html = html.replace(/\.tweet-card\.viewed::after \{[^}]+\}/g, '');

// 在未读指示器样式后添加
html = html.replace(
  /(\.tweet-card::after \{[^}]+\})/,
  `$1${viewedStyle}`
);

// 2. 推文和译文字号大 10%
// .tweet-content 原来是 1.05rem，改为 1.155rem (1.05 * 1.1)
html = html.replace(
  /\.tweet-content \{([^}]+)font-size: 1\.05rem;/,
  `.tweet-content {$1font-size: 1.155rem;`
);

// .tweet-translation 原来是 0.95rem，改为 1.045rem (0.95 * 1.1)
html = html.replace(
  /\.tweet-translation \{([^}]+)font-size: 0\.95rem;/,
  `.tweet-translation {$1font-size: 1.045rem;`
);

// 3. 时间用英文格式
// 修改 JavaScript 中的时间生成部分
html = html.replace(
  /const weekdays = \['周日', '周一', '周二', '周三', '周四', '周五', '周六'\];[\s\S]*?const detailedTime = `\$\{date\.getFullYear\(\)\}年\$\{date\.getMonth\(\) \+ 1\}月\$\{date\.getDate\(\)\}日 \$\{weekdays\[date\.getDay\(\)\]\} \$\{String\(date\.getHours\(\)\)\.padStart\(2, '0'\)\}:\$\{String\(date\.getMinutes\(\)\)\.padStart\(2, '0'\)\}:\$\{String\(date\.getSeconds\(\)\)\.padStart\(2, '0'\)\}`;/,
  `const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const detailedTime = \`\${months[date.getMonth()]} \${date.getDate()}, \${date.getFullYear()} · \${weekdays[date.getDay()]} · \${String(date.getHours()).padStart(2, '0')}:\${String(date.getMinutes()).padStart(2, '0')}:\${String(date.getSeconds()).padStart(2, '0')}\`;`
);

// 4. 统计数量用白色，likes 用玫红色
const statsColorCSS = `
    
    .tweet-stats-row span {
      font-weight: 500;
      color: white;
      background: #666;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
    }
    
    body.night-mode .tweet-stats-row span {
      background: #444;
    }
    
    .tweet-stats-row .likes-count {
      color: white;
      background: #e91e63;
    }`;

html = html.replace(
  /(\.tweet-stats-row span \{[^}]+\})/,
  statsColorCSS
);

// 修改 HTML 模板，给 likes 添加特殊 class
html = html.replace(
  /<span>\$\{stats\.likes\} Likes<\/span>/,
  `<span class="likes-count">\${stats.likes} Likes</span>`
);

// 5. 分享和原文改回中文，添加图标，平均分布宽度
const footerCSS = `
    
    .tweet-footer {
      display: flex;
      gap: 10px;
      padding: 10px 0 0 0;
      border-top: none;
      align-items: stretch;
    }
    
    .tweet-link, .tweet-share {
      flex: 1;
      text-align: center;
      padding: 10px;
      background: #f0f0f0;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      font-weight: normal;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    
    body.night-mode .tweet-link,
    body.night-mode .tweet-share {
      background: #2a2a3e;
      color: #eee;
    }
    
    .tweet-link:hover,
    .tweet-share:hover {
      background: #667eea;
      color: white;
      transform: translateY(-1px);
    }
    
    .tweet-link::before {
      content: '🔗';
      font-size: 1.1rem;
    }
    
    .tweet-share::before {
      content: '📤';
      font-size: 1.1rem;
    }`;

html = html.replace(
  /\.tweet-link, \.tweet-share \{[^}]+\}/g,
  ''
);

html = html.replace(
  /(\.stat-item \{[^}]+\})/,
  `$1${footerCSS}`
);

// 修改链接文字回中文
html = html.replace(/View Original Tweet/g, '查看原文');
html = html.replace(/Share Tweet/g, '分享推文');

fs.writeFileSync('index.html', html);

console.log('✅ 优化完成！\n');
console.log('修改内容：');
console.log('1. ✅ 已读推文只改变右上角圆点颜色，内容保持原样');
console.log('2. ✅ 推文和译文字号增大 10%');
console.log('3. ✅ 时间改用英文格式（Jan 6, 2026 · Mon · 23:16:30）');
console.log('4. ✅ 统计数量用白色背景，Likes 用玫红色');
console.log('5. ✅ 分享和原文按钮：中文+图标+自适应宽度+居中');
console.log('\n预览: open index.html');

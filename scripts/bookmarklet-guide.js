#!/usr/bin/env node
/**
 * BHGL - 浏览器书签工具
 * 在 Twitter 页面运行的 JavaScript 书签，自动提取推文数据
 */

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔖 BHGL - Twitter 推文提取书签工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 使用步骤：

1️⃣  创建书签
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   在浏览器中新建书签，名称：「提取推文」
   URL 填写下面的代码（完整复制）：

2️⃣  访问 Twitter
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   打开: https://twitter.com/elonmusk
   滚动加载一些推文

3️⃣  点击书签
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   点击刚才创建的「提取推文」书签
   会自动提取页面上的推文数据

4️⃣  复制数据
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   复制弹出的 JSON 数据
   保存到: ~/Documents/musk-tweets/data/tweets-raw.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 书签代码（复制整段）：
`);

const bookmarkletCode = `
javascript:(function(){
  const tweets = [];
  
  // 查找所有推文
  document.querySelectorAll('article[data-testid="tweet"]').forEach(article => {
    try {
      // 推文文本
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.innerText : '';
      
      // 推文链接
      const linkEl = article.querySelector('a[href*="/status/"]');
      const link = linkEl ? 'https://twitter.com' + linkEl.getAttribute('href') : '';
      
      // 时间
      const timeEl = article.querySelector('time');
      const time = timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString();
      
      // 图片
      const media = [];
      article.querySelectorAll('img[src*="/media/"]').forEach(img => {
        media.push(img.src);
      });
      
      if (text && link) {
        tweets.push({ text, link, time, media });
      }
    } catch (e) {}
  });
  
  // 显示结果
  const result = JSON.stringify(tweets, null, 2);
  const popup = window.open('', '_blank', 'width=600,height=800');
  popup.document.write(\`
    <html>
      <head>
        <title>提取的推文数据</title>
        <style>
          body { font-family: monospace; margin: 20px; }
          textarea { width: 100%; height: 600px; font-size: 12px; }
          button { padding: 10px 20px; margin: 10px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <h2>✅ 提取了 \${tweets.length} 条推文</h2>
        <button onclick="navigator.clipboard.writeText(document.getElementById('data').value).then(() => alert('已复制到剪贴板！'))">📋 复制到剪贴板</button>
        <br><br>
        <textarea id="data">\${result}</textarea>
        <p>💡 保存到: ~/Documents/musk-tweets/data/tweets-raw.json</p>
      </body>
    </html>
  \`);
})();
`;

console.log(bookmarkletCode);

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 优点：
   • 完全免费
   • 无需 API
   • 可以获取图片
   • 简单快速

❌ 缺点：
   • 需要手动操作
   • 无法自动更新

💡 另一个方案：使用第三方服务

如果你想自动化，可以考虑：
1. RapidAPI 的 Twitter 服务（付费，但便宜）
2. Apify Twitter Scraper（免费层级）
3. 等找到信用卡后使用官方 API

需要我帮你配置哪个？
`);

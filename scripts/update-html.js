// 更新 HTML 页面脚本
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.env.HOME, 'musk-tweets/data');
const PUBLIC_DIR = path.join(process.env.HOME, 'musk-tweets/public');

// 读取推文数据
const tweetsRaw = fs.readFileSync(path.join(DATA_DIR, 'tweets-raw.json'), 'utf-8');
const tweets = JSON.parse(tweetsRaw);

// 生成推文 HTML
const tweetsHTML = tweets.map(tweet => {
  const date = new Date(tweet.time);
  const formattedDate = date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="tweet-card">
      <div class="tweet-header">
        <span class="tweet-author">Elon Musk</span>
        <span class="tweet-time">${formattedDate}</span>
        ${tweet.mediaType ? `<span class="media-icon">${tweet.mediaType}</span>` : ''}
      </div>
      <div class="tweet-content">${tweet.text}</div>
      <div class="tweet-footer">
        <a href="${tweet.link}" target="_blank" class="tweet-link">查看原推</a>
      </div>
    </div>
  `;
}).join('\n');

// HTML 模板
const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elon Musk 推文合集</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .tweet-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .tweet-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }
    .tweet-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 10px;
    }
    .tweet-author {
      font-weight: bold;
      color: #1da1f2;
      font-size: 1.1rem;
    }
    .tweet-time {
      color: #666;
      font-size: 0.9rem;
    }
    .media-icon {
      font-size: 1.2rem;
      margin-left: auto;
    }
    .tweet-content {
      color: #333;
      line-height: 1.6;
      margin-bottom: 15px;
      white-space: pre-wrap;
    }
    .tweet-footer {
      text-align: right;
    }
    .tweet-link {
      color: #1da1f2;
      text-decoration: none;
      font-size: 0.9rem;
      padding: 5px 15px;
      border: 1px solid #1da1f2;
      border-radius: 20px;
      display: inline-block;
      transition: all 0.2s;
    }
    .tweet-link:hover {
      background: #1da1f2;
      color: white;
    }
    .update-time {
      text-align: center;
      color: rgba(255,255,255,0.8);
      margin-top: 20px;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Elon Musk 推文合集</h1>
    ${tweetsHTML}
    <div class="update-time">
      最后更新: ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>
</body>
</html>`;

// 写入文件
fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), htmlTemplate, 'utf-8');

console.log(`✅ 已生成 ${tweets.length} 条推文到 ${PUBLIC_DIR}/index.html`);

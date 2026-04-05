#!/bin/bash
# 抓取 2024-01-01 至今的所有 Elon Musk 推文

set -e

echo "🕷️  开始抓取 2024-01-01 至今的推文..."
echo "📅 目标时间范围: 2024-01-01 到 $(date '+%Y-%m-%d')"

cd ~/musk-tweets

# 关闭现有浏览器会话
echo "🔄 清理现有浏览器会话..."
pkill -f "playwright" 2>/dev/null || true
sleep 3

# 重启 playwright MCP server
echo "🔄 重启 Playwright MCP Server..."
cd ~/.local/lib/openclaw-internal/runtime/node/lib/node_modules/openclaw/skills/tencent/browser-operation
node setup.js --restart
sleep 2

cd ~/musk-tweets

# 打开页面
echo "🌐 打开 Elon Musk 推特页面..."
mcporter call playwright.browser_navigate url=https://x.com/elonmusk

# 等待页面加载
echo "⏳ 等待页面加载..."
sleep 5

# 多次滚动加载更多推文（80次，覆盖更长时间）
echo "📜 开始滚动加载推文（这需要约 3-4 分钟）..."
for i in {1..80}; do
  if [ $((i % 10)) -eq 0 ]; then
    echo "   已完成 $i/80 次滚动..."
  fi
  mcporter call playwright.browser_press_key key=End >/dev/null 2>&1
  sleep 2.5
done

echo "📊 提取推文数据..."

# 创建提取脚本（时间范围改为 2024-01-01）
cat > /tmp/extract_tweets_2024.js << 'EOF'
const tweets = [];
const seenLinks = new Set();
const targetStartDate = new Date('2024-01-01T00:00:00Z');
const targetEndDate = new Date();

const articles = document.querySelectorAll('article[data-testid="tweet"]');
console.log(`找到 ${articles.length} 条推文，开始筛选...`);

for (const article of articles) {
  try {
    const linkElement = article.querySelector('a[href*="/status/"]');
    if (!linkElement) continue;
    
    const link = 'https://x.com' + linkElement.getAttribute('href').split('?')[0];
    if (seenLinks.has(link)) continue;
    seenLinks.add(link);
    
    const timeElement = article.querySelector('time');
    if (!timeElement) continue;
    
    const datetime = timeElement.getAttribute('datetime');
    const tweetDate = new Date(datetime);
    
    // 只保留 2024-01-01 至今的推文
    if (tweetDate < targetStartDate || tweetDate > targetEndDate) continue;
    
    const contentElement = article.querySelector('[data-testid="tweetText"]');
    const text = contentElement ? contentElement.innerText : '';
    
    let mediaType = '';
    if (article.querySelector('[data-testid="videoPlayer"]') || article.querySelector('video')) {
      mediaType = '🎥';
    } else if (article.querySelector('img[alt="Image"]') || article.querySelector('[data-testid="tweetPhoto"]')) {
      mediaType = '📷';
    }
    
    tweets.push({
      text: text.trim(),
      time: datetime,
      link: link,
      mediaType: mediaType
    });
  } catch (e) {
    console.error('提取推文出错:', e);
  }
}

tweets.sort((a, b) => new Date(b.time) - new Date(a.time));
console.log(`✅ 共提取 ${tweets.length} 条推文 (2024-01-01 至今)`);
tweets;
EOF

# 读取脚本内容
SCRIPT_CONTENT=$(cat /tmp/extract_tweets_2024.js)

# 执行脚本并保存结果
echo "🔍 执行提取脚本..."
mcporter call playwright.browser_evaluate "function=()=>{${SCRIPT_CONTENT};return tweets;}" > data/tweets-raw.json 2>&1

# 检查结果
if [ -f data/tweets-raw.json ] && [ -s data/tweets-raw.json ]; then
  TWEET_COUNT=$(grep -o '"link"' data/tweets-raw.json | wc -l | tr -d ' ')
  echo ""
  echo "✅ 抓取完成！"
  echo "📈 共 ${TWEET_COUNT} 条推文（2024-01-01 至今）"
  echo "💾 已保存到: data/tweets-raw.json"
  
  # 显示按月份统计
  echo ""
  echo "📅 按月份统计:"
  node -e "
    const fs = require('fs');
    const tweets = JSON.parse(fs.readFileSync('data/tweets-raw.json', 'utf8'));
    const months = {};
    tweets.forEach(t => {
      const date = new Date(t.time);
      const month = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      months[month] = (months[month] || 0) + 1;
    });
    Object.keys(months).sort().forEach(m => {
      console.log('   ' + m + ': ' + months[m] + ' 条');
    });
  "
else
  echo "❌ 提取失败，请检查日志"
  exit 1
fi

# 清理临时文件
rm -f /tmp/extract_tweets_2024.js

echo ""
echo "🎉 任务完成！"

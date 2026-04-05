#!/bin/bash
# 抓取 2025-01-01 至今的所有 Elon Musk 推文
# 使用隔离浏览器实例避免冲突

set -e

echo "🕷️  开始抓取 2025-01-01 至今的推文..."
echo "📅 目标时间范围: 2025-01-01 到 $(date '+%Y-%m-%d')"

cd ~/musk-tweets

# 关闭现有浏览器会话
echo "🔄 清理现有浏览器会话..."
mcporter call playwright.browser_close 2>/dev/null || true

# 等待清理完成
sleep 2

# 打开页面
echo "🌐 打开 Elon Musk 推特页面..."
mcporter call playwright.browser_navigate url=https://x.com/elonmusk

# 等待页面加载
echo "⏳ 等待页面加载..."
sleep 5

# 多次滚动加载更多推文（滚动60次，覆盖更长时间范围）
echo "📜 开始滚动加载推文..."
for i in {1..60}; do
  echo "   第 $i/60 次滚动..."
  mcporter call playwright.browser_press_key key=End
  sleep 2.5
done

echo "📊 提取推文数据..."

# 创建提取脚本
cat > /tmp/extract_tweets.js << 'EOF'
const tweets = [];
const seenLinks = new Set();
const targetStartDate = new Date('2025-01-01T00:00:00Z');
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
    
    // 只保留 2025-01-01 至今的推文
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
console.log(`✅ 共提取 ${tweets.length} 条推文 (2025-01-01 至今)`);
tweets;
EOF

# 读取脚本内容并执行
SCRIPT_CONTENT=$(cat /tmp/extract_tweets.js)

# 使用 Node.js 将脚本内容转换为安全的 JSON 字符串
SCRIPT_JSON=$(node -e "console.log(JSON.stringify(require('fs').readFileSync('/tmp/extract_tweets.js', 'utf8')))")

# 执行脚本并保存结果
echo "🔍 执行提取脚本..."
mcporter call playwright.browser_evaluate "function=()=>{${SCRIPT_CONTENT};return tweets;}" > data/tweets-raw.json 2>&1

# 检查结果
if [ -f data/tweets-raw.json ] && [ -s data/tweets-raw.json ]; then
  TWEET_COUNT=$(cat data/tweets-raw.json | grep -o '"link"' | wc -l | tr -d ' ')
  echo ""
  echo "✅ 抓取完成！"
  echo "📈 共 ${TWEET_COUNT} 条推文"
  echo "💾 已保存到: data/tweets-raw.json"
else
  echo "❌ 提取失败，请检查日志"
  exit 1
fi

# 清理临时文件
rm -f /tmp/extract_tweets.js

echo ""
echo "🎉 任务完成！"

#!/bin/bash
# Musk Tweets Auto-Update Script V2
# 使用 mcporter 直接调用 Playwright MCP 完成推文抓取和更新

set -e

PROJECT_DIR="$HOME/musk-tweets"
SCRIPT_DIR="$PROJECT_DIR/scripts"
DATA_DIR="$PROJECT_DIR/data"
PUBLIC_DIR="$PROJECT_DIR/public"

cd "$PROJECT_DIR"

echo "========================================="
echo "🚀 Musk 推文自动更新任务开始 (V2)"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Step 1: 导航到 Elon Musk 的推特页面
echo ""
echo "📡 Step 1: 打开 Elon Musk 推特页面..."
mcporter call playwright.browser_navigate url="https://x.com/elonmusk"

# 等待页面加载
echo "⏳ 等待页面加载..."
mcporter call playwright.browser_wait_for time=5

# Step 2: 抓取推文数据
echo ""
echo "🕷️  Step 2: 抓取推文数据..."

# 使用 browser_evaluate 执行抓取脚本
FETCH_CODE=$(cat << 'EOF'
() => {
  const tweets = [];
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  
  articles.forEach((article, index) => {
    try {
      const textElement = article.querySelector('[data-testid="tweetText"]');
      const text = textElement ? textElement.innerText : '';
      
      const timeElement = article.querySelector('time');
      const time = timeElement ? timeElement.getAttribute('datetime') : '';
      
      const linkElement = article.querySelector('a[href*="/status/"]');
      const link = linkElement ? 'https://x.com' + linkElement.getAttribute('href') : '';
      
      const hasImage = article.querySelector('[data-testid="tweetPhoto"]') !== null;
      const hasVideo = article.querySelector('[data-testid="videoPlayer"]') !== null;
      let mediaType = '';
      if (hasImage) mediaType = '📷';
      if (hasVideo) mediaType = '🎥';
      
      tweets.push({ text, time, link, mediaType });
    } catch (e) {
      console.error('提取第', index, '条推文时出错:', e);
    }
  });
  
  return tweets;
}
EOF
)

# 调用 browser_evaluate 并保存结果
mcporter call playwright.browser_evaluate \
  function="$FETCH_CODE" \
  filename="$DATA_DIR/tweets-raw.json"

echo "✅ 推文数据已保存到 $DATA_DIR/tweets-raw.json"

# Step 3: 更新 HTML 页面
echo ""
echo "📝 Step 3: 更新 HTML 页面..."
node "$SCRIPT_DIR/update-html.js"

# Step 4: 部署到 GitHub Pages
echo ""
echo "🚢 Step 4: 部署到 GitHub Pages..."

if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git add .
    git commit -m "Auto-update: $(date '+%Y-%m-%d %H:%M:%S')" || echo "无需提交（无变化）"
    git push origin main
    echo "✅ 已推送到 GitHub"
else
    echo "⚠️  未初始化 Git 仓库，跳过部署"
fi

echo ""
echo "========================================="
echo "✅ 任务完成！"
echo "========================================="

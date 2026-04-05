#!/bin/bash
# Musk Tweets Auto-Update Script
# 功能：自动抓取推文、更新 HTML 页面、部署到 GitHub Pages

set -e

PROJECT_DIR="$HOME/musk-tweets"
SCRIPT_DIR="$PROJECT_DIR/scripts"
DATA_DIR="$PROJECT_DIR/data"
PUBLIC_DIR="$PROJECT_DIR/public"

cd "$PROJECT_DIR"

echo "========================================="
echo "🚀 Musk 推文自动更新任务开始"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# Step 1: 检查 Playwright MCP Server
echo ""
echo "📡 Step 1: 检查 Playwright MCP Server..."
if ! curl -s http://localhost:9090/health > /dev/null 2>&1; then
    echo "⚠️  Playwright MCP Server 未运行，尝试启动..."
    # 这里可以添加启动逻辑，暂时跳过
    echo "❌ 请手动确保 Playwright MCP Server 正在运行"
    exit 1
fi
echo "✅ Playwright MCP Server 运行正常"

# Step 2: 抓取推文数据
echo ""
echo "🕷️  Step 2: 抓取最新推文..."

# 使用 mcporter 调用 Playwright MCP
FETCH_SCRIPT=$(cat "$SCRIPT_DIR/fetch-tweets.js")

# 导航到 Elon Musk 推特页面并执行脚本
TWEETS_JSON=$(mcporter call --http-url http://localhost:9090 --allow-http playwright_execute_script --args "{
  \"script\": $(echo "$FETCH_SCRIPT" | jq -Rs .)
}" 2>&1 | grep -A 9999 '^\[' || echo "[]")

if [ "$TWEETS_JSON" = "[]" ]; then
    echo "❌ 抓取推文失败"
    exit 1
fi

# 保存原始数据
echo "$TWEETS_JSON" > "$DATA_DIR/tweets-raw.json"
echo "✅ 成功抓取推文，保存到 $DATA_DIR/tweets-raw.json"

# Step 3: 更新 HTML 页面
echo ""
echo "📝 Step 3: 更新 HTML 页面..."

node "$SCRIPT_DIR/update-html.js"
echo "✅ HTML 页面更新完成"

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

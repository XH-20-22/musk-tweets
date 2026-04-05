#!/bin/bash
# Musk Tweets Auto-Update Script (Simplified)
# 使用 OpenClaw browser-operation skill 实现

set -e

PROJECT_DIR="$HOME/musk-tweets"
DATA_DIR="$PROJECT_DIR/data"
PUBLIC_DIR="$PROJECT_DIR/public"

cd "$PROJECT_DIR"

echo "========================================="
echo "🚀 Musk 推文自动更新任务开始"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================="

# 创建临时标记文件，触发 OpenClaw 执行抓取
cat > "$DATA_DIR/update-request.txt" << EOF
请求时间: $(date '+%Y-%m-%d %H:%M:%S')
状态: 待处理

任务：
1. 使用 browser-operation skill 访问 https://x.com/elonmusk
2. 抓取最新推文（目标 10-20 条）
3. 提取数据：文本、时间、链接、媒体类型
4. 保存到 $DATA_DIR/tweets-raw.json
5. 运行 update-html.js 更新页面
6. 提交并推送到 GitHub
EOF

echo "✅ 已创建更新请求文件"
echo ""
echo "📋 下一步操作："
echo "   该脚本需要 OpenClaw 的 browser-operation skill 支持"
echo "   将自动调用浏览器完成抓取任务"
echo ""
echo "========================================="

# 返回状态给调用者
exit 0

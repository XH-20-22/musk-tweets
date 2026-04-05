#!/bin/bash

# 推文数据备份脚本
# 使用 gzip 压缩，最大程度节省空间

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_FILE="data/tweets-raw.json"
BACKUP_FILE="$BACKUP_DIR/tweets_$DATE.json.gz"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 压缩备份
if [ -f "$SOURCE_FILE" ]; then
    gzip -c "$SOURCE_FILE" > "$BACKUP_FILE"
    echo "✅ 备份成功: $BACKUP_FILE"
    
    # 显示文件大小
    ORIGINAL_SIZE=$(wc -c < "$SOURCE_FILE" | tr -d ' ')
    COMPRESSED_SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
    RATIO=$(awk "BEGIN {printf \"%.1f\", ($COMPRESSED_SIZE/$ORIGINAL_SIZE)*100}")
    
    echo "📊 原始大小: $ORIGINAL_SIZE bytes"
    echo "📊 压缩大小: $COMPRESSED_SIZE bytes"
    echo "📊 压缩率: $RATIO%"
    
    # 列出所有备份
    echo ""
    echo "📁 所有备份文件:"
    ls -lh "$BACKUP_DIR" | tail -n +2
else
    echo "❌ 错误: 找不到 $SOURCE_FILE"
    exit 1
fi

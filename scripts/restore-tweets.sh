#!/bin/bash

# 推文数据恢复脚本
# 从 gzip 压缩备份恢复数据

BACKUP_DIR="backups"
TARGET_FILE="data/tweets-raw.json"

# 检查备份目录
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 错误: 备份目录不存在"
    exit 1
fi

# 列出所有备份
echo "📁 可用的备份文件:"
echo ""
ls -1t "$BACKUP_DIR"/*.json.gz 2>/dev/null | nl -w2 -s'. '

if [ $? -ne 0 ]; then
    echo "❌ 错误: 没有找到备份文件"
    exit 1
fi

echo ""
read -p "请输入要恢复的备份编号（或按回车选择最新）: " choice

if [ -z "$choice" ]; then
    # 选择最新备份
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/*.json.gz 2>/dev/null | head -1)
else
    # 选择指定编号
    BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/*.json.gz 2>/dev/null | sed -n "${choice}p")
fi

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ 错误: 无效的选择"
    exit 1
fi

echo ""
echo "📥 准备恢复: $BACKUP_FILE"
echo "⚠️  将覆盖现有文件: $TARGET_FILE"
read -p "确认恢复? (y/N): " confirm

if [[ "$confirm" =~ ^[Yy]$ ]]; then
    # 备份当前文件（如果存在）
    if [ -f "$TARGET_FILE" ]; then
        cp "$TARGET_FILE" "$TARGET_FILE.bak"
        echo "✅ 当前文件已备份到: $TARGET_FILE.bak"
    fi
    
    # 解压恢复
    gzip -dc "$BACKUP_FILE" > "$TARGET_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ 恢复成功!"
        echo "📊 文件大小: $(ls -lh "$TARGET_FILE" | awk '{print $5}')"
    else
        echo "❌ 恢复失败"
        # 尝试从备份恢复
        if [ -f "$TARGET_FILE.bak" ]; then
            mv "$TARGET_FILE.bak" "$TARGET_FILE"
            echo "✅ 已回滚到原始文件"
        fi
        exit 1
    fi
else
    echo "❌ 取消恢复"
    exit 0
fi

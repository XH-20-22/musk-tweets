# 推文数据备份与恢复

## 📦 备份数据

使用 gzip 压缩，最大程度节省空间：

```bash
cd /Users/lzc/musk-tweets
./scripts/backup-tweets.sh
```

**输出示例：**
```
✅ 备份成功: backups/tweets_20260405_231500.json.gz
📊 原始大小: 4.2K
📊 压缩大小: 1.1K
📊 压缩率: 26.2%
```

---

## 📥 恢复数据

从备份恢复推文数据：

```bash
cd /Users/lzc/musk-tweets
./scripts/restore-tweets.sh
```

**操作步骤：**
1. 列出所有备份文件
2. 输入编号选择备份（或按回车选择最新）
3. 确认恢复（会自动备份当前文件）

---

## 📁 备份文件说明

**存储位置：** `/Users/lzc/musk-tweets/backups/`

**命名格式：** `tweets_YYYYMMDD_HHMMSS.json.gz`

**压缩率：** 通常能压缩到原文件的 **25-30%**

**空间对比：**
- 原始 JSON: ~4.2 KB
- 压缩后: ~1.1 KB
- 节省: ~70%

---

## 🔄 自动备份

可以配置定时备份（cron）：

```bash
# 每天凌晨 2 点自动备份
0 2 * * * cd /Users/lzc/musk-tweets && ./scripts/backup-tweets.sh
```

---

## 🗑️ 清理旧备份

保留最近 30 天的备份：

```bash
find backups/ -name "tweets_*.json.gz" -mtime +30 -delete
```

---

## 💾 本地 vs 服务器备份

**本地备份（当前方案）：**
- ✅ 快速、简单、无需网络
- ✅ gzip 压缩节省空间
- ❌ 本地磁盘损坏会丢失

**服务器备份（可选）：**
如需服务器备份，可使用：
- GitHub 仓库（自动同步）
- 云存储（阿里云 OSS、腾讯云 COS）
- 自建服务器（rsync、scp）

当前数据量小（~4KB），GitHub 仓库本身就是最好的备份！

---

## 📊 当前数据统计

- **推文数量**: 16 条
- **文件大小**: ~4.2 KB
- **时间范围**: 2022-2025
- **更新频率**: 手动更新

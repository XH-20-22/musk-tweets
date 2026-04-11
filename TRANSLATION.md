# 📝 翻译功能使用指南

本项目支持自动将英文推文翻译成中文。

## 🎯 功能特点

- ✅ 自动翻译推文到中文
- ✅ 跳过已有翻译的推文
- ✅ 增量翻译（避免重复工作）
- ✅ 实时保存进度
- ✅ 失败自动重试

---

## 🚀 快速开始

### 方法一：自动翻译（Google Translate）

**适用场景**：快速批量翻译，免费无需 API Key

```bash
cd ~/Documents/musk-tweets
node scripts/translate-auto.js
```

**优点**：
- 完全免费
- 无需配置
- 速度快

**缺点**：
- 翻译质量一般
- 专业术语可能不准确

---

### 方法二：工蜂 AI 翻译（推荐）

**适用场景**：追求高质量翻译

```bash
cd ~/Documents/musk-tweets
node scripts/translate-tweets.js
```

**优点**：
- 翻译质量高
- 理解上下文
- 专业术语准确

**前提条件**：
- 需要 OpenClaw 环境
- 需要工蜂 AI 访问权限

---

## 📊 翻译工作流程

```
1. 提取推文数据
   ↓
2. 运行翻译脚本
   ↓
3. 自动保存到 data/tweets-raw.json
   ↓
4. 刷新网页查看效果
```

---

## 📂 文件说明

| 文件 | 功能 |
|------|------|
| `scripts/translate-auto.js` | Google Translate 自动翻译 |
| `scripts/translate-tweets.js` | 工蜂 AI 翻译（高质量） |
| `data/tweets-raw.json` | 推文数据（含翻译） |

---

## 🔧 手动添加翻译

如果你想手动编辑翻译，直接修改 `data/tweets-raw.json`：

```json
[
  {
    "text": "The future is bright",
    "link": "https://twitter.com/...",
    "time": "2026-04-11T10:00:00.000Z",
    "media": [],
    "translation": "未来一片光明"  ← 在这里添加翻译
  }
]
```

保存后刷新网页即可看到效果。

---

## ⚙️ 高级配置

### 自定义翻译 API

如果你想使用其他翻译服务（DeepL、百度翻译等），修改脚本中的 `translateWithGoogle` 函数：

```javascript
async function translateWithCustomAPI(text) {
  // 你的 API 调用逻辑
  const response = await fetch('https://api.example.com/translate', {
    method: 'POST',
    body: JSON.stringify({ text, target: 'zh-CN' })
  });
  return await response.json();
}
```

---

## 🐛 常见问题

### Q: 翻译失败怎么办？

**A**: 脚本会自动跳过失败的推文，可以稍后重新运行：

```bash
node scripts/translate-auto.js
```

### Q: 翻译质量不满意？

**A**: 你可以：
1. 使用工蜂 AI 翻译（`translate-tweets.js`）
2. 手动编辑 `data/tweets-raw.json` 中的翻译

### Q: 如何清空所有翻译重新开始？

**A**: 编辑 `data/tweets-raw.json`，删除所有 `"translation"` 字段：

```bash
# 备份原文件
cp data/tweets-raw.json data/tweets-raw.json.bak

# 手动编辑删除 translation 字段
# 或使用脚本批量删除（待开发）
```

### Q: 翻译速度慢？

**A**: Google Translate 有频率限制，脚本已添加延迟（1.5 秒/条）。如需更快速度：
- 使用工蜂 AI（并发能力更强）
- 或使用付费翻译 API

---

## 📈 翻译统计

运行脚本后会显示统计信息：

```
📊 翻译统计:
   新翻译: 15 条
   已跳过: 3 条
   失败: 0 条
   总计: 18 条
```

---

## 🔗 相关文档

- [FEATURES.md](FEATURES.md) - 项目完整功能文档
- [BOOKMARKLET.md](BOOKMARKLET.md) - 推文数据提取指南
- [README.md](README.md) - 项目介绍

---

**提示**：翻译功能完全在本地运行，不会上传任何数据到第三方服务器（除了调用翻译 API）。

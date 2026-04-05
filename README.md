# Elon Musk 推文合集

自动抓取和展示 Elon Musk X.com (Twitter) 推文的系统。

## 🔗 在线访问

- **GitHub Pages**: https://xh-20-22.github.io/musk-tweets/
- **密码**: musk2026

## ✨ 功能特性

- 📅 **时间线导航** - 左侧按年月分组显示
- 🌙 **夜间模式** - 根据北京时间自动切换（18:00-6:00）
- 📱 **响应式设计** - 支持手机/平板访问
- 🔐 **密码保护** - 防止未授权访问
- 📊 **统计信息** - 显示总数、月份分布等

## 📂 项目结构

```
~/musk-tweets/
├── index.html                  # 主页面
├── data/
│   └── tweets-raw.json         # 推文数据
├── scripts/
│   ├── fetch-2024-now.sh       # 抓取脚本（2024至今）
│   └── fetch-2025-now.sh       # 抓取脚本（2025至今）
└── logs/                       # 抓取日志
```

## 🚀 使用方法

### 更新推文数据

```bash
cd ~/musk-tweets

# 抓取 2024 年至今的所有推文
./scripts/fetch-2024-now.sh

# 或抓取 2025 年至今的所有推文
./scripts/fetch-2025-now.sh
```

### 本地预览

```bash
open index.html
```

### 部署到 GitHub Pages

```bash
git add .
git commit -m "Update tweets"
git push
```

GitHub Pages 会在 1-3 分钟内自动更新。

## 🎨 自定义

### 修改密码

在 `index.html` 中搜索 `correctPasswordHash`，使用以下方法生成新密码的 SHA-256 哈希：

```bash
echo -n "你的新密码" | shasum -a 256
```

将输出的哈希值替换到代码中。

### 修改时间范围

编辑 `scripts/fetch-*.sh` 中的 `targetStartDate`：

```javascript
const targetStartDate = new Date('2024-01-01T00:00:00Z');  // 修改起始日期
```

## 📊 数据格式

`data/tweets-raw.json` 格式：

```json
[
  {
    "text": "推文内容",
    "time": "2024-11-06T05:01:15.000Z",
    "link": "https://x.com/elonmusk/status/...",
    "mediaType": "📷"  // 或 "🎥" 表示视频
  }
]
```

## 🛠️ 技术栈

- **前端**: 纯 HTML + CSS + JavaScript（无框架）
- **浏览器自动化**: Playwright MCP Server
- **部署**: GitHub Pages
- **抓取工具**: OpenClaw + browser-operation skill

## 📝 更新日志

### 2026-04-05
- ✅ 简化左侧时间线为按年月显示
- ✅ 移除顶部菜单栏
- ✅ 优化页面布局
- ✅ 创建 2024-now 和 2025-now 抓取脚本

### 2026-04-05 (早期)
- ✅ 添加左侧时间线
- ✅ 添加顶部菜单栏（所有/精选/月份）
- ✅ 实现精选推文功能
- ✅ 部署到 GitHub Pages

## 📄 许可

MIT License

---

**作者**: T1 🚀  
**创建日期**: 2026-04-05  
**GitHub**: https://github.com/XH-20-22/musk-tweets

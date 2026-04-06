# Musk Tweets - 功能文档

## 📋 项目概述

**项目名称**: Elon Musk Tweet Tracker  
**GitHub Pages**: https://xh-20-22.github.io/musk-tweets/  
**本地路径**: `~/Documents/musk-tweets`

一个用于追踪和展示 Elon Musk 推文的网页应用，支持时间线展示、中英文对照、夜间模式等功能。

---

## ✨ 已实现功能

### 1. 界面展示
- ✅ 推文卡片布局（头像、用户名、验证标识）
- ✅ 推文内容 + 中文翻译
- ✅ 时间显示（英文格式：Jan 6, 2026 · Mon · 23:16:30）
- ✅ 统计数据（Views / Retweets / Likes / Bookmarks）
- ✅ 操作按钮（分享推文 + 查看原文）
- ✅ 未读/已读状态指示器（右上角圆点）
- ✅ 响应式设计（适配移动端）

### 2. 交互功能
- ✅ 夜间模式切换
- ✅ 时间线滚动同步
- ✅ 推文链接跳转
- ✅ 分享功能（Twitter Intent）
- ✅ 推文卡片悬停效果
- ✅ 已读状态自动标记

### 3. 视觉设计
- ✅ 推特原生风格
- ✅ 圆形图标按钮（灰色 → 悬停蓝色）
- ✅ 统计数据灰色纯文字
- ✅ 渐变背景（日间/夜间）
- ✅ 平滑动画过渡

---

## 🔧 技术架构

### 前端
- **HTML5** - 结构
- **CSS3** - 样式（渐变、动画、响应式）
- **Vanilla JavaScript** - 交互逻辑（无框架）

### 数据来源
- **浏览器书签工具** - 手动提取 Twitter 页面数据
- **备选方案**:
  - Twitter API v2（需要信用卡验证）
  - Nitter RSS（服务不稳定）
  - 第三方服务（Apify / RapidAPI）

### 数据格式
```json
{
  "text": "推文内容（英文）",
  "link": "https://twitter.com/elonmusk/status/xxx",
  "time": "2026-04-06T12:00:00.000Z",
  "media": ["图片URL数组"],
  "translation": "推文翻译（中文）"
}
```

---

## 📁 项目结构

```
musk-tweets/
├── index.html              # 主页面
├── bookmarklet-tool.html   # 书签工具配置页面
├── BOOKMARKLET.md          # 书签工具使用说明
├── README.md               # 项目说明
├── data/
│   ├── tweets-raw.json     # 推文数据文件
│   └── images/             # 推文图片
├── scripts/
│   ├── fetch-via-twitter-api.js      # Twitter API 获取脚本
│   ├── fetch-via-nitter-v2.js        # Nitter RSS 获取脚本
│   ├── add-tweets-manually.js        # 手动添加工具
│   ├── bookmarklet-guide.js          # 书签工具说明
│   ├── apply-ui-fix*.js              # UI 优化脚本
│   └── fetch-options.js              # 数据获取方案说明
├── .env                    # API Keys（本地，不上传）
├── .gitignore              # Git 忽略配置
├── package.json            # Node.js 依赖
└── node_modules/           # 依赖包（不上传）
```

---

## 🎯 使用方法

### 方法 1: 浏览器书签工具（推荐）

1. **安装书签**
   - 参考 `BOOKMARKLET.md`
   - 创建书签，粘贴 JavaScript 代码

2. **提取数据**
   - 访问 https://twitter.com/elonmusk
   - 滚动加载推文
   - 点击书签
   - 保存数据到 `data/tweets-raw.json`

3. **查看效果**
   - 打开 `index.html`
   - 或访问 GitHub Pages

### 方法 2: Twitter API（需要信用卡）

```bash
# 配置 .env 文件
TWITTER_BEARER_TOKEN=你的Token

# 运行获取脚本
node scripts/fetch-via-twitter-api.js
```

### 方法 3: 手动添加

```bash
node scripts/add-tweets-manually.js
```

---

## 🎨 UI 优化历史

### 第一版（3ab1aa2）
- 三行布局：时间 / 统计数据 / 操作按钮
- 未读指示器（蓝色圆点）
- 统计数据标签化（白色文字 + 灰色背景）

### 第二版（379f8a9）
- 已读状态：只改变圆点颜色（蓝→灰）
- 字号增大 10%
- 时间英文化
- Likes 玫红色背景
- 操作按钮添加图标

### 第三版（61e1cc4 - 当前）
- 统计数据改为灰色纯文字（去背景）
- 删除底部按钮栏
- 操作图标移至统计行右侧
- 推特原生风格图标（圆形按钮）
- 用户名显示（@elonmusk）

---

## 🔄 数据更新流程

### 手动更新（书签工具）
1. 访问 Twitter
2. 点击书签
3. 保存数据
4. 刷新页面

**频率建议**: 每周一次

### 自动更新（API 方案 - 待实现）
```bash
# 定时任务（cron）
0 */6 * * * cd ~/Documents/musk-tweets && node scripts/fetch-via-twitter-api.js
```

---

## 🚀 部署

### GitHub Pages（自动）
```bash
git add .
git commit -m "update: xxx"
git push origin main
# 自动部署到 https://xh-20-22.github.io/musk-tweets/
```

### 本地预览
```bash
cd ~/Documents/musk-tweets
open index.html
```

---

## 📊 待实现功能

- [ ] 图片显示和下载
- [ ] 视频预览
- [ ] 搜索功能
- [ ] 标签筛选
- [ ] 数据统计图表
- [ ] 自动翻译（API）
- [ ] RSS 订阅
- [ ] 推文导出（PDF / Markdown）

---

## 🔐 安全说明

### 数据隐私
- ✅ 只获取公开推文
- ✅ 不涉及登录或认证
- ✅ 数据存储在本地

### API Keys
- ✅ 存储在 `.env`（本地）
- ✅ 已添加到 `.gitignore`
- ✅ 不会上传到 GitHub
- ✅ 只读权限，无写入权限

### 书签工具
- ✅ 只读取页面 DOM
- ✅ 不发送任何数据
- ✅ 完全本地运行
- ✅ 不修改 Twitter 页面

---

## 🐛 已知问题

1. **Nitter 服务不稳定**
   - 多个公共实例无法连接
   - SSL 连接错误
   - HTTP 降级也失败
   - **解决方案**: 使用书签工具或 API

2. **Twitter API 需要信用卡**
   - Free 层级需要验证
   - 不会扣费，只是验证
   - **临时方案**: 使用书签工具

3. **图片未显示**
   - 当前只有示例数据
   - 需要提取真实数据后才有图片
   - **计划**: 实现图片下载功能

---

## 📞 支持

- **GitHub Issues**: https://github.com/XH-20-22/musk-tweets/issues
- **项目文档**: 参考本文件和 `BOOKMARKLET.md`

---

**最后更新**: 2026-04-07  
**版本**: v1.0.0  
**状态**: ✅ 可用（使用书签工具）

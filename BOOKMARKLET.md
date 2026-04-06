# Twitter 推文提取工具

## 🔖 快速安装书签

### 方法 1：复制书签代码（最简单）

1. **复制下面的完整代码**（从 `javascript:` 开始到最后）

2. **创建新书签**：
   - Chrome: `Ctrl+D` 或 `Cmd+D`
   - 名称：`提取推文`
   - URL：粘贴下面的代码

3. **书签代码**（完整复制）：

```javascript
javascript:(function(){const tweets=[];document.querySelectorAll('article[data-testid="tweet"]').forEach(article=>{try{const textEl=article.querySelector('[data-testid="tweetText"]');const text=textEl?textEl.innerText:'';const linkEl=article.querySelector('a[href*="/status/"]');const link=linkEl?'https://twitter.com'+linkEl.getAttribute('href'):'';const timeEl=article.querySelector('time');const time=timeEl?timeEl.getAttribute('datetime'):new Date().toISOString();const media=[];article.querySelectorAll('img[src*="/media/"]').forEach(img=>{media.push(img.src)});if(text&&link){tweets.push({text,link,time,media})}}catch(e){}});const result=JSON.stringify(tweets,null,2);const popup=window.open('','_blank','width=700,height=800');popup.document.write(`<html><head><title>提取的推文数据</title><style>body{font-family:monospace;margin:20px;background:#f5f5f5}textarea{width:100%;height:500px;font-size:12px;padding:15px;border:2px solid #ddd;border-radius:8px}button{padding:12px 24px;margin:10px 5px;font-size:14px;background:#1da1f2;color:white;border:none;border-radius:8px;cursor:pointer}button:hover{background:#1a91da}.header{background:white;padding:20px;border-radius:8px;margin-bottom:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}</style></head><body><div class="header"><h2 style="color:#1da1f2;margin:0">✅ 成功提取 ${tweets.length} 条推文</h2><p style="color:#666;margin:10px 0 0 0">复制下面的数据，保存到项目的 data/tweets-raw.json 文件</p></div><button onclick="navigator.clipboard.writeText(document.getElementById('data').value).then(()=>alert('✅ 已复制到剪贴板！'))">📋 复制到剪贴板</button><button onclick="const blob=new Blob([document.getElementById('data').value],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='tweets-raw.json';a.click()">💾 下载 JSON 文件</button><br><br><textarea id="data">${result}</textarea></body></html>`)})();
```

---

## 📝 使用步骤

### 1. 访问 Twitter
打开: https://twitter.com/elonmusk
滚动加载 20-30 条推文

### 2. 点击书签
点击刚才创建的 "提取推文" 书签

### 3. 保存数据
- 弹窗中点击 "📋 复制到剪贴板" 或 "💾 下载 JSON 文件"
- 保存到: `~/Documents/musk-tweets/data/tweets-raw.json`

### 4. 查看效果
刷新 `index.html` 即可看到推文

---

## 💡 替代方法：手动创建书签

如果复制粘贴不行，试试这个：

1. 在浏览器书签栏右键 → "添加页面"
2. 名称：`提取推文`
3. 网址：粘贴上面的 `javascript:` 代码
4. 保存

---

## 🔧 故障排查

如果书签不工作：

1. **确保在 Twitter 页面**
   - 必须在 `twitter.com` 域名下
   - 不能在首页，要在用户页面

2. **检查浏览器权限**
   - 有些浏览器阻止 JavaScript 书签
   - 试试 Chrome 或 Firefox

3. **手动提取**
   - 按 `F12` 打开开发者工具
   - 切换到 Console 标签
   - 粘贴上面的代码（去掉 `javascript:` 前缀）
   - 按回车运行

---

## 📂 数据文件位置

保存路径: `~/Documents/musk-tweets/data/tweets-raw.json`

示例数据格式:
```json
[
  {
    "text": "推文内容",
    "link": "https://twitter.com/elonmusk/status/xxx",
    "time": "2026-04-06T12:00:00.000Z",
    "media": ["图片URL"]
  }
]
```

---

## 🎉 完成

数据保存后刷新 `index.html` 即可查看效果！

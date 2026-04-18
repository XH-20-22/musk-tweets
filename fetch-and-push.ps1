# fetch-and-push.ps1
# Musk 推文抓取 + 自动推送到 GitHub Pages
# 用法: powershell -ExecutionPolicy Bypass -File fetch-and-push.ps1

$ErrorActionPreference = "Stop"
$REPO_DIR = "C:\Users\Administrator\.openclaw\workspace\musk-tweets"
$TWEETS_JSON = "$REPO_DIR\tweets.json"
$TRANSLATE_API = "https://translate.googleapis.com/translate_a/single"

Write-Host "🚀 开始抓取 Musk 推文..." -ForegroundColor Cyan

# ===== 1. 用 Playwright MCP 抓取推文 =====
Write-Host "🌐 打开浏览器访问 x.com/elonmusk..."

$JS_EXTRACT = @'
() => {
  const articles = Array.from(document.querySelectorAll('article'));
  const tweets = [];
  const seen = new Set();

  articles.forEach(article => {
    try {
      const timeEl = article.querySelector('time');
      if (!timeEl) return;
      const datetime = timeEl.getAttribute('datetime');
      if (!datetime) return;

      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.textContent.trim() : '';

      const linkEl = article.querySelector('a[href*="/status/"]');
      const link = linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '';
      const id = link.match(/status\/(\d+)/)?.[1] || '';

      if (!id || seen.has(id)) return;
      seen.add(id);

      const replyEl = article.querySelector('[data-testid="reply"]');
      const retweetEl = article.querySelector('[data-testid="retweet"]');
      const likeEl = article.querySelector('[data-testid="like"]');

      const parseNum = el => {
        if (!el) return 0;
        const t = el.textContent.trim();
        if (!t) return 0;
        if (t.includes('K')) return Math.round(parseFloat(t) * 1000);
        if (t.includes('M')) return Math.round(parseFloat(t) * 1000000);
        return parseInt(t.replace(/[^0-9]/g, '')) || 0;
      };

      const videoEl = article.querySelector('video');
      const imgEls = Array.from(article.querySelectorAll('img[src*="pbs.twimg.com"]'));
      const media = [];
      if (videoEl) {
        // 尝试获取视频 src（m3u8 或 mp4）
        const videoSrc = videoEl.src || videoEl.querySelector('source')?.src || '';
        // 也从 <source> 元素获取
        const sourceEls = Array.from(videoEl.querySelectorAll('source'));
        const bestSrc = sourceEls.find(s => s.src.includes('.mp4'))?.src
          || sourceEls[0]?.src
          || videoSrc;
        media.push({ type: 'video', url: bestSrc });
      }
      imgEls.forEach(img => media.push({ type: 'photo', url: img.src }));

      if (text || media.length > 0) {
        tweets.push({
          id,
          text,
          text_cn: '',
          created_at: datetime,
          link,
          stats: {
            likes: parseNum(likeEl),
            retweets: parseNum(retweetEl),
            replies: parseNum(replyEl)
          },
          media,
          read: false
        });
      }
    } catch(e) {}
  });

  return JSON.stringify(tweets);
}
'@

# 导航到 x.com/elonmusk
try {
    mcporter call playwright.browser_navigate "url=https://x.com/elonmusk" | Out-Null
    Start-Sleep -Seconds 4
} catch {
    Write-Host "⚠️ 浏览器导航失败，尝试启动浏览器..." -ForegroundColor Yellow
    mcporter call playwright.browser_launch "profile=openclaw" "headless=false" | Out-Null
    Start-Sleep -Seconds 3
    mcporter call playwright.browser_navigate "url=https://x.com/elonmusk" | Out-Null
    Start-Sleep -Seconds 5
}

# 滚动加载
Write-Host "📜 滚动加载推文..."
for ($i = 1; $i -le 10; $i++) {
    mcporter call playwright.browser_evaluate "function=()=>window.scrollBy(0,1500)" | Out-Null
    Start-Sleep -Seconds 2
}

# 提取推文
Write-Host "📊 提取推文数据..."
$raw = mcporter call playwright.browser_evaluate "function=$JS_EXTRACT" 2>&1
$tweetsJson = ($raw | Select-String -Pattern '^\[' | Select-Object -First 1).Line
if (-not $tweetsJson) {
    # 尝试从输出中提取 JSON
    $tweetsJson = ($raw | Where-Object { $_ -match '^\[' } | Select-Object -First 1)
}

if (-not $tweetsJson) {
    Write-Host "⚠️ 未能提取到推文数据，使用现有数据" -ForegroundColor Yellow
    exit 0
}

$newTweets = $tweetsJson | ConvertFrom-Json
Write-Host "✅ 抓取到 $($newTweets.Count) 条推文" -ForegroundColor Green

# ===== 2. 翻译（Google Translate 免费 API）=====
Write-Host "🌏 翻译中文..."
$translated = @()
foreach ($t in $newTweets) {
    if ($t.text -and -not $t.text_cn) {
        try {
            $encoded = [System.Uri]::EscapeDataString($t.text)
            $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=$encoded"
            $resp = Invoke-RestMethod -Uri $url -TimeoutSec 5
            $cn = ($resp[0] | ForEach-Object { $_[0] }) -join ""
            $t.text_cn = $cn
        } catch {
            $t.text_cn = ""
        }
    }
    $translated += $t
}

# ===== 3. 合并到现有数据 =====
Write-Host "🔀 合并数据..."
$existing = @()
if (Test-Path $TWEETS_JSON) {
    $existing = Get-Content $TWEETS_JSON -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($existing -isnot [array]) { $existing = @() }
}

$existingIds = @{}
foreach ($t in $existing) { $existingIds[$t.id] = $true }

$added = 0
foreach ($t in $translated) {
    if (-not $existingIds.ContainsKey($t.id)) {
        $existing = @($t) + $existing
        $added++
    }
}

# 按时间倒序排列
$merged = $existing | Sort-Object { [datetime]$_.created_at } -Descending

Write-Host "➕ 新增 $added 条，总计 $($merged.Count) 条" -ForegroundColor Green

# ===== 4. 写入 tweets.json =====
$merged | ConvertTo-Json -Depth 10 | Set-Content $TWEETS_JSON -Encoding UTF8
Write-Host "💾 已保存到 $TWEETS_JSON"

# ===== 5. Git push =====
Write-Host "📤 推送到 GitHub..."
Push-Location $REPO_DIR

git add tweets.json
$status = git status --porcelain
if ($status) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "auto-update: $timestamp ($($merged.Count) tweets)"
    git push origin main
    Write-Host "✅ 推送成功！页面将在 1-2 分钟后更新" -ForegroundColor Green
    Write-Host "🔗 https://xh-20-22.github.io/musk-tweets/" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ 没有新数据，跳过 push" -ForegroundColor Yellow
}

Pop-Location
Write-Host "🎯 完成！$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

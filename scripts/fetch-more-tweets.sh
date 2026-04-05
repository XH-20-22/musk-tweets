#!/bin/bash
# 抓取更多 2026 年推文的脚本
# 使用方法: ./scripts/fetch-more-tweets.sh

echo "🕷️  开始抓取 2026 年所有推文..."
echo "⏰ 预计需要 3-5 分钟..."

cd ~/musk-tweets

# 多次滚动加载更多推文
for i in {1..30}; do
  echo "📜 第 $i 次滚动..."
  mcporter call playwright.browser_press_key key=End
  sleep 2
done

echo "📊 提取推文数据..."

# 提取所有推文
mcporter call playwright.browser_evaluate "function=()=>{
  const tweets = [];
  const seenLinks = new Set();
  const articles = document.querySelectorAll('article[data-testid=\"tweet\"]');
  for (const article of articles) {
    try {
      const linkElement = article.querySelector('a[href*=\"/status/\"]');
      if (!linkElement) continue;
      const link = 'https://x.com' + linkElement.getAttribute('href').split('?')[0];
      if (seenLinks.has(link)) continue;
      seenLinks.add(link);
      const timeElement = article.querySelector('time');
      if (!timeElement) continue;
      const datetime = timeElement.getAttribute('datetime');
      const year = new Date(datetime).getFullYear();
      if (year !== 2026) continue;
      const contentElement = article.querySelector('[data-testid=\"tweetText\"]');
      const text = contentElement ? contentElement.innerText : '';
      let mediaType = '';
      if (article.querySelector('[data-testid=\"videoPlayer\"]') || article.querySelector('video')) {
        mediaType = '🎥';
      } else if (article.querySelector('img[alt=\"Image\"]') || article.querySelector('[data-testid=\"tweetPhoto\"]')) {
        mediaType = '📷';
      }
      tweets.push({text: text.trim(), time: datetime, link: link, mediaType: mediaType});
    } catch (e) {}
  }
  tweets.sort((a, b) => new Date(b.time) - new Date(a.time));
  return tweets;
}" > data/tweets-raw.json

echo "✅ 抓取完成！数据已保存到 data/tweets-raw.json"
echo "📈 推文数量: $(cat data/tweets-raw.json | grep -o '\"link\"' | wc -l)"

// 简化版：提取当前页面所有可见的 2026 年推文
const tweets = [];
const seenLinks = new Set();

const articles = document.querySelectorAll('article[data-testid="tweet"]');
console.log(`找到 ${articles.length} 条推文`);

for (const article of articles) {
  try {
    const linkElement = article.querySelector('a[href*="/status/"]');
    if (!linkElement) continue;
    
    const link = 'https://x.com' + linkElement.getAttribute('href').split('?')[0];
    if (seenLinks.has(link)) continue;
    seenLinks.add(link);
    
    const timeElement = article.querySelector('time');
    if (!timeElement) continue;
    
    const datetime = timeElement.getAttribute('datetime');
    const tweetDate = new Date(datetime);
    const year = tweetDate.getFullYear();
    
    // 只保留 2026 年
    if (year !== 2026) continue;
    
    const contentElement = article.querySelector('[data-testid="tweetText"]');
    const text = contentElement ? contentElement.innerText : '';
    
    let mediaType = '';
    if (article.querySelector('[data-testid="videoPlayer"]') || article.querySelector('video')) {
      mediaType = '🎥';
    } else if (article.querySelector('img[alt="Image"]') || article.querySelector('[data-testid="tweetPhoto"]')) {
      mediaType = '📷';
    }
    
    tweets.push({
      text: text.trim(),
      time: datetime,
      link: link,
      mediaType: mediaType
    });
  } catch (e) {
    console.error('提取推文出错:', e);
  }
}

tweets.sort((a, b) => new Date(b.time) - new Date(a.time));
console.log(`共提取 ${tweets.length} 条 2026 年推文`);
JSON.stringify(tweets, null, 2);

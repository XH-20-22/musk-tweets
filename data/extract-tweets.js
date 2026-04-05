// 推文提取脚本
const tweets = [];
const articles = document.querySelectorAll('article[data-testid="tweet"]');

articles.forEach((article, index) => {
  try {
    // 提取推文文本
    const textElement = article.querySelector('[data-testid="tweetText"]');
    const text = textElement ? textElement.innerText : '';
    
    // 提取时间
    const timeElement = article.querySelector('time');
    const time = timeElement ? timeElement.getAttribute('datetime') : '';
    
    // 提取推文链接
    const linkElement = article.querySelector('a[href*="/status/"]');
    const link = linkElement ? 'https://x.com' + linkElement.getAttribute('href') : '';
    
    // 检测媒体类型
    const hasImage = article.querySelector('[data-testid="tweetPhoto"]') !== null;
    const hasVideo = article.querySelector('[data-testid="videoPlayer"]') !== null;
    let mediaType = '';
    if (hasImage) mediaType = '📷';
    if (hasVideo) mediaType = '🎥';
    
    tweets.push({
      text,
      time,
      link,
      mediaType
    });
  } catch (e) {
    console.error('提取第', index, '条推文时出错:', e);
  }
});

JSON.stringify(tweets, null, 2);

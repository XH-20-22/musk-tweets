// 推文提取脚本（简化版，避免 testid 问题）
const tweets = [];
const articles = document.querySelectorAll('article');

articles.forEach((article, index) => {
  try {
    // 提取推文文本 - 使用更通用的选择器
    const textElement = article.querySelector('[dir="auto"][lang]');
    const text = textElement ? textElement.innerText : '';
    
    // 提取时间
    const timeElement = article.querySelector('time');
    const time = timeElement ? timeElement.getAttribute('datetime') : '';
    
    // 提取推文链接
    const linkElement = article.querySelector('a[href*="/status/"]');
    const link = linkElement ? 'https://x.com' + linkElement.getAttribute('href') : '';
    
    // 检测媒体类型 - 查找图片和视频元素
    const hasImage = article.querySelector('img[src*="pbs.twimg.com"]') !== null;
    const hasVideo = article.querySelector('video') !== null;
    let mediaType = '';
    if (hasImage && !hasVideo) mediaType = '📷';
    if (hasVideo) mediaType = '🎥';
    
    // 只添加有内容的推文
    if (text || link) {
      tweets.push({
        text,
        time,
        link,
        mediaType
      });
    }
  } catch (e) {
    console.error('提取第', index, '条推文时出错:', e);
  }
});

JSON.stringify(tweets, null, 2);

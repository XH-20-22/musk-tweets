// 抓取 2026 年所有 Elon Musk 推文
// 通过滚动加载更多推文，直到到达 2025 年或达到抓取上限

(async () => {
  const tweets = [];
  const seenLinks = new Set();
  let scrollCount = 0;
  const maxScrolls = 50; // 最多滚动 50 次
  let consecutiveNoNew = 0;
  
  // 目标年份
  const targetYear = 2026;
  
  console.log('开始抓取 2026 年推文...');
  
  while (scrollCount < maxScrolls && consecutiveNoNew < 3) {
    // 提取当前可见的推文
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    console.log(`第 ${scrollCount + 1} 次扫描，找到 ${articles.length} 条推文`);
    
    let newTweetsCount = 0;
    
    for (const article of articles) {
      try {
        // 提取推文链接
        const linkElement = article.querySelector('a[href*="/status/"]');
        if (!linkElement) continue;
        
        const link = 'https://x.com' + linkElement.getAttribute('href').split('?')[0];
        
        // 去重
        if (seenLinks.has(link)) continue;
        seenLinks.add(link);
        
        // 提取时间
        const timeElement = article.querySelector('time');
        if (!timeElement) continue;
        
        const datetime = timeElement.getAttribute('datetime');
        const tweetDate = new Date(datetime);
        const year = tweetDate.getFullYear();
        
        // 只保留 2026 年的推文
        if (year < targetYear) {
          console.log(`遇到 ${year} 年推文，停止抓取`);
          consecutiveNoNew = 3; // 强制停止
          break;
        }
        
        if (year !== targetYear) continue;
        
        // 提取推文内容
        const contentElement = article.querySelector('[data-testid="tweetText"]');
        const text = contentElement ? contentElement.innerText : '';
        
        // 提取媒体类型
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
        
        newTweetsCount++;
        
      } catch (e) {
        console.error('提取推文出错:', e);
      }
    }
    
    console.log(`本次新增 ${newTweetsCount} 条推文，累计 ${tweets.length} 条`);
    
    if (newTweetsCount === 0) {
      consecutiveNoNew++;
    } else {
      consecutiveNoNew = 0;
    }
    
    // 滚动到底部加载更多
    window.scrollTo(0, document.body.scrollHeight);
    
    // 等待加载
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    scrollCount++;
  }
  
  console.log(`抓取完成！共 ${tweets.length} 条 2026 年推文`);
  
  // 按时间倒序排序（最新的在前）
  tweets.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  return tweets;
})();

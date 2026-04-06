#!/usr/bin/env node
/**
 * BHGL - Fetch Tweets via Nitter (优化版)
 * 使用更多备用实例 + 更宽松的 SSL 配置
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  username: 'elonmusk',
  nitterInstances: [
    // 更多备用实例
    'nitter.privacydev.net',
    'nitter.poast.org',
    'nitter.net',
    'nitter.cz',
    'nitter.unixfox.eu',
    'nitter.1d4.us',
    'nitter.kavin.rocks',
    'nitter.fdn.fr',
    'nitter.nixnet.services',
    'nitter.42l.fr'
  ],
  maxTweets: 50,
  outputFile: path.join(__dirname, '../data/tweets-raw.json'),
  imagesDir: path.join(__dirname, '../data/images'),
};

/**
 * 解析 RSS XML
 */
function parseRSS(xml) {
  const tweets = [];
  
  // 提取所有 <item> 标签
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    
    // 提取字段
    const title = (item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || [])[1] || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const description = (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || [])[1] || '';
    
    if (link && title) {
      // 清理文本
      const cleanText = title
        .replace(/<[^>]+>/g, '') // 移除 HTML 标签
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
      
      tweets.push({
        text: cleanText,
        link: link.replace(/nitter\.[^\/]+/, 'twitter.com'),
        time: new Date(pubDate).toISOString(),
        media: extractMedia(description)
      });
    }
  }
  
  return tweets;
}

/**
 * 从描述中提取媒体链接
 */
function extractMedia(description) {
  const media = [];
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;
  
  while ((match = imgRegex.exec(description)) !== null) {
    const url = match[1];
    if (url && !url.includes('avatar') && !url.includes('profile')) {
      // 转换为完整 URL
      if (url.startsWith('/pic/')) {
        media.push(`https://nitter.net${url}`);
      } else {
        media.push(url);
      }
    }
  }
  
  return media;
}

/**
 * 下载图片
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      rejectUnauthorized: false, // 允许自签名证书
      timeout: 10000
    };
    
    protocol.get(url, options, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(outputPath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 从 Nitter 实例获取 RSS
 */
function fetchFromNitter(instance, useHttp = false) {
  return new Promise((resolve, reject) => {
    const protocol = useHttp ? 'http' : 'https';
    const url = `${protocol}://${instance}/${CONFIG.username}/rss`;
    
    console.log(`📡 尝试 ${instance} (${protocol.toUpperCase()})...`);
    
    const options = {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      rejectUnauthorized: false // 允许自签名证书
    };
    
    const lib = useHttp ? http : https;
    
    const req = lib.get(url, options, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const tweets = parseRSS(data);
            if (tweets.length > 0) {
              resolve({ instance, tweets });
            } else {
              reject(new Error('No tweets found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        reject(new Error('Redirect - try different instance'));
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 BHGL - Nitter RSS 数据获取 (优化版)\n');
  console.log(`📌 目标用户: @${CONFIG.username}`);
  console.log(`📊 最多获取: ${CONFIG.maxTweets} 条\n`);
  console.log(`🔧 尝试 ${CONFIG.nitterInstances.length} 个实例...\n`);
  
  // 尝试所有实例（先 HTTPS 再 HTTP）
  for (const instance of CONFIG.nitterInstances) {
    // 先尝试 HTTPS
    try {
      const result = await fetchFromNitter(instance, false);
      const tweets = result.tweets.slice(0, CONFIG.maxTweets);
      
      console.log(`✅ 成功从 ${instance} 获取 ${tweets.length} 条推文\n`);
      
      // 下载图片
      const imagesDir = CONFIG.imagesDir;
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      
      let downloadedImages = 0;
      for (const tweet of tweets) {
        if (tweet.media && tweet.media.length > 0) {
          const tweetId = tweet.link.split('/').pop();
          for (let i = 0; i < tweet.media.length; i++) {
            try {
              const imageUrl = tweet.media[i];
              const filename = `${tweetId}_${i}.jpg`;
              const outputPath = path.join(imagesDir, filename);
              
              if (!fs.existsSync(outputPath)) {
                await downloadImage(imageUrl, outputPath);
                downloadedImages++;
                console.log(`📥 下载图片: ${filename}`);
              }
              
              tweet.media[i] = `./data/images/${filename}`;
            } catch (error) {
              console.log(`⚠️  图片下载失败: ${error.message}`);
            }
          }
        }
      }
      
      console.log(`\n📦 共下载 ${downloadedImages} 张图片`);
      
      // 保存数据
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(tweets, null, 2));
      console.log(`\n💾 数据已保存: ${CONFIG.outputFile}`);
      
      // 显示示例
      console.log('\n📋 最新推文示例:');
      tweets.slice(0, 3).forEach((tweet, index) => {
        console.log(`\n${index + 1}. ${tweet.text.substring(0, 80)}...`);
        console.log(`   时间: ${new Date(tweet.time).toLocaleString('zh-CN')}`);
        console.log(`   链接: ${tweet.link}`);
        if (tweet.media.length > 0) {
          console.log(`   图片: ${tweet.media.length} 张`);
        }
      });
      
      console.log('\n🎉 完成！');
      return;
      
    } catch (error) {
      console.log(`   ❌ HTTPS 失败: ${error.message}`);
      
      // 如果 HTTPS 失败，尝试 HTTP
      try {
        const result = await fetchFromNitter(instance, true);
        const tweets = result.tweets.slice(0, CONFIG.maxTweets);
        
        console.log(`   ✅ HTTP 成功！获取 ${tweets.length} 条推文\n`);
        
        // 保存数据（简化版，不下载图片）
        fs.writeFileSync(CONFIG.outputFile, JSON.stringify(tweets, null, 2));
        console.log(`\n💾 数据已保存: ${CONFIG.outputFile}`);
        console.log('⚠️  注意: 使用 HTTP 连接，图片下载已跳过\n');
        console.log('🎉 完成！');
        return;
        
      } catch (httpError) {
        console.log(`   ❌ HTTP 也失败: ${httpError.message}\n`);
      }
    }
  }
  
  console.error('\n❌ 所有 Nitter 实例都失败了\n');
  console.log('💡 其他方案:');
  console.log('1. 使用代理访问 Nitter');
  console.log('2. 自建 Nitter 实例');
  console.log('3. 等待找到信用卡后使用 Twitter API');
  console.log('4. 使用第三方服务（如 RapidAPI）\n');
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  });
}

module.exports = { parseRSS, fetchFromNitter };

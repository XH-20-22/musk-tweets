#!/usr/bin/env node
/**
 * BHGL - Fetch Tweets via Nitter RSS
 * 方案 D: 通过 Nitter RSS Feed 获取推文（安全、免费、无需登录）
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  username: 'elonmusk',
  nitterInstances: [
    'nitter.net',
    'nitter.poast.org',
    'nitter.privacydev.net',
    'nitter.cz'
  ],
  maxTweets: 50,
  outputFile: path.join(__dirname, '../data/tweets-raw.json'),
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
      tweets.push({
        text: title.trim(),
        link: link.replace('nitter.net', 'twitter.com').replace(/nitter\.[^\/]+/, 'twitter.com'),
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
    if (url && !url.includes('avatar')) {
      media.push(url);
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
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(outputPath);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 从 Nitter 实例获取 RSS
 */
function fetchFromNitter(instance) {
  return new Promise((resolve, reject) => {
    const url = `https://${instance}/${CONFIG.username}/rss`;
    
    console.log(`📡 尝试从 ${instance} 获取数据...`);
    
    https.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BHGL/1.0)'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const tweets = parseRSS(data);
            resolve({ instance, tweets });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 BHGL - 开始获取 Elon Musk 推文\n');
  console.log(`📌 目标用户: @${CONFIG.username}`);
  console.log(`📊 最多获取: ${CONFIG.maxTweets} 条\n`);
  
  // 尝试多个 Nitter 实例
  for (const instance of CONFIG.nitterInstances) {
    try {
      const result = await fetchFromNitter(instance);
      const tweets = result.tweets.slice(0, CONFIG.maxTweets);
      
      console.log(`✅ 成功从 ${instance} 获取 ${tweets.length} 条推文\n`);
      
      // 下载图片（可选）
      const imagesDir = path.join(__dirname, '../data/images');
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
              
              // 更新为本地路径
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
      
      console.log('\n🎉 完成！现在可以运行 generate-page.js 生成页面');
      return;
      
    } catch (error) {
      console.log(`❌ ${instance} 失败: ${error.message}`);
    }
  }
  
  console.error('\n❌ 所有 Nitter 实例都失败了');
  console.log('\n💡 建议：');
  console.log('1. 检查网络连接');
  console.log('2. 尝试访问 https://nitter.net/elonmusk 确认服务可用');
  console.log('3. 或者使用其他方案（Twitter API）');
}

// 运行
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  });
}

module.exports = { parseRSS, fetchFromNitter };

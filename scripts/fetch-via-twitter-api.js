#!/usr/bin/env node
/**
 * BHGL - Fetch Tweets via Twitter API v2
 * 使用官方 Twitter API 获取推文数据
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 加载配置
require('dotenv').config();

const CONFIG = {
  username: 'elonmusk',
  userId: '44196397', // Elon Musk 的 Twitter User ID
  maxResults: 50,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
  outputFile: path.join(__dirname, '../data/tweets-raw.json'),
  imagesDir: path.join(__dirname, '../data/images'),
};

/**
 * 调用 Twitter API v2
 */
function fetchTweets() {
  return new Promise((resolve, reject) => {
    const url = `https://api.twitter.com/2/users/${CONFIG.userId}/tweets?max_results=${CONFIG.maxResults}&tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url`;
    
    const options = {
      hostname: 'api.twitter.com',
      path: url.replace('https://api.twitter.com', ''),
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CONFIG.bearerToken}`,
        'User-Agent': 'v2TweetLookupJS'
      }
    };
    
    console.log('📡 正在从 Twitter API 获取数据...\n');
    
    https.get(options, (response) => {
      let data = '';
      
      response.on('data', chunk => data += chunk);
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`JSON 解析失败: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * 下载图片
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(outputPath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // 处理重定向
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

/**
 * 转换数据格式
 */
function transformData(apiData) {
  const tweets = [];
  const mediaMap = {};
  
  // 构建媒体映射
  if (apiData.includes && apiData.includes.media) {
    apiData.includes.media.forEach(media => {
      mediaMap[media.media_key] = media.url || media.preview_image_url;
    });
  }
  
  // 转换推文数据
  apiData.data.forEach(tweet => {
    const tweetData = {
      text: tweet.text,
      link: `https://twitter.com/${CONFIG.username}/status/${tweet.id}`,
      time: tweet.created_at,
      stats: {
        views: formatNumber(tweet.public_metrics.impression_count || 0),
        retweets: formatNumber(tweet.public_metrics.retweet_count),
        likes: formatNumber(tweet.public_metrics.like_count),
        bookmarks: formatNumber(tweet.public_metrics.bookmark_count || 0)
      },
      media: []
    };
    
    // 添加媒体
    if (tweet.attachments && tweet.attachments.media_keys) {
      tweet.attachments.media_keys.forEach(key => {
        if (mediaMap[key]) {
          tweetData.media.push(mediaMap[key]);
        }
      });
    }
    
    tweets.push(tweetData);
  });
  
  return tweets;
}

/**
 * 格式化数字
 */
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 BHGL - Twitter API v2 数据获取\n');
  console.log(`📌 目标用户: @${CONFIG.username}`);
  console.log(`📊 获取数量: ${CONFIG.maxResults} 条\n`);
  
  // 检查 Bearer Token
  if (!CONFIG.bearerToken) {
    console.error('❌ 错误: 未找到 Bearer Token');
    console.log('💡 请确保 .env 文件中有 TWITTER_BEARER_TOKEN');
    process.exit(1);
  }
  
  try {
    // 获取数据
    const apiData = await fetchTweets();
    
    if (!apiData.data || apiData.data.length === 0) {
      console.error('❌ 未获取到推文数据');
      console.log('返回数据:', JSON.stringify(apiData, null, 2));
      process.exit(1);
    }
    
    console.log(`✅ 成功获取 ${apiData.data.length} 条推文\n`);
    
    // 转换数据格式
    const tweets = transformData(apiData);
    
    // 下载图片
    if (!fs.existsSync(CONFIG.imagesDir)) {
      fs.mkdirSync(CONFIG.imagesDir, { recursive: true });
    }
    
    let downloadedImages = 0;
    for (const tweet of tweets) {
      if (tweet.media && tweet.media.length > 0) {
        const tweetId = tweet.link.split('/').pop();
        for (let i = 0; i < tweet.media.length; i++) {
          try {
            const imageUrl = tweet.media[i];
            const filename = `${tweetId}_${i}.jpg`;
            const outputPath = path.join(CONFIG.imagesDir, filename);
            
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
      console.log(`   ❤️ ${tweet.stats.likes} | 🔁 ${tweet.stats.retweets} | 👁 ${tweet.stats.views}`);
      if (tweet.media.length > 0) {
        console.log(`   图片: ${tweet.media.length} 张`);
      }
    });
    
    console.log('\n🎉 完成！现在可以运行 generate-page.js 生成页面');
    
    // 显示 API 使用情况
    console.log('\n📊 API 使用情况:');
    console.log(`   本次请求: 1 次`);
    console.log(`   免费额度: 500,000 次/月`);
    console.log(`   剩余额度: 充足 ✅`);
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 可能的原因:');
      console.log('1. Bearer Token 不正确');
      console.log('2. API 权限未启用');
      console.log('3. Token 已过期');
    } else if (error.message.includes('429')) {
      console.log('\n💡 速率限制:');
      console.log('请稍后再试（通常 15 分钟后恢复）');
    }
    
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { fetchTweets, transformData };

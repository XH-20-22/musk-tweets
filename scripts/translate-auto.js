#!/usr/bin/env node
/**
 * 推文自动翻译脚本（简化版）
 * 手动提供翻译或使用在线翻译 API
 */

const fs = require('fs');
const path = require('path');

// 配置
const DATA_FILE = path.join(__dirname, '../data/tweets-raw.json');

// 读取推文数据
function loadTweets() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 无法读取推文数据:', error.message);
    process.exit(1);
  }
}

// 保存翻译后的数据
function saveTweets(tweets) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tweets, null, 2), 'utf-8');
    console.log('✅ 翻译结果已保存到:', DATA_FILE);
  } catch (error) {
    console.error('❌ 保存失败:', error.message);
    process.exit(1);
  }
}

// 使用 Google Translate API (免费但有限制)
async function translateWithGoogle(text) {
  const https = require('https');
  
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translation = json[0].map(item => item[0]).join('');
          resolve(translation);
        } catch (e) {
          reject(new Error('解析翻译结果失败'));
        }
      });
    }).on('error', reject);
  });
}

// 主函数
async function main() {
  console.log('🚀 开始翻译推文...\n');
  
  const tweets = loadTweets();
  let translatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    
    // 如果已有翻译，跳过
    if (tweet.translation && tweet.translation.trim() !== '') {
      console.log(`⏭️  [${i + 1}/${tweets.length}] 已有翻译，跳过: "${tweet.translation.substring(0, 30)}..."`);
      skippedCount++;
      continue;
    }
    
    console.log(`🔄 [${i + 1}/${tweets.length}] 正在翻译:\n   原文: "${tweet.text}"`);
    
    try {
      const translation = await translateWithGoogle(tweet.text);
      tweet.translation = translation;
      translatedCount++;
      console.log(`   译文: "${translation}"`);
      console.log('   ✅ 完成\n');
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`   ❌ 失败: ${error.message}\n`);
      tweet.translation = ''; // 标记为待翻译
      failedCount++;
    }
  }
  
  // 保存结果
  saveTweets(tweets);
  
  console.log('\n📊 翻译统计:');
  console.log(`   新翻译: ${translatedCount} 条`);
  console.log(`   已跳过: ${skippedCount} 条`);
  console.log(`   失败: ${failedCount} 条`);
  console.log(`   总计: ${tweets.length} 条`);
  
  if (translatedCount > 0) {
    console.log('\n✅ 翻译完成！请刷新网页查看效果。');
    console.log('   页面地址: file://' + path.resolve(__dirname, '../index.html'));
  } else if (failedCount > 0) {
    console.log('\n⚠️  部分翻译失败，请稍后重试。');
  } else {
    console.log('\n✅ 所有推文已有翻译。');
  }
}

// 运行
main().catch(error => {
  console.error('❌ 程序异常:', error);
  process.exit(1);
});

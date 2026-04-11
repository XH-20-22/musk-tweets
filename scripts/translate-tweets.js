#!/usr/bin/env node
/**
 * 推文自动翻译脚本
 * 使用工蜂 AI (Claude) 将英文推文翻译成中文
 */

const fs = require('fs');
const path = require('path');

// 配置
const DATA_FILE = path.join(__dirname, '../data/tweets-raw.json');
const GONGFENG_API = 'gongfeng/claude-sonnet-4-5'; // 工蜂 AI 模型

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

// 使用工蜂 AI 翻译
async function translateWithGongfeng(text) {
  // 这里使用 OpenClaw 的内置 AI 能力
  // 实际调用会通过 OpenClaw 的模型接口
  const prompt = `请将以下英文推文翻译成简洁的中文，保持原意和风格：

"${text}"

只返回翻译结果，不要额外解释。`;

  // 注意：这个脚本需要在 OpenClaw 环境中运行
  // 或者通过 exec 调用 OpenClaw CLI
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    
    // 转义引号
    const escapedPrompt = prompt.replace(/"/g, '\\"');
    
    exec(`openclaw ask "${escapedPrompt}" --model ${GONGFENG_API}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      // 提取翻译结果
      const translation = stdout.trim();
      resolve(translation);
    });
  });
}

// 主函数
async function main() {
  console.log('🚀 开始翻译推文...\n');
  
  const tweets = loadTweets();
  let translatedCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    
    // 如果已有翻译，跳过
    if (tweet.translation && tweet.translation.trim() !== '') {
      console.log(`⏭️  [${i + 1}/${tweets.length}] 已有翻译，跳过`);
      skippedCount++;
      continue;
    }
    
    console.log(`🔄 [${i + 1}/${tweets.length}] 正在翻译: "${tweet.text.substring(0, 50)}..."`);
    
    try {
      const translation = await translateWithGongfeng(tweet.text);
      tweet.translation = translation;
      translatedCount++;
      console.log(`✅ 翻译完成: "${translation.substring(0, 50)}..."\n`);
      
      // 每翻译一条就保存（避免中断后丢失进度）
      saveTweets(tweets);
      
      // 避免请求过快，稍微延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ 翻译失败: ${error.message}\n`);
      tweet.translation = ''; // 标记为待翻译
    }
  }
  
  console.log('\n📊 翻译统计:');
  console.log(`   新翻译: ${translatedCount} 条`);
  console.log(`   已跳过: ${skippedCount} 条`);
  console.log(`   总计: ${tweets.length} 条`);
  
  if (translatedCount > 0) {
    console.log('\n✅ 翻译完成！请刷新网页查看效果。');
  } else {
    console.log('\n✅ 所有推文已有翻译。');
  }
}

// 运行
main().catch(error => {
  console.error('❌ 程序异常:', error);
  process.exit(1);
});

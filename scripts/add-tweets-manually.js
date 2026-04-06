#!/usr/bin/env node
/**
 * BHGL - 手动数据方案
 * 创建一个简单的数据输入工具，手动添加推文
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG = {
  outputFile: path.join(__dirname, '../data/tweets-raw.json'),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('📝 BHGL - 手动添加推文工具\n');
  console.log('💡 使用方法：');
  console.log('1. 访问 https://twitter.com/elonmusk');
  console.log('2. 复制推文链接（例如：https://twitter.com/elonmusk/status/1234567890）');
  console.log('3. 复制推文内容');
  console.log('4. 输入到这个工具\n');
  
  // 加载现有数据
  let tweets = [];
  if (fs.existsSync(CONFIG.outputFile)) {
    tweets = JSON.parse(fs.readFileSync(CONFIG.outputFile, 'utf8'));
    console.log(`📊 已有 ${tweets.length} 条推文\n`);
  }
  
  while (true) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    const action = await question('\n选择操作：\n1. 添加新推文\n2. 查看现有推文\n3. 保存并退出\n\n请输入 (1/2/3): ');
    
    if (action === '1') {
      console.log('\n添加新推文：');
      const link = await question('推文链接: ');
      const text = await question('推文内容（英文）: ');
      const textCn = await question('推文翻译（中文，可选）: ');
      
      const tweet = {
        text: text.trim(),
        link: link.trim(),
        time: new Date().toISOString(),
        media: [],
        translation: textCn.trim() || ''
      };
      
      tweets.unshift(tweet); // 添加到最前面
      console.log('✅ 推文已添加！');
      
    } else if (action === '2') {
      console.log(`\n📋 现有推文列表 (共 ${tweets.length} 条):\n`);
      tweets.slice(0, 10).forEach((tweet, index) => {
        console.log(`${index + 1}. ${tweet.text.substring(0, 60)}...`);
        console.log(`   ${tweet.link}\n`);
      });
      
    } else if (action === '3') {
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(tweets, null, 2));
      console.log(`\n💾 已保存 ${tweets.length} 条推文到: ${CONFIG.outputFile}`);
      console.log('\n🎉 完成！现在可以运行 generate-page.js 生成页面');
      break;
    }
  }
  
  rl.close();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 错误:', error);
    rl.close();
    process.exit(1);
  });
}

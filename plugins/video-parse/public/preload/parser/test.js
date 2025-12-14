const DouYinParser = require('./douyin.js');

async function test() {
  const parser = new DouYinParser();
  try {
    const result = await parser.parse('https://v.douyin.com/RBFv_1-CMTg/');
    console.log('解析结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('解析失败:', error.message);
  }
}

test();
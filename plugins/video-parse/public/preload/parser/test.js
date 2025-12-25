const Parser = require('./kuaishou.js');

async function test() {
  const parser = new Parser();
  try {
    const result = await parser.parse('https://www.kuaishou.com/f/X-6S79G8Kibq018N');
    console.log('解析结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('解析失败:', error.message);
  }
  // 结束进程
  process.exit(0);
}

test();
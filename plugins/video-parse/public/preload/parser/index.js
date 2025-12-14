const DouYinParser = require('./douyin');

/**
 * 解析信息
 * @param {string} sharedUrl 分享链接
 */
async function parseInfo(sharedUrl) {
  if (sharedUrl.includes('douyin.com')) {
    return await new DouYinParser().parse(sharedUrl);
  }
}

module.exports = { parseInfo }
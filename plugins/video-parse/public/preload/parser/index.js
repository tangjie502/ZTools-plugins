const DouYinParser = require('./douyin');
const RedBookParser = require('./redbook');
const JiMengParser = require('./jimeng');

/**
 * 解析信息
 * @param {string} sharedUrl 分享链接
 */
async function parseInfo(sharedUrl) {
  if (sharedUrl.includes('douyin.com')) {
    return await new DouYinParser().parse(sharedUrl);
  } else if (sharedUrl.includes('xiaohongshu.com') || sharedUrl.includes('xhslink.com')) {
    return await new RedBookParser().parse(sharedUrl);
  } else if (sharedUrl.includes('jimeng.jianying.com')) {
    return await new JiMengParser().parse(sharedUrl);
  } else {
    throw new Error("暂不支持该平台");
  }
}

module.exports = { parseInfo }
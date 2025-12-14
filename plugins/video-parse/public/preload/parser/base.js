const https = require('https');
const urlModule = require('url');
/**
 * 获取重定向URL
 * @param {string} originalUrl 原始URL
 * @param {string} userAgent User-Agent 
 * @returns {Promise<string>} 重定向URL
 */
function getRedirectUrl(originalUrl, userAgent) {
  return new Promise((resolve, reject) => {
    const url = new URL(originalUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'HEAD', // 使用HEAD请求获取重定向信息
      headers: {
        'User-Agent': userAgent
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(urlModule.resolve(originalUrl, res.headers.location));
      } else {
        resolve(originalUrl);
      }
    });

    req.on('error', (error) => {
      console.error('获取重定向链接失败:', error);
      reject(error);
    });

    req.end();
  });
}

class Video {
  constructor(videoId, title, downloadUrl, cover, pics, author) {
    this.videoId = videoId;
    this.title = title;
    this.downloadUrl = downloadUrl;
    this.cover = cover;
    this.pics = pics;
    this.author = author;
  }
}

module.exports = { getRedirectUrl, Video };
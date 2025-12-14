const https = require('https');
const urlModule = require('url');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:89.0) Gecko/20100101 Firefox/89.0'
]

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

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
      method: 'GET', // 使用HEAD请求获取重定向信息
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

/**
 * 链接转换
 * @param {string} url 链接
 * @return 转换后的链接(http => https，若是https则返回原链接)
 */
function convertUrl(url) {
  return url.replace('http:', 'https:');
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

module.exports = { getRedirectUrl, Video, convertUrl, getRandomUserAgent };
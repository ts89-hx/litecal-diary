const isWeChatDevTools = uni.getSystemInfoSync().platform === 'devtools';

// The simulator can always reach localhost; real devices use the machine's LAN address.
let defaultBaseUrl = isWeChatDevTools
  ? 'http://127.0.0.1:3000'
  : 'http://172.20.10.2:3000';
// #ifdef H5
defaultBaseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
// #endif
export const BASE_URL = uni.getStorageSync('apiBaseUrl') || defaultBaseUrl;

const request = ({ url, method = 'GET', data = {}, headers = {} }) => new Promise((resolve, reject) => {
  const token = uni.getStorageSync('accessToken');
  uni.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    timeout: 10000,
    header: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    success(response) {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        resolve(response.data);
        return;
      }
      if (response.statusCode === 401 || response.statusCode === 403) {
        uni.removeStorageSync('accessToken');
      }
      const error = new Error(response.data && (response.data.msg || response.data.error) || `请求失败（${response.statusCode}）`);
      error.statusCode = response.statusCode;
      error.payload = response.data;
      reject(error);
    },
    fail(error) {
      reject(new Error(error.errMsg && error.errMsg.includes('timeout') ? '请求超时，请稍后重试' : '无法连接轻卡服务'));
    },
  });
});

export default request;

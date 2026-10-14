import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
});

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    // 从本地存储中获取 token
    const token = localStorage.getItem('authToken');
    if (token) {
      // 如果 token 存在，则在请求头中添加 Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

export default instance; 
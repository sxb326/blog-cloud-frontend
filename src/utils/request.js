import axios from 'axios';
import { localStorage } from '@/utils/storage';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth.js';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_SERVICE_API,
  timeout: 50000, // 请求超时时间：50s
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    //如果localStorage中有token，取出放到请求头中
    let token = localStorage.get('BLOG_TOKEN');
    if (token) {
      config.headers['Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    //如果响应头中有token，保存到localStorage中
    const headers = response.headers;
    let token = headers['token'];
    if (token) {
      localStorage.set('BLOG_TOKEN', token);
    }
    let { code, message } = response.data;
    //接口未登录
    if (code === '401') {
      //弹出登录表单
      useAuthStore().toggleLoginForm();
      return;
    }
    //接口报错
    if (code === '500') {
      ElMessage({
        message: message,
        type: 'error',
      });
      return;
    }
    return response.data;
  },
  (error) => {
    console.log('请求异常：', error);
  },
);

// 导出实例
export default service;

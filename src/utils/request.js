import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  // 在开发环境使用空baseURL，让代理配置处理路径转换
  // 在生产环境使用环境变量中配置的API基础URL
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么，如添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // 如果自定义状态码不是200，则判断为错误
    if (res.code !== 200) {
      ElMessage({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 处理HTTP状态错误
    let msg = '请求失败'
    if (error.response && error.response.status) {
      switch (error.response.status) {
        case 400:
          msg = '请求参数错误'
          break
        case 401:
          msg = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          msg = '拒绝访问'
          break
        case 404:
          msg = '请求资源不存在'
          break
        case 500:
          msg = '服务器内部错误'
          break
        default:
          msg = `连接错误${error.response.status}`
      }
    }
    ElMessage({
      message: msg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
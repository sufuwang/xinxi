import axios from 'axios'

// 创建实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地取 Token
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 可添加统一 headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest'

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 根据你后台返回的格式调整
    // if (res.code !== 200) {
    //   console.error('API Error:', res.message || '请求失败')

    //   // 401 未授权
    //   if (res.code === 401) {
    //     localStorage.removeItem('token')
    //     window.location.href = '/login'
    //   }

    //   return Promise.reject(res)
    // }

    return res
  },
  (error) => {
    // 网络异常
    if (!error.response) {
      console.error('网络连接失败，请检查网络')
      return Promise.reject(error)
    }

    const { status } = error.response

    // if (status === 401) {
    //   localStorage.removeItem('token')
    //   window.location.href = '/login'
    // }

    if (status === 500) {
      console.error('服务器内部错误')
    }

    return Promise.reject(error)
  },
)

export default service

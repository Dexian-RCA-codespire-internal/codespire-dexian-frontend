import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err?.response?.data?.message || err.message
    console.error('API error:', msg)
    return Promise.reject(err)
  }
)

export default api

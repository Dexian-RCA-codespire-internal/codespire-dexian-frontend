import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  withCredentials: true, // Enable credentials for authentication
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

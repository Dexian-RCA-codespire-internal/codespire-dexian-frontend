import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
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

// Export the axios instance
export default api

// Export all API services
export { authService } from './services/authService.js'
export { clientService } from './services/clientService.js'
export { rcaService } from './services/rcaService.js'
export { ticketService } from './services/ticketService.js'
export { dashboardService } from './services/dashboardService.js'
export { integrationService } from './services/integrationService.js'
export { aiService } from './services/aiService.js'
export { notificationService } from './services/notificationService.js'
export { auditService } from './services/auditService.js'
export { playbookService } from './services/playbookService.js'

// Legacy export for backward compatibility
export { getTickets, transformTicketToRCACase } from './rcaService.js'

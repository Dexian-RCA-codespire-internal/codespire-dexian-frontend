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
    
    // Don't automatically redirect on 401 errors - let the app handle it
    if (err.response?.status === 401) {
      console.log('🔒 401 error detected, but not redirecting automatically');
      // The session management will handle this
    }
    
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
export { autoSuggestionService } from './services/autoSuggestionService.js'
export { userService } from './services/userService.js'
export { emailVerificationService } from './services/emailVerificationService.js'

// Legacy export for backward compatibility
export { getTickets, transformTicketToRCACase } from './rcaService.js'

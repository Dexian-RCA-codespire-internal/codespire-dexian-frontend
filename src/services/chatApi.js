import api from '../api/index'

class ChatApiService {
  // Send message to chatbot
  async sendMessage(message, context = {}) {
    try {
      const response = await api.post('/chat/send-message', {
        message,
        sessionId: context.sessionId || 'default',
        service: context.service || 'gemini',
        context
      })
      return response.data
    } catch (error) {
      console.error('Chat API error:', error)
      throw new Error(error.response?.data?.error || 'Failed to send message')
    }
  }

  // Get conversation history
  async getChatHistory() {
    try {
      const response = await api.get('/chat/history')
      return response.data
    } catch (error) {
      console.error('Chat history error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get chat history')
    }
  }

  // Get available AI services
  async getAvailableServices() {
    try {
      const response = await api.get('/chat/services')
      return response.data
    } catch (error) {
      console.error('Services error:', error)
      throw new Error(error.response?.data?.error || 'Failed to get services')
    }
  }

  // Clear conversation history
  async clearChatHistory() {
    try {
      const response = await api.delete('/chat/history')
      return response.data
    } catch (error) {
      console.error('Clear chat error:', error)
      throw new Error(error.response?.data?.error || 'Failed to clear chat')
    }
  }

  // Test service connection
  async testService(serviceName) {
    try {
      const response = await api.get(`/chat/test-service?service=${serviceName}`)
      return response.data
    } catch (error) {
      console.error('Test service error:', error)
      throw new Error(error.response?.data?.error || 'Failed to test service')
    }
  }

  // Get RCA-focused welcome message
  async getWelcomeMessage() {
    try {
      const response = await api.get('/chat/welcome')
      return response.data
    } catch (error) {
      console.error('Error getting welcome message:', error)
      return {
        response: "Hello! I'm your RCA AI assistant. How can I help you?"
      }
    }
  }
}

export default new ChatApiService()

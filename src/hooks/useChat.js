import { useState, useEffect, useRef } from 'react'
import chatApi from '../services/chatApi'

export const useChat = (pageContext = null) => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableServices, setAvailableServices] = useState([])
  const [selectedService, setSelectedService] = useState('gemini')
  const messagesEndRef = useRef(null)

  // Function to initialize welcome message
  const initializeWelcomeMessage = async () => {
    try {
      const welcomeData = await chatApi.getWelcomeMessage()
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: welcomeData.response || `Hi! I'm your AI assistant. I can help you with questions about the ${pageContext?.pageName || 'current page'} data and provide insights. What would you like to know?`,
        timestamp: new Date(),
        service: selectedService
      }
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to load welcome message:', error)
      // Fallback to static message
      const fallbackMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hi! I'm your AI assistant. I can help you with questions about the ${pageContext?.pageName || 'current page'} data and provide insights. What would you like to know?`,
        timestamp: new Date(),
        service: selectedService
      }
      setMessages([fallbackMessage])
    }
  }

  // Initialize chat with dynamic welcome message on mount
  useEffect(() => {
    initializeWelcomeMessage()
  }, [pageContext?.pageName, selectedService])

  // Load available services on mount
  useEffect(() => {
    loadAvailableServices()
  }, [])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadAvailableServices = async () => {
    try {
      const response = await chatApi.getAvailableServices()
      setAvailableServices(response.services || ['gemini', 'openai', 'anthropic', 'ollama'])
    } catch (error) {
      console.error('Failed to load services:', error)
      setAvailableServices(['gemini']) // Fallback to gemini
    }
  }

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await chatApi.sendMessage(messageText, {
        ...pageContext,
        service: selectedService
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response || response.message || 'No response received',
        timestamp: new Date(response.timestamp),
        service: response.service || selectedService,
        usage: response.usage
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      setError(error.message)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    try {
      await chatApi.clearChatHistory()
      setMessages([])
      setError(null)
    } catch (error) {
      console.error('Failed to clear chat:', error)
      setError('Failed to clear chat history')
    }
  }

  const testService = async (serviceName) => {
    try {
      const response = await chatApi.testService(serviceName)
      return response.success
    } catch (error) {
      console.error('Service test failed:', error)
      return false
    }
  }

  return {
    messages,
    isLoading,
    error,
    availableServices,
    selectedService,
    setSelectedService,
    sendMessage,
    clearChat,
    testService,
    initializeWelcomeMessage,
    messagesEndRef
  }
}

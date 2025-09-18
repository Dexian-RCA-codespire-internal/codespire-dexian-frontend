import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Only use localStorage - no API calls on app startup
      const savedUser = localStorage.getItem('user')
      
      if (savedUser) {
        console.log('📱 Using cached user data (no session API call)')
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        console.log('👤 No cached user data found')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.signin({ email, password })
      console.log('✅ SuperTokens login response:', response)

      if (response.status === "OK" && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('isAuthenticated', 'true')
        return { success: true, data: response }
      }
      return { success: false, error: response.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      console.log('✅ SuperTokens logout successful')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('lastSessionCheck')
      localStorage.removeItem('workingSessionEndpoint')
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.signup(userData)
      console.log('✅ SuperTokens registration response:', response)

      if (response.status === "OK") {
        return { success: true, data: response }
      }
      return { success: false, error: response.message || 'Registration failed' }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      }
    }
  }

  // Manual session check function (call only when needed)
  const checkSessionManually = async () => {
    try {
      console.log('🔍 Manual session check requested')
      const sessionResponse = await authService.getSession()
      console.log('✅ Manual session check response:', sessionResponse)

      if (sessionResponse.status === "OK" && sessionResponse.user) {
        setUser(sessionResponse.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(sessionResponse.user))
        localStorage.setItem('isAuthenticated', 'true')
        return { success: true, data: sessionResponse }
      } else {
        // Clear invalid session data
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        return { success: false, error: 'Session invalid' }
      }
    } catch (error) {
      console.error('Manual session check error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus,
    checkSessionManually
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

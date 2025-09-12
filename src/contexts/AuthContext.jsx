import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

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
      // Check if user data exists in localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      }

      // Try to get current user profile from backend
      try {
        const response = await api.get('/auth/profile')
        if (response.data && response.data.user) {
          setUser(response.data.user)
          setIsAuthenticated(true)
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }
      } catch (error) {
        // If profile fetch fails, user might not be authenticated
        console.log('Profile fetch failed, user might not be authenticated')
        if (savedUser) {
          // Keep the saved user data but mark as potentially stale
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.data && response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return { success: true, data: response.data }
      }
      return { success: false, error: 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

import React, { useState, useEffect } from 'react'
import { Button, Input, Card, CardContent } from '../../components/ui'
import { MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ResetPasswordWithOTP() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  
  const navigate = useNavigate()
  const { consumePasswordlessCode } = useAuth()

  useEffect(() => {
    // Get email and OTP from localStorage
    const resetEmail = localStorage.getItem('resetEmail')
    const verifiedOTP = localStorage.getItem('verifiedOTP')
    
    if (!resetEmail || !verifiedOTP) {
      navigate('/forgot-password')
      return
    }
    
    setEmail(resetEmail)
    setOtp(verifiedOTP)
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'newPassword') {
      setNewPassword(value)
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value)
    }
    
    if (error) setError('')
  }

  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long'
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number'
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use SuperTokens passwordless code consumption for password reset
      const result = await consumePasswordlessCode(otp, newPassword)
      
      if (result.status === 'OK') {
        setSuccess(true)
        // Clear stored data
        localStorage.removeItem('resetEmail')
        localStorage.removeItem('verifiedOTP')
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully! Please log in with your new password.' 
            } 
          })
        }, 2000)
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToOTP = () => {
    navigate('/verify-password-reset-otp')
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Password Reset Successfully!
                </h3>
                <p className="text-gray-600 text-sm">
                  Redirecting to login page...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Half - Reset Password Form Section */}
        <div className="w-1/2 bg-gray-50 flex items-center justify-center pt-4 pb-4 px-12">
          <div className="w-full max-w-md">
            {/* Logo and Title Section */}
            <div className="text-center mb-8">
              {/* Dexian Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/logos/dexian-logo.png" 
                    alt="Dexian Logo" 
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-2xl font-bold text-blue-600">Dexian</span>
                </div>
              </div>
              
              {/* Main Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600 text-lg">
                Enter your new password below
              </p>
            </div>

            {/* Form Card */}
            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
              <CardContent className="p-6">
                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-800 text-sm">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {error}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={newPassword}
                      onChange={handleInputChange}
                      placeholder="New Password"
                      className="pl-10 pr-10 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm New Password"
                      className="pl-10 pr-10 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <MdVisibilityOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <MdVisibility className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One lowercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Back to OTP Link */}
            <div className="text-center mt-6">
              <button
                onClick={handleBackToOTP}
                className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to OTP Verification
              </button>
            </div>
          </div>
        </div>

        {/* Right Half - Image Section */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/assets/login-right bg.png" 
            alt="Reset Password visual" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}


import React, { useState, useEffect } from 'react'
import { Button, Input, Card, CardContent } from '../../components/ui'
import { MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { validatePassword, getPasswordStrength, getPasswordRequirements } from '../../utils/validation'
import { useAuth } from '../../contexts/AuthContext'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [token, setToken] = useState('')
  const [passwordValidation, setPasswordValidation] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuth()

  useEffect(() => {
    // Get token from URL parameters
    const tokenFromUrl = searchParams.get('token')
    const rid = searchParams.get('rid')
    const tenantId = searchParams.get('tenantId')
    
    console.log('🔍 Reset password URL params:', {
      token: tokenFromUrl ? 'present' : 'missing',
      rid,
      tenantId,
      fullUrl: window.location.href
    })
    
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token. Please request a new password reset.')
      return
    }
    
    // Validate that this is a SuperTokens password reset token
    if (rid !== 'emailpassword') {
      setError('Invalid reset token type. Please request a new password reset.')
      return
    }
    
    setToken(tokenFromUrl)
  }, [searchParams])

  // Real-time password validation
  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword)
      setPasswordValidation(validation)
    } else {
      setPasswordValidation({})
    }
  }, [newPassword])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'newPassword') {
      setNewPassword(value)
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value)
    }
    
    if (error) setError('')
  }

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }))
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

    const passwordValidationResult = validatePassword(newPassword)
    if (!passwordValidationResult.isValid) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
      return
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use SuperTokens EmailPassword.submitNewPassword
      // SuperTokens automatically consumes the token from the URL
      const response = await EmailPassword.submitNewPassword({
        formFields: [
          {
            id: "password",
            value: newPassword
          }
        ]
      });
      
      console.log('🔐 Password reset response:', response);
      
      if (response.status === "OK") {
        setSuccess(true)
        setSuccessMessage('Password updated successfully!')
        
        // Clear form
        setNewPassword('')
        setConfirmPassword('')
        setPasswordValidation({})
        setTouchedFields({})
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully! Please log in with your new password.' 
            } 
          })
        }, 2000)
      } else if (response.status === "FIELD_ERROR") {
        const passwordError = response.formFields?.find(field => field.id === 'password')
        setError(passwordError?.error || 'Password validation failed')
      } else if (response.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        setError('Invalid or expired reset token. Please request a new password reset.')
      } else {
        setError(response.message || 'Failed to reset password. Please try again.')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred while resetting your password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  const handleRequestNewReset = () => {
    navigate('/forgot-password')
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
                  <span className="text-2xl font-bold text-[#2b8f88]">AIResolve360</span>
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
                {/* Success Display */}
                {success && successMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {successMessage}
                    </div>
                    <p className="text-green-700 text-xs mt-1">
                      Redirecting to login page...
                    </p>
                  </div>
                )}

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
                      maxLength={15}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('newPassword')}
                      placeholder="New Password"
                      className={`pl-10 pr-10 h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        passwordValidation.isValid === false && touchedFields.newPassword 
                          ? 'border-red-500' 
                          : passwordValidation.isValid === true
                          ? 'border-green-500'
                          : 'border-gray-200'
                      } ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={success}
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
                  
                  {/* Password validation error */}
                  {passwordValidation.isValid === false && touchedFields.newPassword && (
                    <div className="flex items-center text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Password must be between 8-15 characters with uppercase, lowercase, number, and special characters
                    </div>
                  )}

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      maxLength={15}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      placeholder="Confirm New Password"
                      className={`pl-10 pr-10 h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        confirmPassword && newPassword !== confirmPassword && touchedFields.confirmPassword
                          ? 'border-red-500' 
                          : confirmPassword && newPassword === confirmPassword
                          ? 'border-green-500'
                          : 'border-gray-200'
                      } ${success ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={success}
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
                  
                  {/* Confirm password error */}
                  {confirmPassword && newPassword !== confirmPassword && touchedFields.confirmPassword && (
                    <div className="flex items-center text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Passwords do not match
                    </div>
                  )}

                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Password Strength</span>
                        <span className={`font-medium text-xs sm:text-sm ${
                          getPasswordStrength(newPassword).level === 'weak' ? 'text-red-600' :
                          getPasswordStrength(newPassword).level === 'fair' ? 'text-orange-600' :
                          getPasswordStrength(newPassword).level === 'good' ? 'text-blue-600' :
                          getPasswordStrength(newPassword).level === 'strong' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {getPasswordStrength(newPassword).text}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {getPasswordRequirements(newPassword).map((req, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              req.met ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={`text-xs ${
                              req.met ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || !token || !passwordValidation.isValid || newPassword !== confirmPassword || success}
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </form>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleRequestNewReset}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Request new password reset
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Back to Login Link */}
            <div className="text-center mt-6">
              <button
                onClick={handleBackToLogin}
                className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to Login
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

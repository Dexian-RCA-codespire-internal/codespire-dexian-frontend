import React, { useState, useEffect } from 'react'
import { Button, Input, Card, CardContent } from '../../components/ui'
import { MdArrowBack, MdRefresh } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import api from '../../api'

export default function VerifyPasswordResetOTP() {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  
  const navigate = useNavigate()

  useEffect(() => {
    // Get email from localStorage
    const resetEmail = localStorage.getItem('resetEmail')
    if (!resetEmail) {
      navigate('/forgot-password')
      return
    }
    setEmail(resetEmail)
  }, [navigate])

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 6) {
      setOtp(value)
      if (error) setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/v1/auth/verify-password-reset-otp', {
        email: email,
        otp: otp
      })
      
      if (response.data.success) {
        setSuccess(true)
        // Store OTP for the next step
        localStorage.setItem('verifiedOTP', otp)
        // Navigate to reset password page after a short delay
        setTimeout(() => {
          navigate('/reset-password-with-otp')
        }, 1500)
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/v1/auth/forgot-password', {
        email: email
      })
      
      if (response.data.success) {
        setError('')
        // Show success message briefly
        const originalError = error
        setError('OTP sent successfully!')
        setTimeout(() => setError(originalError), 3000)
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (err) {
      console.error('Resend OTP error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToForgotPassword = () => {
    localStorage.removeItem('resetEmail')
    navigate('/forgot-password')
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
                  OTP Verified Successfully!
                </h3>
                <p className="text-gray-600 text-sm">
                  Redirecting to password reset...
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
        {/* Left Half - OTP Verification Form Section */}
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
                Enter OTP
              </h1>
              <p className="text-gray-600 text-lg">
                We've sent a 6-digit OTP to <strong>{email}</strong>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Enter 6-digit OTP
                    </label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={handleInputChange}
                      placeholder="123456"
                      className="h-12 text-center text-2xl font-mono tracking-widest border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      maxLength={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </form>

                {/* Resend OTP */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="flex items-center justify-center mx-auto text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <MdRefresh className="h-4 w-4 mr-1" />
                    Resend OTP
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Back to Forgot Password Link */}
            <div className="text-center mt-6">
              <button
                onClick={handleBackToForgotPassword}
                className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                <MdArrowBack className="h-4 w-4 mr-2" />
                Back to Forgot Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Half - Image Section */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/assets/login-right bg.png" 
            alt="OTP Verification visual" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}


import React, { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui'
import { MdEmail, MdArrowBack } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function ForgetPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  
  const navigate = useNavigate()
  const { sendPasswordReset } = useAuth()

  const handleInputChange = (e) => {
    setEmail(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use SuperTokens sendPasswordReset method
      const result = await sendPasswordReset(email.trim())
      
      if (result.status === 'OK') {
        setEmailSent(true)
      } else {
        setError(result.message || 'Failed to send reset link. Please try again.')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Half - Forget Password Form Section */}
        <div className="w-1/2 bg-gray-50 flex items-center justify-center pt-4 pb-4 px-12">
          <div className="w-full max-w-md">
            {/* Logo and Title Section */}
            <div className="text-center mb-8">
              {/* Dexian Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-3">
                  {/* Logo Image */}
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
                {emailSent ? 'Check Your Email' : 'Forgot Password?'}
              </h1>
              <p className="text-gray-600 text-lg">
                {emailSent 
                  ? 'We\'ve sent you a password reset link'
                  : 'No worries! Enter your email and we\'ll send you a reset link.'
                }
              </p>
            </div>

            {/* Form Card */}
            <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
              <CardContent className="p-6">
                {!emailSent ? (
                  <>
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
                      {/* Email Input */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdEmail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className="pl-10 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          required
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </form>
                  </>
                ) : (
                  /* Success State */
                  <div className="text-center space-y-6">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-green-600" />
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Email Sent Successfully!
                      </h3>
                      <p className="text-gray-600 text-sm">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <p className="text-gray-500 text-xs">
                        Please follow the instructions in the email to reset your password. If you don't see it, check your spam or junk folder.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleBackToLogin}
                        className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl"
                      >
                        Back to Login
                      </Button>
                      
                      <button
                        onClick={() => {
                          setEmailSent(false)
                          setEmail('')
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Didn't receive the email? Try again
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back to Login Link */}
            {!emailSent && (
              <div className="text-center mt-6">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  <MdArrowBack className="h-4 w-4 mr-2" />
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Half - Image Section */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/assets/login-right bg.png" 
            alt="Forgot Password visual" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

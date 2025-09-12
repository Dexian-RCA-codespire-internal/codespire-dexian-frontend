import React, { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../../components/ui'
import { ArrowLeft, Mail, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { validateOTP } from '../../utils/validation'
import EmailVerification from 'supertokens-auth-react/recipe/emailverification'

export default function VerifyOTP() {
  const [otp, setOtp] = useState("")
  const [resendLeft, setResendLeft] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const clearError = () => {
    setError("")
  }

  // Get email from navigation state or use default
  const email = location.state?.email || ''
  const fromRegistration = location.state?.fromRegistration || false

  // Countdown timer for resend
  useEffect(() => {
    if (resendLeft <= 0) return
    const id = setInterval(() => setResendLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [resendLeft])

  const handleComplete = (value) => {
    setOtp(value)
  }

  const handleVerifyOTP = async () => {
    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    
    if (!email) {
      setError('Email not found. Please try registering again.')
      navigate('/register')
      return
    }
    
    setIsVerifying(true)
    clearError()
    
    try {
      // Get the verification token from localStorage or state
      const verificationToken = localStorage.getItem('verificationToken') || location.state?.verificationToken
      
      if (!verificationToken) {
        setError('Verification token not found. Please try registering again.')
        navigate('/register')
        return
      }

      // Step 1: Use your custom backend OTP verification
      const customResponse = await fetch('http://localhost:8081/api/v1/auth/verify-custom-otp', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: verificationToken,
          otp: otp
        })
      })

      const customData = await customResponse.json()
      console.log('✅ Custom OTP verification response:', customData)

      if (customResponse.ok && customData.success) {
        // Step 2: Update SuperTokens verification status
        try {
          const superTokensResponse = await EmailVerification.verifyEmail({
            method: "userInputCode",
            userInputCode: otp
          })
          console.log('✅ SuperTokens verification updated:', superTokensResponse)
        } catch (superTokensError) {
          console.log('⚠️ Could not update SuperTokens verification:', superTokensError)
          // Continue anyway since custom verification was successful
        }

        // Clear the verification token
        localStorage.removeItem('verificationToken')
        
        setSuccessMessage('Email verified successfully!')
        setTimeout(() => {
          if (fromRegistration) {
            navigate('/login', { 
              state: { 
                message: 'Registration completed! Please log in with your credentials.' 
              } 
            })
          } else {
            navigate('/')
          }
        }, 2000)
      } else {
        setError(customData.message || 'OTP verification failed. Please try again.')
        setIsVerifying(false)
      }
    } catch (err) {
      console.error('SuperTokens verifyEmail error:', err)
      setError('OTP verification failed. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please try registering again.')
      navigate('/register')
      return
    }
    
    setIsResending(true)
    clearError()
    
    try {
      // Use your custom backend to generate new OTP
      const response = await fetch('http://localhost:8081/api/v1/auth/generate-email-verification-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email
        })
      })

      const data = await response.json()
      console.log('✅ Custom resend OTP response:', data)

      if (response.ok && data.success) {
        // Store the new verification token
        localStorage.setItem('verificationToken', data.token)
        
        setResendLeft(30)
        setSuccessMessage('OTP has been resent to your email')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (err) {
      console.error('Custom resend OTP error:', err)
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyWithLink = async () => {
    if (!email) {
      setError('Email not found. Please try registering again.')
      navigate('/register')
      return
    }
    
    setIsSendingMagicLink(true)
    clearError()
    
    try {
      // Use SuperTokens EmailVerification.sendVerificationEmail for magic link
      const response = await EmailVerification.sendVerificationEmail()

      console.log('✅ SuperTokens sendVerificationEmail (verification link) response:', response)

      if (response.status === "OK") {
        setSuccessMessage('Verification link has been sent to your email')
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setError('Failed to send verification link. Please try again.')
      }
    } catch (err) {
      console.error('SuperTokens sendVerificationEmail (verification link) error:', err)
      setError('Failed to send verification link. Please try again.')
    } finally {
      setIsSendingMagicLink(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link 
            to="/register" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-teal-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            We've sent a 6-digit verification code to your email address
          </p>
        </div>

        {/* OTP Verification Form */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4 md:p-6">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {successMessage}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Enter the verification code
                  </p>
                  <InputOTP 
                    maxLength={6} 
                    onComplete={handleComplete}
                    className="justify-center"
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot 
                        index={0} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                      <InputOTPSlot 
                        index={1} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                      <InputOTPSlot 
                        index={2} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                    </InputOTPGroup>

                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot 
                        index={3} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                      <InputOTPSlot 
                        index={4} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                      <InputOTPSlot 
                        index={5} 
                        className="h-12 w-12 text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Verify OTP Button */}
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isVerifying}
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLeft > 0 || isResending}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending ? 'Sending...' : resendLeft > 0 ? `Resend in ${resendLeft}s` : 'Resend code'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Verify with Link */}
              <div className="text-center">
                <Button
                  onClick={handleVerifyWithLink}
                  disabled={isSendingMagicLink}
                  variant="outline"
                  className="w-full h-10 sm:h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium rounded-lg transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  {isSendingMagicLink ? 'Sending...' : 'Verify using link'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send you a verification link via email
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Having trouble?{' '}
            <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent } from '../../components/ui'
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmailVerification from 'supertokens-auth-react/recipe/emailverification'

export default function VerifyMagicLink() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { token } = useParams()

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setVerificationStatus('error')
        setMessage('Invalid verification link')
        setIsVerifying(false)
        return
      }

      try {
        // Use SuperTokens EmailVerification.verifyEmail with token
        const response = await EmailVerification.verifyEmail({
          method: "link",
          token: token
        })

        console.log('✅ SuperTokens verifyEmail (magic link) response:', response)
        
        if (response.status === "OK") {
          setVerificationStatus('success')
          setMessage('Email verified successfully! You can now access your account.')
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/')
          }, 3000)
        } else {
          setVerificationStatus('error')
          if (response.status === "FIELD_ERROR") {
            const fieldErrors = response.formFields
            if (fieldErrors) {
              fieldErrors.forEach(field => {
                if (field.id === "token") {
                  setMessage(field.error)
                }
              })
            }
          } else {
            setMessage('Verification failed. The link may be expired or invalid.')
          }
        }
      } catch (err) {
        console.error('SuperTokens verifyEmail (magic link) error:', err)
        setVerificationStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      } finally {
        setIsVerifying(false)
      }
    }

    handleVerification()
  }, [token, navigate])

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
        return <AlertCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-blue-500 animate-pulse" />
    }
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      default:
        return 'bg-blue-100'
    }
  }

  const getStatusTextColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      default:
        return 'text-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Verification Card */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-6">
              {/* Status Icon */}
              <div className={`mx-auto w-20 h-20 ${getStatusColor()} rounded-full flex items-center justify-center`}>
                {getStatusIcon()}
              </div>

              {/* Status Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isVerifying ? 'Verifying Email...' : 
                   verificationStatus === 'success' ? 'Email Verified!' : 
                   'Verification Failed'}
                </h1>
                
                <p className={`text-sm ${getStatusTextColor()}`}>
                  {isVerifying ? 'Please wait while we verify your email address' : message}
                </p>
              </div>

              {/* Loading Spinner */}
              {isVerifying && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
              )}

              {/* Error Details */}
              {verificationStatus === 'error' && error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!isVerifying && (
                <div className="space-y-3">
                  {verificationStatus === 'success' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Redirecting to dashboard...
                      </p>
                      <Button
                        onClick={() => navigate('/')}
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate('/login')}
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        Back to Login
                      </Button>
                      <Button
                        onClick={() => navigate('/register')}
                        variant="outline"
                        className="w-full h-10 sm:h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium rounded-lg transition-all duration-200 text-sm sm:text-base"
                      >
                        Register New Account
                      </Button>
                    </div>
                  )}
                </div>
              )}
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

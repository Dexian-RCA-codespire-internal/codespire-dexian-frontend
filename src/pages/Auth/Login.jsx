import React, { useState, useEffect } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Checkbox } from '../../components/ui'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { validateLoginForm } from '../../utils/validation'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Session } from 'supertokens-auth-react/recipe/session'
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [location.state])

  // Clear error when user makes changes
  const clearError = () => {
    setError('')
  }

  // Note: Session checking is handled by SuperTokensProtectedRoute

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    
    if (name === 'email') setEmail(newValue)
    if (name === 'password') setPassword(newValue)
    if (name === 'rememberMe') setRememberMe(newValue)

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }

    // Clear auth error when user makes changes
    if (error) {
      clearError()
    }
  }

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 Login form submitted')
    
    // Validate form
    const validation = validateLoginForm({ email, password })
    if (!validation.isValid) {
      console.log('❌ Form validation failed:', validation.errors)
      setValidationErrors(validation.errors)
      setTouchedFields({
        email: true,
        password: true
      })
      return
    }

    console.log('✅ Form validation passed')

    // Clear any previous errors
    setValidationErrors({})
    clearError()

    setIsLoading(true)
    console.log('📡 Using SuperTokens EmailPassword.signIn...')

    try {
      // Use SuperTokens EmailPassword.signIn
      const response = await EmailPassword.signIn({
        formFields: [{
          id: "email",
          value: email.trim()
        }, {
          id: "password", 
          value: password
        }]
      })

      console.log('✅ SuperTokens signIn successful:', response)

      if (response.status === "OK") {
        setSuccessMessage('Login successful! Redirecting...')
        
        // Wait for SuperTokens session to be established, then redirect
        setTimeout(async () => {
          console.log('⏰ Starting redirect process after 1.5s delay...')
          try {
            // Check if session exists before redirecting
            console.log('🔍 Checking if SuperTokens session exists...')
            const sessionExists = await Session.doesSessionExist()
            console.log('🔍 Session exists:', sessionExists)
            
            if (sessionExists) {
              console.log('✅ Session exists, navigating to dashboard...')
              navigate('/', { replace: true })
            } else {
              console.log('❌ Session does not exist, forcing page reload...')
              // If session doesn't exist, force a page reload to establish it
              window.location.href = '/'
            }
          } catch (error) {
            console.log('❌ Session check failed, forcing reload:', error)
            window.location.href = '/'
          }
        }, 1500)
      } else {
        // Handle different response statuses
        if (response.status === "WRONG_CREDENTIALS_ERROR") {
          setError('Invalid email or password')
        } else if (response.status === "FIELD_ERROR") {
          const fieldErrors = response.formFields
          if (fieldErrors) {
            const errors = {}
            fieldErrors.forEach(field => {
              if (field.id === "email") errors.email = field.error
              if (field.id === "password") errors.password = field.error
            })
            setValidationErrors(errors)
          }
        } else if (response.status === "EMAIL_NOT_VERIFIED_ERROR") {
          setError('Please verify your email address before logging in')
        } else {
          setError('Login failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('SuperTokens signIn error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Half - Login Form Section */}
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
              <span className="text-2xl font-bold text-blue-600">Dexian</span>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Log in to your Account
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back! Please enter your credentials:
          </p>
        </div>

        {/* Email and Password Form */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {successMessage}
                </div>
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
                  onBlur={() => handleFieldBlur('email')}
                  placeholder="Email"
                  className={`pl-10 h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                    validationErrors.email && touchedFields.email 
                      ? 'border-red-500' 
                      : 'border-gray-200'
                  }`}
                  required
                />
                {validationErrors.email && touchedFields.email && (
                  <div className="flex items-center mt-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.email}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdLock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('password')}
                  placeholder="Password"
                  className={`pl-10 pr-10 h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                    validationErrors.password && touchedFields.password 
                      ? 'border-red-500' 
                      : 'border-gray-200'
                  }`}
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
                {validationErrors.password && touchedFields.password && (
                  <div className="flex items-center mt-1 text-red-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="mr-2"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </a>
              </div>

                             {/* Login Button */}
                               <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Creation Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>

        </div>
        </div>

        {/* Right Half - Image Section */}
        <div className="w-1/2 relative overflow-hidden">
          <img 
            src="/assets/login-right bg.png" 
            alt="Login visual" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}



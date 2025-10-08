import React, { useState, useRef, useEffect } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Checkbox } from '../../components/ui'
import { Mail, Lock, User, Eye, EyeOff, Phone, ChevronDown, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { COUNTRY_CODES, searchCountries } from '../../constants/countryCodes'
import { validateRegistrationForm, getPasswordStrength, getPasswordRequirements } from '../../utils/validation'
import { useAuth } from '../../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // Default to US
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const dropdownRef = useRef(null)
  const countrySearchRef = useRef(null)

  // Redirect if already authenticated (but only check once to avoid multiple redirects)
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard');
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Clear error function
  const clearError = () => {
    setError('')
  }

  // Password strength calculation
  const passwordStrength = getPasswordStrength(formData.password)
  const passwordRequirements = getPasswordRequirements(formData.password)
  const strengthBarClass =
  passwordStrength.level === 'weak' ? 'bg-red-500' :
  passwordStrength.level === 'fair' ? 'bg-orange-500' :
  passwordStrength.level === 'good' ? 'bg-blue-500' :
  passwordStrength.level === 'strong' ? 'bg-green-500' :
  passwordStrength.level === 'invalid' ? 'bg-red-500' :
  'bg-gray-300';

  const strengthPercent =
    passwordStrength.level === 'weak' ? 25 :
    passwordStrength.level === 'fair' ? 50 :
    passwordStrength.level === 'good' ? 75 :
    passwordStrength.level === 'strong' ? 100 :
    passwordStrength.level === 'invalid' ? 'bg-red-500' :
    0;

  // Country dropdown functions
  const filteredCountries = countrySearch ? searchCountries(countrySearch) : COUNTRY_CODES

  const handleCountrySelect = (country) => {
    setSelectedCountry(country)
    setShowCountryDropdown(false)
    setCountrySearch('')
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value
    // Limit to 15 digits total (including country code)
    if (value.length <= 15) {
      setFormData(prev => ({ ...prev, phone: value }))
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false)
        setCountrySearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // For password fields, trim to 15 chars
    if (name === 'password' || name === 'confirmPassword') {
      newValue = newValue.slice(0, 15);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear auth error when user makes changes
    if (error) {
      clearError();
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
    
    // Validate form
    const validation = validateRegistrationForm(formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setTouchedFields({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
        agreeToTerms: true
      })
      return
    }

    // Clear any previous errors
    setValidationErrors({})
    clearError()

    setIsLoading(true)

    try {
      // Use SuperTokens registration via AuthContext
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: `${selectedCountry.dialCode}${formData.phone}`
      }

      const response = await register(userData)
      console.log('✅ Registration response:', response)

      if (response.success) {
        console.log('✅ Registration successful')
        
        // Navigate to login page with success message
        navigate('/login', {
          state: {
            message: 'Registration successful! Please check your inbox for verification email',
            email: formData.email
          }
        })
      } else {
        // Handle different error types
        if (response.status === 'FIELD_ERROR') {
          setError('An account with this email already exists')
        } else if (response.formFields) {
          // Handle field errors from SuperTokens
          const fieldErrors = {}
          response.formFields.forEach(field => {
            if (field.error) {
              fieldErrors[field.id] = [field.error]
            }
          })
          setValidationErrors(fieldErrors)
        } 
        else {
          setError(response.message || 'Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      {/* Main Container */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 mx-2 sm:mx-0">
        {/* Logo and Title Section */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          {/* Dexian Logo */}
          <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Logo Image */}
              <img 
                src="/logos/dexian-logo.png" 
                alt="Dexian Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="text-xl sm:text-2xl font-bold text-[#2b8f88]">AIResolve360</span>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Create your Account
          </h1>
        </div>

        {/* Registration Form */}
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg">
          <CardContent className="p-3 sm:p-4 md:p-6">
            {/* Global Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('firstName')}
                    placeholder="First Name"
                    className={`pl-10 h-10 sm:h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base ${
                      validationErrors.firstName && touchedFields.firstName 
                        ? 'border-red-500' 
                        : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.firstName && touchedFields.firstName && (
                    <div className="flex items-center mt-1 text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.firstName}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('lastName')}
                    placeholder="Last Name"
                    className={`pl-10 h-10 sm:h-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base ${
                      validationErrors.lastName && touchedFields.lastName 
                        ? 'border-red-500' 
                        : 'border-gray-200'
                    }`}
                    required
                  />
                  {validationErrors.lastName && touchedFields.lastName && (
                    <div className="flex items-center mt-1 text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="pl-10 h-10 sm:h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                  required
                />
              </div>

              {/* Phone Number Input */}
              <div className="relative">
                <div className="flex">
                  {/* Country Code Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCountryDropdown(prev => {
                          const next = !prev
                          if (next) {
                            setTimeout(() => countrySearchRef.current?.focus(), 0)
                          }
                          return next
                        })
                      }}
                      className="flex items-center px-2 sm:px-3 h-10 sm:h-12 border border-gray-200 border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    >
                      <span className="text-base sm:text-lg mr-1 sm:mr-2 flag-emoji">{selectedCountry.flag}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-gray-500" />
                    </button>

                    {/* Country Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 z-50 w-64 sm:w-72 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 sm:max-h-80 overflow-hidden">
                        {/* Search Input */}
                        <div className="p-2 sm:p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              ref={countrySearchRef}
                              type="text"
                              placeholder="Search countries..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            />
                          </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-40 sm:max-h-48 md:max-h-60 overflow-y-auto">
                          {filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountrySelect(country)}
                              className="w-full flex items-center px-2 sm:px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                            >
                              <span className="text-base sm:text-lg mr-2 sm:mr-3 flag-emoji">{country.flag}</span>
                              <span className="text-xs sm:text-sm font-medium text-gray-700 mr-1 sm:mr-2">{country.dialCode}</span>
                              <span className="text-xs sm:text-sm text-gray-600 truncate">{country.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Number Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="Phone Number"
                      className="pl-10 h-10 sm:h-12 border border-gray-200 rounded-r-lg rounded-l-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      maxLength={15}
                      placeholder="Password"
                      className="pl-10 pr-10 h-10 sm:h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                      required
                    />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Password Strength</span>
                    <span className={`text-xs sm:text-sm font-medium ${
                      passwordStrength.level === 'weak' ? 'text-red-600' :
                      passwordStrength.level === 'fair' ? 'text-orange-600' :
                      passwordStrength.level === 'good' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${strengthBarClass}`}
                      style={{ width: `${strengthPercent}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        {req.met ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400 mr-2" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              {/* Error message above input */}
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="flex items-center mb-1 text-red-600 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Passwords do not match
                </div>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  maxLength={15}
                  placeholder="Confirm Password"
                  className="pl-10 pr-10 h-10 sm:h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Terms and Conditions can comment out once we have proper terms and conditions */}
              {/* <div className="flex items-start">
                <Checkbox
                  id="terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: checked }))}
                  className="mr-2 sm:mr-3 mt-1"
                />
                <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div> */}

              {/* Register Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center mt-3 sm:mt-4 md:mt-6">
          <p className="text-sm sm:text-base text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

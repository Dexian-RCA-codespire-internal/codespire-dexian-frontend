import React, { useState, useRef, useEffect } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Checkbox } from '../../components/ui'
import { Mail, Lock, User, Eye, EyeOff, Phone, ChevronDown, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { COUNTRY_CODES, searchCountries } from '../../constants/countryCodes'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]) // Default to US
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const dropdownRef = useRef(null)

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0
    let feedback = []
    
    if (password.length >= 8) score += 1
    else feedback.push('At least 8 characters')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Lowercase letter')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Uppercase letter')
    
    if (/[0-9]/.test(password)) score += 1
    else feedback.push('Number')
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push('Special character')
    
    return { score, feedback }
  }

  const passwordStrength = calculatePasswordStrength(formData.password)
  const getStrengthColor = (score) => {
    if (score <= 1) return 'bg-red-500'
    if (score <= 2) return 'bg-orange-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (score) => {
    if (score <= 1) return 'Very Weak'
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
  }

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
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (!formData.phone || formData.phone.length < 10) {
      alert('Please enter a valid phone number')
      return
    }
    console.log('Registration attempt:', formData)
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
              <span className="text-xl sm:text-2xl font-bold text-blue-600">Dexian</span>
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
                    placeholder="First Name"
                    className="pl-10 h-10 sm:h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    required
                  />
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
                    placeholder="Last Name"
                    className="pl-10 h-10 sm:h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base"
                    required
                  />
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
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center px-2 sm:px-3 h-10 sm:h-12 border border-gray-200 border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    >
                      <span className="text-base sm:text-lg mr-1 sm:mr-2">{selectedCountry.flag}</span>
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
                              <span className="text-base sm:text-lg mr-2 sm:mr-3">{country.flag}</span>
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
                      passwordStrength.score <= 2 ? 'text-red-600' :
                      passwordStrength.score <= 3 ? 'text-orange-600' :
                      passwordStrength.score <= 4 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div 
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <p>Missing: {passwordStrength.feedback.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
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

              {/* Terms and Conditions */}
              <div className="flex items-start">
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
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-teal-500 to-teal-900 hover:from-teal-600 hover:to-teal-800 text-white font-semibold rounded-lg transition-all duration-1000 ease-in-out shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Create Account
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

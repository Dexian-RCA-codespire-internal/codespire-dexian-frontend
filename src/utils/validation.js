// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
  }
}

// Phone number validation
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/
  return phoneRegex.test(phone)
}

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/
  return nameRegex.test(name.trim())
}

// OTP validation
export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/
  return otpRegex.test(otp)
}

// Form validation helpers
export const validateRegistrationForm = (formData) => {
  const errors = {}

  if (!formData.firstName || !validateName(formData.firstName)) {
    errors.firstName = 'First name must be 2-50 characters and contain only letters'
  }

  if (!formData.lastName || !validateName(formData.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters and contain only letters'
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!formData.phone || !validatePhoneNumber(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  const passwordValidation = validatePassword(formData.password)
  if (!formData.password || !passwordValidation.isValid) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!formData.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateLoginForm = (formData) => {
  const errors = {}

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!formData.password || formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Real-time validation helpers
export const getPasswordStrength = (password) => {
  const validation = validatePassword(password)
  const { score } = validation

  if (score <= 2) return { level: 'weak', color: 'red', text: 'Weak' }
  if (score <= 3) return { level: 'fair', color: 'orange', text: 'Fair' }
  if (score <= 4) return { level: 'good', color: 'blue', text: 'Good' }
  return { level: 'strong', color: 'green', text: 'Strong' }
}

export const getPasswordRequirements = (password) => {
  const validation = validatePassword(password)
  return [
    { text: 'At least 8 characters', met: validation.minLength },
    { text: 'One uppercase letter', met: validation.hasUpperCase },
    { text: 'One lowercase letter', met: validation.hasLowerCase },
    { text: 'One number', met: validation.hasNumbers },
    { text: 'One special character', met: validation.hasSpecialChar }
  ]
}

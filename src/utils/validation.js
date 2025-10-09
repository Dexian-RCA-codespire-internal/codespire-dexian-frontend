// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password = "") => {
  const MIN_LENGTH = 8;
  const MAX_LENGTH = 15;
  const length = password.length;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const meetsMin = length >= MIN_LENGTH;
  const meetsMax = length <= MAX_LENGTH;

  const criteria = [meetsMin, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];
  const score = criteria.filter(Boolean).length;
  const allCriteria = score === 5;          
  const isValid = allCriteria && meetsMax;

  return {
    isValid: allCriteria && meetsMax,
    minLength: meetsMin,
    maxLength: meetsMax,
    hasUpperCase,
    hasLowerCase,
    hasNumbers: hasNumber,
    hasNumber,
    hasSpecialChar,
    length,
    allCriteria,
    score: [meetsMin, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length
  };
};

export const getPasswordStrength = (password = "") => {
  const v = validatePassword(password);
  const len = v.length;

  if (len === 0) return { level: 'empty', color: 'gray', text: 'Start typing' };

  if (!v.maxLength) {
    return { level: 'invalid', color: 'red', text: 'Too long (max 15)' };
  }

  switch (true) {
    case (v.score <= 2):
      return { level: 'weak',  color: 'red',    text: 'Weak' };
    case (v.score === 3):
      return { level: 'fair',  color: 'orange', text: 'Fair' };
    case (v.score === 4):
      return { level: 'good',  color: 'green',   text: 'Good' };
    case (v.score === 5):
      return { level: 'strong',color: 'green',  text: 'Strong' };
    default:
      return { level: 'weak',  color: 'red',    text: 'Weak' };
  }
};

export const getPasswordRequirements = (password = "") => {
  const v = validatePassword(password);
  return [
    { text: 'Between 8-15 characters', met: v.minLength && v.maxLength },
    { text: 'One uppercase letter', met: v.hasUpperCase },
    { text: 'One lowercase letter', met: v.hasLowerCase },
    { text: 'One number', met: v.hasNumber },
    { text: 'One special character', met: v.hasSpecialChar }
  ];
};

// Phone number validation 
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// Name validation 
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// OTP validation 
export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Registration form validator 
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.firstName || !validateName(formData.firstName)) {
    errors.firstName = 'Enter between 2-50 characters';
  }

  if (!formData.lastName || !validateName(formData.lastName)) {
    errors.lastName = 'Enter between 2-50 characters';
  }

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.phone || !validatePhoneNumber(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  const passwordValidation = validatePassword(formData.password);
  if (!formData.password || !passwordValidation.isValid) {
    errors.password = 'Password needs 8+ chars incl. uppercase, lowercase, number, and special character';
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginForm = (formData) => {
  const errors = {};
  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

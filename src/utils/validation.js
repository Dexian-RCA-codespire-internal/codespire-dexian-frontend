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

  // Check for repeated characters (3 or more in a row)
  const hasRepeatedChars = /(.)\1{2,}/.test(password);

  // Check for overall diversity (not just repeated single char)
  const uniqueChars = new Set(password.split('')).size;
  const isDiverse = uniqueChars >= 5; // Require at least 5 unique chars for strong

  const allCriteria = meetsMin && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isDiverse && !hasRepeatedChars;

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
    hasRepeatedChars,
    isDiverse,
    score: [meetsMin, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isDiverse, !hasRepeatedChars].filter(Boolean).length
  };
};

export const getPasswordStrength = (password = "") => {
  const v = validatePassword(password);
  const len = v.length;

  if (len === 0) return { level: 'empty', color: 'gray', text: 'Start typing' };

  if (!v.maxLength) {
    return { level: 'invalid', color: 'red', text: 'Too long (max 15)' };
  }

  if (len < 5) {
    return { level: 'weak', color: 'red', text: 'Weak' };
  }

  if (len >= 5 && (v.hasNumber || v.hasSpecialChar) && !v.allCriteria) {
    return { level: 'fair', color: 'orange', text: 'Fair' };
  }

  if (v.allCriteria && len <= 10) {
    return { level: 'good', color: 'blue', text: 'Good' };
  }

  if (v.allCriteria && len >= 11) {
    return { level: 'strong', color: 'green', text: 'Strong' };
  }

  return { level: 'weak', color: 'red', text: 'Weak' };
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

// Phone number validation (unchanged)
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

// Name validation (unchanged)
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// OTP validation (unchanged)
export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

// Registration form validator (only tweak the error text to match new rules)
export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.firstName || !validateName(formData.firstName)) {
    errors.firstName = 'First name must be 2-50 characters and contain only letters';
  }

  if (!formData.lastName || !validateName(formData.lastName)) {
    errors.lastName = 'Last name must be 2-50 characters and contain only letters';
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
  if (!formData.password || formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

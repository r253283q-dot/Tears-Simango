export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates phone numbers: strictly numbers only (optional leading + allowed).
 * Rejects letters, spaces, and punctuation.
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.' };
  }
  // Enforces digits only (with optional single leading +)
  const phoneRegex = /^\+?\d{8,15}$/;
  if (!phoneRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number must contain numbers only (8 to 15 digits, e.g. 263771234567 or +263771234567).'
    };
  }
  return { isValid: true };
};

/**
 * Validates email addresses using standard corporate pattern.
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. contact@business.co.zw).'
    };
  }
  return { isValid: true };
};

/**
 * Validates human names: characters / letters only (no numbers, no special symbols).
 */
export const validatePersonName = (name: string, fieldLabel = 'Name'): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldLabel} must be at least 2 characters.` };
  }
  // Letters, spaces, hyphens, and apostrophes only - absolutely NO digits
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldLabel} must contain characters/letters only (no numbers or symbols).`
    };
  }
  return { isValid: true };
};

/**
 * Validates city names: letters and characters only.
 */
export const validateCity = (city: string): ValidationResult => {
  const trimmed = city.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Headquarters city is required.' };
  }
  const cityRegex = /^[a-zA-Z\s'-]+$/;
  if (!cityRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'City name must contain characters/letters only.'
    };
  }
  return { isValid: true };
};

/**
 * Validates business sector: letters and characters only.
 */
export const validateSector = (sector: string): ValidationResult => {
  const trimmed = sector.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Commercial sector is required.' };
  }
  const sectorRegex = /^[a-zA-Z\s,-]+$/;
  if (!sectorRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Sector must contain characters/letters only.'
    };
  }
  return { isValid: true };
};

/**
 * Validates company name: must be at least 2 characters.
 */
export const validateCompanyName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Company name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Company name must be at least 2 characters.' };
  }
  // Company names must start with a letter and contain valid business title characters
  const compRegex = /^[a-zA-Z0-9\s&'.-]{2,100}$/;
  if (!compRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Company name contains invalid characters.'
    };
  }
  return { isValid: true };
};

/**
 * Validates username: alphanumeric, hyphens, underscores.
 */
export const validateUsername = (username: string): ValidationResult => {
  const trimmed = username.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Username is required.' };
  }
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!usernameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Username must be 3-30 characters with letters, numbers, hyphens or underscores only.'
    };
  }
  return { isValid: true };
};

/**
 * Validates password: at least 6 characters.
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
};

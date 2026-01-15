/**
 * Input sanitization utilities
 * Prevents XSS attacks and injection attacks
 */

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text input (remove HTML tags)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize SSN input (only allow digits and hyphens)
 */
export function sanitizeSSN(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove all non-digits and non-hyphens, then format
  const cleaned = input.replace(/[^\d-]/g, '');
  
  // Format as XXX-XX-XXXX
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }
  
  return cleaned;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove all non-digits
  return input.replace(/\D/g, '');
}

/**
 * Sanitize email
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic email validation and sanitization
  const email = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(email)) {
    return email;
  }
  
  return '';
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) ? 0 : input;
  }
  
  if (typeof input !== 'string') {
    return 0;
  }
  
  const num = parseFloat(input.replace(/[^\d.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate and sanitize SSN format
 */
export function validateSSN(ssn: string): boolean {
  if (!ssn) return false;
  
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.length === 9;
}

/**
 * Remove sensitive data from logs
 */
export function redactSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = ['ssn', 'password', 'accountnumber', 'routingnumber', 'creditcard'];
  
  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }
  
  const redacted: any = {};
  
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const keyLower = key.toLowerCase();
      // Check if key matches any sensitive field (case-insensitive)
      if (sensitiveFields.some(field => keyLower === field || keyLower.includes(field))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        redacted[key] = redactSensitiveData(data[key]);
      } else {
        redacted[key] = data[key];
      }
    }
  }
  
  return redacted;
}

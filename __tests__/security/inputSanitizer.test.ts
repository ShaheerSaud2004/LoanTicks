import { describe, it, expect } from '@jest/globals';
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeSSN,
  sanitizePhone,
  sanitizeEmail,
  sanitizeNumber,
  validateSSN,
  redactSensitiveData,
} from '@/lib/inputSanitizer';

describe('Input Sanitization Utilities', () => {
  describe('sanitizeHTML', () => {
    it('should escape HTML tags to prevent XSS', () => {
      const malicious = '<script>alert("XSS")</script>';
      const safe = sanitizeHTML(malicious);
      
      expect(safe).not.toContain('<script>');
      expect(safe).toContain('&lt;script&gt;');
      expect(safe).toContain('&lt;/script&gt;');
    });

    it('should escape quotes', () => {
      const input = 'Hello "world"';
      const safe = sanitizeHTML(input);
      expect(safe).toBe('Hello &quot;world&quot;');
      expect(safe).not.toContain('"');
    });

    it('should handle empty strings', () => {
      expect(sanitizeHTML('')).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const safe = sanitizeText(input);
      expect(safe).toBe('Hello world');
    });

    it('should handle nested tags', () => {
      const input = '<div><span>Text</span></div>';
      const safe = sanitizeText(input);
      expect(safe).toBe('Text');
    });
  });

  describe('sanitizeSSN', () => {
    it('should format SSN correctly', () => {
      expect(sanitizeSSN('123456789')).toBe('123-45-6789');
      expect(sanitizeSSN('123-45-6789')).toBe('123-45-6789');
    });

    it('should remove non-digit characters', () => {
      expect(sanitizeSSN('123-45-6789abc')).toBe('123-45-6789');
    });

    it('should handle partial SSN', () => {
      expect(sanitizeSSN('12345')).toBe('12345');
    });
  });

  describe('sanitizePhone', () => {
    it('should remove all non-digit characters', () => {
      expect(sanitizePhone('(555) 123-4567')).toBe('5551234567');
      expect(sanitizePhone('555-123-4567')).toBe('5551234567');
    });

    it('should handle empty strings', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and normalize email', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
      expect(sanitizeEmail('  user@domain.com  ')).toBe('user@domain.com');
    });

    it('should return empty string for invalid email', () => {
      expect(sanitizeEmail('invalid-email')).toBe('');
      expect(sanitizeEmail('not@valid')).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should parse valid numbers', () => {
      expect(sanitizeNumber('123.45')).toBe(123.45);
      expect(sanitizeNumber('1000')).toBe(1000);
    });

    it('should handle non-numeric strings', () => {
      expect(sanitizeNumber('abc')).toBe(0);
      expect(sanitizeNumber('')).toBe(0);
    });

    it('should handle number type', () => {
      expect(sanitizeNumber(123)).toBe(123);
      expect(sanitizeNumber(NaN)).toBe(0);
    });
  });

  describe('validateSSN', () => {
    it('should validate correct SSN format', () => {
      expect(validateSSN('123-45-6789')).toBe(true);
      expect(validateSSN('123456789')).toBe(true);
    });

    it('should reject invalid SSN', () => {
      expect(validateSSN('123-45-678')).toBe(false);
      expect(validateSSN('12345678')).toBe(false);
      expect(validateSSN('')).toBe(false);
    });
  });

  describe('redactSensitiveData', () => {
    it('should redact sensitive fields', () => {
      const data = {
        ssn: '123-45-6789',
        password: 'secret123',
        accountNumber: '1234567890',
        name: 'John Doe',
      };
      
      const redacted = redactSensitiveData(data);
      
      expect(redacted.ssn).toBe('[REDACTED]');
      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.accountNumber).toBe('[REDACTED]');
      expect(redacted.name).toBe('John Doe'); // Not sensitive
    });

    it('should handle nested objects', () => {
      const data = {
        user: {
          ssn: '123-45-6789',
          name: 'John',
        },
      };
      
      const redacted = redactSensitiveData(data);
      expect(redacted.user.ssn).toBe('[REDACTED]');
    });

    it('should handle arrays', () => {
      const data = {
        accounts: [
          { accountNumber: '123', name: 'Account 1' },
          { accountNumber: '456', name: 'Account 2' },
        ],
      };
      
      const redacted = redactSensitiveData(data);
      expect(redacted.accounts[0].accountNumber).toBe('[REDACTED]');
      expect(redacted.accounts[1].accountNumber).toBe('[REDACTED]');
      expect(redacted.accounts[0].name).toBe('Account 1');
    });
  });
});

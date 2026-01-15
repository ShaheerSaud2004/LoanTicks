import { describe, it, expect } from '@jest/globals';

describe('Form Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
      ];

      invalidEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate US phone number formats', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '5551234567',
        '+1-555-123-4567',
      ];

      validPhones.forEach((phone) => {
        const phoneRegex = /^[\d\s()+-]+$/;
        expect(phoneRegex.test(phone.replace(/\s/g, ''))).toBe(true);
      });
    });
  });

  describe('SSN Validation', () => {
    it('should validate SSN format', () => {
      const validSSNs = [
        '123-45-6789',
        '123456789',
      ];

      validSSNs.forEach((ssn) => {
        const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
        expect(ssnRegex.test(ssn)).toBe(true);
      });
    });

    it('should reject invalid SSN format', () => {
      const invalidSSNs = [
        '123-45-678',
        '12-345-6789',
        '000-00-0000',
        '123-45-67890',
      ];

      invalidSSNs.forEach((ssn) => {
        const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
        if (ssnRegex.test(ssn)) {
          // Additional check for all zeros
          expect(ssn.replace(/-/g, '') === '000000000').toBe(false);
        }
      });
    });
  });

  describe('Currency Validation', () => {
    it('should format currency correctly', () => {
      const amounts = [1000, 1000000, 1234.56];
      const formatted = amounts.map((amount) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)
      );

      expect(formatted[0]).toBe('$1,000.00');
      expect(formatted[1]).toBe('$1,000,000.00');
      expect(formatted[2]).toBe('$1,234.56');
    });
  });

  describe('Date Validation', () => {
    it('should validate date format', () => {
      const validDates = [
        '2024-01-15',
        '2024-12-31',
        '2000-01-01',
      ];

      validDates.forEach((date) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        expect(dateRegex.test(date)).toBe(true);
        expect(new Date(date).toString()).not.toBe('Invalid Date');
      });
    });

    it('should reject invalid dates', () => {
      const invalidDates = [
        '2024-13-01', // Invalid month
        '2024-02-30', // Invalid day
        '24-01-15', // Wrong format
      ];

      invalidDates.forEach((date) => {
        const parsed = new Date(date);
        expect(isNaN(parsed.getTime())).toBe(true);
      });
    });
  });
});

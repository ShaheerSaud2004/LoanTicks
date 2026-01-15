import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  encryptSensitiveData, 
  decryptSensitiveData, 
  maskSSN, 
  maskAccountNumber,
  generateEncryptionKey 
} from '@/lib/encryption';

describe('Encryption Utilities', () => {
  // Set a test encryption key
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-purposes-only-32-chars';
  });

  describe('encryptSensitiveData and decryptSensitiveData', () => {
    it('should encrypt and decrypt SSN correctly', () => {
      const ssn = '123-45-6789';
      const encrypted = encryptSensitiveData(ssn);
      const decrypted = decryptSensitiveData(encrypted);

      expect(encrypted).not.toBe(ssn);
      expect(encrypted).toContain(':'); // Encrypted format: iv:tag:encrypted
      expect(decrypted).toBe(ssn);
    });

    it('should encrypt and decrypt account number correctly', () => {
      const accountNumber = '1234567890';
      const encrypted = encryptSensitiveData(accountNumber);
      const decrypted = decryptSensitiveData(encrypted);

      expect(encrypted).not.toBe(accountNumber);
      expect(decrypted).toBe(accountNumber);
    });

    it('should produce different encrypted values for same input (IV uniqueness)', () => {
      const ssn = '123-45-6789';
      const encrypted1 = encryptSensitiveData(ssn);
      const encrypted2 = encryptSensitiveData(ssn);

      // Should be different due to random IV
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to same value
      expect(decryptSensitiveData(encrypted1)).toBe(ssn);
      expect(decryptSensitiveData(encrypted2)).toBe(ssn);
    });

    it('should throw error if encryption key is missing', () => {
      delete process.env.ENCRYPTION_KEY;
      
      expect(() => {
        encryptSensitiveData('123-45-6789');
      }).toThrow('ENCRYPTION_KEY');
    });

    it('should throw error for invalid encrypted data format', () => {
      expect(() => {
        decryptSensitiveData('invalid-format');
      }).toThrow('Invalid encrypted data format');
    });
  });

  describe('maskSSN', () => {
    it('should mask SSN showing only last 4 digits', () => {
      expect(maskSSN('123-45-6789')).toBe('***-**-6789');
      expect(maskSSN('123456789')).toBe('***-**-6789');
    });

    it('should handle SSN without dashes', () => {
      expect(maskSSN('123456789')).toBe('***-**-6789');
    });

    it('should return default mask for invalid input', () => {
      expect(maskSSN('')).toBe('***-**-****');
      expect(maskSSN('123')).toBe('***-**-****');
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask account number showing only last 4 digits', () => {
      expect(maskAccountNumber('1234567890')).toBe('******7890');
      expect(maskAccountNumber('1234567890123456')).toBe('************3456');
    });

    it('should handle short account numbers', () => {
      expect(maskAccountNumber('1234')).toBe('1234');
      expect(maskAccountNumber('123')).toBe('****');
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex string', () => {
      const key = generateEncryptionKey();
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique keys', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });
});

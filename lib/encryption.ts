/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for encryption at rest
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is 12, but we'll use 16 for compatibility
const _SALT_LENGTH = 64;
const _TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment variable
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  // If no key is set, use a default key (for development/testing only)
  // In production, ENCRYPTION_KEY should always be set
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    // Use a default key for development (not secure, but allows testing)
    console.warn('⚠️  ENCRYPTION_KEY not set. Using default key for development. Set ENCRYPTION_KEY in production!');
    return crypto.pbkdf2Sync('default-dev-key-change-in-production', 'loanticks-salt', 100000, KEY_LENGTH, 'sha512');
  }
  
  // If key is a hex string, convert it; otherwise use it directly
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Derive key from string using PBKDF2
  return crypto.pbkdf2Sync(key, 'loanticks-salt', 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data (e.g., SSN, bank account numbers)
 */
export function encryptSensitiveData(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Return: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    if (error instanceof Error && error.message.includes('ENCRYPTION_KEY')) {
      throw error;
    }
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
      const parts = encryptedData.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      if (!parts[0] || !parts[1] || !parts[2]) {
        throw new Error('Invalid encrypted data format');
      }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      if (error instanceof Error && error.message.includes('Invalid encrypted data format')) {
        throw error;
      }
      throw new Error('Invalid encrypted data format');
    }
}

/**
 * Mask sensitive data for display (show only last 4 digits)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '***';
  }
  
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  
  return `${masked}${visible}`;
}

/**
 * Mask SSN (format: ***-**-1234)
 */
export function maskSSN(ssn: string): string {
  if (!ssn || ssn.length < 4) {
    return '***-**-****';
  }
  
  // Remove any non-digits
  const digits = ssn.replace(/\D/g, '');
  
  if (digits.length < 4) {
    return '***-**-****';
  }
  
  const last4 = digits.slice(-4);
  return `***-**-${last4}`;
}

/**
 * Mask bank account number (show last 4 digits)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) {
    return '****';
  }
  
  const digits = accountNumber.replace(/\D/g, '');
  
  // If exactly 4 digits, show all
  if (digits.length === 4) {
    return digits;
  }
  
  // If less than 4 digits, mask all
  if (digits.length < 4) {
    return '****';
  }
  
  // Show last 4, mask the rest
  const last4 = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4);
  
  return `${masked}${last4}`;
}

/**
 * Generate a secure encryption key (use this once to generate ENCRYPTION_KEY)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

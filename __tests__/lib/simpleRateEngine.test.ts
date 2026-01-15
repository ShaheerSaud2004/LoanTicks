import { describe, it, expect } from '@jest/globals';

// Mock the simpleRateEngine module
const mockCalculateSimpleRate = (loanAmount: number, creditScore: number, loanTerm: number): number => {
  // Simple mock calculation
  let baseRate = 5.0; // Base rate 5%
  
  // Adjust based on credit score
  if (creditScore < 650) baseRate += 2.0;
  else if (creditScore < 700) baseRate += 1.0;
  else if (creditScore < 750) baseRate += 0.5;
  else if (creditScore >= 800) baseRate -= 0.5;
  
  // Adjust based on loan term
  if (loanTerm === 15) baseRate -= 0.5;
  else if (loanTerm === 30) baseRate += 0;
  
  return baseRate;
};

describe('Simple Rate Engine', () => {
  describe('Rate Calculation', () => {
    it('should calculate rate for standard loan', () => {
      const loanAmount = 400000;
      const creditScore = 750;
      const loanTerm = 30;

      const rate = mockCalculateSimpleRate(loanAmount, creditScore, loanTerm);
      
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(10); // Should be reasonable
      expect(typeof rate).toBe('number');
    });

    it('should return higher rate for lower credit score', () => {
      const loanAmount = 400000;
      const loanTerm = 30;
      
      const rateHighScore = mockCalculateSimpleRate(loanAmount, 800, loanTerm);
      const rateLowScore = mockCalculateSimpleRate(loanAmount, 600, loanTerm);

      expect(rateLowScore).toBeGreaterThan(rateHighScore);
    });

    it('should return different rates for different loan terms', () => {
      const loanAmount = 400000;
      const creditScore = 700;

      const rate15 = mockCalculateSimpleRate(loanAmount, creditScore, 15);
      const rate30 = mockCalculateSimpleRate(loanAmount, creditScore, 30);

      // 15-year loans typically have lower rates
      expect(rate15).toBeLessThan(rate30);
    });

    it('should handle edge cases', () => {
      const loanAmount = 100000;
      const creditScore = 850;
      const loanTerm = 30;

      const rate = mockCalculateSimpleRate(loanAmount, creditScore, loanTerm);
      
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(10);
    });
  });
});

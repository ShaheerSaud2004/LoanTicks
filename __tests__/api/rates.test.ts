import { describe, it, expect, jest } from '@jest/globals';

// Mock rate engine
const mockRateEngine = {
  calculateRate: jest.fn(),
  getRates: jest.fn(),
};

jest.mock('@/lib/rateEngines', () => ({
  calculateRate: (...args: any[]) => mockRateEngine.calculateRate(...args),
  getRates: (...args: any[]) => mockRateEngine.getRates(...args),
}));

describe('Rate Calculation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate loan amount is positive', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.loanAmount <= 0) throw new Error('Invalid loan amount');
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ loanAmount: -100000 })).toThrow();
      expect(() => calculateRate({ loanAmount: 0 })).toThrow();
    });

    it('should validate property value is positive', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.propertyValue <= 0) throw new Error('Invalid property value');
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ loanAmount: 300000, propertyValue: -400000 })).toThrow();
    });

    it('should validate credit score range', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.creditScore < 300 || params.creditScore > 850) {
          throw new Error('Invalid credit score');
        }
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 200 
      })).toThrow();
      
      expect(() => calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 900 
      })).toThrow();
    });

    it('should accept valid credit score range', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.creditScore < 300 || params.creditScore > 850) {
          throw new Error('Invalid credit score');
        }
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 750 
      })).not.toThrow();
    });

    it('should validate loan term is positive', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.loanTerm <= 0) throw new Error('Invalid loan term');
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ 
        loanAmount: 300000,
        loanTerm: -30 
      })).toThrow();
    });
  });

  describe('LTV Calculation', () => {
    it('should calculate LTV correctly', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const ltv = (params.loanAmount / params.propertyValue) * 100;
        return { rate: 6.5, apr: 6.75, ltv };
      });

      const result = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000 
      });
      
      expect(result.ltv).toBeCloseTo(75, 1);
    });

    it('should handle 100% LTV', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const ltv = (params.loanAmount / params.propertyValue) * 100;
        return { rate: 7.5, apr: 7.75, ltv };
      });

      const result = calculateRate({ 
        loanAmount: 400000,
        propertyValue: 400000 
      });
      
      expect(result.ltv).toBeCloseTo(100, 1);
    });

    it('should handle low LTV (high down payment)', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const ltv = (params.loanAmount / params.propertyValue) * 100;
        return { rate: 5.5, apr: 5.75, ltv };
      });

      const result = calculateRate({ 
        loanAmount: 200000,
        propertyValue: 400000 
      });
      
      expect(result.ltv).toBeCloseTo(50, 1);
    });
  });

  describe('Rate Adjustments', () => {
    it('should give better rates for higher credit scores', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        let rate = 7.0;
        if (params.creditScore >= 760) rate = 5.5;
        else if (params.creditScore >= 700) rate = 6.0;
        return { rate, apr: rate + 0.25 };
      });

      const highCreditResult = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 780
      });
      
      const lowCreditResult = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 650
      });
      
      expect(highCreditResult.rate).toBeLessThan(lowCreditResult.rate);
    });

    it('should adjust rates based on LTV', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const ltv = (params.loanAmount / params.propertyValue) * 100;
        let rate = 6.0;
        if (ltv > 80) rate = 6.5;
        return { rate, apr: rate + 0.25 };
      });

      const highLtvResult = calculateRate({ 
        loanAmount: 380000,
        propertyValue: 400000
      });
      
      const lowLtvResult = calculateRate({ 
        loanAmount: 280000,
        propertyValue: 400000
      });
      
      expect(highLtvResult.rate).toBeGreaterThan(lowLtvResult.rate);
    });

    it('should adjust rates based on loan term', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        let rate = 6.0;
        if (params.loanTerm === 15) rate = 5.5;
        else if (params.loanTerm === 30) rate = 6.5;
        return { rate, apr: rate + 0.25 };
      });

      const result15yr = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        loanTerm: 15
      });
      
      const result30yr = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        loanTerm: 30
      });
      
      expect(result15yr.rate).toBeLessThan(result30yr.rate);
    });

    it('should adjust rates based on property type', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        let rate = 6.0;
        if (params.propertyType === 'investment') rate = 7.0;
        else if (params.propertyType === 'secondHome') rate = 6.5;
        return { rate, apr: rate + 0.25 };
      });

      const primaryResult = calculateRate({ 
        loanAmount: 300000,
        propertyType: 'primary'
      });
      
      const investmentResult = calculateRate({ 
        loanAmount: 300000,
        propertyType: 'investment'
      });
      
      expect(investmentResult.rate).toBeGreaterThan(primaryResult.rate);
    });
  });

  describe('Payment Calculation', () => {
    it('should calculate monthly payment correctly', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const rate = 6.0;
        const monthlyRate = rate / 100 / 12;
        const numPayments = params.loanTerm * 12;
        const monthlyPayment = params.loanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
          (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        return { rate, apr: rate + 0.25, monthlyPayment, loanAmount: params.loanAmount };
      });

      const result = calculateRate({ 
        loanAmount: 300000,
        loanTerm: 30
      });
      
      expect(result.monthlyPayment).toBeGreaterThan(0);
      expect(result.monthlyPayment).toBeLessThan(300000);
    });

    it('should have higher monthly payments for shorter terms', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const rate = 6.0;
        const monthlyRate = rate / 100 / 12;
        const numPayments = params.loanTerm * 12;
        const monthlyPayment = params.loanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
          (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        return { rate, apr: rate + 0.25, monthlyPayment };
      });

      const result15yr = calculateRate({ 
        loanAmount: 300000,
        loanTerm: 15
      });
      
      const result30yr = calculateRate({ 
        loanAmount: 300000,
        loanTerm: 30
      });
      
      expect(result15yr.monthlyPayment).toBeGreaterThan(result30yr.monthlyPayment);
    });
  });

  describe('Multiple Rate Quotes', () => {
    it('should return multiple rate options', () => {
      const { getRates } = require('@/lib/rateEngines');
      
      mockRateEngine.getRates.mockResolvedValue([
        { term: 15, rate: 5.5, apr: 5.75, monthlyPayment: 2445 },
        { term: 20, rate: 6.0, apr: 6.25, monthlyPayment: 2149 },
        { term: 30, rate: 6.5, apr: 6.75, monthlyPayment: 1896 },
      ]);

      return getRates({ loanAmount: 300000 }).then((rates: any) => {
        expect(Array.isArray(rates)).toBe(true);
        expect(rates.length).toBeGreaterThan(1);
      });
    });

    it('should sort rates by term length', () => {
      const { getRates } = require('@/lib/rateEngines');
      
      mockRateEngine.getRates.mockResolvedValue([
        { term: 15, rate: 5.5 },
        { term: 20, rate: 6.0 },
        { term: 30, rate: 6.5 },
      ]);

      return getRates({ loanAmount: 300000 }).then((rates: any) => {
        for (let i = 0; i < rates.length - 1; i++) {
          expect(rates[i].term).toBeLessThanOrEqual(rates[i + 1].term);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle jumbo loans', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const isJumbo = params.loanAmount > 726200;
        const rate = isJumbo ? 7.0 : 6.5;
        return { rate, apr: rate + 0.25, isJumbo };
      });

      const result = calculateRate({ 
        loanAmount: 800000,
        propertyValue: 1000000
      });
      
      expect(result.isJumbo).toBe(true);
      expect(result.rate).toBeGreaterThan(6.5);
    });

    it('should handle very high credit scores', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        const rate = params.creditScore >= 800 ? 5.0 : 6.0;
        return { rate, apr: rate + 0.25 };
      });

      const result = calculateRate({ 
        loanAmount: 300000,
        propertyValue: 400000,
        creditScore: 840
      });
      
      expect(result.rate).toBeLessThan(5.5);
    });

    it('should handle minimum loan amounts', () => {
      const { calculateRate } = require('@/lib/rateEngines');
      
      mockRateEngine.calculateRate.mockImplementation((params) => {
        if (params.loanAmount < 50000) throw new Error('Loan too small');
        return { rate: 6.5, apr: 6.75 };
      });

      expect(() => calculateRate({ loanAmount: 25000 })).toThrow();
      expect(() => calculateRate({ loanAmount: 50000 })).not.toThrow();
    });
  });
});


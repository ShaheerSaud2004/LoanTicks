import { describe, it, expect } from '@jest/globals';

describe('Financial Calculations', () => {
  describe('Down Payment Calculations', () => {
    it('should calculate down payment amount', () => {
      const purchasePrice = 500000;
      const loanAmount = 400000;
      const downPayment = purchasePrice - loanAmount;

      expect(downPayment).toBe(100000);
    });

    it('should calculate down payment percentage', () => {
      const purchasePrice = 500000;
      const downPayment = 100000;
      const downPaymentPercent = (downPayment / purchasePrice) * 100;

      expect(downPaymentPercent).toBe(20);
    });

    it('should handle zero purchase price', () => {
      const purchasePrice = 0;
      const loanAmount = 0;
      const downPayment = purchasePrice - loanAmount;
      const downPaymentPercent = purchasePrice > 0 ? (downPayment / purchasePrice) * 100 : 0;

      expect(downPayment).toBe(0);
      expect(downPaymentPercent).toBe(0);
    });
  });

  describe('LTV Ratio Calculations', () => {
    it('should calculate LTV ratio correctly', () => {
      const loanAmount = 400000;
      const appraisedValue = 500000;
      const ltv = (loanAmount / appraisedValue) * 100;

      expect(ltv).toBe(80);
    });

    it('should handle 100% LTV', () => {
      const loanAmount = 500000;
      const appraisedValue = 500000;
      const ltv = (loanAmount / appraisedValue) * 100;

      expect(ltv).toBe(100);
    });

    it('should prevent division by zero', () => {
      const loanAmount = 400000;
      const appraisedValue = 0;
      const ltv = appraisedValue > 0 ? (loanAmount / appraisedValue) * 100 : 0;

      expect(ltv).toBe(0);
    });
  });

  describe('Debt-to-Income Ratio', () => {
    it('should calculate DTI correctly', () => {
      const monthlyIncome = 6000;
      const monthlyDebt = 1500;
      const dti = (monthlyDebt / monthlyIncome) * 100;

      expect(dti).toBe(25);
    });

    it('should handle zero income', () => {
      const monthlyIncome = 0;
      const monthlyDebt = 1500;
      const dti = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;

      expect(dti).toBe(0);
    });
  });

  describe('Monthly Payment Calculations', () => {
    it('should calculate monthly payment for 30-year loan', () => {
      const loanAmount = 400000;
      const annualRate = 0.06; // 6%
      const monthlyRate = annualRate / 12;
      const numPayments = 30 * 12; // 360 months

      const monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

      expect(monthlyPayment).toBeGreaterThan(2000);
      expect(monthlyPayment).toBeLessThan(2500);
    });

    it('should calculate monthly payment for 15-year loan', () => {
      const loanAmount = 400000;
      const annualRate = 0.05; // 5%
      const monthlyRate = annualRate / 12;
      const numPayments = 15 * 12; // 180 months

      const monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

      expect(monthlyPayment).toBeGreaterThan(3000);
      expect(monthlyPayment).toBeLessThan(3500);
    });
  });
});

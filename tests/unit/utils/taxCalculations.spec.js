import { describe, it, expect } from 'vitest'
import {
  calculateTaxTreatment,
  daysUntilLongTerm,
  calculateTaxSavings,
  calculateTotalTaxImpact
} from '@/utils/taxCalculations'

describe('Tax Calculations', () => {
  describe('calculateTaxTreatment', () => {
    it('returns long-term for holdings over 365 days', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)
      const dateString = oldDate.toISOString().split('T')[0]
      
      expect(calculateTaxTreatment(dateString)).toBe('long-term')
    })

    it('returns short-term for holdings under 365 days', () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 100)
      const dateString = recentDate.toISOString().split('T')[0]
      
      expect(calculateTaxTreatment(dateString)).toBe('short-term')
    })

    it('returns short-term for holdings exactly at 365 days', () => {
      const exactDate = new Date()
      exactDate.setDate(exactDate.getDate() - 365)
      const dateString = exactDate.toISOString().split('T')[0]
      
      expect(calculateTaxTreatment(dateString)).toBe('short-term')
    })
  })

  describe('daysUntilLongTerm', () => {
    it('returns 0 for long-term holdings', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)
      const dateString = oldDate.toISOString().split('T')[0]
      
      expect(daysUntilLongTerm(dateString)).toBe(0)
    })

    it('returns positive number for short-term holdings', () => {
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 100)
      const dateString = recentDate.toISOString().split('T')[0]
      
      const days = daysUntilLongTerm(dateString)
      expect(days).toBeGreaterThan(0)
      expect(days).toBeLessThanOrEqual(366)
    })

    it('returns approximately correct days remaining', () => {
      const date300DaysAgo = new Date()
      date300DaysAgo.setDate(date300DaysAgo.getDate() - 300)
      const dateString = date300DaysAgo.toISOString().split('T')[0]
      
      const days = daysUntilLongTerm(dateString)
      expect(days).toBeGreaterThan(60)
      expect(days).toBeLessThan(70)
    })
  })

  describe('calculateTaxSavings', () => {
    it('calculates savings with default rates', () => {
      const gainAmount = 10000
      const savings = calculateTaxSavings(gainAmount)
      
      // Default: 32% - 15% = 17% savings
      expect(savings).toBe(1700)
    })

    it('calculates savings with custom rates', () => {
      const gainAmount = 10000
      const savings = calculateTaxSavings(gainAmount, 0.37, 0.20)
      
      // 37% - 20% = 17% savings
      expect(savings).toBe(1700)
    })

    it('returns zero for zero gain', () => {
      expect(calculateTaxSavings(0)).toBe(0)
    })

    it('handles negative gains (losses)', () => {
      const savings = calculateTaxSavings(-1000)
      expect(savings).toBe(-170) // Negative savings
    })
  })

  describe('calculateTotalTaxImpact', () => {
    it('calculates total tax correctly', () => {
      const shortTermGains = 10000  // 32% = 3200
      const longTermGains = 10000   // 15% = 1500
      
      const totalTax = calculateTotalTaxImpact(shortTermGains, longTermGains)
      expect(totalTax).toBe(4700)
    })

    it('handles zero gains', () => {
      expect(calculateTotalTaxImpact(0, 0)).toBe(0)
    })

    it('handles only short-term gains', () => {
      const tax = calculateTotalTaxImpact(10000, 0)
      expect(tax).toBe(3200)
    })

    it('handles only long-term gains', () => {
      const tax = calculateTotalTaxImpact(0, 10000)
      expect(tax).toBe(1500)
    })
  })
})

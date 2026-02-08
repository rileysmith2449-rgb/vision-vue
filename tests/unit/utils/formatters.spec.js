import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercent,
  formatCompactNumber,
  formatDate
} from '@/utils/formatters'

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(1234567)).toBe('$1,234,567')
    })

    it('formats negative amounts correctly', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000')
    })

    it('rounds to no decimal places by default', () => {
      expect(formatCurrency(1000.99)).toBe('$1,001')
      expect(formatCurrency(1000.49)).toBe('$1,000')
    })

    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000')
    })
  })

  describe('formatPercent', () => {
    it('formats positive percentages with + sign', () => {
      expect(formatPercent(12.34)).toBe('+12.34%')
    })

    it('formats negative percentages with - sign', () => {
      expect(formatPercent(-5.67)).toBe('-5.67%')
    })

    it('formats zero without sign', () => {
      expect(formatPercent(0)).toBe('+0.00%')
    })

    it('respects decimal places parameter', () => {
      expect(formatPercent(12.3456, 1)).toBe('+12.3%')
      expect(formatPercent(12.3456, 3)).toBe('+12.346%')
    })
  })

  describe('formatCompactNumber', () => {
    it('formats thousands with K suffix', () => {
      expect(formatCompactNumber(1000)).toBe('1.0K')
      expect(formatCompactNumber(5500)).toBe('5.5K')
    })

    it('formats millions with M suffix', () => {
      expect(formatCompactNumber(1000000)).toBe('1.0M')
      expect(formatCompactNumber(2500000)).toBe('2.5M')
    })

    it('formats billions with B suffix', () => {
      expect(formatCompactNumber(1000000000)).toBe('1.0B')
      expect(formatCompactNumber(3400000000)).toBe('3.4B')
    })

    it('formats numbers under 1000 without suffix', () => {
      expect(formatCompactNumber(999)).toBe('999')
      expect(formatCompactNumber(500)).toBe('500')
    })

    it('rounds to one decimal place', () => {
      expect(formatCompactNumber(1234)).toBe('1.2K')
      expect(formatCompactNumber(1567)).toBe('1.6K')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date string correctly', () => {
      const result = formatDate('2026-02-07')
      expect(result).toContain('Feb')
      expect(result).toContain('7')
      expect(result).toContain('2026')
    })

    it('handles different date formats', () => {
      const result = formatDate('2025-12-25')
      expect(result).toContain('Dec')
      expect(result).toContain('25')
      expect(result).toContain('2025')
    })
  })
})

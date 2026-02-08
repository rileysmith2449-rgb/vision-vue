import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { usePortfolioStore } from '@/stores/portfolio'

describe('Portfolio Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('initializes with empty holdings', () => {
      const store = usePortfolioStore()
      expect(store.holdings).toEqual([])
    })

    it('has loading state set to false', () => {
      const store = usePortfolioStore()
      expect(store.loading).toBe(false)
    })

    it('has no error initially', () => {
      const store = usePortfolioStore()
      expect(store.error).toBeNull()
    })
  })

  describe('Computed Values', () => {
    it('calculates total value correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },
        { currentValue: 2000, costBasis: 1500 }
      ]
      expect(store.totalValue).toBe(3000)
    })

    it('calculates total cost basis correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },
        { currentValue: 2000, costBasis: 1500 }
      ]
      expect(store.totalCostBasis).toBe(2300)
    })

    it('calculates total gains correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },
        { currentValue: 2000, costBasis: 1500 }
      ]
      expect(store.totalGains).toBe(700)
    })

    it('calculates unrealized gains correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },  // +200 gain
        { currentValue: 1500, costBasis: 2000 }  // -500 loss (ignored)
      ]
      expect(store.unrealizedGains).toBe(200)
    })

    it('calculates unrealized losses correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },  // +200 gain (ignored)
        { currentValue: 1500, costBasis: 2000 }  // -500 loss
      ]
      expect(store.unrealizedLosses).toBe(500)
    })
  })

  describe('Tax Calculations', () => {
    it('filters long-term holdings correctly', () => {
      const store = usePortfolioStore()
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)
      
      store.holdings = [
        { type: 'stock', purchaseDate: oldDate.toISOString().split('T')[0], currentValue: 1000 },
        { type: 'stock', purchaseDate: new Date().toISOString().split('T')[0], currentValue: 2000 },
        { type: 'cash', purchaseDate: oldDate.toISOString().split('T')[0], currentValue: 500 }
      ]
      
      expect(store.longTermHoldings.length).toBe(1)
    })

    it('calculates harvestable holdings (losses)', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { currentValue: 1000, costBasis: 800 },  // gain
        { currentValue: 1500, costBasis: 2000 }, // loss
        { currentValue: 2500, costBasis: 3000 }  // loss
      ]
      
      expect(store.harvestableHoldings.length).toBe(2)
      expect(store.harvestableAmount).toBe(1000) // 500 + 500
    })
  })

  describe('Category Management', () => {
    it('groups holdings by category', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { category: 'Stocks', currentValue: 1000 },
        { category: 'Stocks', currentValue: 2000 },
        { category: 'Crypto', currentValue: 500 }
      ]
      
      expect(store.holdingsByCategory).toHaveProperty('Stocks')
      expect(store.holdingsByCategory).toHaveProperty('Crypto')
      expect(store.holdingsByCategory.Stocks.length).toBe(2)
      expect(store.holdingsByCategory.Crypto.length).toBe(1)
    })

    it('calculates category totals', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { category: 'Stocks', currentValue: 1000 },
        { category: 'Stocks', currentValue: 2000 },
        { category: 'Crypto', currentValue: 500 }
      ]
      
      expect(store.categoryTotals.Stocks).toBe(3000)
      expect(store.categoryTotals.Crypto).toBe(500)
    })
  })

  describe('Actions', () => {
    it('adds holding correctly', () => {
      const store = usePortfolioStore()
      const newHolding = {
        symbol: 'AAPL',
        currentValue: 1000,
        costBasis: 800
      }
      
      store.addHolding(newHolding)
      
      expect(store.holdings.length).toBe(1)
      expect(store.holdings[0].symbol).toBe('AAPL')
      expect(store.holdings[0]).toHaveProperty('id')
    })

    it('updates holding correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { id: '1', symbol: 'AAPL', currentValue: 1000 }
      ]
      
      store.updateHolding('1', { currentValue: 1500 })
      
      expect(store.holdings[0].currentValue).toBe(1500)
      expect(store.holdings[0].symbol).toBe('AAPL')
    })

    it('removes holding correctly', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { id: '1', symbol: 'AAPL' },
        { id: '2', symbol: 'MSFT' }
      ]
      
      store.removeHolding('1')
      
      expect(store.holdings.length).toBe(1)
      expect(store.holdings[0].id).toBe('2')
    })

    it('filters holdings by category', () => {
      const store = usePortfolioStore()
      store.holdings = [
        { category: 'Stocks', symbol: 'AAPL' },
        { category: 'Stocks', symbol: 'MSFT' },
        { category: 'Crypto', symbol: 'BTC' }
      ]
      
      const stocks = store.getHoldingsByCategory('Stocks')
      
      expect(stocks.length).toBe(2)
      expect(stocks.every(h => h.category === 'Stocks')).toBe(true)
    })
  })
})

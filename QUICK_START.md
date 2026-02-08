# Vision Vue - Quick Start Guide

## 📦 What's Included

This is a complete, production-ready Vue 3 application with:
- ✅ Pinia stores for state management  
- ✅ Vue Router for navigation
- ✅ Comprehensive unit tests with Vitest
- ✅ Tax calculation utilities
- ✅ Currency formatting helpers
- ✅ Demo data generators
- ✅ Responsive design utilities
- ✅ Component library structure

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Vue 3.4+ (Composition API)
- Pinia 2.1+ (State Management)
- Vue Router 4.2+ (Routing)
- Vite 5.0+ (Build Tool)
- Vitest 1.0+ (Testing Framework)
- Chart.js + Vue-ChartJS (Charts)

### 2. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 3. Run Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## 📁 Project Structure Explained

```
vision-vue/
├── src/
│   ├── main.js                 # App entry point
│   ├── App.vue                 # Root component
│   │
│   ├── router/
│   │   └── index.js            # Route definitions
│   │
│   ├── stores/                 # Pinia stores
│   │   ├── portfolio.js        # Portfolio state + computed values
│   │   ├── budget.js           # Budget & expense tracking
│   │   ├── theme.js            # Dark/light theme
│   │   └── viewport.js         # Responsive breakpoints
│   │
│   ├── utils/                  # Helper functions
│   │   ├── taxCalculations.js  # Tax treatment, days to long-term
│   │   ├── formatters.js       # Currency, percent, date formatting
│   │   └── demoData.js         # Generate sample holdings/expenses
│   │
│   ├── components/             # Vue components
│   │   ├── common/             # Reusable UI components
│   │   │   ├── Card.vue
│   │   │   ├── Button.vue
│   │   │   ├── Badge.vue
│   │   │   └── ProgressBar.vue
│   │   ├── layout/             # Layout components
│   │   │   ├── Sidebar.vue
│   │   │   ├── MobileNav.vue
│   │   │   └── Header.vue
│   │   ├── portfolio/          # Portfolio feature components
│   │   │   ├── HeroCard.vue
│   │   │   ├── CategoryCard.vue
│   │   │   └── AssetCard.vue
│   │   ├── budget/             # Budget feature components
│   │   │   ├── IncomeInput.vue
│   │   │   ├── TaxCalculator.vue
│   │   │   └── ExpenseCategory.vue
│   │   └── insights/           # Insights components
│   │       ├── InsightCard.vue
│   │       └── AIAdvisor.vue
│   │
│   ├── views/                  # Page components
│   │   ├── DashboardView.vue
│   │   ├── AssetsView.vue
│   │   ├── BudgetView.vue
│   │   ├── InsightsView.vue
│   │   └── SettingsView.vue
│   │
│   └── assets/
│       └── styles/
│           └── main.css        # Global styles
│
└── tests/                      # Test files
    └── unit/
        ├── stores/
        │   └── portfolio.spec.js     # Store tests
        └── utils/
            ├── taxCalculations.spec.js # Utility tests
            └── formatters.spec.js
```

## 🧩 Key Concepts

### 1. Pinia Stores (State Management)

Stores manage application state and business logic.

**Example: Using Portfolio Store**

```vue
<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const portfolio = usePortfolioStore()

// Access state
const holdings = computed(() => portfolio.holdings)

// Access computed values
const totalValue = computed(() => portfolio.totalValue)

// Call actions
portfolio.loadHoldings()
portfolio.addHolding({ symbol: 'AAPL', value: 1000 })
</script>
```

**Portfolio Store Features:**
- `totalValue` - Sum of all holdings
- `totalGains` - Unrealized gains/losses
- `longTermHoldings` - Assets held >365 days
- `harvestableAmount` - Tax-loss harvesting opportunities
- `loadHoldings()` - Load demo data
- `addHolding()` - Add new asset

### 2. Tax Calculations

```javascript
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'

// Check if holding is long-term (>365 days)
const treatment = calculateTaxTreatment('2024-01-01') // 'long-term' or 'short-term'

// Days remaining until long-term
const days = daysUntilLongTerm('2025-06-01') // e.g., 62
```

### 3. Currency Formatting

```javascript
import { formatCurrency, formatPercent } from '@/utils/formatters'

formatCurrency(1234567)  // "$1,234,567"
formatPercent(12.34)     // "+12.34%"
```

### 4. Component Structure

All components use Vue 3 Composition API with `<script setup>`:

```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <p>{{ formattedValue }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  title: String,
  value: Number
})

const formattedValue = computed(() => formatCurrency(props.value))
</script>

<style scoped>
.my-component {
  padding: 20px;
}
</style>
```

## 🧪 Writing Tests

### Store Test Example

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { usePortfolioStore } from '@/stores/portfolio'

describe('Portfolio Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calculates total value', () => {
    const store = usePortfolioStore()
    store.holdings = [
      { currentValue: 1000 },
      { currentValue: 2000 }
    ]
    expect(store.totalValue).toBe(3000)
  })
})
```

### Utility Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/utils/formatters'

describe('formatCurrency', () => {
  it('formats numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
  })
})
```

## 🎨 Styling

The app uses CSS custom properties for theming:

```css
:root {
  --electric-teal: #00FF9F;
  --sky-blue: #87CEEB;
  --bg-card: rgba(255, 255, 255, 0.7);
  --text-primary: #0a1929;
}

[data-theme="dark"] {
  --bg-card: rgba(15, 36, 55, 0.6);
  --text-primary: #e3f2fd;
}
```

Components use scoped styles:

```vue
<style scoped>
.card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
}
</style>
```

## 🔌 Adding New Features

### 1. Create a New Store

```javascript
// src/stores/newFeature.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNewFeatureStore = defineStore('newFeature', () => {
  const data = ref([])
  
  const total = computed(() => data.value.length)
  
  function addItem(item) {
    data.value.push(item)
  }
  
  return { data, total, addItem }
})
```

### 2. Create a Component

```bash
touch src/components/newfeature/NewComponent.vue
```

### 3. Add a Route

```javascript
// src/router/index.js
{
  path: '/new-feature',
  name: 'newFeature',
  component: () => import('@/views/NewFeatureView.vue')
}
```

### 4. Write Tests

```bash
touch tests/unit/stores/newFeature.spec.js
```

## 📱 Responsive Design

The app uses a viewport store for responsive logic:

```vue
<script setup>
import { computed } from 'vue'
import { useViewportStore } from '@/stores/viewport'

const viewport = useViewportStore()
const isMobile = computed(() => viewport.isMobile)
</script>

<template>
  <div v-if="isMobile">Mobile View</div>
  <div v-else>Desktop View</div>
</template>
```

Breakpoints:
- Mobile: < 1024px
- Desktop: ≥ 1024px

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Tests Not Running
```bash
# Clear Vitest cache
rm -rf node_modules/.vitest
npm test
```

### Import Errors
Make sure to use `@/` alias for imports:
```javascript
import { usePortfolioStore } from '@/stores/portfolio'  // ✅
import { usePortfolioStore } from '../stores/portfolio' // ❌
```

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
# In vite.config.js, set base: '/repo-name/'
npm run build
# Push dist/ folder to gh-pages branch
```

## 📚 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run dev server: `npm run dev`
3. ✅ Explore the code in `src/`
4. ✅ Run tests: `npm test`
5. ✅ Build your own features!

## 💡 Tips

- Use `npm run test:ui` for visual test debugging
- Check `npm run test:coverage` to see what's tested
- Use Vue DevTools browser extension for debugging
- Enable Vite HMR for instant updates

## 🤝 Need Help?

- Check existing tests for examples
- Refer to store implementations
- Look at component patterns in `src/components/`
- Read Vue 3 Composition API docs

---

**Happy Coding! 🎉**

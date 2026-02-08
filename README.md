# Vision Vue - Tax-Smart Portfolio Intelligence

A modern Vue 3 application for tax-smart portfolio management with glassmorphic design.

## 📁 Project Structure

```
vision-vue/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css           # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.vue         # Desktop sidebar navigation
│   │   │   ├── MobileNav.vue       # Mobile bottom navigation
│   │   │   └── Header.vue          # Page headers
│   │   ├── portfolio/
│   │   │   ├── HeroCard.vue        # Portfolio value hero card
│   │   │   ├── AssetCard.vue       # Individual asset display
│   │   │   ├── CategoryCard.vue    # Asset category cards
│   │   │   └── StatsGrid.vue       # Stats display grid
│   │   ├── budget/
│   │   │   ├── IncomeInput.vue     # Income input form
│   │   │   ├── TaxCalculator.vue   # Tax calculation display
│   │   │   ├── ExpenseCategory.vue # Expense category card
│   │   │   └── TransactionList.vue # Transaction list
│   │   ├── insights/
│   │   │   ├── InsightCard.vue     # Tax insight cards
│   │   │   └── AIAdvisor.vue       # AI recommendations
│   │   └── common/
│   │       ├── Card.vue            # Reusable glass card
│   │       ├── Button.vue          # Button component
│   │       ├── Badge.vue           # Status badges
│   │       ├── ProgressBar.vue     # Progress indicators
│   │       └── LoadingSpinner.vue  # Loading states
│   ├── views/
│   │   ├── DashboardView.vue       # Dashboard page
│   │   ├── AssetsView.vue          # Assets category view
│   │   ├── AssetCategoryView.vue   # Asset drill-down view
│   │   ├── BudgetView.vue          # Budget & cashflow page
│   │   ├── InsightsView.vue        # Tax insights page
│   │   └── SettingsView.vue        # Settings page
│   ├── stores/
│   │   ├── portfolio.js            # Portfolio state management
│   │   ├── budget.js               # Budget state management
│   │   ├── theme.js                # Theme management
│   │   └── viewport.js             # Responsive viewport
│   ├── utils/
│   │   ├── taxCalculations.js      # Tax calculation functions
│   │   ├── formatters.js           # Currency/number formatters
│   │   └── demoData.js             # Demo data generators
│   ├── router/
│   │   └── index.js                # Vue Router configuration
│   ├── App.vue                     # Root component
│   └── main.js                     # Application entry point
├── tests/
│   ├── unit/
│   │   ├── stores/
│   │   │   ├── portfolio.spec.js
│   │   │   └── budget.spec.js
│   │   ├── utils/
│   │   │   ├── taxCalculations.spec.js
│   │   │   └── formatters.spec.js
│   │   └── components/
│   │       ├── HeroCard.spec.js
│   │       └── Card.spec.js
│   └── integration/
│       └── dashboard.spec.js
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vision-vue.git
cd vision-vue

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
npm run lint         # Lint and fix files
npm run format       # Format code with Prettier
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test src/stores/portfolio.spec.js
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage Report
```bash
npm run test:coverage
```

## 🏗️ Architecture

### State Management (Pinia)
- **portfolio.js**: Manages holdings, calculations, categories
- **budget.js**: Handles expenses, income, tax calculations
- **theme.js**: Controls dark/light theme
- **viewport.js**: Responsive breakpoint management

### Key Features
- ✅ Reactive state with Pinia stores
- ✅ Vue Router for navigation
- ✅ Composition API with `<script setup>`
- ✅ TypeScript-ready structure
- ✅ Vitest for unit testing
- ✅ Vite for fast development

## 🎨 Component Patterns

### Composition API Example
```vue
<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'

const portfolio = usePortfolioStore()
const totalValue = computed(() => portfolio.totalValue)
</script>
```

### Prop Validation
```vue
<script setup>
defineProps({
  amount: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'Value'
  }
})
</script>
```

## 📝 Adding New Components

1. Create component in appropriate folder:
```bash
touch src/components/portfolio/NewComponent.vue
```

2. Write component with `<script setup>`:
```vue
<template>
  <div class="new-component">
    <!-- template -->
  </div>
</template>

<script setup>
// composition logic
</script>

<style scoped>
/* component styles */
</style>
```

3. Write tests:
```bash
touch tests/unit/components/NewComponent.spec.js
```

## 🧪 Test Examples

### Store Test
```javascript
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { usePortfolioStore } from '@/stores/portfolio'

describe('Portfolio Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calculates total value correctly', () => {
    const store = usePortfolioStore()
    expect(store.totalValue).toBe(0)
  })
})
```

### Component Test
```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Card from '@/components/common/Card.vue'

describe('Card Component', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: 'Test Content'
      }
    })
    expect(wrapper.text()).toContain('Test Content')
  })
})
```

## 🎯 Key Technologies

- **Vue 3.4+** - Progressive JavaScript framework
- **Pinia 2.1+** - State management
- **Vue Router 4.2+** - Routing
- **Vite 5.0+** - Build tool
- **Vitest 1.2+** - Unit testing
- **Plotly.js** - Interactive charts

## 🔧 Configuration

### Vite (vite.config.js)
- Path aliases (@/ = src/)
- Vue plugin configuration
- Test environment setup

### ESLint
- Vue 3 recommended rules
- Prettier integration

## 📱 Responsive Design

Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

Output in `dist/` folder.

### Deploy to Vercel/Netlify
```bash
# Vercel
vercel

# Netlify
netlify deploy --prod
```

### Environment Variables
Create `.env` file:
```
VITE_API_URL=https://api.example.com
VITE_PLAID_KEY=your_plaid_key
```

## 📚 Next Steps

1. Implement real API integration (Plaid, Zillow)
2. Add authentication
3. Implement data persistence
4. Add E2E tests with Playwright
5. Set up CI/CD pipeline

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](../LICENSE)

---

Built with Vue 3 and ❤️

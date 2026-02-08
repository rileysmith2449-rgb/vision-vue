<template>
  <div class="hero-card">
    <div class="hero-top">
      <div class="hero-label">Total Portfolio Value</div>
      <div class="hero-value">{{ formatCurrency(portfolioStore.totalValue) }}</div>
      <div class="hero-gains">
        <Badge
          :type="portfolioStore.totalGains >= 0 ? 'gain' : 'loss'"
          :label="formatPercent(gainPercent)"
        />
        <span :class="['gain-amount', portfolioStore.totalGains >= 0 ? 'positive' : 'negative']">
          {{ formatCurrency(portfolioStore.totalGains) }}
        </span>
      </div>
    </div>

    <div class="hero-grid">
      <div class="hero-stat">
        <span class="stat-label">Long-term Gains</span>
        <span class="stat-value positive">{{ formatCurrency(portfolioStore.longTermGains) }}</span>
      </div>
      <div class="hero-stat">
        <span class="stat-label">Short-term Gains</span>
        <span class="stat-value">{{ formatCurrency(portfolioStore.shortTermGains) }}</span>
      </div>
      <div class="hero-stat">
        <span class="stat-label">Est. Tax Impact</span>
        <span class="stat-value negative">{{ formatCurrency(portfolioStore.estimatedTaxImpact) }}</span>
      </div>
      <div class="hero-stat">
        <span class="stat-label">Harvestable</span>
        <span class="stat-value">{{ formatCompactNumber(portfolioStore.harvestableAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent, formatCompactNumber } from '@/utils/formatters'
import Badge from '@/components/common/Badge.vue'

const portfolioStore = usePortfolioStore()

const gainPercent = computed(() => {
  if (portfolioStore.totalCostBasis === 0) return 0
  return (portfolioStore.totalGains / portfolioStore.totalCostBasis) * 100
})
</script>

<style scoped>
.hero-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 24px;
  box-shadow: var(--shadow-glass);
  padding: 32px;
  background-image: var(--gradient-pop);
  background-size: 200% 200%;
  background-blend-mode: soft-light;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0, 255, 159, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.hero-top {
  margin-bottom: 28px;
}

.hero-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.hero-value {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
}

.hero-gains {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.gain-amount {
  font-size: 0.9rem;
  font-weight: 600;
}

.gain-amount.positive { color: var(--electric-teal); }
.gain-amount.negative { color: var(--persimmon); }

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  padding-top: 24px;
  border-top: 1px solid var(--border-glass);
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.positive { color: var(--electric-teal); }
.stat-value.negative { color: var(--persimmon); }

@media (max-width: 1024px) {
  .hero-value {
    font-size: 2rem;
  }

  .hero-card {
    padding: 24px;
  }
}
</style>

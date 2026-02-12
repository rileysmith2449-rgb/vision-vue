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
      <router-link to="/tax/long-term" class="hero-stat clickable">
        <div class="stat-icon-wrap green">
          <TrendingUp :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Long-term Gains</span>
          <span class="stat-value positive">{{ formatCurrency(portfolioStore.longTermGains) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/short-term" class="hero-stat clickable">
        <div class="stat-icon-wrap blue">
          <Clock :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Short-term Gains</span>
          <span class="stat-value">{{ formatCurrency(portfolioStore.shortTermGains) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/tax-impact" class="hero-stat clickable">
        <div class="stat-icon-wrap red">
          <Receipt :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Est. Tax Impact</span>
          <span class="stat-value negative">{{ formatCurrency(portfolioStore.estimatedTaxImpact) }}</span>
        </div>
      </router-link>
      <router-link to="/tax/harvestable" class="hero-stat clickable">
        <div class="stat-icon-wrap purple">
          <Scissors :size="16" stroke-width="2" />
        </div>
        <div>
          <span class="stat-label">Harvestable</span>
          <span class="stat-value">{{ formatCompactNumber(portfolioStore.harvestableAmount) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent, formatCompactNumber } from '@/utils/formatters'
import { TrendingUp, Clock, Receipt, Scissors } from 'lucide-vue-next'
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
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero-top {
  margin-bottom: 28px;
}

.hero-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-value {
  font-family: 'Lexend', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero-gains {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.gain-amount {
  font-size: 0.85rem;
  font-weight: 600;
}

.gain-amount.positive { color: var(--accent-teal); }
.gain-amount.negative { color: var(--negative); }

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(59, 130, 246, 0.15);
}

.hero-stat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-decoration: none;
}

.hero-stat.clickable {
  padding: 10px;
  margin: -10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s ease;
}

.hero-stat.clickable:hover {
  background: var(--bg-subtle);
}

.stat-icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-icon-wrap.green {
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
}

.stat-icon-wrap.blue {
  background: rgba(56, 189, 248, 0.1);
  color: var(--accent-sky);
}

.stat-icon-wrap.red {
  background: rgba(239, 68, 68, 0.1);
  color: var(--negative);
}

.stat-icon-wrap.purple {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-blue);
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
}

.stat-value.positive { color: var(--accent-teal); }
.stat-value.negative { color: var(--negative); }

@media (max-width: 1024px) {
  .hero-value {
    font-size: 2rem;
  }

  .hero-card {
    padding: 24px;
  }
}
</style>

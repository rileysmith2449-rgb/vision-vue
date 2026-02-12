<template>
  <div class="asset-card">
    <div class="asset-left">
      <div class="asset-icon-wrap">
        <component :is="assetIcon" :size="18" stroke-width="1.8" />
      </div>
      <div class="asset-info">
        <h4 class="asset-symbol">{{ holding.symbol }}</h4>
        <p class="asset-shares">{{ holding.shares }} {{ holding.type === 'cash' ? '' : 'shares' }}</p>
      </div>
    </div>

    <div class="asset-right">
      <div class="asset-value">{{ formatCurrency(holding.currentValue) }}</div>
      <div class="asset-gain-row">
        <span :class="['asset-gain', gain >= 0 ? 'positive' : 'negative']">
          {{ formatCurrency(gain) }}
        </span>
        <Badge
          v-if="holding.type !== 'cash'"
          :type="gain >= 0 ? 'gain' : 'loss'"
          :label="formatPercent(gainPercent)"
        />
      </div>
      <div v-if="holding.type !== 'cash'" class="asset-tax">
        <Badge
          :type="taxTreatment === 'long-term' ? 'info' : 'neutral'"
          :label="taxTreatment"
        />
        <span v-if="daysLeft > 0" class="days-left">{{ daysLeft }}d to LT</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'
import { Banknote, TrendingUp, Bitcoin, Diamond, Home, Target } from 'lucide-vue-next'
import Badge from '@/components/common/Badge.vue'

const props = defineProps({
  holding: { type: Object, required: true }
})

const iconMap = {
  cash: Banknote,
  stock: TrendingUp,
  crypto: Bitcoin,
  etf: Diamond,
  realestate: Home,
  other: Target
}

const assetIcon = computed(() => iconMap[props.holding.type] || Target)

const gain = computed(() => props.holding.currentValue - props.holding.costBasis)
const gainPercent = computed(() => {
  if (props.holding.costBasis === 0) return 0
  return (gain.value / props.holding.costBasis) * 100
})
const taxTreatment = computed(() =>
  props.holding.type === 'cash' ? '' : calculateTaxTreatment(props.holding.purchaseDate)
)
const daysLeft = computed(() =>
  props.holding.type === 'cash' ? 0 : daysUntilLongTerm(props.holding.purchaseDate)
)
</script>

<style scoped>
.asset-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: all 0.2s ease;
}

.asset-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
}

.asset-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asset-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.asset-symbol {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.asset-shares {
  font-size: 0.78rem;
  color: var(--text-tertiary);
  margin-top: 1px;
}

.asset-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.asset-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.asset-gain-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-gain {
  font-size: 0.78rem;
  font-weight: 600;
}

.asset-gain.positive { color: var(--accent-teal); }
.asset-gain.negative { color: var(--negative); }

.asset-tax {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.days-left {
  font-size: 0.68rem;
  color: var(--text-tertiary);
}

@media (max-width: 1024px) {
  .asset-card {
    flex-direction: column;
    align-items: stretch;
  }

  .asset-right {
    align-items: flex-start;
    border-top: 1px solid var(--border-glass);
    padding-top: 12px;
    margin-top: 4px;
  }
}
</style>

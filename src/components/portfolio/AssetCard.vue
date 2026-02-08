<template>
  <div class="asset-card">
    <div class="asset-left">
      <span class="asset-icon">{{ holding.icon }}</span>
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
import Badge from '@/components/common/Badge.vue'

const props = defineProps({
  holding: { type: Object, required: true }
})

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
  padding: 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-glass);
  transition: all 0.3s ease;
}

.asset-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 40px 0 rgba(70, 130, 180, 0.2);
}

.asset-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.asset-icon {
  font-size: 1.6rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 12px;
}

.asset-symbol {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.asset-shares {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.asset-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.asset-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.asset-gain-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-gain {
  font-size: 0.8rem;
  font-weight: 600;
}

.asset-gain.positive { color: var(--electric-teal); }
.asset-gain.negative { color: var(--persimmon); }

.asset-tax {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.days-left {
  font-size: 0.7rem;
  color: var(--text-secondary);
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

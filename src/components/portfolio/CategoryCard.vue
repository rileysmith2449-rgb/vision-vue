<template>
  <router-link :to="`/assets/${category}`" class="category-card">
    <div class="category-icon-wrap">
      <component :is="categoryIcon" :size="20" stroke-width="1.8" />
    </div>
    <div class="category-info">
      <h4 class="category-name">{{ category }}</h4>
      <p class="category-count">{{ holdings.length }} holding{{ holdings.length !== 1 ? 's' : '' }}</p>
    </div>
    <div class="category-right">
      <span class="category-value">{{ formatCurrency(total) }}</span>
      <ChevronRight :size="16" stroke-width="2" class="chevron" />
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import {
  Banknote,
  TrendingUp,
  Bitcoin,
  Diamond,
  Home,
  Target,
  ChevronRight
} from 'lucide-vue-next'

const props = defineProps({
  category: { type: String, required: true },
  holdings: { type: Array, required: true },
  total: { type: Number, required: true }
})

const iconMap = {
  Cash: Banknote,
  Stocks: TrendingUp,
  Crypto: Bitcoin,
  ETFs: Diamond,
  'Real Estate': Home,
  Other: Target
}

const categoryIcon = computed(() => iconMap[props.category] || Target)
</script>

<style scoped>
.category-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-card:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
}

.category-card:hover .chevron {
  transform: translateX(2px);
}

.category-icon-wrap {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.category-count {
  font-size: 0.78rem;
  color: var(--text-tertiary);
  margin-top: 1px;
}

.category-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.category-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chevron {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}
</style>

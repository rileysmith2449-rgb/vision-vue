<template>
  <router-link :to="`/assets/${category}`" class="category-card">
    <div class="category-icon">{{ categoryIcon }}</div>
    <div class="category-info">
      <h4 class="category-name">{{ category }}</h4>
      <p class="category-count">{{ holdings.length }} holding{{ holdings.length !== 1 ? 's' : '' }}</p>
    </div>
    <div class="category-value">{{ formatCurrency(total) }}</div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  category: { type: String, required: true },
  holdings: { type: Array, required: true },
  total: { type: Number, required: true }
})

const categoryIcons = {
  Cash: '💵',
  Stocks: '📈',
  Crypto: '₿',
  ETFs: '💎',
  'Real Estate': '🏠',
  Other: '🎯'
}

const categoryIcon = computed(() => categoryIcons[props.category] || '📁')
</script>

<style scoped>
.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-glass);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(70, 130, 180, 0.2);
  border-color: var(--electric-teal);
}

.category-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 14px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.category-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
}
</style>

<template>
  <div :class="['insight-card', `insight-${type}`]">
    <div class="insight-icon">{{ typeIcon }}</div>
    <div class="insight-content">
      <h4 class="insight-title">{{ title }}</h4>
      <p class="insight-description">{{ description }}</p>
      <span v-if="value" class="insight-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'info', validator: v => ['opportunity', 'warning', 'info'].includes(v) },
  value: { type: String, default: '' }
})

const typeIcon = computed(() => {
  const icons = { opportunity: '💰', warning: '⚠️', info: 'ℹ️' }
  return icons[props.type] || 'ℹ️'
})
</script>

<style scoped>
.insight-card {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-glass);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 40px 0 rgba(70, 130, 180, 0.2);
}

.insight-opportunity {
  border-left-color: var(--electric-teal);
}

.insight-warning {
  border-left-color: var(--persimmon);
}

.insight-info {
  border-left-color: var(--violet-pop);
}

.insight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(135, 206, 235, 0.08);
}

.insight-content {
  flex: 1;
  min-width: 0;
}

.insight-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.insight-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.insight-value {
  display: inline-block;
  margin-top: 10px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  background: rgba(0, 255, 159, 0.1);
  color: var(--electric-teal);
}
</style>

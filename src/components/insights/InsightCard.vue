<template>
  <div :class="['insight-card', `insight-${type}`]">
    <div :class="['insight-icon-wrap', type]">
      <component :is="typeIcon" :size="18" stroke-width="2" />
    </div>
    <div class="insight-content">
      <h4 class="insight-title">{{ title }}</h4>
      <p class="insight-description">{{ description }}</p>
      <span v-if="value" class="insight-value">{{ value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DollarSign, AlertTriangle, Info } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'info', validator: v => ['opportunity', 'warning', 'info'].includes(v) },
  value: { type: String, default: '' }
})

const typeIcon = computed(() => {
  const icons = { opportunity: DollarSign, warning: AlertTriangle, info: Info }
  return icons[props.type] || Info
})
</script>

<style scoped>
.insight-card {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  border-left: 3px solid transparent;
  transition: box-shadow 0.2s ease;
}

.insight-card:hover {
  box-shadow: var(--shadow-hover);
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

.insight-icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.insight-icon-wrap.opportunity {
  background: rgba(0, 230, 138, 0.1);
  color: var(--electric-teal);
}

.insight-icon-wrap.warning {
  background: rgba(244, 91, 105, 0.1);
  color: var(--persimmon);
}

.insight-icon-wrap.info {
  background: rgba(139, 92, 246, 0.1);
  color: var(--violet-pop);
}

.insight-content {
  flex: 1;
  min-width: 0;
}

.insight-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
  letter-spacing: -0.01em;
}

.insight-description {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.insight-value {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgba(0, 230, 138, 0.08);
  color: var(--electric-teal);
}
</style>

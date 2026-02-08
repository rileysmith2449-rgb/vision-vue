<template>
  <div class="progress-container">
    <div v-if="label || showPercent" class="progress-header">
      <span v-if="label" class="progress-label">{{ label }}</span>
      <span v-if="showPercent" :class="['progress-percent', { over: value > 100 }]">
        {{ Math.round(value) }}%
      </span>
    </div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: Math.min(value, 100) + '%', background: fillColor }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  color: { type: String, default: '' },
  label: { type: String, default: '' },
  showPercent: { type: Boolean, default: false }
})

const fillColor = computed(() => {
  if (props.color) return props.color
  if (props.value > 100) return 'var(--persimmon)'
  if (props.value > 80) return '#f0a500'
  return 'var(--electric-teal)'
})
</script>

<style scoped>
.progress-container {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.progress-percent {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-percent.over {
  color: var(--persimmon);
}

.progress-track {
  width: 100%;
  height: 8px;
  background: rgba(135, 206, 235, 0.15);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
</style>

<template>
  <span :class="['badge', `badge-${type}`]">{{ label }}</span>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'neutral', validator: v => ['gain', 'loss', 'neutral', 'info'].includes(v) },
  label: { type: String, required: true }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-gain {
  background: rgba(0, 255, 159, 0.15);
  color: var(--electric-teal);
}

.badge-loss {
  background: rgba(255, 111, 97, 0.15);
  color: var(--persimmon);
}

.badge-neutral {
  background: rgba(135, 206, 235, 0.15);
  color: var(--text-secondary);
}

.badge-info {
  background: rgba(157, 78, 221, 0.15);
  color: var(--violet-pop);
}
</style>

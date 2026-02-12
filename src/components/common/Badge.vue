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
  background: rgba(20, 184, 166, 0.15);
  color: var(--accent-teal);
}

.badge-loss {
  background: rgba(239, 68, 68, 0.15);
  color: var(--negative);
}

.badge-neutral {
  background: rgba(56, 189, 248, 0.15);
  color: var(--text-secondary);
}

.badge-info {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
}
</style>

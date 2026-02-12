<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary', validator: v => ['primary', 'secondary', 'danger'].includes(v) },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
}

.btn-md {
  padding: 10px 22px;
  font-size: 0.9rem;
}

.btn-lg {
  padding: 14px 32px;
  font-size: 1rem;
}

.btn-primary {
  background: var(--gradient-pop);
  color: #F1F5F9;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-glass);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-card);
  border-color: var(--accent-blue);
}

.btn-danger {
  background: var(--negative);
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}
</style>

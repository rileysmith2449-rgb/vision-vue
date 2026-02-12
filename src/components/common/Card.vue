<template>
  <div class="card">
    <div v-if="title || subtitle || $slots.actions" class="card-header">
      <div class="card-header-top">
        <div>
          <h3 v-if="title" class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
        <slot name="actions" />
      </div>
    </div>
    <div :class="['card-body', { 'no-padding': noPadding }]">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  noPadding: { type: Boolean, default: false }
})
</script>

<style scoped>
.card {
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: 12px;
  box-shadow: var(--shadow-glass);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.card:hover {
  border-color: var(--border-focus);
  transform: translateY(-1px);
}

.card-header {
  padding: 24px 24px 0;
}

.card-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.card-body {
  padding: 20px 24px 24px;
}

.card-body.no-padding {
  padding: 0;
}
</style>

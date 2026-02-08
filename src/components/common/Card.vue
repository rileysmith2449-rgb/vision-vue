<template>
  <div class="card">
    <div v-if="title || subtitle" class="card-header">
      <h3 v-if="title" class="card-title">{{ title }}</h3>
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
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
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-hover);
}

.card-header {
  padding: 24px 24px 0;
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

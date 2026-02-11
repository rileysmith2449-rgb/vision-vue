<template>
  <div
    :class="['insight-card', `insight-${type}`, { 'is-expandable': !!details }]"
    @click="details ? $emit('toggle') : null"
  >
    <div class="insight-main">
      <div :class="['insight-icon-wrap', type]">
        <component :is="typeIcon" :size="18" stroke-width="2" />
      </div>
      <div class="insight-content">
        <h4 class="insight-title">{{ title }}</h4>
        <p class="insight-description">{{ description }}</p>
        <span v-if="value" class="insight-value">{{ value }}</span>
      </div>
      <div v-if="details" class="insight-chevron" :class="{ rotated: expanded }">
        <ChevronDown :size="18" stroke-width="2" />
      </div>
    </div>

    <div v-if="details && expanded" class="insight-details" @click.stop>
      <p v-if="details.summary" class="details-summary">{{ details.summary }}</p>
      <div v-if="details.columns && details.rows?.length" class="details-table">
        <div class="details-header">
          <span v-for="col in details.columns" :key="col" class="details-cell">{{ col }}</span>
        </div>
        <component
          :is="row.link ? 'router-link' : 'div'"
          v-for="(row, i) in details.rows"
          :key="i"
          :to="row.link || undefined"
          :class="['details-row', { 'details-row-link': row.link }]"
        >
          <span v-for="(cell, j) in row.cells" :key="j" class="details-cell">{{ cell }}</span>
          <ArrowRight v-if="row.link" :size="14" stroke-width="2" class="row-link-icon" />
        </component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { DollarSign, AlertTriangle, Info, ChevronDown, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, default: 'info', validator: v => ['opportunity', 'warning', 'info'].includes(v) },
  value: { type: String, default: '' },
  details: { type: Object, default: null },
  expanded: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const typeIcon = computed(() => {
  const icons = { opportunity: DollarSign, warning: AlertTriangle, info: Info }
  return icons[props.type] || Info
})
</script>

<style scoped>
.insight-card {
  display: flex;
  flex-direction: column;
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

.insight-card.is-expandable {
  cursor: pointer;
}

.insight-main {
  display: flex;
  gap: 14px;
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
  background: rgba(100, 149, 237, 0.1);
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
  background: rgba(100, 149, 237, 0.08);
  color: var(--electric-teal);
}

.insight-chevron {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.insight-chevron.rotated {
  transform: rotate(180deg);
}

.insight-details {
  border-top: 1px solid var(--border-glass);
  margin-top: 14px;
  padding-top: 14px;
}

.details-summary {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.details-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.details-header {
  display: flex;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-glass);
}

.details-header .details-cell {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.details-row {
  display: flex;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.details-row:last-child {
  border-bottom: none;
}

.details-row-link {
  cursor: pointer;
}

.details-row-link:hover {
  background: var(--bg-subtle);
}

.row-link-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
  align-self: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.details-row-link:hover .row-link-icon {
  opacity: 1;
}

.details-cell {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

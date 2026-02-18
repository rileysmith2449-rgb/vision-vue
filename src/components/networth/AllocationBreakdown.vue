<template>
  <div class="allocation-breakdown">
    <div v-for="item in allocation" :key="item.label" class="alloc-row">
      <div class="alloc-top">
        <span class="alloc-label">{{ item.label }}</span>
        <span class="alloc-values">
          <span class="alloc-pct">{{ item.percent }}%</span>
          <span class="alloc-amt">{{ formatCurrency(item.value) }}</span>
        </span>
      </div>
      <div class="alloc-track">
        <div
          class="alloc-fill"
          :style="{ width: item.percent + '%', background: colorFor(item.label) }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  allocation: { type: Array, default: () => [] },
  total:      { type: Number, default: 0 },
})

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function colorFor(label) {
  const map = {
    'Cash & Savings': '#34d399',
    'Investments':    '#3b82f6',
    'Retirement':     '#a78bfa',
    'Real Assets':    '#fbbf24',
  }
  return map[label] || '#64748b'
}
</script>

<style scoped>
.allocation-breakdown { display: flex; flex-direction: column; gap: 1.1rem; }

.alloc-row { display: flex; flex-direction: column; gap: 0.45rem; }

.alloc-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.alloc-label  { font-size: 0.85rem; color: #cbd5e1; }
.alloc-values { display: flex; gap: 0.6rem; align-items: baseline; }
.alloc-pct    { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }
.alloc-amt    { font-size: 0.75rem; color: #475569; }

.alloc-track {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.alloc-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}
</style>

<template>
  <div
    class="goal-card"
    :class="{ selected, 'at-risk': isAtRisk }"
    :style="{ '--goal-color': goal.color }"
    @click="$emit('click')"
  >
    <!-- Progress ring -->
    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 56 56">
        <circle class="ring-bg"   cx="28" cy="28" r="24" />
        <circle class="ring-fill" cx="28" cy="28" r="24"
          :stroke="goal.color"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <span class="ring-emoji">{{ goal.emoji }}</span>
    </div>

    <div class="goal-body">
      <div class="goal-top">
        <span class="goal-title">{{ goal.title }}</span>
        <span v-if="isAtRisk" class="risk-badge">At risk</span>
        <span v-if="isComplete" class="done-badge">Done</span>
      </div>

      <div class="goal-amounts">
        <span class="goal-current">{{ formatCurrency(goal.currentAmount) }}</span>
        <span class="goal-sep"> of </span>
        <span class="goal-target">{{ formatCurrency(goal.targetAmount) }}</span>
      </div>

      <div class="goal-progress-track">
        <div class="goal-progress-fill" :style="{ width: pct + '%', background: goal.color }"></div>
      </div>

      <div class="goal-footer">
        <span class="goal-pct">{{ pct.toFixed(0) }}% funded</span>
        <span class="goal-due" :class="{ urgent: daysLeft <= 14 }">
          {{ daysLeft <= 0 ? 'Past due' : `${daysLeft}d left` }}
        </span>
      </div>
    </div>

    <!-- Quick contribute button -->
    <button
      class="contribute-btn"
      title="Add contribution"
      @click.stop="openContribute"
    >+</button>

    <!-- Inline contribute input -->
    <div v-if="showContribute" class="contribute-overlay" @click.stop>
      <input
        ref="amtInput"
        v-model.number="contributionAmount"
        type="number"
        min="1"
        placeholder="Amount"
        @keydown.enter="submitContribution"
        @keydown.esc="showContribute = false"
      />
      <button class="contrib-save" @click="submitContribution">Save</button>
      <button class="contrib-cancel" @click="showContribute = false">✕</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { progressPercent, daysUntil } from '../../stores/goals.js'

const props = defineProps({
  goal:     { type: Object,  required: true },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['click', 'contribute', 'archive'])

const showContribute    = ref(false)
const contributionAmount = ref(null)
const amtInput          = ref(null)

const circumference = 2 * Math.PI * 24
const pct           = computed(() => progressPercent(props.goal))
const dashOffset    = computed(() => circumference - (pct.value / 100) * circumference)
const daysLeft      = computed(() => daysUntil(props.goal.targetDate))
const isComplete    = computed(() => props.goal.currentAmount >= props.goal.targetAmount)
const isAtRisk      = computed(() => daysLeft.value <= 60 && pct.value < 80 && !isComplete.value)

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

async function openContribute() {
  showContribute.value = true
  await nextTick()
  amtInput.value?.focus()
}

function submitContribution() {
  if (!contributionAmount.value || contributionAmount.value <= 0) return
  emit('contribute', { goalId: props.goal.id, amount: contributionAmount.value })
  contributionAmount.value = null
  showContribute.value = false
}
</script>

<style scoped>
.goal-card {
  position: relative;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.1rem;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  overflow: hidden;
}
.goal-card:hover {
  border-color: rgba(255,255,255,0.14);
  transform: translateY(-1px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
.goal-card.selected {
  border-color: var(--goal-color);
  box-shadow: 0 0 0 1px var(--goal-color), 0 4px 24px rgba(0,0,0,0.25);
}
.goal-card.at-risk {
  border-color: rgba(251,191,36,0.3);
}

.ring-wrap { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
.ring { width: 56px; height: 56px; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 4; }
.ring-fill { fill: none; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1); }
.ring-emoji { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }

.goal-body { flex: 1; display: flex; flex-direction: column; gap: 0.45rem; min-width: 0; }
.goal-top { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.goal-title { font-size: 0.9rem; font-weight: 600; color: #f1f5f9; }

.risk-badge { font-size: 0.65rem; background: rgba(251,191,36,0.15); color: #fbbf24; padding: 0.1rem 0.4rem; border-radius: 6px; }
.done-badge { font-size: 0.65rem; background: rgba(52,211,153,0.15); color: #34d399; padding: 0.1rem 0.4rem; border-radius: 6px; }

.goal-amounts { font-size: 0.82rem; }
.goal-current { color: #f1f5f9; font-weight: 700; }
.goal-sep     { color: #334155; }
.goal-target  { color: #475569; }

.goal-progress-track { height: 4px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; }
.goal-progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

.goal-footer { display: flex; justify-content: space-between; }
.goal-pct  { font-size: 0.72rem; color: #475569; }
.goal-due  { font-size: 0.72rem; color: #475569; }
.goal-due.urgent { color: #fbbf24; }

.contribute-btn {
  position: absolute;
  top: 0.75rem; right: 0.75rem;
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: #64748b;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.contribute-btn:hover { border-color: var(--goal-color); color: var(--goal-color); }

.contribute-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15,23,42,0.96);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  backdrop-filter: blur(8px);
}
.contribute-overlay input {
  flex: 1;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  color: #f1f5f9;
  font-size: 0.9rem;
  outline: none;
  min-width: 0;
}
.contribute-overlay input:focus { border-color: var(--goal-color); }
.contrib-save {
  background: var(--goal-color, #3b82f6);
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}
.contrib-cancel {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
}
</style>

<template>
  <div class="goals-view">

    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Goals</h1>
        <p class="view-subtitle">Track your savings targets and milestones</p>
      </div>
      <button class="btn-primary" @click="showAddGoal = true">+ New Goal</button>
    </div>

    <!-- At-risk alert -->
    <div v-if="store.goalsAtRisk.length" class="risk-banner">
      <span>⚠️</span>
      <span>
        <strong>{{ store.goalsAtRisk.length }} goal{{ store.goalsAtRisk.length > 1 ? 's are' : ' is' }} at risk</strong>
        — deadline approaching with less than 80% funded.
      </span>
    </div>

    <!-- Overall progress bar (clickable to expand) -->
    <div class="glass-card overall-card" :class="{ expanded: showBreakdown }" @click="showBreakdown = !showBreakdown">
      <div class="overall-top">
        <div>
          <div class="overall-label">Overall Progress</div>
          <div class="overall-val">{{ formatCurrency(store.totalSaved) }} <span class="overall-of">of {{ formatCurrency(store.totalTarget) }}</span></div>
        </div>
        <div class="overall-right">
          <div class="overall-pct">{{ store.overallProgress.toFixed(0) }}%</div>
          <ChevronDown :size="16" stroke-width="2" :class="['expand-hint', { rotated: showBreakdown }]" />
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: store.overallProgress + '%' }"></div>
      </div>

      <!-- Per-goal breakdown -->
      <div v-if="showBreakdown" class="goals-breakdown" @click.stop>
        <div v-for="goal in store.sortedGoals" :key="goal.id" class="breakdown-row" @click="store.selectGoal(goal.id)">
          <div class="breakdown-left">
            <span class="breakdown-emoji">{{ goal.emoji }}</span>
            <span class="breakdown-name">{{ goal.title }}</span>
          </div>
          <div class="breakdown-right">
            <span class="breakdown-amount">{{ formatCurrency(goal.currentAmount) }}</span>
            <span class="breakdown-target">/ {{ formatCurrency(goal.targetAmount) }}</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" :style="{ width: goalPct(goal) + '%', background: goal.color }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sort controls -->
    <div class="controls">
      <span class="controls-label">Sort by:</span>
      <div class="sort-tabs">
        <button
          v-for="s in sorts"
          :key="s.value"
          class="sort-tab"
          :class="{ active: store.sortMode === s.value }"
          @click="store.setSortMode(s.value)"
        >{{ s.label }}</button>
      </div>
    </div>

    <!-- Goals grid -->
    <div class="goals-grid">
      <GoalCard
        v-for="goal in store.sortedGoals"
        :key="goal.id"
        :goal="goal"
        :selected="store.selectedGoalId === goal.id"
        @click="store.selectGoal(goal.id)"
        @contribute="onContribute"
        @archive="store.archiveGoal"
      />
    </div>

    <!-- Goal detail panel -->
    <GoalDetailPanel
      v-if="store.selectedGoal"
      :goal="store.selectedGoal"
      @contribute="onContribute"
      @close="store.selectGoal(null)"
    />

    <!-- Add goal modal -->
    <AddGoalModal
      v-if="showAddGoal"
      @close="showAddGoal = false"
      @save="onAddGoal"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useGoalsStore, progressPercent } from '../stores/goals.js'
import GoalCard        from '../components/goals/GoalCard.vue'
import GoalDetailPanel from '../components/goals/GoalDetailPanel.vue'
import AddGoalModal    from '../components/goals/AddGoalModal.vue'

const store = useGoalsStore()
const showAddGoal = ref(false)
const showBreakdown = ref(false)

const sorts = [
  { label: 'Progress', value: 'progress' },
  { label: 'Due Date',  value: 'date' },
  { label: 'Amount',   value: 'amount' },
]

function formatCurrency(v) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
}

function goalPct(goal) {
  return progressPercent(goal)
}

function onContribute({ goalId, amount }) {
  store.addContribution(goalId, amount)
}

function onAddGoal(goal) {
  store.addGoal(goal)
  showAddGoal.value = false
}
</script>

<style scoped>
.goals-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
}
.view-title   { font-size: 1.75rem; font-weight: 700; color: var(--text-primary, #f1f5f9); margin: 0; }
.view-subtitle { font-size: 0.875rem; color: var(--text-muted, #64748b); margin: 0.25rem 0 0; }

.btn-primary {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }

.risk-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.25);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  font-size: 0.875rem;
  color: #fcd34d;
}
.risk-banner strong { color: #fde68a; }

.glass-card {
  background: var(--bg-card, rgba(255,255,255,0.04));
  border: 1px solid var(--border-glass, rgba(255,255,255,0.08));
  border-radius: var(--radius-xl, 16px);
  padding: 1.25rem;
  box-shadow: var(--shadow-glass, none);
}
.overall-card {
  padding: 1.4rem 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.overall-card:hover { border-color: rgba(255,255,255,0.14); }
.overall-card.expanded { border-color: rgba(59,130,246,0.25); }

.overall-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.9rem;
}
.overall-label { font-size: 0.72rem; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.3rem; }
.overall-val   { font-size: 1.4rem; font-weight: 700; color: var(--text-primary, #f1f5f9); }
.overall-of    { font-size: 0.9rem; font-weight: 400; color: #475569; }

.overall-right { display: flex; align-items: center; gap: 0.5rem; }
.overall-pct   { font-size: 2rem; font-weight: 800; color: #60a5fa; line-height: 1; }
.expand-hint { color: #475569; transition: transform 0.2s; }
.expand-hint.rotated { transform: rotate(180deg); }

.progress-track {
  height: 8px;
  background: rgba(255,255,255,0.07);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #34d399);
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Per-goal breakdown */
.goals-breakdown {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.breakdown-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.3rem 1rem;
  padding: 0.45rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}
.breakdown-row:hover { background: rgba(255,255,255,0.04); }

.breakdown-left { display: flex; align-items: center; gap: 0.5rem; }
.breakdown-emoji { font-size: 0.9rem; }
.breakdown-name { font-size: 0.82rem; color: #cbd5e1; font-weight: 500; }

.breakdown-right { display: flex; align-items: baseline; gap: 0.3rem; justify-self: end; }
.breakdown-amount { font-size: 0.82rem; color: #f1f5f9; font-weight: 600; }
.breakdown-target { font-size: 0.72rem; color: #475569; }

.breakdown-bar-track {
  grid-column: 1 / -1;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.breakdown-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.controls-label { font-size: 0.8rem; color: #475569; }
.sort-tabs {
  display: flex;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.sort-tab {
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted, #64748b);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.sort-tab.active { background: rgba(59,130,246,0.2); color: #60a5fa; }

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
</style>

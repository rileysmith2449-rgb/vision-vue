<template>
  <div class="cc-optimizer">
    <!-- Score Banner -->
    <div class="score-banner">
      <div class="score-ring-wrap">
        <svg class="score-ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-glass)" stroke-width="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="var(--accent-teal)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="`${circumference}`"
            :stroke-dashoffset="ringOffset"
            transform="rotate(-90 60 60)"
            class="score-progress"
          />
        </svg>
        <div class="score-number">
          <span class="score-value">{{ optimizationScore }}</span>
          <span class="score-label">Score</span>
        </div>
      </div>

      <div class="score-stats">
        <div class="score-stat">
          <span class="stat-label">Monthly Spend</span>
          <span class="stat-value">{{ formatCurrency(totalSpend) }}</span>
        </div>
        <div class="score-stat">
          <span class="stat-label">Optimal Rewards</span>
          <span class="stat-value stat-teal">{{ formatCurrencyCents(totalOptimalRewards) }}</span>
        </div>
        <div class="score-stat" v-if="totalMissedRewards > 0">
          <span class="stat-label">Left on Table</span>
          <span class="stat-value stat-negative">{{ formatCurrencyCents(totalMissedRewards) }}</span>
        </div>
      </div>

      <button class="manage-btn" @click="showCardManager = true">
        <Settings :size="16" stroke-width="2" />
        Manage Cards
      </button>
    </div>

    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        v-for="v in views"
        :key="v.key"
        :class="['toggle-btn', { active: activeView === v.key }]"
        @click="activeView = v.key"
      >
        <component :is="v.icon" :size="15" stroke-width="2" />
        {{ v.label }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="cardStore.activeCards.length === 0" class="empty-state">
      <CreditCard :size="40" stroke-width="1.2" class="empty-icon" />
      <p class="empty-title">No cards in your portfolio</p>
      <p class="empty-desc">Add your credit cards to see personalized optimization recommendations.</p>
      <button class="primary-btn" @click="showCardManager = true">
        <Plus :size="16" stroke-width="2" />
        Add Cards
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="isAnalyzing || cardStore.loading" class="loading-state">
      <Loader2 :size="24" stroke-width="2" class="loading-spinner" />
      Analyzing your transactions...
    </div>

    <template v-else>
      <!-- Recommendations View -->
      <div v-if="activeView === 'recommendations'" class="recommendations-grid">
        <div v-if="recommendations.length === 0" class="empty-section">
          Your card usage is already optimized. Nice work!
        </div>
        <div
          v-for="(rec, i) in recommendations"
          :key="i"
          :class="['rec-card', `rec-${rec.type}`, `priority-${rec.priority}`]"
        >
          <div class="rec-header">
            <div :class="['rec-type-icon', `rec-icon-${rec.type}`]">
              <component :is="recIcon(rec.type)" :size="16" stroke-width="2" />
            </div>
            <span class="rec-type-label">{{ recTypeLabel(rec.type) }}</span>
            <span :class="['rec-priority', `priority-${rec.priority}`]">{{ rec.priority }}</span>
          </div>
          <h4 class="rec-title">{{ rec.title }}</h4>
          <p class="rec-message">{{ rec.message }}</p>
          <div class="rec-footer">
            <span v-if="rec.impact" class="rec-impact">
              {{ rec.type === 'signup' ? '' : '+' }}{{ rec.type === 'signup' ? rec.impact.toLocaleString() + ' pts' : formatCurrencyCents(rec.impact) }}
            </span>
            <span v-if="rec.daysLeft" class="rec-deadline">{{ rec.daysLeft }} days left</span>
          </div>
        </div>
      </div>

      <!-- Category Table View -->
      <div v-if="activeView === 'categories'" class="category-table-wrap">
        <div v-if="topCategories.length === 0" class="empty-section">
          No transaction data to analyze.
        </div>
        <div v-else class="category-table">
          <div class="cat-row cat-header">
            <span class="cat-cell cat-name-cell">Category</span>
            <span class="cat-cell">Spend</span>
            <span class="cat-cell">Best Card</span>
            <span class="cat-cell">Rate</span>
            <span class="cat-cell cat-right">Rewards</span>
          </div>
          <div
            v-for="cat in topCategories"
            :key="cat.category"
            class="cat-row"
          >
            <span class="cat-cell cat-name-cell">
              <span class="cat-icon">{{ categoryIcon(cat.category) }}</span>
              {{ formatCatName(cat.category) }}
            </span>
            <span class="cat-cell">{{ formatCurrency(cat.spend) }}</span>
            <span class="cat-cell cat-card-name">{{ getCardName(cat.bestCard) }}</span>
            <span class="cat-cell">
              <span class="rate-badge">{{ cat.bestRate?.earnMultiplier || 1 }}x</span>
            </span>
            <span class="cat-cell cat-right">
              {{ formatCurrencyCents(cat.optimalRewards) }}
              <span v-if="cat.missedRewards > 0.5" class="missed-tag">
                -{{ formatCurrencyCents(cat.missedRewards) }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Card Stack View -->
      <div v-if="activeView === 'cards'" class="card-stack">
        <div v-if="!report?.byCard || Object.keys(report.byCard).length === 0" class="empty-section">
          No card assignments yet.
        </div>
        <div
          v-for="card in sortedCards"
          :key="card.cardKey"
          class="stack-card"
        >
          <div class="stack-card-header">
            <img
              v-if="cardStore.getCardImageUrl(card.cardKey)"
              :src="cardStore.getCardImageUrl(card.cardKey)"
              :alt="getCardName(card.cardKey)"
              class="stack-card-img"
            />
            <div v-else class="stack-card-img stack-card-placeholder">
              <CreditCard :size="20" stroke-width="1.5" />
            </div>
            <div class="stack-card-info">
              <span class="stack-card-name">{{ getCardName(card.cardKey) }}</span>
              <span class="stack-card-issuer">{{ getCardIssuer(card.cardKey) }}</span>
            </div>
            <div class="stack-card-stat">
              <span class="stack-rewards">{{ formatCurrencyCents(card.rewards) }}</span>
              <span class="stack-spend">on {{ formatCurrency(card.spend) }}</span>
            </div>
          </div>
          <div class="stack-card-categories">
            <span
              v-for="cat in card.categories"
              :key="cat"
              class="stack-cat-tag"
            >
              {{ categoryIcon(cat) }} {{ formatCatName(cat) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cheat Sheet View -->
      <div v-if="activeView === 'cheatsheet'" class="cheatsheet-wrap">
        <div v-if="cheatSheet.length === 0" class="empty-section">
          Add cards to see your personalized cheat sheet.
        </div>
        <div v-else class="cheatsheet-grid">
          <div
            v-for="item in cheatSheet"
            :key="item.plaidCategory"
            class="cheat-row"
          >
            <span class="cheat-category">{{ item.displayName }}</span>
            <span class="cheat-arrow">
              <ArrowRight :size="14" stroke-width="2" />
            </span>
            <span class="cheat-card">{{ item.cardName }}</span>
            <span class="cheat-rate">
              <span class="rate-badge">{{ item.earnMultiplier }}x</span>
              {{ item.currency }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Card Manager Modal -->
    <CardManager :visible="showCardManager" @close="onCardManagerClose" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CreditCard, Settings, Plus, ArrowRight, Loader2,
  LayoutList, BarChart3, Wallet, BookOpen,
  TrendingUp, Gift, Zap, AlertTriangle,
} from 'lucide-vue-next'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { useBudgetStore } from '@/stores/budget'
import { useCardOptimizer } from '@/composables/useCardOptimizer'
import { formatCurrency } from '@/utils/formatters'
import CardManager from '@/components/CardManager.vue'

const cardStore = useCreditCardStore()
const budgetStore = useBudgetStore()
const {
  report,
  recommendations,
  cheatSheet,
  isAnalyzing,
  totalMissedRewards,
  optimizationScore,
  totalOptimalRewards,
  totalSpend,
  topCategories,
  runAnalysis,
} = useCardOptimizer()

const showCardManager = ref(false)
const activeView = ref('recommendations')

const views = [
  { key: 'recommendations', label: 'Recommendations', icon: Zap },
  { key: 'categories', label: 'By Category', icon: BarChart3 },
  { key: 'cards', label: 'By Card', icon: Wallet },
  { key: 'cheatsheet', label: 'Cheat Sheet', icon: BookOpen },
]

const circumference = 2 * Math.PI * 52
const ringOffset = computed(() => {
  const pct = (100 - optimizationScore.value) / 100
  return circumference * pct
})

const sortedCards = computed(() => {
  if (!report.value?.byCard) return []
  return Object.values(report.value.byCard).sort((a, b) => b.rewards - a.rewards)
})

function formatCurrencyCents(val) {
  if (val >= 1) return `$${val.toFixed(2)}`
  return `$${val.toFixed(2)}`
}

function getCardName(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardName || cardKey || 'Unknown'
}

function getCardIssuer(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardIssuer || ''
}

function formatCatName(name) {
  if (!name) return 'Other'
  return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const CATEGORY_ICONS = {
  FOOD_AND_DRINK: '🍽️',
  TRANSPORTATION: '🚗',
  TRAVEL: '✈️',
  ENTERTAINMENT: '🎬',
  GENERAL_MERCHANDISE: '🛍️',
  RENT_AND_UTILITIES: '🏠',
  GENERAL_SERVICES: '💼',
  PERSONAL_CARE: '💆',
  MEDICAL: '🏥',
  OTHER: '📋',
}

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '📋'
}

function recIcon(type) {
  const map = { optimize: TrendingUp, benefit: Gift, signup: Zap, gap: AlertTriangle }
  return map[type] || Zap
}

function recTypeLabel(type) {
  const map = { optimize: 'Optimize', benefit: 'Benefit', signup: 'Signup Bonus', gap: 'Coverage Gap' }
  return map[type] || type
}

function onCardManagerClose() {
  showCardManager.value = false
  runAnalysis()
}

onMounted(async () => {
  // Initialize card store
  await cardStore.initialize()

  // Ensure budget data is loaded
  if (Object.keys(budgetStore.expenses).length === 0) {
    await budgetStore.loadExpenses()
  }

  // Run initial analysis
  runAnalysis()
})
</script>

<style scoped>
.cc-optimizer {
  max-width: 1200px;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Score Banner ── */
.score-banner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 28px 32px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  margin-bottom: 24px;
}

.score-ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.score-ring {
  width: 100%;
  height: 100%;
}

.score-progress {
  transition: stroke-dashoffset 0.6s ease;
}

.score-number {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1;
}

.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.score-stats {
  flex: 1;
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.score-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-teal { color: var(--accent-teal); }
.stat-negative { color: var(--negative); }

.manage-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.manage-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-focus);
}

/* ── View Toggle ── */
.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  flex: 1;
  justify-content: center;
}

.toggle-btn:hover {
  color: var(--text-primary);
  background: var(--bg-subtle);
}

.toggle-btn.active {
  background: var(--gradient-pop);
  color: #fff;
}

/* ── Empty & Loading ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon { color: var(--text-tertiary); }
.empty-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.empty-desc { font-size: 0.85rem; color: var(--text-secondary); max-width: 360px; }

.primary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--gradient-pop);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s ease;
  margin-top: 8px;
}

.primary-btn:hover { opacity: 0.9; }

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-section {
  text-align: center;
  padding: 40px 24px;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* ── Recommendations Grid ── */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.rec-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.rec-card:hover {
  box-shadow: var(--shadow-hover);
}

.rec-card.priority-high { border-left: 3px solid var(--accent-teal); }
.rec-card.priority-medium { border-left: 3px solid var(--accent-blue); }
.rec-card.priority-low { border-left: 3px solid var(--text-tertiary); }

.rec-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.rec-type-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.rec-icon-optimize { background: rgba(20, 184, 166, 0.12); color: var(--accent-teal); }
.rec-icon-benefit { background: rgba(59, 130, 246, 0.12); color: var(--accent-blue); }
.rec-icon-signup { background: rgba(234, 179, 8, 0.12); color: #EAB308; }
.rec-icon-gap { background: rgba(239, 68, 68, 0.12); color: var(--negative); }

.rec-type-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  flex: 1;
}

.rec-priority {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
}

.rec-priority.priority-high { background: rgba(20, 184, 166, 0.1); color: var(--accent-teal); }
.rec-priority.priority-medium { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.rec-priority.priority-low { background: rgba(100, 116, 139, 0.1); color: var(--text-tertiary); }

.rec-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rec-message {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}

.rec-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rec-impact {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-teal);
}

.rec-deadline {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

/* ── Category Table ── */
.category-table-wrap {
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cat-row {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-glass);
  align-items: center;
}

.cat-row:last-child {
  border-bottom: none;
}

.cat-header {
  background: var(--bg-subtle);
}

.cat-header .cat-cell {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.cat-cell {
  flex: 1;
  font-size: 0.82rem;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-name-cell {
  flex: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.cat-icon { flex-shrink: 0; }

.cat-card-name {
  color: var(--accent-blue);
  font-weight: 600;
}

.cat-right {
  text-align: right;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.rate-badge {
  display: inline-flex;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(20, 184, 166, 0.1);
  color: var(--accent-teal);
  font-size: 0.72rem;
  font-weight: 700;
}

.missed-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--negative);
  opacity: 0.8;
}

/* ── Card Stack ── */
.card-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.stack-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stack-card-img {
  width: 54px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.stack-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.stack-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stack-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stack-card-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-stat {
  text-align: right;
  flex-shrink: 0;
}

.stack-rewards {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-teal);
}

.stack-spend {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.stack-cat-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.06);
  color: var(--text-secondary);
}

/* ── Cheat Sheet ── */
.cheatsheet-wrap {
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cheatsheet-grid {
  max-height: 500px;
  overflow-y: auto;
}

.cheat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border-glass);
  transition: background 0.15s ease;
}

.cheat-row:last-child { border-bottom: none; }
.cheat-row:hover { background: var(--bg-subtle); }

.cheat-category {
  flex: 1.5;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheat-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.cheat-card {
  flex: 1.2;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-blue);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cheat-rate {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .score-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }

  .score-ring-wrap {
    width: 80px;
    height: 80px;
    align-self: center;
  }

  .score-stats {
    gap: 20px;
    width: 100%;
  }

  .manage-btn {
    width: 100%;
    justify-content: center;
  }

  .view-toggle {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .toggle-btn {
    padding: 8px 12px;
    white-space: nowrap;
    font-size: 0.75rem;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .cat-row {
    padding: 10px 14px;
    gap: 6px;
  }
}
</style>

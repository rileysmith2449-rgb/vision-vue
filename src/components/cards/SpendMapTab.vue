<template>
  <div class="spendmap-wrap">
    <div v-if="cheatSheet.length === 0 && !hasSimpleData" class="empty-section">
      Add cards to see your personalized spend map.
    </div>
    <template v-else>
      <!-- View Mode Toggle -->
      <div class="spendmap-mode-toggle">
        <button :class="['mode-btn', { active: viewMode === 'detailed' }]" @click="viewMode = 'detailed'">Detailed</button>
        <button :class="['mode-btn', { active: viewMode === 'simple' }]" @click="viewMode = 'simple'">Simple</button>
      </div>

      <!-- Combo Preview Banner -->
      <div v-if="selectedCombo" class="combo-preview-banner">
        <span>Previewing: <strong>{{ selectedCombo }}</strong></span>
        <button class="combo-preview-close" @click="$emit('clear-combo')">&times;</button>
      </div>

      <!-- Simple View -->
      <template v-if="viewMode === 'simple'">
        <div v-if="simpleSpendMap.length === 0" class="empty-section">
          No spend data to map.
        </div>
        <div v-else class="spendmap-rows">
          <div
            v-for="item in simpleSpendMap"
            :key="item.bucket"
            class="spendmap-row"
          >
            <span class="spendmap-icon">{{ item.icon }}</span>
            <span class="spendmap-category">{{ item.bucket }}</span>
            <span class="spendmap-rate-badge" :style="{ borderColor: item.color, color: item.color }">{{ item.earnMultiplier }}x</span>
            <span class="spendmap-card">{{ item.cardName }}</span>
          </div>
        </div>
      </template>

      <!-- Detailed View (existing) -->
      <template v-else>
        <!-- Personal Section -->
        <div v-if="activeSpendMap.personal.length > 0" class="spendmap-section">
          <div class="spendmap-section-header">
            <span class="spendmap-dot spendmap-dot-personal"></span>
            <span class="spendmap-section-title">Personal</span>
          </div>
          <div class="spendmap-rows">
            <div
              v-for="item in activeSpendMap.personal"
              :key="'p-' + item.plaidCategory"
              :class="['spendmap-row', { 'spendmap-row-changed': item.changed }]"
            >
              <span class="spendmap-icon">{{ item.icon }}</span>
              <span class="spendmap-category">
                {{ item.displayName }}
                <span v-if="item.changed" class="spendmap-prev">was {{ item.previousRate }}x {{ item.previousCard }}</span>
              </span>
              <span class="spendmap-rate-badge" :style="{ borderColor: item.color, color: item.color }">{{ item.earnMultiplier }}x</span>
              <span class="spendmap-card">{{ item.cardName }}</span>
            </div>
          </div>
        </div>

        <!-- Business Section -->
        <div v-if="activeSpendMap.business.length > 0" class="spendmap-section">
          <div class="spendmap-section-header">
            <span class="spendmap-dot spendmap-dot-business"></span>
            <span class="spendmap-section-title">Business</span>
          </div>
          <div class="spendmap-rows">
            <div
              v-for="item in activeSpendMap.business"
              :key="'b-' + item.plaidCategory"
              :class="['spendmap-row', { 'spendmap-row-changed': item.changed }]"
            >
              <span class="spendmap-icon">{{ item.icon }}</span>
              <span class="spendmap-category">
                {{ item.displayName }}
                <span v-if="item.changed" class="spendmap-prev">was {{ item.previousRate }}x {{ item.previousCard }}</span>
              </span>
              <span class="spendmap-rate-badge" :style="{ borderColor: item.color, color: item.color }">{{ item.earnMultiplier }}x</span>
              <span class="spendmap-card">{{ item.cardName }}</span>
            </div>
          </div>
        </div>

        <!-- Recommended Card Combos -->
        <div v-if="filteredEcosystems.length > 0" class="section-block" style="margin-top: 16px;">
          <h4 class="block-title">
            <Layers :size="16" stroke-width="2" />
            Recommended Card Combos
          </h4>
          <p class="block-subtitle">Complete card ecosystems that maximize rewards for your spending pattern</p>

          <div class="eco-grid">
            <div
              v-for="eco in filteredEcosystems"
              :key="eco.name"
              :class="['eco-card', { 'eco-expanded': expandedEco === eco.name, 'eco-previewing': selectedCombo === eco.name }]"
              @click="$emit('toggle-combo', eco.name)"
            >
              <div class="eco-header">
                <div class="eco-title-row">
                  <span class="eco-name">{{ eco.name }}</span>
                  <span :class="['eco-scope-badge', `eco-scope-${eco.scope}`]">{{ eco.scope === 'combined' ? 'Both' : eco.scope }}</span>
                </div>
                <p class="eco-desc">{{ eco.description }}</p>
              </div>
              <div class="eco-stats">
                <div class="combo-stat">
                  <span class="combo-stat-label">Projected Rewards</span>
                  <span class="combo-stat-value gain">{{ formatCurrency(eco.projectedRewards) }}</span>
                </div>
                <div class="combo-stat">
                  <span class="combo-stat-label">Total Fees</span>
                  <span class="combo-stat-value">{{ eco.totalAnnualFee > 0 ? formatCurrency(eco.totalAnnualFee) : 'Free' }}</span>
                </div>
                <div class="combo-stat">
                  <span class="combo-stat-label">Net Value</span>
                  <span class="combo-stat-value" :class="eco.netValue >= 0 ? 'gain' : 'loss'">{{ eco.netValue >= 0 ? '+' : '' }}{{ formatCurrency(eco.netValue) }}</span>
                </div>
                <div v-if="eco.pooledValue > 0" class="combo-stat">
                  <span class="combo-stat-label">Pooled Value</span>
                  <span class="combo-stat-value gain">{{ formatCurrency(eco.pooledValue) }}</span>
                </div>
              </div>
              <p class="eco-highlight">{{ eco.highlight }}</p>
              <ChevronDown :size="14" stroke-width="2" :class="['eco-chevron', { rotated: expandedEco === eco.name }]" />

              <!-- Expanded detail -->
              <div v-if="expandedEco === eco.name" class="eco-detail" @click.stop>
                <div v-for="c in eco.cards" :key="c.name" class="eco-card-row">
                  <span :class="['eco-card-required', { optional: !c.required }]">{{ c.required ? '●' : '○' }}</span>
                  <span class="eco-card-name">{{ c.name }}</span>
                  <span class="eco-card-role">{{ c.role }}</span>
                </div>
                <div v-if="eco.poolNote" class="eco-pool-note">
                  {{ eco.poolNote }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { Layers, ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  cheatSheet: { type: Array, default: () => [] },
  activeSpendMap: { type: Object, default: () => ({ personal: [], business: [] }) },
  filteredEcosystems: { type: Array, default: () => [] },
  selectedCombo: { type: String, default: null },
  expandedEco: { type: String, default: null },
  activeCards: { type: Array, default: () => [] },
  cardDetails: { type: Object, default: () => ({}) },
  plaidMappings: { type: Object, default: () => ({}) },
})

defineEmits(['toggle-combo', 'clear-combo'])

const { formatCurrency } = inject('helpers')

const viewMode = ref('detailed')

// ── Simple Spend Map ──
const SIMPLE_BUCKETS = {
  'Dining': {
    icon: '🍽️',
    plaid: ['FOOD_AND_DRINK_RESTAURANT', 'FOOD_AND_DRINK_COFFEE', 'FOOD_AND_DRINK_FAST_FOOD'],
  },
  'Groceries': {
    icon: '🛒',
    plaid: ['FOOD_AND_DRINK_GROCERIES'],
  },
  'Gas': {
    icon: '⛽',
    plaid: ['TRANSPORTATION_GAS'],
  },
  'Travel': {
    icon: '✈️',
    plaid: ['TRAVEL_FLIGHTS', 'TRAVEL_LODGING', 'TRAVEL_OTHER_TRAVEL'],
  },
  'Streaming': {
    icon: '📺',
    plaid: ['ENTERTAINMENT_TV_AND_MOVIES'],
  },
  'Drugstores': {
    icon: '💊',
    plaid: ['MEDICAL_PHARMACIES_AND_SUPPLEMENTS'],
  },
  'Office Supplies': {
    icon: '📎',
    plaid: ['GENERAL_SERVICES_OTHER_GENERAL_SERVICES'],
  },
  'Internet / Phone': {
    icon: '📶',
    plaid: ['RENT_AND_UTILITIES_TELECOMMUNICATION_SERVICES'],
  },
  'Online Advertising': {
    icon: '📣',
    plaid: ['GENERAL_SERVICES_ADVERTISING'],
  },
  'Amazon / AWS': {
    icon: '📦',
    plaid: ['GENERAL_MERCHANDISE_ONLINE_MARKETPLACES'],
  },
  'Costco': {
    icon: '🏪',
    plaid: ['GENERAL_MERCHANDISE_SUPERSTORES'],
  },
  'Everything Else': {
    icon: '💳',
    plaid: [],
  },
}

const simpleSpendMap = computed(() => {
  const allItems = [...(props.activeSpendMap.personal || []), ...(props.activeSpendMap.business || [])]
  if (allItems.length === 0) return []

  // Build a lookup: plaidCategory → best item
  const plaidLookup = {}
  for (const item of allItems) {
    plaidLookup[item.plaidCategory] = item
  }

  // For each simple bucket, find the best card assignment from the cheat sheet
  const assigned = new Set()
  const results = []

  for (const [bucket, config] of Object.entries(SIMPLE_BUCKETS)) {
    if (bucket === 'Everything Else') continue

    let bestItem = null
    let bestRate = 0

    for (const plaidCode of config.plaid) {
      const item = plaidLookup[plaidCode]
      if (item && item.earnMultiplier > bestRate) {
        bestRate = item.earnMultiplier
        bestItem = item
      }
    }

    if (bestItem) {
      results.push({
        bucket,
        icon: config.icon,
        cardName: bestItem.cardName,
        earnMultiplier: bestItem.earnMultiplier,
        color: bestItem.color || 'var(--accent-teal)',
      })
      config.plaid.forEach(p => assigned.add(p))
    }
  }

  // "Everything Else" = whatever has the best default rate
  const everythingElse = allItems.find(item => !assigned.has(item.plaidCategory)) || allItems[allItems.length - 1]
  if (everythingElse) {
    results.push({
      bucket: 'Everything Else',
      icon: '💳',
      cardName: everythingElse.cardName,
      earnMultiplier: everythingElse.earnMultiplier,
      color: everythingElse.color || 'var(--accent-teal)',
    })
  }

  return results
})

const hasSimpleData = computed(() => simpleSpendMap.value.length > 0)
</script>

<style scoped>
@import './shared.css';

.spendmap-wrap { animation: viewFadeIn 0.2s ease-out; }

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.spendmap-mode-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  margin-bottom: 16px;
  width: fit-content;
}

.mode-btn {
  padding: 5px 16px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover { color: var(--text-primary); }
.mode-btn.active { background: var(--accent-blue); color: #fff; }

.spendmap-section { margin-bottom: 20px; }
.spendmap-section:last-child { margin-bottom: 0; }

.spendmap-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-glass);
}

.spendmap-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spendmap-dot-personal { background: #3B82F6; }
.spendmap-dot-business { background: #EAB308; }

.spendmap-section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.spendmap-rows {
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.spendmap-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border-glass);
  transition: background 0.15s ease;
}

.spendmap-row:last-child { border-bottom: none; }
.spendmap-row:hover { background: var(--bg-subtle); }

.spendmap-icon { flex-shrink: 0; font-size: 1rem; }

.spendmap-category {
  flex: 1.5;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spendmap-rate-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.03);
}

.spendmap-card {
  flex: 1.2;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-blue);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

/* Combo Preview */
.combo-preview-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  margin-bottom: 14px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  color: var(--text-primary);
}

.combo-preview-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.combo-preview-close:hover { color: var(--text-primary); }

/* Changed Rows */
.spendmap-row-changed {
  border-left: 3px solid var(--accent-blue);
  background: rgba(59, 130, 246, 0.04);
}

.spendmap-prev {
  display: block;
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-top: 1px;
}

/* ── Ecosystems ── */
.eco-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.eco-card {
  padding: 18px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  background-image: var(--gradient-card);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.eco-card:hover { box-shadow: var(--shadow-hover); }
.eco-expanded { border-color: var(--accent-blue); }

.eco-previewing {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 1px var(--accent-blue), 0 0 12px rgba(59, 130, 246, 0.15);
}

.eco-header { margin-bottom: 12px; }

.eco-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.eco-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.eco-scope-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.eco-scope-personal { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
.eco-scope-business { background: rgba(234, 179, 8, 0.12); color: #EAB308; }
.eco-scope-combined { background: rgba(20, 184, 166, 0.12); color: var(--accent-teal); }

.eco-desc {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.eco-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.eco-highlight {
  font-size: 0.72rem;
  color: var(--accent-blue);
  font-weight: 600;
  margin-bottom: 4px;
}

.eco-chevron {
  color: var(--text-tertiary);
  float: right;
  transition: transform 0.2s ease;
}

.eco-chevron.rotated { transform: rotate(180deg); }

.eco-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-glass);
  clear: both;
}

.eco-card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.eco-card-required {
  font-size: 0.6rem;
  color: var(--accent-teal);
  flex-shrink: 0;
}

.eco-card-required.optional { color: var(--text-tertiary); }

.eco-card-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 140px;
}

.eco-card-role {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.eco-pool-note {
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(20, 184, 166, 0.04);
  border: 1px solid rgba(20, 184, 166, 0.1);
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  color: var(--accent-teal);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .eco-grid { grid-template-columns: 1fr; }
}
</style>

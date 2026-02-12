<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-info">
            <div class="header-title">{{ holding.icon }} {{ holding.symbol }}</div>
            <div class="header-sub">{{ holding.category }}</div>
          </div>
          <div class="header-values">
            <div class="header-value">{{ formatCurrency(holding.currentValue) }}</div>
            <div class="header-gain" :class="gain >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(gain) }} ({{ formatPercent(gainPct) }})
            </div>
          </div>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>

        <!-- Sell Simulator -->
        <div class="sim-section">
          <h3 class="section-title">Sell Simulator</h3>
          <p class="section-sub">Estimate the tax impact of selling shares</p>

          <div class="input-group">
            <label class="input-label" for="modal-shares-input">Shares to sell</label>
            <input
              id="modal-shares-input"
              type="number"
              class="shares-input"
              v-model.number="sharesToSell"
              :min="0"
              :max="holding.shares"
              step="1"
            />
            <input
              type="range"
              class="shares-slider"
              v-model.number="sharesToSell"
              :min="0"
              :max="holding.shares"
              step="1"
            />
            <div class="input-hint">{{ sharesToSell }} of {{ holding.shares }} shares</div>
          </div>

          <div class="results-grid">
            <div class="result-item">
              <div class="result-label">Proceeds</div>
              <div class="result-value">{{ formatCurrency(proceeds) }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Cost Basis Sold</div>
              <div class="result-value">{{ formatCurrency(costBasisSold) }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Capital Gain/Loss</div>
              <div class="result-value" :class="capitalGain >= 0 ? 'positive' : 'negative'">
                {{ formatCurrency(capitalGain) }}
              </div>
            </div>
            <div class="result-item">
              <div class="result-label">Tax Rate</div>
              <div class="result-value">{{ taxTreatment === 'short-term' ? '32%' : '15%' }}</div>
            </div>
            <div class="result-item">
              <div class="result-label">Estimated Tax</div>
              <div class="result-value negative">{{ formatCurrency(estimatedTax) }}</div>
            </div>
            <div class="result-item highlight">
              <div class="result-label">Net After Tax</div>
              <div class="result-value big">{{ formatCurrency(netAfterTax) }}</div>
            </div>
          </div>
        </div>

        <!-- What-If Comparison -->
        <div v-if="capitalGain > 0 && sharesToSell > 0" class="sim-section">
          <h3 class="section-title">Short-term vs Long-term</h3>
          <p class="section-sub">See how holding period affects your tax bill</p>

          <div class="comparison-table">
            <div class="comparison-header">
              <div class="comparison-cell label-cell"></div>
              <div class="comparison-cell" :class="{ 'active-col': taxTreatment === 'short-term' }">Short-term <span class="rate-tag">32%</span></div>
              <div class="comparison-cell" :class="{ 'active-col': taxTreatment === 'long-term' }">Long-term <span class="rate-tag">15%</span></div>
            </div>
            <div class="comparison-row">
              <div class="comparison-cell label-cell">Capital Gain</div>
              <div class="comparison-cell positive">{{ formatCurrency(capitalGain) }}</div>
              <div class="comparison-cell positive">{{ formatCurrency(capitalGain) }}</div>
            </div>
            <div class="comparison-row">
              <div class="comparison-cell label-cell">Tax Owed</div>
              <div class="comparison-cell negative">{{ formatCurrency(shortTermTax) }}</div>
              <div class="comparison-cell negative">{{ formatCurrency(longTermTax) }}</div>
            </div>
            <div class="comparison-row">
              <div class="comparison-cell label-cell">Net After Tax</div>
              <div class="comparison-cell">{{ formatCurrency(proceeds - shortTermTax) }}</div>
              <div class="comparison-cell">{{ formatCurrency(proceeds - longTermTax) }}</div>
            </div>
            <div class="comparison-row highlight-row">
              <div class="comparison-cell label-cell">You Keep</div>
              <div class="comparison-cell">{{ proceeds > 0 ? (100 - (shortTermTax / proceeds) * 100).toFixed(1) : '100.0' }}%</div>
              <div class="comparison-cell">{{ proceeds > 0 ? (100 - (longTermTax / proceeds) * 100).toFixed(1) : '100.0' }}%</div>
            </div>
          </div>

          <div class="savings-banner" :class="taxTreatment === 'long-term' ? 'savings-active' : 'savings-potential'">
            <template v-if="taxTreatment === 'long-term'">
              <span class="savings-icon">&#10003;</span>
              <div>
                <div class="savings-title">You're saving {{ formatCurrency(taxSavings) }} with long-term rates</div>
                <div class="savings-detail">Compared to {{ formatCurrency(shortTermTax) }} at the short-term rate</div>
              </div>
            </template>
            <template v-else>
              <span class="savings-icon">&#9201;</span>
              <div>
                <div class="savings-title">Wait {{ daysRemaining }}d to save {{ formatCurrency(taxSavings) }}</div>
                <div class="savings-detail">
                  Holding until long-term cuts your tax from {{ formatCurrency(shortTermTax) }} to {{ formatCurrency(longTermTax) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'

const props = defineProps({
  holding: { type: Object, required: true }
})

defineEmits(['close'])

const gain = computed(() => props.holding.currentValue - props.holding.costBasis)
const gainPct = computed(() =>
  props.holding.costBasis > 0
    ? (gain.value / props.holding.costBasis) * 100
    : 0
)

const taxTreatment = computed(() => calculateTaxTreatment(props.holding.purchaseDate))

// Sell simulator
const sharesToSell = ref(0)

const sellRatio = computed(() =>
  props.holding.shares > 0 ? sharesToSell.value / props.holding.shares : 0
)
const proceeds = computed(() => sellRatio.value * props.holding.currentValue)
const costBasisSold = computed(() => sellRatio.value * props.holding.costBasis)
const capitalGain = computed(() => proceeds.value - costBasisSold.value)
const taxRate = computed(() => taxTreatment.value === 'short-term' ? 0.32 : 0.15)
const estimatedTax = computed(() => capitalGain.value > 0 ? capitalGain.value * taxRate.value : 0)
const netAfterTax = computed(() => proceeds.value - estimatedTax.value)

// What-if comparison
const shortTermTax = computed(() => capitalGain.value > 0 ? capitalGain.value * 0.32 : 0)
const longTermTax = computed(() => capitalGain.value > 0 ? capitalGain.value * 0.15 : 0)
const taxSavings = computed(() => shortTermTax.value - longTermTax.value)
const daysRemaining = computed(() => daysUntilLongTerm(props.holding.purchaseDate))
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--bg-card, #1E293B);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl, 16px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  padding: 0;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-glass);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-sub {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.header-values {
  text-align: right;
}

.header-value {
  font-family: 'Lexend', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-gain {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 2px;
}

.header-gain.positive { color: var(--electric-teal); }
.header-gain.negative { color: var(--persimmon); }

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.4rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Section */
.sim-section {
  padding: 24px;
  border-bottom: 1px solid var(--border-glass);
}

.sim-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 2px;
  margin-bottom: 20px;
}

/* Input */
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.shares-input {
  width: 120px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Lexend', sans-serif;
  outline: none;
  transition: border-color 0.2s;
}

.shares-input:focus {
  border-color: var(--border-focus);
}

.shares-slider {
  display: block;
  width: 100%;
  margin-top: 12px;
  accent-color: var(--accent-blue);
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 6px;
}

/* Results */
.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.result-item {
  padding: 14px;
  border-radius: 10px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
}

.result-item.highlight {
  border-color: var(--accent-teal);
  background: rgba(20, 184, 166, 0.05);
}

.result-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.result-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.result-value.big {
  font-family: 'Lexend', sans-serif;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
}

.result-value.positive { color: var(--electric-teal); }
.result-value.negative { color: var(--persimmon); }

/* Comparison table */
.comparison-table {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-glass);
}

.comparison-header,
.comparison-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
}

.comparison-header {
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-glass);
}

.comparison-header .comparison-cell {
  font-weight: 600;
  font-size: 0.8rem;
  padding: 12px 14px;
}

.comparison-cell {
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.comparison-cell.label-cell {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.comparison-cell.positive { color: var(--electric-teal); }
.comparison-cell.negative { color: var(--persimmon); }

.comparison-cell.active-col {
  background: rgba(59, 130, 246, 0.06);
}

.rate-tag {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.comparison-row {
  border-bottom: 1px solid var(--border-glass);
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-row.highlight-row {
  background: var(--bg-subtle);
}

/* Savings banner */
.savings-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
}

.savings-banner.savings-active {
  background: rgba(20, 184, 166, 0.08);
  border: 1px solid rgba(20, 184, 166, 0.25);
}

.savings-banner.savings-potential {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.savings-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.savings-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.savings-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .modal-card {
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .sim-section {
    padding: 16px;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>

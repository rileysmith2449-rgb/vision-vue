<template>
  <div class="property-detail">
    <Header :title="property ? `🏠 ${property.name}` : 'Property Not Found'" :subtitle="property ? property.address : ''">
      <template #actions>
        <button class="back-btn" @click="router.back()">Back</button>
      </template>
    </Header>

    <template v-if="property">
      <!-- Property Summary -->
      <div class="summary-card">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Estimated Value</div>
            <div class="summary-value big">{{ formatCurrency(property.estimatedValue) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Purchase Price</div>
            <div class="summary-value">{{ formatCurrency(property.purchasePrice) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Gain/Loss</div>
            <div class="summary-value" :class="gain >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(gain) }} ({{ formatPercent(gainPct) }})
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Purchase Date</div>
            <div class="summary-value">{{ formatDate(property.purchaseDate) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tax Treatment</div>
            <div class="summary-value">
              <Badge :type="taxTreatment === 'long-term' ? 'info' : 'neutral'" :label="taxBadgeLabel" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sale Simulator -->
      <div class="simulator-card">
        <h3 class="card-title">Sale Simulator</h3>
        <p class="card-subtitle">Estimate net proceeds from selling this property</p>

        <div class="input-group">
          <label class="input-label" for="sale-price-input">Sale price</label>
          <input
            id="sale-price-input"
            type="number"
            class="price-input"
            v-model.number="salePrice"
            :min="0"
            step="1000"
          />
          <input
            type="range"
            class="price-slider"
            v-model.number="salePrice"
            :min="Math.round(property.purchasePrice * 0.5)"
            :max="Math.round(property.estimatedValue * 1.5)"
            step="1000"
          />
          <div class="input-hint">{{ formatCurrency(salePrice) }} sale price</div>
        </div>

        <div class="results-grid">
          <div class="result-item">
            <div class="result-label">Sale Proceeds</div>
            <div class="result-value">{{ formatCurrency(salePrice) }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">Capital Gain</div>
            <div class="result-value" :class="saleGain >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(saleGain) }}
            </div>
          </div>
          <div class="result-item">
            <div class="result-label">Tax Rate ({{ taxTreatment === 'short-term' ? '32%' : '15%' }})</div>
            <div class="result-value">{{ taxTreatment === 'short-term' ? '32%' : '15%' }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">Estimated Tax Owed</div>
            <div class="result-value negative">{{ formatCurrency(estimatedTax) }}</div>
          </div>
          <div class="result-item highlight">
            <div class="result-label">Net Proceeds After Tax</div>
            <div class="result-value big">{{ formatCurrency(netProceeds) }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">vs Current Estimated Value</div>
            <div class="result-value" :class="salePrice >= property.estimatedValue ? 'positive' : 'negative'">
              {{ formatCurrency(salePrice - property.estimatedValue) }}
            </div>
          </div>
        </div>
      </div>

      <!-- What-If: Short-term vs Long-term Comparison -->
      <div v-if="saleGain > 0 && salePrice > 0" class="comparison-card">
        <h3 class="card-title">What If: Short-term vs Long-term</h3>
        <p class="card-subtitle">See how holding period affects your tax bill on this sale</p>

        <div class="comparison-table">
          <div class="comparison-header">
            <div class="comparison-cell label-cell"></div>
            <div class="comparison-cell" :class="{ 'active-col': taxTreatment === 'short-term' }">
              <Badge type="neutral" label="Short-term" />
              <span class="rate-tag">32%</span>
            </div>
            <div class="comparison-cell" :class="{ 'active-col': taxTreatment === 'long-term' }">
              <Badge type="info" label="Long-term" />
              <span class="rate-tag">15%</span>
            </div>
          </div>

          <div class="comparison-row">
            <div class="comparison-cell label-cell">Capital Gain</div>
            <div class="comparison-cell positive">{{ formatCurrency(saleGain) }}</div>
            <div class="comparison-cell positive">{{ formatCurrency(saleGain) }}</div>
          </div>

          <div class="comparison-row">
            <div class="comparison-cell label-cell">Tax Owed</div>
            <div class="comparison-cell negative">{{ formatCurrency(shortTermTax) }}</div>
            <div class="comparison-cell negative">{{ formatCurrency(longTermTax) }}</div>
          </div>

          <div class="comparison-row">
            <div class="comparison-cell label-cell">Net After Tax</div>
            <div class="comparison-cell">{{ formatCurrency(salePrice - shortTermTax) }}</div>
            <div class="comparison-cell">{{ formatCurrency(salePrice - longTermTax) }}</div>
          </div>

          <div class="comparison-row highlight-row">
            <div class="comparison-cell label-cell">You Keep</div>
            <div class="comparison-cell">{{ (100 - (shortTermTax / salePrice) * 100).toFixed(1) }}%</div>
            <div class="comparison-cell">{{ (100 - (longTermTax / salePrice) * 100).toFixed(1) }}%</div>
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
    </template>

    <div v-else class="empty-state">
      <p>Property not found.</p>
      <button class="back-btn" @click="router.push('/net-worth')">Back to Net Worth</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency, formatPercent, formatDate } from '@/utils/formatters'
import { calculateTaxTreatment, daysUntilLongTerm } from '@/utils/taxCalculations'
import Header from '@/components/layout/Header.vue'
import Badge from '@/components/common/Badge.vue'

const route = useRoute()
const router = useRouter()
const portfolioStore = usePortfolioStore()

const property = computed(() => {
  const id = route.params.id
  return portfolioStore.propertyValues.find(p => p.id === id) || null
})

const gain = computed(() => property.value ? property.value.estimatedValue - property.value.purchasePrice : 0)
const gainPct = computed(() => property.value && property.value.purchasePrice > 0
  ? ((gain.value / property.value.purchasePrice) * 100)
  : 0
)

// Tax treatment
const taxTreatment = computed(() => property.value ? calculateTaxTreatment(property.value.purchaseDate) : 'short-term')
const taxBadgeLabel = computed(() => {
  if (!property.value) return ''
  if (taxTreatment.value === 'long-term') return 'Long-term'
  const days = daysUntilLongTerm(property.value.purchaseDate)
  return `Short-term (${days}d to LT)`
})

// Sale simulator
const salePrice = ref(0)

// Initialize salePrice when property loads
import { watch } from 'vue'
watch(property, (p) => {
  if (p) salePrice.value = p.estimatedValue
}, { immediate: true })

const saleGain = computed(() => salePrice.value - (property.value?.purchasePrice || 0))
const taxRate = computed(() => taxTreatment.value === 'short-term' ? 0.32 : 0.15)
const estimatedTax = computed(() => saleGain.value > 0 ? saleGain.value * taxRate.value : 0)
const netProceeds = computed(() => salePrice.value - estimatedTax.value)

// What-if comparison
const shortTermTax = computed(() => saleGain.value > 0 ? saleGain.value * 0.32 : 0)
const longTermTax = computed(() => saleGain.value > 0 ? saleGain.value * 0.15 : 0)
const taxSavings = computed(() => shortTermTax.value - longTermTax.value)
const daysRemaining = computed(() => property.value ? daysUntilLongTerm(property.value.purchaseDate) : 0)
</script>

<style scoped>
.property-detail {
  max-width: 1200px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: var(--bg-subtle);
}

/* Summary Card */
.summary-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  margin-bottom: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.big {
  font-family: 'Lexend', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.summary-value.positive { color: var(--electric-teal); }
.summary-value.negative { color: var(--persimmon); }

/* Simulator Card */
.simulator-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  margin-bottom: 24px;
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
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 28px;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.price-input {
  width: 160px;
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

.price-input:focus {
  border-color: var(--electric-teal);
}

.price-slider {
  display: block;
  width: 100%;
  max-width: 400px;
  margin-top: 12px;
  accent-color: var(--electric-teal);
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.result-item {
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
}

.result-item.highlight {
  border-color: var(--electric-teal);
  background: rgba(0, 255, 159, 0.05);
}

.result-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.result-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.result-value.big {
  font-family: 'Lexend', sans-serif;
  font-size: 1.4rem;
  letter-spacing: -0.03em;
}

.result-value.positive { color: var(--electric-teal); }
.result-value.negative { color: var(--persimmon); }

/* Comparison Card */
.comparison-card {
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 32px;
  margin-bottom: 24px;
}

.comparison-table {
  margin-top: 8px;
  border-radius: 12px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  font-weight: 600;
}

.comparison-cell {
  padding: 12px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.comparison-cell.label-cell {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.comparison-cell.positive { color: var(--electric-teal); }
.comparison-cell.negative { color: var(--persimmon); }

.comparison-cell.active-col {
  background: rgba(157, 78, 221, 0.06);
}

.rate-tag {
  font-size: 0.7rem;
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

.savings-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.savings-banner.savings-active {
  background: rgba(0, 255, 159, 0.08);
  border: 1px solid rgba(0, 255, 159, 0.25);
}

.savings-banner.savings-potential {
  background: rgba(157, 78, 221, 0.08);
  border: 1px solid rgba(157, 78, 221, 0.25);
}

.savings-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.savings-title {
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.savings-detail {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: 16px;
}

@media (max-width: 1024px) {
  .summary-card,
  .simulator-card,
  .comparison-card {
    padding: 24px;
  }

  .summary-value.big {
    font-size: 1.3rem;
  }

  .summary-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
  }

  .results-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>

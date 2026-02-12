<template>
  <div class="liability-detail">
    <Header :title="liability ? `${liability.icon} ${liability.name}` : 'Liability Not Found'" :subtitle="liability ? liability.category : ''">
      <template #actions>
        <button class="back-btn" @click="router.back()">Back</button>
      </template>
    </Header>

    <template v-if="liability">
      <!-- Liability Summary -->
      <div class="summary-card">
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Balance</div>
            <div class="summary-value big negative">{{ formatCurrency(liability.balance) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Interest Rate</div>
            <div class="summary-value">{{ liability.interestRate }}% APR</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Monthly Payment</div>
            <div class="summary-value">{{ formatCurrency(liability.monthlyPayment) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Category</div>
            <div class="summary-value">
              <Badge type="info" :label="liability.category" />
            </div>
          </div>
        </div>
      </div>

      <!-- Payoff Simulator -->
      <div class="simulator-card">
        <h3 class="card-title">Payoff Simulator</h3>
        <p class="card-subtitle">See how extra payments accelerate your payoff</p>

        <div class="input-group">
          <label class="input-label" for="extra-payment-input">Extra monthly payment</label>
          <input
            id="extra-payment-input"
            type="number"
            class="payment-input"
            v-model.number="extraPayment"
            :min="0"
            :max="liability.balance"
            step="50"
          />
          <input
            type="range"
            class="payment-slider"
            v-model.number="extraPayment"
            :min="0"
            :max="Math.min(liability.balance, liability.monthlyPayment * 5)"
            step="50"
          />
          <div class="input-hint">{{ formatCurrency(extraPayment) }} extra per month</div>
        </div>

        <div class="results-grid">
          <div class="result-item">
            <div class="result-label">Current Payoff</div>
            <div class="result-value">{{ currentMonths }} months</div>
          </div>
          <div class="result-item">
            <div class="result-label">New Payoff</div>
            <div class="result-value" :class="{ 'positive': extraPayment > 0 }">{{ newMonths }} months</div>
          </div>
          <div class="result-item highlight">
            <div class="result-label">Months Saved</div>
            <div class="result-value big" :class="{ 'positive': monthsSaved > 0 }">{{ monthsSaved }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">Current Total Interest</div>
            <div class="result-value negative">{{ formatCurrency(currentTotalInterest) }}</div>
          </div>
          <div class="result-item">
            <div class="result-label">New Total Interest</div>
            <div class="result-value negative">{{ formatCurrency(newTotalInterest) }}</div>
          </div>
          <div class="result-item highlight">
            <div class="result-label">Interest Saved</div>
            <div class="result-value big positive">{{ formatCurrency(interestSaved) }}</div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <p>Liability not found.</p>
      <button class="back-btn" @click="router.push('/net-worth')">Back to Net Worth</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePortfolioStore } from '@/stores/portfolio'
import { formatCurrency } from '@/utils/formatters'
import Header from '@/components/layout/Header.vue'
import Badge from '@/components/common/Badge.vue'

const route = useRoute()
const router = useRouter()
const portfolioStore = usePortfolioStore()

const liability = computed(() => {
  const id = route.params.id
  return portfolioStore.liabilities.find(l => l.id === id) || null
})

const extraPayment = ref(0)

function calcPayoff(balance, monthlyRate, payment) {
  if (payment <= 0 || monthlyRate <= 0) {
    return payment <= 0
      ? { months: balance > 0 ? Infinity : 0, totalInterest: 0 }
      : { months: Math.ceil(balance / payment), totalInterest: 0 }
  }
  let remaining = balance
  let months = 0
  let totalInterest = 0
  const maxMonths = 1200 // 100 year cap
  while (remaining > 0.01 && months < maxMonths) {
    const interest = remaining * monthlyRate
    totalInterest += interest
    remaining = remaining + interest - payment
    months++
    if (remaining + interest <= payment) {
      // Will be fully paid this cycle or next
      if (remaining <= 0) break
    }
  }
  return { months, totalInterest }
}

const monthlyRate = computed(() => liability.value ? liability.value.interestRate / 100 / 12 : 0)

const currentPayoff = computed(() => {
  if (!liability.value) return { months: 0, totalInterest: 0 }
  return calcPayoff(liability.value.balance, monthlyRate.value, liability.value.monthlyPayment)
})

const newPayoff = computed(() => {
  if (!liability.value) return { months: 0, totalInterest: 0 }
  return calcPayoff(liability.value.balance, monthlyRate.value, liability.value.monthlyPayment + extraPayment.value)
})

const currentMonths = computed(() => currentPayoff.value.months === Infinity ? '∞' : currentPayoff.value.months)
const newMonths = computed(() => newPayoff.value.months === Infinity ? '∞' : newPayoff.value.months)
const monthsSaved = computed(() => {
  if (currentPayoff.value.months === Infinity || newPayoff.value.months === Infinity) return 0
  return currentPayoff.value.months - newPayoff.value.months
})
const currentTotalInterest = computed(() => currentPayoff.value.totalInterest)
const newTotalInterest = computed(() => newPayoff.value.totalInterest)
const interestSaved = computed(() => currentTotalInterest.value - newTotalInterest.value)
</script>

<style scoped>
.liability-detail {
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
  background-image: var(--gradient-card);
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
  background-image: var(--gradient-card);
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

.payment-input {
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

.payment-input:focus {
  border-color: var(--border-focus);
}

.payment-slider {
  display: block;
  width: 100%;
  max-width: 400px;
  margin-top: 12px;
  accent-color: var(--accent-blue);
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
  border-color: var(--accent-teal);
  background: rgba(20, 184, 166, 0.05);
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
  .simulator-card {
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

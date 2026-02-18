<template>
  <div class="settings">
    <Header title="Settings" subtitle="Customize your experience" />

    <div class="settings-grid">
      <!-- Account -->
      <Card title="Account" subtitle="Manage your sign-in and security">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">{{ authStore.currentUser?.email || authStore.currentUser?.name || 'Signed in' }}</span>
            <span class="setting-description">Signed in with Descope</span>
          </div>
          <button class="sign-out-btn" @click="authStore.logout()">
            <LogOut :size="16" stroke-width="2" />
            Sign Out
          </button>
        </div>
      </Card>

      <!-- Data Source -->
      <Card title="Data Source" subtitle="Choose between demo data, bank data via Plaid, or CSV upload">
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: settingsStore.dataSource === 'demo' }"
            @click="switchDataSource('demo')"
          >
            <Database :size="14" stroke-width="2" />
            Demo Data
          </button>
          <button
            class="mode-btn"
            :class="{ active: settingsStore.dataSource === 'plaid' }"
            @click="switchDataSource('plaid')"
          >
            <Landmark :size="14" stroke-width="2" />
            Plaid (Sandbox)
          </button>
          <button
            class="mode-btn"
            :class="{ active: settingsStore.dataSource === 'csv' }"
            @click="switchDataSource('csv')"
          >
            <Upload :size="14" stroke-width="2" />
            CSV Upload
          </button>
        </div>

        <div v-if="settingsStore.dataSource === 'plaid'" class="data-source-detail">
          <PlaidLink />
        </div>
        <div v-else-if="settingsStore.dataSource === 'csv'" class="data-source-detail">
          <div class="csv-upload-area">
            <label class="csv-file-label">
              <Upload :size="18" stroke-width="2" />
              <span>{{ csvFileName || 'Choose a CSV file' }}</span>
              <input
                type="file"
                accept=".csv"
                class="csv-file-input"
                @change="handleCSVUpload"
              />
            </label>
            <p class="csv-format-hint">
              Expected columns: <code>date,merchant,amount,category,card</code><br />
              Optional: <code>subcategory</code> &mdash; Date format: YYYY-MM-DD
            </p>
          </div>
          <div v-if="csvErrors.length" class="csv-errors">
            <p v-for="(err, i) in csvErrors" :key="i">{{ err }}</p>
          </div>
          <div v-if="csvSummary" class="csv-summary">
            <span class="csv-summary-text">{{ csvSummary }}</span>
            <button class="csv-clear-btn" @click="clearCSVData">Clear Data</button>
          </div>
        </div>
        <p v-else class="data-source-hint">
          Using generated demo data for budget, investments, and liabilities.
        </p>
      </Card>

      <!-- Budget Mode -->
      <Card title="Budget Mode" subtitle="Switch between personal or family view">
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: budgetStore.budgetMode === 'personal' }"
            @click="budgetStore.setBudgetMode('personal')"
          >
            <User :size="14" stroke-width="2" />
            Personal
          </button>
          <button
            class="mode-btn"
            :class="{ active: budgetStore.budgetMode === 'family' }"
            @click="budgetStore.setBudgetMode('family')"
          >
            <Users :size="14" stroke-width="2" />
            Family
          </button>
        </div>

        <div class="business-toggle-row">
          <div class="business-toggle-info">
            <Briefcase :size="14" stroke-width="2" class="business-icon" />
            <div>
              <span class="business-toggle-label">Business</span>
              <span class="business-toggle-hint">Include business credit cards and insights</span>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="budgetStore.businessEnabled" @change="budgetStore.setBusinessEnabled($event.target.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </Card>

      <!-- Family Members (when family mode) -->
      <Card v-if="budgetStore.budgetMode === 'family'" title="Family Members" subtitle="Configure names and assign the default filing member">
        <div class="members-section">
          <div class="member-row">
            <div class="member-color mine"></div>
            <div class="member-fields">
              <label class="field-label">Member 1 Name</label>
              <input
                type="text"
                class="text-input"
                :value="budgetStore.familyMembers.mine.name"
                @input="budgetStore.updateMemberName('mine', $event.target.value)"
              />
            </div>
          </div>
          <div class="member-row">
            <div class="member-color yours"></div>
            <div class="member-fields">
              <label class="field-label">Member 2 Name</label>
              <input
                type="text"
                class="text-input"
                :value="budgetStore.familyMembers.yours.name"
                @input="budgetStore.updateMemberName('yours', $event.target.value)"
              />
            </div>
          </div>
        </div>

        <div class="filing-mapping">
          <span class="field-label">Default filing member</span>
          <span class="field-hint">Used for personal &amp; business budget views</span>
          <div class="mapping-toggle">
            <button
              class="map-btn"
              :class="{ active: budgetStore.personalMember === 'mine' }"
              @click="budgetStore.setPersonalMember('mine')"
            >
              {{ budgetStore.familyMembers.mine.name }}
            </button>
            <button
              class="map-btn"
              :class="{ active: budgetStore.personalMember === 'yours' }"
              @click="budgetStore.setPersonalMember('yours')"
            >
              {{ budgetStore.familyMembers.yours.name }}
            </button>
          </div>
        </div>
      </Card>

      <!-- Tax Brackets -->
      <Card title="Tax Brackets" subtitle="Select your federal income and capital gains brackets">
        <!-- Family mode: tabs for each member -->
        <div v-if="budgetStore.budgetMode === 'family'" class="bracket-member-tabs">
          <button
            v-for="id in ['mine', 'yours']"
            :key="id"
            class="bracket-member-tab"
            :class="{ active: activeTaxMember === id }"
            @click="activeTaxMember = id"
          >
            <div class="member-color" :class="id"></div>
            {{ budgetStore.familyMembers[id].name }}
          </button>
        </div>

        <!-- Filing status + State row -->
        <div class="bracket-row">
          <div class="tax-field">
            <label class="field-label">Filing Status</label>
            <div class="filing-toggle">
              <button
                v-for="f in filingOptions"
                :key="f.value"
                class="filing-btn"
                :class="{ active: currentTaxMember.filingStatus === f.value }"
                @click="updateTaxMember('filingStatus', f.value)"
              >{{ f.label }}</button>
            </div>
          </div>
          <div class="tax-field">
            <label class="field-label">State</label>
            <select class="select-input" :value="currentTaxMember.state" @change="updateTaxMember('state', $event.target.value)">
              <option v-for="s in stateOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Federal bracket picker -->
        <div class="tax-field">
          <label class="field-label">Federal Income Tax Bracket</label>
          <div class="bracket-grid">
            <button
              v-for="b in incomeBrackets"
              :key="b.rate"
              class="bracket-card"
              :class="{ selected: currentBracket === b.rate }"
              @click="selectBracket(b.rate)"
            >
              <span class="bracket-rate">{{ b.rate }}%</span>
              <span class="bracket-range">{{ b.range(currentTaxMember.filingStatus) }}</span>
            </button>
          </div>
        </div>

        <!-- Capital gains picker -->
        <div class="tax-field">
          <label class="field-label">Long-Term Capital Gains Rate</label>
          <div class="capgains-grid">
            <button
              v-for="c in capGainsOptions"
              :key="c.rate"
              class="bracket-card capgains-card"
              :class="{ selected: currentCapGains === c.rate }"
              @click="selectCapGains(c.rate)"
            >
              <span class="bracket-rate">{{ c.rate }}%</span>
              <span class="bracket-range">{{ c.label }}</span>
            </button>
          </div>
        </div>

        <!-- Advanced toggle -->
        <button class="advanced-toggle" @click="showAdvanced = !showAdvanced">
          <ChevronDown :size="14" stroke-width="2" :class="['adv-chevron', { rotated: showAdvanced }]" />
          Advanced — edit exact income
        </button>

        <div v-if="showAdvanced" class="advanced-section">
          <div class="tax-field">
            <label class="field-label">Salary</label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">$</span>
              <input type="number" class="number-input" :value="currentTaxMember.salary" @input="updateTaxMember('salary', Number($event.target.value))" min="0" step="1000" />
            </div>
          </div>
          <div class="tax-field">
            <label class="field-label">Business Income</label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">$</span>
              <input type="number" class="number-input" :value="currentTaxMember.businessIncome" @input="updateTaxMember('businessIncome', Number($event.target.value))" min="0" step="1000" />
            </div>
          </div>
          <div class="tax-field">
            <label class="field-label">Short-term Investment Income</label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">$</span>
              <input type="number" class="number-input" :value="currentTaxMember.shortTermInvestmentIncome" @input="updateTaxMember('shortTermInvestmentIncome', Number($event.target.value))" min="0" step="500" />
            </div>
          </div>
          <div class="tax-field">
            <label class="field-label">Long-term Investment Income</label>
            <div class="currency-input-wrap">
              <span class="currency-prefix">$</span>
              <input type="number" class="number-input" :value="currentTaxMember.longTermInvestmentIncome" @input="updateTaxMember('longTermInvestmentIncome', Number($event.target.value))" min="0" step="500" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { usePortfolioStore } from '@/stores/portfolio'
import { User, Users, Briefcase, LogOut, Database, Landmark, Upload, ChevronDown } from 'lucide-vue-next'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'
import PlaidLink from '@/components/banking/PlaidLink.vue'
import { parseCSV } from '@/utils/csvParser'
import { useCreditCardStore } from '@/stores/creditCardStore'

const budgetStore = useBudgetStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const portfolioStore = usePortfolioStore()
const cardStore = useCreditCardStore()

async function switchDataSource(source) {
  settingsStore.setDataSource(source)
  await Promise.all([
    budgetStore.loadExpenses(),
    portfolioStore.loadHoldings(),
  ])
  if (source === 'csv') {
    refreshCSVSummary()
    cardStore.syncPortfolioWithCSV()
    budgetStore.loadHistoricalData()
  }
}

// CSV upload state
const csvFileName = ref('')
const csvErrors = ref([])
const csvSummary = ref('')

function refreshCSVSummary() {
  try {
    const raw = localStorage.getItem('vision-csv-transactions')
    if (!raw) { csvSummary.value = ''; return }
    const txns = JSON.parse(raw)
    if (!txns.length) { csvSummary.value = ''; return }
    const dates = txns.map(t => t.date).sort()
    csvSummary.value = `${txns.length} transactions loaded (${dates[0]} to ${dates[dates.length - 1]})`
  } catch { csvSummary.value = '' }
}

// Initialize summary on load if CSV mode
if (settingsStore.dataSource === 'csv') refreshCSVSummary()

function handleCSVUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  csvFileName.value = file.name
  csvErrors.value = []

  const reader = new FileReader()
  reader.onload = async (e) => {
    const { transactions, errors } = parseCSV(e.target.result)
    if (errors.length) csvErrors.value = errors
    if (!transactions.length) return

    localStorage.setItem('vision-csv-transactions', JSON.stringify(transactions))
    refreshCSVSummary()
    await cardStore.initialize()
    cardStore.syncPortfolioWithCSV()
    await budgetStore.loadExpenses()
    budgetStore.loadHistoricalData()
  }
  reader.readAsText(file)
}

async function clearCSVData() {
  localStorage.removeItem('vision-csv-transactions')
  csvSummary.value = ''
  csvFileName.value = ''
  csvErrors.value = []
  await budgetStore.loadExpenses()
}

const activeMember = computed(() => budgetStore.familyMembers[budgetStore.personalMember])

const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

// --- Tax Bracket Picker ---
const activeTaxMember = ref('mine')
const showAdvanced = ref(false)

const filingOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Head of Household', value: 'hoh' },
]

const incomeBrackets = [
  { rate: 10, range: (f) => f === 'married' ? 'Up to $23K' : f === 'hoh' ? 'Up to $17K' : 'Up to $12K' },
  { rate: 12, range: (f) => f === 'married' ? '$23K – $94K' : f === 'hoh' ? '$17K – $63K' : '$12K – $47K' },
  { rate: 22, range: (f) => f === 'married' ? '$94K – $201K' : f === 'hoh' ? '$63K – $101K' : '$47K – $101K' },
  { rate: 24, range: (f) => f === 'married' ? '$201K – $384K' : f === 'hoh' ? '$101K – $192K' : '$101K – $192K' },
  { rate: 32, range: (f) => f === 'married' ? '$384K – $487K' : f === 'hoh' ? '$192K – $244K' : '$192K – $244K' },
  { rate: 35, range: (f) => f === 'married' ? '$487K – $731K' : f === 'hoh' ? '$244K – $609K' : '$244K – $609K' },
  { rate: 37, range: (f) => f === 'married' ? 'Over $731K' : f === 'hoh' ? 'Over $609K' : 'Over $609K' },
]

const capGainsOptions = [
  { rate: 0,  label: 'Lower incomes' },
  { rate: 15, label: 'Most taxpayers' },
  { rate: 20, label: 'High earners' },
]

const BRACKET_SALARY_MAP = {
  single:  { 10: 20000, 12: 44000, 22: 90000, 24: 165000, 32: 230000, 35: 440000, 37: 700000 },
  married: { 10: 30000, 12: 88000, 22: 177000, 24: 322000, 32: 465000, 35: 638000, 37: 850000 },
  hoh:     { 10: 22000, 12: 55000, 22: 100000, 24: 165000, 32: 235000, 35: 445000, 37: 700000 },
}

// Reverse-map: salary → closest bracket rate
function salaryToBracket(salary, filingStatus) {
  const map = BRACKET_SALARY_MAP[filingStatus] || BRACKET_SALARY_MAP.single
  let closest = 22
  let minDiff = Infinity
  for (const [rate, mid] of Object.entries(map)) {
    const diff = Math.abs(salary - mid)
    if (diff < minDiff) { minDiff = diff; closest = Number(rate) }
  }
  return closest
}

const currentTaxMember = computed(() => {
  if (budgetStore.budgetMode === 'family') return budgetStore.familyMembers[activeTaxMember.value]
  return budgetStore.familyMembers[budgetStore.personalMember]
})

const currentBracket = computed(() =>
  salaryToBracket(currentTaxMember.value.salary, currentTaxMember.value.filingStatus)
)

const currentCapGains = computed(() => {
  const ltgi = currentTaxMember.value.longTermInvestmentIncome || 0
  if (ltgi === 0) return 15
  // Approximate: check which cap gains rate best fits
  const salary = currentTaxMember.value.salary
  const total = salary + ltgi
  if (currentTaxMember.value.filingStatus === 'married') {
    if (total <= 94050) return 0
    if (total <= 583750) return 15
    return 20
  }
  if (total <= 47025) return 0
  if (total <= 518900) return 15
  return 20
})

function selectBracket(rate) {
  const memberId = budgetStore.budgetMode === 'family' ? activeTaxMember.value : budgetStore.personalMember
  const filing = currentTaxMember.value.filingStatus
  const salaryMap = BRACKET_SALARY_MAP[filing] || BRACKET_SALARY_MAP.single
  budgetStore.updateMemberSetting(memberId, 'salary', salaryMap[rate] || 90000)
}

function selectCapGains(rate) {
  const memberId = budgetStore.budgetMode === 'family' ? activeTaxMember.value : budgetStore.personalMember
  // Set a representative long-term investment income based on rate
  const ltgiMap = { 0: 0, 15: 5000, 20: 25000 }
  budgetStore.updateMemberSetting(memberId, 'longTermInvestmentIncome', ltgiMap[rate] ?? 5000)
}

function updateTaxMember(field, value) {
  const memberId = budgetStore.budgetMode === 'family' ? activeTaxMember.value : budgetStore.personalMember
  budgetStore.updateMemberSetting(memberId, field, value)
}
</script>

<style scoped>
.settings {
  max-width: 720px;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-description {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

/* Mode toggle */
.mode-toggle {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  padding: 10px 14px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mode-btn:hover {
  color: var(--text-primary);
}

.mode-btn.active {
  background: var(--accent-blue);
  color: #F1F5F9;
}

/* Business toggle row */
.business-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
}

.business-toggle-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.business-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.business-toggle-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.business-toggle-hint {
  display: block;
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: 22px;
  transition: all 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: var(--text-tertiary);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
  background: #F1F5F9;
}

/* Family Members */
.members-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.member-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-color.mine {
  background: #14b8a6;
}

.member-color.yours {
  background: #06B6D4;
}

.member-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filing-mapping {
  padding-top: 20px;
  border-top: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-hint {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.mapping-toggle {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
  width: fit-content;
}

.map-btn {
  padding: 7px 18px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.map-btn:hover {
  color: var(--text-primary);
}

.map-btn.active {
  background: var(--accent-blue);
  color: #F1F5F9;
}

/* Tax Information */
.tax-members {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.tax-member-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tax-member-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-glass);
}

.tax-member-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.tax-single {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tax-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.text-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: var(--accent-blue);
}

.currency-input-wrap {
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  overflow: hidden;
  transition: border-color 0.2s;
}

.currency-input-wrap:focus-within {
  border-color: var(--accent-blue);
}

.currency-prefix {
  padding: 0 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-tertiary);
  pointer-events: none;
}

.number-input {
  width: 100%;
  padding: 9px 12px 9px 4px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Lexend', sans-serif;
  outline: none;
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  opacity: 1;
}

.select-input {
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: auto;
}

.select-input:focus {
  border-color: var(--accent-blue);
}

.sign-out-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
  color: var(--negative);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sign-out-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
}

.data-source-detail {
  margin-top: 16px;
}

.data-source-hint {
  margin-top: 12px;
  font-size: 0.78rem;
  color: var(--text-tertiary);
}

/* CSV Upload */
.csv-upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.csv-file-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: 1.5px dashed var(--border-glass);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.csv-file-label:hover {
  border-color: var(--accent-blue);
  color: var(--text-primary);
}

.csv-file-input {
  display: none;
}

.csv-format-hint {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  line-height: 1.5;
}

.csv-format-hint code {
  background: var(--bg-subtle);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.72rem;
}

.csv-errors {
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
}

.csv-errors p {
  font-size: 0.78rem;
  color: var(--negative);
  margin: 2px 0;
}

.csv-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-sm);
}

.csv-summary-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--positive, #10b981);
}

.csv-clear-btn {
  padding: 5px 12px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.08);
  color: var(--negative);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.csv-clear-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
}

/* Tax Bracket Picker */
.bracket-member-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.bracket-member-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bracket-member-tab:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.bracket-member-tab.active {
  background: rgba(59, 130, 246, 0.08);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}

.bracket-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.filing-toggle {
  display: flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.filing-btn {
  flex: 1;
  padding: 7px 10px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filing-btn:hover {
  color: var(--text-primary);
}

.filing-btn.active {
  background: var(--accent-blue);
  color: #F1F5F9;
}

.bracket-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.bracket-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
}

.bracket-card:hover {
  border-color: var(--text-tertiary);
  background: var(--bg-base);
}

.bracket-card.selected {
  border-color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.08);
}

.bracket-rate {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.bracket-card.selected .bracket-rate {
  color: var(--accent-blue);
}

.bracket-range {
  font-size: 0.68rem;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.2;
}

.capgains-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.advanced-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-tertiary);
  font-size: 0.78rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s;
}

.advanced-toggle:hover {
  color: var(--text-secondary);
}

.adv-chevron {
  transition: transform 0.2s ease;
}

.adv-chevron.rotated {
  transform: rotate(180deg);
}

.advanced-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-glass);
}

@media (max-width: 640px) {
  .bracket-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bracket-row {
    grid-template-columns: 1fr;
  }
}
</style>

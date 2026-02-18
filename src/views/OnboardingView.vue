<template>
  <div class="onboarding-page">
    <div class="onboarding-card">
      <div class="onboarding-brand">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="48" height="48" class="onboarding-logo">
          <g transform="translate(50,50)">
            <circle cx="0" cy="0" r="28" fill="none" stroke="currentColor" stroke-width="4"/>
            <ellipse cx="0" cy="0" rx="42" ry="17" fill="none" stroke="currentColor" stroke-width="2.5" transform="rotate(-20)"/>
            <circle cx="40" cy="-16" r="5" fill="currentColor"/>
          </g>
        </svg>
        <h1 class="onboarding-title">VISION</h1>
        <p class="onboarding-subtitle">Let's set up your profile</p>
      </div>

      <!-- Progress indicator -->
      <div class="step-indicator">
        <div
          v-for="n in 3"
          :key="n"
          class="step-dot"
          :class="{ active: step === n, completed: step > n }"
        ></div>
      </div>

      <!-- Step 1: Mode -->
      <div v-if="step === 1" class="step-content">
        <h2 class="step-heading">Mode</h2>
        <p class="step-description">How will you use Vision?</p>

        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: localMode === 'personal' }"
            @click="localMode = 'personal'"
          >
            <User :size="14" stroke-width="2" />
            Personal
          </button>
          <button
            class="mode-btn"
            :class="{ active: localMode === 'family' }"
            @click="localMode = 'family'"
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
            <input type="checkbox" v-model="localBusinessEnabled" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- Family member names -->
        <div v-if="localMode === 'family'" class="family-setup">
          <div class="tax-field">
            <label class="field-label">Member 1 Name</label>
            <div class="member-row-input">
              <div class="member-color mine"></div>
              <input type="text" class="text-input" v-model="localMembers.mine.name" />
            </div>
          </div>
          <div class="tax-field">
            <label class="field-label">Member 2 Name</label>
            <div class="member-row-input">
              <div class="member-color yours"></div>
              <input type="text" class="text-input" v-model="localMembers.yours.name" />
            </div>
          </div>
          <div class="tax-field">
            <span class="field-label">Default filing member</span>
            <span class="field-hint">Used for personal &amp; business budget views</span>
            <div class="mapping-toggle">
              <button
                class="map-btn"
                :class="{ active: localPersonalMember === 'mine' }"
                @click="localPersonalMember = 'mine'"
              >
                {{ localMembers.mine.name }}
              </button>
              <button
                class="map-btn"
                :class="{ active: localPersonalMember === 'yours' }"
                @click="localPersonalMember = 'yours'"
              >
                {{ localMembers.yours.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-primary" @click="step = 2">
            Continue
            <ChevronRight :size="16" stroke-width="2" />
          </button>
        </div>
      </div>

      <!-- Step 2: Tax Bracket -->
      <div v-if="step === 2" class="step-content">
        <h2 class="step-heading">Tax Bracket</h2>
        <p class="step-description">Select your approximate tax brackets — you can fine-tune in Settings later</p>

        <!-- Family mode: tabs for each member -->
        <div v-if="localMode === 'family'" class="family-bracket-tabs">
          <button
            v-for="id in ['mine', 'yours']"
            :key="id"
            class="bracket-member-tab"
            :class="{ active: activeBracketMember === id }"
            @click="activeBracketMember = id"
          >
            <div class="member-color" :class="id"></div>
            {{ localMembers[id].name }}
          </button>
        </div>

        <!-- Filing status + State row -->
        <div class="bracket-row">
          <div class="tax-field bracket-field">
            <label class="field-label">Filing Status</label>
            <div class="filing-toggle">
              <button
                v-for="f in filingOptions"
                :key="f.value"
                class="filing-btn"
                :class="{ active: currentMemberData.filingStatus === f.value }"
                @click="currentMemberData.filingStatus = f.value"
              >{{ f.label }}</button>
            </div>
          </div>
          <div class="tax-field bracket-field">
            <label class="field-label">State</label>
            <select class="select-input" v-model="currentMemberData.state">
              <option v-for="s in stateOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <!-- Federal income bracket picker -->
        <div class="tax-field">
          <label class="field-label">Federal Income Tax Bracket</label>
          <div class="bracket-grid">
            <button
              v-for="b in incomeBrackets"
              :key="b.rate"
              class="bracket-card"
              :class="{ selected: currentMemberData.selectedBracket === b.rate }"
              @click="currentMemberData.selectedBracket = b.rate"
            >
              <span class="bracket-rate">{{ b.rate }}%</span>
              <span class="bracket-range">{{ b.range(currentMemberData.filingStatus) }}</span>
            </button>
          </div>
        </div>

        <!-- Capital gains rate picker -->
        <div class="tax-field">
          <label class="field-label">Long-Term Capital Gains Rate</label>
          <div class="capgains-grid">
            <button
              v-for="c in capGainsOptions"
              :key="c.rate"
              class="bracket-card capgains-card"
              :class="{ selected: currentMemberData.selectedCapGains === c.rate }"
              @click="currentMemberData.selectedCapGains = c.rate"
            >
              <span class="bracket-rate">{{ c.rate }}%</span>
              <span class="bracket-range">{{ c.label }}</span>
            </button>
          </div>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" @click="step = 1">
            <ChevronLeft :size="16" stroke-width="2" />
            Back
          </button>
          <button class="btn-skip" @click="skippedTax = true; step = 3">
            Skip for now
          </button>
          <button class="btn-primary" @click="skippedTax = false; step = 3">
            Continue
            <ChevronRight :size="16" stroke-width="2" />
          </button>
        </div>
      </div>

      <!-- Step 3: Review & Confirm -->
      <div v-if="step === 3" class="step-content">
        <h2 class="step-heading">Review & Confirm</h2>
        <p class="step-description">Make sure everything looks right</p>

        <div class="review-section">
          <div class="review-row">
            <span class="review-label">Mode</span>
            <span class="review-value">{{ localMode.charAt(0).toUpperCase() + localMode.slice(1) }}</span>
          </div>
          <div class="review-row">
            <span class="review-label">Business</span>
            <span class="review-value" :class="{ 'review-skipped': !localBusinessEnabled }">{{ localBusinessEnabled ? 'Enabled' : 'Disabled' }}</span>
          </div>

          <div v-if="skippedTax" class="review-row">
            <span class="review-label">Tax Brackets</span>
            <span class="review-value review-skipped">Skipped — defaults applied</span>
          </div>

          <template v-if="!skippedTax">
            <template v-if="localMode === 'family'">
              <div v-for="id in ['mine', 'yours']" :key="id" class="review-member">
                <div class="review-member-header">
                  <div class="member-color" :class="id"></div>
                  <span class="review-member-name">{{ localMembers[id].name }}</span>
                  <span v-if="id === localPersonalMember" class="review-badge">Default</span>
                </div>
                <div class="review-details">
                  <div class="review-row">
                    <span class="review-label">Federal Bracket</span>
                    <span class="review-value">{{ localMembers[id].selectedBracket || 22 }}%</span>
                  </div>
                  <div class="review-row">
                    <span class="review-label">Capital Gains</span>
                    <span class="review-value">{{ localMembers[id].selectedCapGains ?? 15 }}%</span>
                  </div>
                  <div class="review-row">
                    <span class="review-label">Filing Status</span>
                    <span class="review-value">{{ filingLabel(localMembers[id].filingStatus) }}</span>
                  </div>
                  <div class="review-row">
                    <span class="review-label">State</span>
                    <span class="review-value">{{ localMembers[id].state }}</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="review-details">
                <div class="review-row">
                  <span class="review-label">Federal Bracket</span>
                  <span class="review-value">{{ localMembers[localPersonalMember].selectedBracket || 22 }}%</span>
                </div>
                <div class="review-row">
                  <span class="review-label">Capital Gains</span>
                  <span class="review-value">{{ localMembers[localPersonalMember].selectedCapGains ?? 15 }}%</span>
                </div>
                <div class="review-row">
                  <span class="review-label">Filing Status</span>
                  <span class="review-value">{{ filingLabel(localMembers[localPersonalMember].filingStatus) }}</span>
                </div>
                <div class="review-row">
                  <span class="review-label">State</span>
                  <span class="review-value">{{ localMembers[localPersonalMember].state }}</span>
                </div>
              </div>
            </template>
          </template>
        </div>

        <div class="step-actions">
          <button class="btn-secondary" @click="step = 2">
            <ChevronLeft :size="16" stroke-width="2" />
            Back
          </button>
          <button class="btn-primary btn-get-started" @click="finish">
            <Rocket :size="16" stroke-width="2" />
            Get Started
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '@/stores/budget'
import { User, Users, Briefcase, ChevronRight, ChevronLeft, Rocket } from 'lucide-vue-next'

const router = useRouter()
const budgetStore = useBudgetStore()

const step = ref(1)
const skippedTax = ref(false)
const localMode = ref('personal')
const localBusinessEnabled = ref(false)
const localPersonalMember = ref('mine')
const activeBracketMember = ref('mine')
const localMembers = reactive({
  mine: {
    id: 'mine',
    name: 'Person 1',
    salary: 0,
    businessIncome: 0,
    shortTermInvestmentIncome: 0,
    longTermInvestmentIncome: 0,
    filingStatus: 'single',
    state: 'CA',
    selectedBracket: 22,
    selectedCapGains: 15,
  },
  yours: {
    id: 'yours',
    name: 'Person 2',
    salary: 0,
    businessIncome: 0,
    shortTermInvestmentIncome: 0,
    longTermInvestmentIncome: 0,
    filingStatus: 'single',
    state: 'CA',
    selectedBracket: 22,
    selectedCapGains: 15,
  }
})

const currentMemberData = computed(() => {
  if (localMode.value === 'family') return localMembers[activeBracketMember.value]
  return localMembers[localPersonalMember.value]
})

const filingOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Head of Household', value: 'hoh' },
]

// Federal income tax brackets with income ranges per filing status
const incomeBrackets = [
  {
    rate: 10,
    range: (f) => f === 'married' ? 'Up to $23K' : f === 'hoh' ? 'Up to $17K' : 'Up to $12K'
  },
  {
    rate: 12,
    range: (f) => f === 'married' ? '$23K – $94K' : f === 'hoh' ? '$17K – $63K' : '$12K – $47K'
  },
  {
    rate: 22,
    range: (f) => f === 'married' ? '$94K – $201K' : f === 'hoh' ? '$63K – $101K' : '$47K – $101K'
  },
  {
    rate: 24,
    range: (f) => f === 'married' ? '$201K – $384K' : f === 'hoh' ? '$101K – $192K' : '$101K – $192K'
  },
  {
    rate: 32,
    range: (f) => f === 'married' ? '$384K – $487K' : f === 'hoh' ? '$192K – $244K' : '$192K – $244K'
  },
  {
    rate: 35,
    range: (f) => f === 'married' ? '$487K – $731K' : f === 'hoh' ? '$244K – $609K' : '$244K – $609K'
  },
  {
    rate: 37,
    range: (f) => f === 'married' ? 'Over $731K' : f === 'hoh' ? 'Over $609K' : 'Over $609K'
  },
]

const capGainsOptions = [
  { rate: 0,  label: 'Lower incomes' },
  { rate: 15, label: 'Most taxpayers' },
  { rate: 20, label: 'High earners' },
]

// Map selected bracket → representative salary (midpoint of bracket range + standard deduction)
const BRACKET_SALARY_MAP = {
  single: { 10: 20000, 12: 44000, 22: 90000, 24: 165000, 32: 230000, 35: 440000, 37: 700000 },
  married: { 10: 30000, 12: 88000, 22: 177000, 24: 322000, 32: 465000, 35: 638000, 37: 850000 },
  hoh: { 10: 22000, 12: 55000, 22: 100000, 24: 165000, 32: 235000, 35: 445000, 37: 700000 },
}

const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

function filingLabel(status) {
  const labels = { single: 'Single', married: 'Married Filing Jointly', hoh: 'Head of Household' }
  return labels[status] || status
}

function finish() {
  // Apply settings to store
  budgetStore.setBudgetMode(localMode.value)
  budgetStore.setBusinessEnabled(localBusinessEnabled.value)
  budgetStore.setPersonalMember(localPersonalMember.value)

  // Copy member data into the store, mapping brackets to salary
  for (const id of ['mine', 'yours']) {
    const m = localMembers[id]
    budgetStore.updateMemberName(id, m.name)
    budgetStore.updateMemberSetting(id, 'filingStatus', m.filingStatus)
    budgetStore.updateMemberSetting(id, 'state', m.state)

    if (!skippedTax.value) {
      // Map selected bracket to representative salary
      const salaryMap = BRACKET_SALARY_MAP[m.filingStatus] || BRACKET_SALARY_MAP.single
      const salary = salaryMap[m.selectedBracket] || 90000
      budgetStore.updateMemberSetting(id, 'salary', salary)
      budgetStore.updateMemberSetting(id, 'businessIncome', 0)
      budgetStore.updateMemberSetting(id, 'shortTermInvestmentIncome', 0)
      budgetStore.updateMemberSetting(id, 'longTermInvestmentIncome', 0)
    }
  }

  budgetStore.completeOnboarding()
  router.push('/')
}
</script>

<style scoped>
.onboarding-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
}

.onboarding-card {
  width: 100%;
  max-width: 560px;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  padding: 40px 32px;
  background-image: var(--gradient-card);
  box-shadow: var(--shadow-glass);
  margin: auto;
}

.onboarding-brand {
  text-align: center;
  margin-bottom: 20px;
}

.onboarding-logo {
  color: var(--violet-pop);
  margin-bottom: 12px;
}

.onboarding-title {
  font-family: 'Lexend', sans-serif;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.25em;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.onboarding-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Step indicator */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: var(--electric-teal);
  border-color: var(--electric-teal);
  transform: scale(1.3);
}

.step-dot.completed {
  background: var(--electric-teal);
  border-color: var(--electric-teal);
  opacity: 0.5;
}

/* Step content */
.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-heading {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.step-description {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Mode toggle — reuse from Settings */
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
  background: var(--electric-teal);
  color: #000;
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
  background: var(--electric-teal);
  border-color: var(--electric-teal);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
  background: #000;
}

/* Family setup */
.family-setup {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.member-row-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.member-row-input .text-input {
  flex: 1;
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
  background: var(--electric-teal);
  color: #000;
}

/* Tax fields — reuse from Settings */
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

.field-hint {
  font-size: 0.72rem;
  color: var(--text-tertiary);
  margin-bottom: 8px;
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
  border-color: var(--electric-teal);
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
  border-color: var(--electric-teal);
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
  border-color: var(--electric-teal);
}

/* Review section */
.review-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.review-label {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.review-value {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
}

.review-member {
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px;
}

.review-member-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-glass);
}

.review-member-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.review-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--electric-teal);
  color: #000;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.review-details {
  display: flex;
  flex-direction: column;
}

/* Action buttons */
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 28px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--electric-teal);
  color: #000;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 22px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.btn-skip {
  padding: 11px 22px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-skip:hover {
  color: var(--text-primary);
}

.review-skipped {
  color: var(--text-tertiary);
  font-style: italic;
  font-weight: 500;
}

.btn-get-started {
  padding: 12px 28px;
  font-size: 0.92rem;
}

/* Bracket picker */
.family-bracket-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.bracket-member-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  padding: 10px 14px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bracket-member-tab:hover {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.bracket-member-tab.active {
  background: var(--electric-teal);
  color: #000;
  border-color: var(--electric-teal);
}

.bracket-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 8px;
}

.bracket-field { margin-bottom: 0; }

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
  padding: 8px 6px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filing-btn:hover { color: var(--text-primary); }

.filing-btn.active {
  background: var(--electric-teal);
  color: #000;
}

.bracket-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.capgains-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.bracket-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 14px 8px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
}

.bracket-card:hover {
  border-color: var(--text-tertiary);
  transform: translateY(-1px);
}

.bracket-card.selected {
  border-color: var(--electric-teal);
  background: rgba(20, 184, 166, 0.08);
  box-shadow: 0 0 0 1px var(--electric-teal);
}

.bracket-rate {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
}

.bracket-card.selected .bracket-rate {
  color: var(--electric-teal);
}

.bracket-range {
  font-size: 0.65rem;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.3;
}

.capgains-card {
  padding: 16px 12px;
}

.capgains-card .bracket-range {
  font-size: 0.72rem;
}

@media (max-width: 640px) {
  .onboarding-card {
    padding: 28px 20px;
  }

  .bracket-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .bracket-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .bracket-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

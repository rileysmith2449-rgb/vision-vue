<template>
  <div class="settings">
    <Header title="Settings" subtitle="Customize your experience" />

    <div class="settings-grid">
      <PlaidLink />

      <Card title="Appearance" subtitle="Toggle between light and dark mode">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Theme</span>
            <span class="setting-description">{{ themeStore.isDark ? 'Dark mode' : 'Light mode' }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: themeStore.isDark }" @click="themeStore.toggleTheme()">
            <span class="toggle-knob">
              <Moon v-if="themeStore.isDark" :size="12" stroke-width="2" />
              <Sun v-else :size="12" stroke-width="2" />
            </span>
          </button>
        </div>
      </Card>

      <!-- Family Members card (family mode only) -->
      <Card
        v-if="budgetStore.budgetMode === 'family'"
        title="Family Members"
        subtitle="Edit names for each household member"
      >
        <div class="settings-form">
          <div v-for="(member, id) in budgetStore.familyMembers" :key="id" class="setting-row">
            <div class="setting-info">
              <span class="setting-label">{{ id === 'mine' ? 'Mine' : 'Yours' }}</span>
              <span class="setting-description">Display name</span>
            </div>
            <div class="input-wrapper">
              <input
                type="text"
                class="form-input"
                :value="member.name"
                @input="budgetStore.updateMemberName(id, $event.target.value)"
              />
            </div>
          </div>
        </div>
      </Card>

      <!-- Per-member Income cards (family mode) -->
      <template v-if="budgetStore.budgetMode === 'family'">
        <Card
          v-for="(member, id) in budgetStore.familyMembers"
          :key="'income-' + id"
          :title="member.name + ' — Income'"
          subtitle="Annual income for tax calculations"
        >
          <div class="settings-form">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">W-2 Salary</span>
                <span class="setting-description">Annual gross salary</span>
              </div>
              <div class="input-wrapper">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  class="form-input"
                  :value="member.salary"
                  @input="budgetStore.updateMemberSetting(id, 'salary', Number($event.target.value) || 0)"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Business / Side Income</span>
                <span class="setting-description">1099, freelance, etc.</span>
              </div>
              <div class="input-wrapper">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  class="form-input"
                  :value="member.businessIncome"
                  @input="budgetStore.updateMemberSetting(id, 'businessIncome', Number($event.target.value) || 0)"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Short-Term Investment Income</span>
                <span class="setting-description">Gains held &lt; 1 year, taxed as ordinary</span>
              </div>
              <div class="input-wrapper">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  class="form-input"
                  :value="member.shortTermInvestmentIncome"
                  @input="budgetStore.updateMemberSetting(id, 'shortTermInvestmentIncome', Number($event.target.value) || 0)"
                />
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Long-Term Investment Income</span>
                <span class="setting-description">Gains held &gt; 1 year, preferential rate</span>
              </div>
              <div class="input-wrapper">
                <span class="input-prefix">$</span>
                <input
                  type="number"
                  class="form-input"
                  :value="member.longTermInvestmentIncome"
                  @input="budgetStore.updateMemberSetting(id, 'longTermInvestmentIncome', Number($event.target.value) || 0)"
                />
              </div>
            </div>
          </div>
        </Card>
      </template>

      <!-- Single Income card (personal/business mode) — mapped to a family member -->
      <Card v-else title="Income" subtitle="Your annual income for tax calculations">
        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Person</span>
              <span class="setting-description">Which family member is this budget for?</span>
            </div>
            <div class="person-toggle">
              <button
                v-for="(member, id) in budgetStore.familyMembers"
                :key="id"
                class="person-btn"
                :class="{ active: budgetStore.personalMember === id }"
                @click="budgetStore.setPersonalMember(id)"
              >
                {{ member.name }}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">W-2 Salary</span>
              <span class="setting-description">Annual gross salary</span>
            </div>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-input"
                :value="budgetStore.activePersonalMember.salary"
                @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'salary', Number($event.target.value) || 0)"
              />
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Business / Side Income</span>
              <span class="setting-description">1099, freelance, etc.</span>
            </div>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-input"
                :value="budgetStore.activePersonalMember.businessIncome"
                @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'businessIncome', Number($event.target.value) || 0)"
              />
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Short-Term Investment Income</span>
              <span class="setting-description">Gains held &lt; 1 year, taxed as ordinary</span>
            </div>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-input"
                :value="budgetStore.activePersonalMember.shortTermInvestmentIncome"
                @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'shortTermInvestmentIncome', Number($event.target.value) || 0)"
              />
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Long-Term Investment Income</span>
              <span class="setting-description">Gains held &gt; 1 year, preferential rate</span>
            </div>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-input"
                :value="budgetStore.activePersonalMember.longTermInvestmentIncome"
                @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'longTermInvestmentIncome', Number($event.target.value) || 0)"
              />
            </div>
          </div>

          <div class="tax-summary">
            <div class="setting-row summary-row">
              <span class="setting-label">Ordinary Income</span>
              <span class="summary-value">{{ formatCurrency(budgetStore.ordinaryIncome) }}</span>
            </div>
            <div class="setting-row summary-row">
              <span class="setting-label">Gross Income</span>
              <span class="summary-value">{{ formatCurrency(budgetStore.grossIncome) }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Per-member Tax Settings cards (family mode) -->
      <template v-if="budgetStore.budgetMode === 'family'">
        <Card
          v-for="(member, id) in budgetStore.familyMembers"
          :key="'tax-' + id"
          :title="member.name + ' — Tax Settings'"
          subtitle="Configure tax parameters"
        >
          <div class="settings-form">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">Filing Status</span>
              </div>
              <select
                class="form-select"
                :value="member.filingStatus"
                @change="budgetStore.updateMemberSetting(id, 'filingStatus', $event.target.value)"
              >
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">State</span>
                <span class="setting-description">For state income tax</span>
              </div>
              <select
                class="form-select"
                :value="member.state"
                @change="budgetStore.updateMemberSetting(id, 'state', $event.target.value)"
              >
                <option v-for="s in states" :key="s.code" :value="s.code">{{ s.name }}</option>
              </select>
            </div>
          </div>
        </Card>

        <!-- Household tax summary -->
        <Card title="Household Tax Summary" subtitle="Combined taxes for all members">
          <div class="settings-form">
            <div class="tax-summary">
              <div class="setting-row summary-row">
                <span class="setting-label">Federal Tax</span>
                <span class="summary-value">{{ formatCurrency(budgetStore.federalTax) }} <span class="rate-tag">{{ budgetStore.federalEffectiveRate.toFixed(1) }}%</span></span>
              </div>
              <div class="setting-row summary-row">
                <span class="setting-label">State Tax</span>
                <span class="summary-value">{{ formatCurrency(budgetStore.stateTax) }} <span class="rate-tag">{{ budgetStore.stateEffectiveRate.toFixed(1) }}%</span></span>
              </div>
              <div class="setting-row summary-row total">
                <span class="setting-label">Effective Rate</span>
                <span class="summary-value highlight">{{ budgetStore.effectiveRate.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </Card>
      </template>

      <!-- Single Tax Settings card (personal/business mode) — mapped to family member -->
      <Card v-else title="Tax Settings" subtitle="Configure your tax parameters">
        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Filing Status</span>
            </div>
            <select
              class="form-select"
              :value="budgetStore.activePersonalMember.filingStatus"
              @change="budgetStore.updateMemberSetting(budgetStore.personalMember, 'filingStatus', $event.target.value)"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="hoh">Head of Household</option>
            </select>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">State</span>
              <span class="setting-description">For state income tax</span>
            </div>
            <select
              class="form-select"
              :value="budgetStore.activePersonalMember.state"
              @change="budgetStore.updateMemberSetting(budgetStore.personalMember, 'state', $event.target.value)"
            >
              <option v-for="s in states" :key="s.code" :value="s.code">{{ s.name }}</option>
            </select>
          </div>

          <div class="tax-summary">
            <div class="setting-row summary-row">
              <span class="setting-label">Federal Tax</span>
              <span class="summary-value">{{ formatCurrency(budgetStore.federalTax) }} <span class="rate-tag">{{ budgetStore.federalEffectiveRate.toFixed(1) }}%</span></span>
            </div>
            <div class="setting-row summary-row">
              <span class="setting-label">State Tax</span>
              <span class="summary-value">{{ formatCurrency(budgetStore.stateTax) }} <span class="rate-tag">{{ budgetStore.stateEffectiveRate.toFixed(1) }}%</span></span>
            </div>
            <div class="setting-row summary-row total">
              <span class="setting-label">Effective Rate</span>
              <span class="summary-value highlight">{{ budgetStore.effectiveRate.toFixed(1) }}%</span>
            </div>
          </div>

          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Monthly Budget</span>
            </div>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                type="number"
                class="form-input"
                :value="budgetStore.monthlyBudget"
                @input="budgetStore.monthlyBudget = Number($event.target.value) || 0"
              />
            </div>
          </div>
        </div>
      </Card>

      <div class="disclaimer">
        All figures shown are estimates for informational purposes only and do not constitute financial, tax, or legal advice. Calculations are simplified and may not reflect your complete tax situation, including deductions, credits, AMT, NIIT, or other provisions of federal, state, or local tax law. Consult a qualified tax professional or financial advisor before making any financial decisions.
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useBudgetStore } from '@/stores/budget'
import { formatCurrency } from '@/utils/formatters'
import { Sun, Moon } from 'lucide-vue-next'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'
import PlaidLink from '@/components/banking/PlaidLink.vue'

const themeStore = useThemeStore()
const budgetStore = useBudgetStore()

const states = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'Washington D.C.' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
]
</script>

<style scoped>
.settings {
  max-width: 720px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-form {
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

.toggle-btn {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: var(--electric-teal);
  border-color: var(--electric-teal);
}

.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: var(--text-secondary);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(24px);
  color: var(--electric-teal);
}

.form-select {
  padding: 10px 14px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  min-width: 200px;
}

.form-select:focus {
  border-color: var(--electric-teal);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.2s ease;
  min-width: 200px;
}

.input-wrapper:focus-within {
  border-color: var(--electric-teal);
}

.input-prefix {
  padding: 0 10px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.form-input {
  flex: 1;
  padding: 10px 14px 10px 0;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  -moz-appearance: textfield;
}

.form-input::-webkit-outer-spin-button,
.form-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.tax-summary {
  padding: 14px 0;
  border-top: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  padding: 0;
}

.summary-row.total {
  padding-top: 10px;
  border-top: 1px solid var(--border-glass);
}

.summary-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-value.highlight {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--electric-teal);
}

.rate-tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.person-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.person-btn {
  padding: 5px 14px;
  border: none;
  border-radius: calc(var(--radius-sm) - 2px);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.person-btn:hover {
  color: var(--text-primary);
}

.person-btn.active {
  background: var(--violet-pop);
  color: #fff;
}

.disclaimer {
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--text-tertiary);
  padding: 16px 20px;
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
}
</style>

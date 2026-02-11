<template>
  <div class="settings">
    <Header title="Settings" subtitle="Customize your experience" />

    <div class="settings-grid">
      <!-- Appearance -->
      <Card title="Appearance" subtitle="Toggle between light and dark mode">
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-label">Theme</span>
            <span class="setting-description">{{ themeStore.isDark ? 'Dark mode' : 'Light mode' }}</span>
          </div>
          <button class="theme-toggle" :class="{ active: themeStore.isDark }" @click="themeStore.toggleTheme()">
            <span class="toggle-knob">
              <Moon v-if="themeStore.isDark" :size="12" stroke-width="2" />
              <Sun v-else :size="12" stroke-width="2" />
            </span>
          </button>
        </div>
      </Card>

      <!-- Budget Mode -->
      <Card title="Budget Mode" subtitle="Switch between personal, family, or business view">
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
          <button
            class="mode-btn"
            :class="{ active: budgetStore.budgetMode === 'business' }"
            @click="budgetStore.setBudgetMode('business')"
          >
            <Briefcase :size="14" stroke-width="2" />
            Business
          </button>
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

      <!-- Tax Information -->
      <Card title="Tax Information" :subtitle="budgetStore.budgetMode === 'family' ? 'Income and filing details for each family member' : 'Income and filing details'">
        <!-- Family mode: two member columns -->
        <template v-if="budgetStore.budgetMode === 'family'">
          <div class="tax-members">
            <div v-for="id in ['mine', 'yours']" :key="id" class="tax-member-col">
              <div class="tax-member-header">
                <div class="member-color" :class="id"></div>
                <span class="tax-member-name">{{ budgetStore.familyMembers[id].name }}</span>
              </div>

              <div class="tax-field">
                <label class="field-label">Salary</label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">$</span>
                  <input
                    type="number"
                    class="number-input"
                    :value="budgetStore.familyMembers[id].salary"
                    @input="budgetStore.updateMemberSetting(id, 'salary', Number($event.target.value))"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div class="tax-field">
                <label class="field-label">Business Income</label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">$</span>
                  <input
                    type="number"
                    class="number-input"
                    :value="budgetStore.familyMembers[id].businessIncome"
                    @input="budgetStore.updateMemberSetting(id, 'businessIncome', Number($event.target.value))"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div class="tax-field">
                <label class="field-label">Short-term Investment Income</label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">$</span>
                  <input
                    type="number"
                    class="number-input"
                    :value="budgetStore.familyMembers[id].shortTermInvestmentIncome"
                    @input="budgetStore.updateMemberSetting(id, 'shortTermInvestmentIncome', Number($event.target.value))"
                    min="0"
                    step="500"
                  />
                </div>
              </div>

              <div class="tax-field">
                <label class="field-label">Long-term Investment Income</label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">$</span>
                  <input
                    type="number"
                    class="number-input"
                    :value="budgetStore.familyMembers[id].longTermInvestmentIncome"
                    @input="budgetStore.updateMemberSetting(id, 'longTermInvestmentIncome', Number($event.target.value))"
                    min="0"
                    step="500"
                  />
                </div>
              </div>

              <div class="tax-field">
                <label class="field-label">Filing Status</label>
                <select
                  class="select-input"
                  :value="budgetStore.familyMembers[id].filingStatus"
                  @change="budgetStore.updateMemberSetting(id, 'filingStatus', $event.target.value)"
                >
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                  <option value="hoh">Head of Household</option>
                </select>
              </div>

              <div class="tax-field">
                <label class="field-label">State</label>
                <select
                  class="select-input"
                  :value="budgetStore.familyMembers[id].state"
                  @change="budgetStore.updateMemberSetting(id, 'state', $event.target.value)"
                >
                  <option v-for="s in stateOptions" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>
          </div>
        </template>

        <!-- Personal / Business mode: single person -->
        <template v-else>
          <div class="tax-single">
            <div class="tax-field">
              <label class="field-label">Salary</label>
              <div class="currency-input-wrap">
                <span class="currency-prefix">$</span>
                <input
                  type="number"
                  class="number-input"
                  :value="activeMember.salary"
                  @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'salary', Number($event.target.value))"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div class="tax-field">
              <label class="field-label">Business Income</label>
              <div class="currency-input-wrap">
                <span class="currency-prefix">$</span>
                <input
                  type="number"
                  class="number-input"
                  :value="activeMember.businessIncome"
                  @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'businessIncome', Number($event.target.value))"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div class="tax-field">
              <label class="field-label">Short-term Investment Income</label>
              <div class="currency-input-wrap">
                <span class="currency-prefix">$</span>
                <input
                  type="number"
                  class="number-input"
                  :value="activeMember.shortTermInvestmentIncome"
                  @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'shortTermInvestmentIncome', Number($event.target.value))"
                  min="0"
                  step="500"
                />
              </div>
            </div>

            <div class="tax-field">
              <label class="field-label">Long-term Investment Income</label>
              <div class="currency-input-wrap">
                <span class="currency-prefix">$</span>
                <input
                  type="number"
                  class="number-input"
                  :value="activeMember.longTermInvestmentIncome"
                  @input="budgetStore.updateMemberSetting(budgetStore.personalMember, 'longTermInvestmentIncome', Number($event.target.value))"
                  min="0"
                  step="500"
                />
              </div>
            </div>

            <div class="tax-field">
              <label class="field-label">Filing Status</label>
              <select
                class="select-input"
                :value="activeMember.filingStatus"
                @change="budgetStore.updateMemberSetting(budgetStore.personalMember, 'filingStatus', $event.target.value)"
              >
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="hoh">Head of Household</option>
              </select>
            </div>

            <div class="tax-field">
              <label class="field-label">State</label>
              <select
                class="select-input"
                :value="activeMember.state"
                @change="budgetStore.updateMemberSetting(budgetStore.personalMember, 'state', $event.target.value)"
              >
                <option v-for="s in stateOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useBudgetStore } from '@/stores/budget'
import { Sun, Moon, User, Users, Briefcase } from 'lucide-vue-next'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'

const themeStore = useThemeStore()
const budgetStore = useBudgetStore()

const activeMember = computed(() => budgetStore.familyMembers[budgetStore.personalMember])

const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
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

/* Theme toggle switch */
.theme-toggle {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  border: 1px solid var(--border-glass);
  background: var(--bg-subtle);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle.active {
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

.theme-toggle.active .toggle-knob {
  transform: translateX(24px);
  color: var(--electric-teal);
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
  background: var(--electric-teal);
  color: #000;
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
  background: #f97316;
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
  background: var(--electric-teal);
  color: #000;
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

@media (max-width: 640px) {
  .tax-members {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>

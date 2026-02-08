<template>
  <div class="settings">
    <Header title="Settings" subtitle="Customize your experience" />

    <div class="settings-grid">
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

      <Card title="Tax Settings" subtitle="Configure your tax parameters">
        <div class="settings-form">
          <div class="setting-row">
            <div class="setting-info">
              <span class="setting-label">Filing Status</span>
            </div>
            <select
              class="form-select"
              :value="budgetStore.filingStatus"
              @change="budgetStore.updateFilingStatus($event.target.value)"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="hoh">Head of Household</option>
            </select>
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
                @input="budgetStore.monthlyBudget = Number($event.target.value)"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useBudgetStore } from '@/stores/budget'
import { Sun, Moon } from 'lucide-vue-next'
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'

const themeStore = useThemeStore()
const budgetStore = useBudgetStore()
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
</style>

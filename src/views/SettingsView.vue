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
            <span class="toggle-knob">{{ themeStore.isDark ? '🌙' : '☀️' }}</span>
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
import Header from '@/components/layout/Header.vue'
import Card from '@/components/common/Card.vue'

const themeStore = useThemeStore()
const budgetStore = useBudgetStore()
</script>

<style scoped>
.settings {
  max-width: 800px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.setting-description {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.toggle-btn {
  width: 56px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: rgba(135, 206, 235, 0.2);
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
  flex-shrink: 0;
}

.toggle-btn.active {
  background: var(--electric-teal);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-btn.active .toggle-knob {
  transform: translateX(26px);
}

.form-select {
  padding: 10px 14px;
  border: 1px solid var(--border-glass);
  border-radius: 10px;
  background: rgba(135, 206, 235, 0.08);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
  min-width: 200px;
}

.form-select:focus {
  border-color: var(--electric-teal);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(135, 206, 235, 0.08);
  border: 1px solid var(--border-glass);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.3s ease;
  min-width: 200px;
}

.input-wrapper:focus-within {
  border-color: var(--electric-teal);
}

.input-prefix {
  padding: 0 10px;
  color: var(--text-secondary);
  font-weight: 600;
}

.form-input {
  flex: 1;
  padding: 10px 14px 10px 0;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 0.9rem;
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

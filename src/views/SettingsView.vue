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
          <button class="theme-toggle" :class="{ active: themeStore.isDark }" @click="themeStore.toggleTheme()">
            <span class="toggle-knob">
              <Moon v-if="themeStore.isDark" :size="12" stroke-width="2" />
              <Sun v-else :size="12" stroke-width="2" />
            </span>
          </button>
        </div>
      </Card>

      <Card title="Mode" subtitle="Switch between personal, family, or business view">
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
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { useBudgetStore } from '@/stores/budget'
import { Sun, Moon, User, Users, Briefcase } from 'lucide-vue-next'
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
</style>

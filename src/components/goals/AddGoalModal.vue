<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h2 class="modal-title">New Goal</h2>

        <label>Name
          <input v-model="form.title" placeholder="e.g. Emergency Fund" />
        </label>

        <label>Emoji
          <input v-model="form.emoji" placeholder="🎯" maxlength="2" style="width: 60px" />
        </label>

        <label>Target Amount ($)
          <input v-model.number="form.targetAmount" type="number" min="1" placeholder="10000" />
        </label>

        <label>Starting Amount ($)
          <input v-model.number="form.currentAmount" type="number" min="0" placeholder="0" />
        </label>

        <label>Target Date
          <input v-model="form.targetDate" type="date" :min="minDate" />
        </label>

        <label>Category
          <select v-model="form.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <label>Color
          <div class="color-swatches">
            <button
              v-for="c in colors"
              :key="c"
              class="swatch"
              :style="{ background: c }"
              :class="{ active: form.color === c }"
              @click="form.color = c"
            ></button>
          </div>
        </label>

        <div class="modal-actions">
          <button class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button class="btn-save" :disabled="!isValid" @click="submit">Create Goal</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, computed } from 'vue'

const emit = defineEmits(['close', 'save'])

const minDate    = new Date().toISOString().split('T')[0]
const categories = ['savings', 'travel', 'family', 'investment', 'home', 'vehicle', 'education', 'other']
const colors     = ['#34d399', '#3b82f6', '#a78bfa', '#fbbf24', '#f87171', '#f472b6', '#38bdf8', '#fb923c']

const form = reactive({
  title: '', emoji: '🎯', targetAmount: null,
  currentAmount: 0, targetDate: '', category: 'savings', color: '#3b82f6',
})

const isValid = computed(() =>
  form.title.trim() && form.targetAmount > 0 && form.targetDate
)

function submit() {
  if (!isValid.value) return
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 1.75rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-title { font-size: 1.15rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.25rem; }

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
input, select {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  color: #f1f5f9;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
input:focus, select:focus { border-color: rgba(59,130,246,0.5); }
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
select option { background: #0f172a; }

.color-swatches { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
.swatch {
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}
.swatch.active { border-color: white; transform: scale(1.15); }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.btn-cancel {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}
.btn-save {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

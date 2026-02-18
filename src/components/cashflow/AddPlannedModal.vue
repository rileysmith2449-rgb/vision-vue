<!-- AddPlannedModal.vue -->
<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h2 class="modal-title">Add Planned Expense</h2>

        <label>Name
          <input v-model="form.label" placeholder="e.g. Vegas Trip" />
        </label>

        <label>Amount ($)
          <input v-model.number="form.amount" type="number" min="0" placeholder="0.00" />
        </label>

        <label>Date
          <input v-model="form.date" type="date" :min="minDate" />
        </label>

        <label>Category
          <select v-model="form.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <div class="modal-actions">
          <button class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button class="btn-save" :disabled="!isValid" @click="submit">Save</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, computed } from 'vue'

const emit = defineEmits(['close', 'save'])

const categories = ['travel', 'auto', 'health', 'home', 'shopping', 'food', 'other']

const minDate = new Date().toISOString().split('T')[0]

const form = reactive({
  label: '',
  amount: null,
  date: '',
  category: 'other',
})

const isValid = computed(() => form.label.trim() && form.amount > 0 && form.date)

function submit() {
  if (!isValid.value) return
  emit('save', { ...form })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
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
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 0.25rem;
}
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
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
select option { background: #0f172a; }

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
}
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>

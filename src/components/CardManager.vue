<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-panel">
          <div class="modal-header">
            <h3 class="modal-title">Manage Cards</h3>
            <button class="modal-close" @click="$emit('close')">
              <X :size="20" stroke-width="2" />
            </button>
          </div>

          <!-- Summary Bar -->
          <div class="summary-bar">
            <span class="summary-stat">{{ cardStore.userPortfolio.length }} card{{ cardStore.userPortfolio.length !== 1 ? 's' : '' }}</span>
            <span class="summary-divider"></span>
            <span class="summary-stat">{{ formatCurrency(cardStore.totalAnnualFees) }}/yr in fees</span>
          </div>

          <!-- Active Cards List -->
          <div v-if="cardStore.userPortfolio.length > 0" class="section">
            <h4 class="section-heading">Your Cards</h4>
            <div class="card-list">
              <div
                v-for="card in cardStore.userPortfolio"
                :key="card.cardKey"
                :class="['card-row', { inactive: !card.active }]"
              >
                <div class="card-row-left">
                  <img
                    v-if="cardStore.getCardImageUrl(card.cardKey)"
                    :src="cardStore.getCardImageUrl(card.cardKey)"
                    :alt="getCardName(card.cardKey)"
                    class="card-thumb"
                  />
                  <div v-else class="card-thumb card-thumb-placeholder">
                    <CreditCard :size="18" stroke-width="1.5" />
                  </div>
                  <div class="card-row-info">
                    <span class="card-row-name">{{ getCardName(card.cardKey) }}</span>
                    <span class="card-row-issuer">{{ getCardIssuer(card.cardKey) }}</span>
                  </div>
                </div>
                <div class="card-row-actions">
                  <button
                    class="btn-icon"
                    :title="card.active ? 'Deactivate' : 'Activate'"
                    @click="cardStore.toggleCard(card.cardKey)"
                  >
                    <component :is="card.active ? ToggleRight : ToggleLeft" :size="22" stroke-width="1.8" />
                  </button>
                  <button class="btn-icon btn-danger" title="Remove" @click="cardStore.removeCardFromPortfolio(card.cardKey)">
                    <Trash2 :size="16" stroke-width="2" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Section -->
          <div class="section">
            <h4 class="section-heading">Add a Card</h4>
            <div class="search-wrap">
              <Search :size="16" stroke-width="2" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search by card name..."
                @input="onSearchInput"
              />
              <Loader2
                v-if="cardStore.searchLoading"
                :size="16"
                stroke-width="2"
                class="search-spinner"
              />
            </div>

            <div v-if="filteredResults.length > 0" class="search-results">
              <div
                v-for="result in filteredResults"
                :key="result.cardKey"
                class="search-result-row"
              >
                <div class="result-info">
                  <span class="result-name">{{ result.cardName }}</span>
                  <span class="result-issuer">{{ result.cardIssuer }}</span>
                </div>
                <button
                  class="btn-add"
                  :disabled="cardStore.portfolioCardKeys.includes(result.cardKey)"
                  @click="addCard(result.cardKey)"
                >
                  <template v-if="cardStore.portfolioCardKeys.includes(result.cardKey)">
                    <Check :size="14" stroke-width="2" /> Added
                  </template>
                  <template v-else>
                    <Plus :size="14" stroke-width="2" /> Add
                  </template>
                </button>
              </div>
            </div>

            <div v-else-if="searchQuery.length >= 2 && !cardStore.searchLoading" class="empty-search">
              No cards found for "{{ searchQuery }}"
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, CreditCard, Search, Plus, Check, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-vue-next'
import { useCreditCardStore } from '@/stores/creditCardStore'
import { formatCurrency } from '@/utils/formatters'

defineProps({ visible: Boolean })
defineEmits(['close'])

const cardStore = useCreditCardStore()
const searchQuery = ref('')
let debounceTimer = null

function onSearchInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    cardStore.searchCards(searchQuery.value)
  }, 350)
}

const filteredResults = computed(() =>
  cardStore.searchResults.filter(r => !cardStore.portfolioCardKeys.includes(r.cardKey))
    .concat(cardStore.searchResults.filter(r => cardStore.portfolioCardKeys.includes(r.cardKey)))
)

async function addCard(cardKey) {
  await cardStore.addCardToPortfolio(cardKey)
}

function getCardName(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardName || cardKey
}

function getCardIssuer(cardKey) {
  return cardStore.cardDetails[cardKey]?.cardIssuer || ''
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-glass);
  position: sticky;
  top: 0;
  background: var(--bg-surface);
  z-index: 1;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(59, 130, 246, 0.04);
  border-bottom: 1px solid var(--border-glass);
}

.summary-stat {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.summary-divider {
  width: 1px;
  height: 14px;
  background: var(--border-glass);
}

.section {
  padding: 20px 24px;
}

.section + .section {
  border-top: 1px solid var(--border-glass);
}

.section-heading {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin-bottom: 12px;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  transition: opacity 0.2s ease;
}

.card-row.inactive {
  opacity: 0.45;
}

.card-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.card-thumb {
  width: 40px;
  height: 26px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.card-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.card-row-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.card-row-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-row-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.card-row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.btn-danger:hover {
  color: var(--negative);
}

/* Search */
.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--border-focus);
}

.search-spinner {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-blue);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-results {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}

.search-result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}

.search-result-row:hover {
  background: var(--bg-subtle);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.result-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.result-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-glass);
  background: transparent;
  color: var(--accent-blue);
  font-size: 0.76rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-add:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.1);
}

.btn-add:disabled {
  color: var(--text-tertiary);
  cursor: default;
}

.empty-search {
  margin-top: 16px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.85rem;
  padding: 20px 0;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal-panel {
  transform: scale(0.95) translateY(10px);
}
</style>

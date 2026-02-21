<template>
  <div class="card-stack">
    <div v-if="personalCards.length === 0 && businessCards.length === 0" class="empty-section">
      No card assignments yet.
    </div>
    <template v-else>
      <div v-if="personalCards.length > 0 && businessCards.length > 0" class="section-subheading">Personal</div>

      <!-- Personal Cards -->
      <div
        v-for="card in personalCards"
        :key="card.cardKey"
        :class="['stack-card', card.action || '', { 'stack-card-expanded': expandedCard === card.cardKey }]"
      >
        <div class="stack-card-header" @click="$emit('update:expandedCard', expandedCard === card.cardKey ? null : card.cardKey)">
          <img
            v-if="getCardImageUrl(card.cardKey)"
            :src="getCardImageUrl(card.cardKey)"
            :alt="getCardName(card.cardKey)"
            class="stack-card-img"
          />
          <div v-else class="stack-card-img stack-card-placeholder">
            <CreditCard :size="20" stroke-width="1.5" />
          </div>
          <div class="stack-card-info">
            <span class="stack-card-name">{{ getCardName(card.cardKey) }}</span>
            <span class="stack-card-issuer">{{ getCardIssuer(card.cardKey) }}</span>
          </div>
          <span v-if="card.action" :class="['combo-badge', card.action]">
            {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
          </span>
          <div class="stack-card-stat">
            <span class="stack-rewards">{{ formatCurrencyCents(card.rewards) }}</span>
            <span class="stack-spend">on {{ formatCurrency(card.spend) }}</span>
          </div>
          <ChevronDown :size="14" stroke-width="2" :class="['card-chevron', { rotated: expandedCard === card.cardKey }]" />
        </div>
        <div v-if="card.action === 'evaluate'" class="combo-warning">
          Fee exceeds rewards — consider if perks justify the cost
        </div>
        <div v-if="card.netValue !== undefined" class="stack-card-net">
          <span class="combo-stat-label">Fee (prorated)</span>
          <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
          <span class="combo-stat-label" style="margin-left: 14px;">Net Value</span>
          <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
            {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
          </span>
        </div>
        <div class="stack-card-categories">
          <span v-for="cat in card.categories" :key="cat" class="stack-cat-tag">
            {{ categoryIcon(cat) }} {{ formatCatName(cat) }}
          </span>
        </div>

        <!-- Card Drilldown -->
        <div v-if="expandedCard === card.cardKey" class="card-drilldown">
          <CardDrilldown :cardKey="card.cardKey" :getCardCategoryBreakdown="getCardCategoryBreakdown" :getCardTransactions="getCardTransactions" />
        </div>
      </div>

      <!-- Business Cards -->
      <div v-if="businessCards.length > 0" class="section-subheading section-subheading-business">Business</div>
      <div
        v-for="card in businessCards"
        :key="card.cardKey"
        :class="['stack-card', card.action || '', { 'stack-card-expanded': expandedCard === card.cardKey }]"
      >
        <div class="stack-card-header" @click="$emit('update:expandedCard', expandedCard === card.cardKey ? null : card.cardKey)">
          <img
            v-if="getCardImageUrl(card.cardKey)"
            :src="getCardImageUrl(card.cardKey)"
            :alt="getCardName(card.cardKey)"
            class="stack-card-img"
          />
          <div v-else class="stack-card-img stack-card-placeholder">
            <CreditCard :size="20" stroke-width="1.5" />
          </div>
          <div class="stack-card-info">
            <span class="stack-card-name">{{ getCardName(card.cardKey) }}</span>
            <span class="stack-card-issuer">{{ getCardIssuer(card.cardKey) }}</span>
          </div>
          <span v-if="card.action" :class="['combo-badge', card.action]">
            {{ card.action === 'keep' ? 'Keep' : card.action === 'add' ? 'Add' : card.action === 'evaluate' ? 'Evaluate' : 'Drop' }}
          </span>
          <div class="stack-card-stat">
            <span class="stack-rewards">{{ formatCurrencyCents(card.rewards) }}</span>
            <span class="stack-spend">on {{ formatCurrency(card.spend) }}</span>
          </div>
          <ChevronDown :size="14" stroke-width="2" :class="['card-chevron', { rotated: expandedCard === card.cardKey }]" />
        </div>
        <div v-if="card.action === 'evaluate'" class="combo-warning">
          Fee exceeds rewards — consider if perks justify the cost
        </div>
        <div v-if="card.netValue !== undefined" class="stack-card-net">
          <span class="combo-stat-label">Fee (prorated)</span>
          <span class="combo-stat-value">{{ card.proratedFee > 0 ? formatCurrency(card.proratedFee) : 'Free' }}</span>
          <span class="combo-stat-label" style="margin-left: 14px;">Net Value</span>
          <span class="combo-stat-value" :class="card.netValue >= 0 ? 'gain' : 'loss'">
            {{ card.netValue >= 0 ? '+' : '' }}{{ formatCurrency(card.netValue) }}
          </span>
        </div>
        <div class="stack-card-categories">
          <span v-for="cat in card.categories" :key="cat" class="stack-cat-tag">
            {{ categoryIcon(cat) }} {{ formatCatName(cat) }}
          </span>
        </div>

        <!-- Card Drilldown -->
        <div v-if="expandedCard === card.cardKey" class="card-drilldown">
          <CardDrilldown :cardKey="card.cardKey" :getCardCategoryBreakdown="getCardCategoryBreakdown" :getCardTransactions="getCardTransactions" />
        </div>
      </div>
    </template>

    <!-- Cards to Consider -->
    <div v-if="marketCardSuggestions.length > 0" class="section-block" style="margin-top: 16px;">
      <h4 class="block-title">
        <PlusCircle :size="16" stroke-width="2" />
        Cards to Consider
      </h4>
      <p class="block-subtitle">Based on your {{ cardFilter === 'business' ? 'business' : cardFilter === 'personal' ? 'personal' : '' }} spending, these cards could boost rewards</p>
      <div class="combo-grid">
        <div
          v-for="card in marketCardSuggestions"
          :key="card.name"
          class="combo-card suggest"
        >
          <div class="combo-card-header">
            <span class="combo-card-name">{{ card.name }}</span>
            <span class="combo-badge suggest">{{ card.type === 'business' ? 'Business' : 'Consider' }}</span>
          </div>
          <p class="suggest-highlight">{{ card.highlight }}</p>
          <div class="combo-stats">
            <div class="combo-stat">
              <span class="combo-stat-label">Projected Rewards</span>
              <span class="combo-stat-value gain">{{ formatCurrency(card.projectedRewards) }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Annual Fee</span>
              <span class="combo-stat-value">{{ card.annualFee > 0 ? formatCurrency(card.annualFee) : 'Free' }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Net Value</span>
              <span class="combo-stat-value gain">+{{ formatCurrency(card.netValue) }}</span>
            </div>
          </div>
          <div v-if="card.bestCategories.length" class="combo-categories">
            <span v-for="cat in card.bestCategories" :key="cat" class="combo-cat-tag">{{ cat }}</span>
          </div>
          <button
            :class="['add-card-btn', { added: isCardInPortfolio(card.name) }]"
            :disabled="isCardInPortfolio(card.name)"
            @click.stop="$emit('add-suggested-card', card.name)"
          >{{ isCardInPortfolio(card.name) ? 'Added' : 'Add to Portfolio' }}</button>
        </div>
      </div>
    </div>

    <!-- Merchant-Specific Cards -->
    <div v-if="merchantCardSuggestions.length > 0" class="section-block" style="margin-top: 16px;">
      <h4 class="block-title">
        <PlusCircle :size="16" stroke-width="2" />
        Merchant-Specific Cards
      </h4>
      <p class="block-subtitle">Cards optimized for merchants you frequently shop at</p>
      <div class="combo-grid">
        <div
          v-for="card in merchantCardSuggestions"
          :key="card.cardName + '-' + card.merchant"
          class="combo-card suggest"
        >
          <div class="combo-card-header">
            <span class="combo-card-name">{{ card.cardName }}</span>
            <span class="combo-badge suggest">{{ card.type === 'business' ? 'Business' : 'Consider' }}</span>
          </div>
          <p class="suggest-highlight">{{ card.highlight }}</p>
          <div class="combo-stats">
            <div class="combo-stat">
              <span class="combo-stat-label">{{ card.merchant }} Spend</span>
              <span class="combo-stat-value">{{ formatCurrency(card.merchantSpend) }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Projected Rewards</span>
              <span class="combo-stat-value gain">{{ formatCurrency(card.projectedRewards) }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Annual Fee</span>
              <span class="combo-stat-value">{{ card.annualFee > 0 ? formatCurrency(card.annualFee) : 'Free' }}</span>
            </div>
            <div class="combo-stat">
              <span class="combo-stat-label">Net Value</span>
              <span class="combo-stat-value gain">+{{ formatCurrency(card.netValue) }}</span>
            </div>
          </div>
          <button
            :class="['add-card-btn', { added: isCardInPortfolio(card.cardName) }]"
            :disabled="isCardInPortfolio(card.cardName)"
            @click.stop="$emit('add-suggested-card', card.cardName)"
          >{{ isCardInPortfolio(card.cardName) ? 'Added' : 'Add to Portfolio' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
import { CreditCard, ChevronDown, PlusCircle } from 'lucide-vue-next'
import CardDrilldown from './CardDrilldown.vue'

defineProps({
  personalCards: { type: Array, default: () => [] },
  businessCards: { type: Array, default: () => [] },
  expandedCard: { type: String, default: null },
  marketCardSuggestions: { type: Array, default: () => [] },
  merchantCardSuggestions: { type: Array, default: () => [] },
  cardFilter: { type: String, default: 'all' },
  getCardCategoryBreakdown: { type: Function, required: true },
  getCardTransactions: { type: Function, required: true },
  isCardInPortfolio: { type: Function, required: true },
  getCardImageUrl: { type: Function, required: true },
})

defineEmits(['update:expandedCard', 'add-suggested-card'])

const { formatCurrency, formatCurrencyCents, getCardName, getCardIssuer, formatCatName, categoryIcon } = inject('helpers')
</script>

<style scoped>
@import './shared.css';

.card-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-card-expanded { border-color: var(--accent-blue) !important; }

.stack-card {
  padding: 18px 20px;
  background: var(--bg-card);
  background-image: var(--gradient-card);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-glass);
}

.stack-card.keep { border-color: rgba(20, 184, 166, 0.2); }
.stack-card.add { border-color: rgba(59, 130, 246, 0.25); }
.stack-card.evaluate { border-color: rgba(56, 189, 248, 0.25); }
.stack-card.drop { border-color: rgba(239, 68, 68, 0.2); opacity: 0.6; }

.stack-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}

.card-chevron {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.card-chevron.rotated { transform: rotate(180deg); }

.stack-card-img {
  width: 54px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.stack-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
}

.stack-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.stack-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stack-card-issuer {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-stat {
  text-align: right;
  flex-shrink: 0;
}

.stack-rewards {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-teal);
}

.stack-spend {
  font-size: 0.72rem;
  color: var(--text-tertiary);
}

.stack-card-net {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.stack-card-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.stack-cat-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.06);
  color: var(--text-secondary);
}

.card-drilldown {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-glass);
}
</style>

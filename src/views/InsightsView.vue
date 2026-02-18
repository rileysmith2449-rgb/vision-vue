<template>
  <div class="insights">
    <Header title="Tax & Portfolio Insights" subtitle="AI-powered insights for investments and taxes" />

    <div v-if="portfolioStore.loading" class="loading">Analyzing portfolio...</div>

    <template v-else>
      <AIAdvisor />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import Header from '@/components/layout/Header.vue'
import AIAdvisor from '@/components/insights/AIAdvisor.vue'

const portfolioStore = usePortfolioStore()

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  }
})
</script>

<style scoped>
.insights {
  max-width: 1200px;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>

<template>
  <div class="dashboard">
    <Header title="Dashboard" subtitle="Your portfolio at a glance" />

    <div v-if="portfolioStore.loading" class="loading">Loading portfolio...</div>

    <template v-else>
      <div class="bento-grid">
        <HeroCard class="span-2" />

        <AllocationChart class="span-1" />

        <HoldingsChart class="span-2" />

        <TopMovers class="span-1" />

        <HoldingsTable class="span-3" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import Header from '@/components/layout/Header.vue'
import HeroCard from '@/components/portfolio/HeroCard.vue'
import HoldingsChart from '@/components/charts/HoldingsChart.vue'
import HoldingsTable from '@/components/portfolio/HoldingsTable.vue'
import TopMovers from '@/components/portfolio/TopMovers.vue'
import AllocationChart from '@/components/charts/AllocationChart.vue'

const portfolioStore = usePortfolioStore()

onMounted(() => {
  if (portfolioStore.holdings.length === 0) {
    portfolioStore.loadHoldings()
  }
})
</script>

<style scoped>
.dashboard {
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

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.bento-grid .span-1 { grid-column: span 1; }
.bento-grid .span-2 { grid-column: span 2; }
.bento-grid .span-3 { grid-column: span 3; }

@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: 1fr; }
  .bento-grid .span-2, .bento-grid .span-3 { grid-column: span 1; }
}
</style>

<template>
  <div class="dashboard">
    <Header title="Dashboard" subtitle="Your portfolio at a glance" />

    <div v-if="portfolioStore.loading" class="loading">Loading portfolio...</div>

    <template v-else>
      <HeroCard />

      <HoldingsChart class="section" />

      <HoldingsTable class="section" />

      <TopMovers class="section" />
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
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.section {
  margin-top: 24px;
}
</style>

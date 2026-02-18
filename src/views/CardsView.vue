<template>
  <div class="cards-page">
    <Header title="Card Optimizer" subtitle="Maximize rewards by using the right card for every purchase" />
    <CreditCardOptimizer />
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import CreditCardOptimizer from '@/components/CreditCardOptimizer.vue'
</script>

<style scoped>
.cards-page {
  max-width: 1200px;
  animation: viewFadeIn 0.3s ease-out;
}

@keyframes viewFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

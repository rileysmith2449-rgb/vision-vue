<template>
  <div v-if="visible" class="reauth-global-banner">
    <AlertTriangle :size="16" />
    <span>Your bank connection has expired.</span>
    <router-link to="/settings" class="reauth-link">Fix in Settings</router-link>
    <button class="reauth-dismiss" @click="dismiss">&#x2715;</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import { usePlaidStore } from '@/stores/plaid'

const plaidStore = usePlaidStore()
const dismissed = ref(sessionStorage.getItem('reauth-banner-dismissed') === 'true')

const needsReauth = computed(() => {
  if (plaidStore.loginRequired) return true
  const mc = plaidStore.memberConnections
  return Object.keys(mc).some(id => mc[id].loginRequired)
})

const visible = computed(() => needsReauth.value && !dismissed.value)

function dismiss() {
  dismissed.value = true
  sessionStorage.setItem('reauth-banner-dismissed', 'true')
}
</script>

<style scoped>
.reauth-global-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 12px;
  color: #fcd34d;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.reauth-link {
  margin-left: auto;
  color: #fde68a;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.reauth-link:hover {
  text-decoration: underline;
}

.reauth-dismiss {
  background: transparent;
  border: none;
  color: #92400e;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
</style>

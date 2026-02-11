import { createApp } from 'vue'
import { createPinia } from 'pinia'
import descope from '@descope/vue-sdk'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(descope, {
  projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID
})
app.use(router)
app.mount('#app')

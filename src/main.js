import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'
import descope from '@descope/vue-sdk'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  beforeSend(event) {
    const msg = event.exception?.values?.[0]?.value || ''
    if (msg.includes('Failed to fetch') || msg.includes('Load failed')) return null
    return event
  },
})

app.use(pinia)
app.use(descope, {
  projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID
})
app.use(router)
app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import { supabaseClient } from './services/supabase/client'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initSession()

supabaseClient.auth.onAuthStateChange((_event, session) => {
  authStore.setSession(session ?? null)
})

app.mount('#app')


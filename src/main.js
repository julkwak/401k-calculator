import 'zingchart/es6'
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import './assets/styles.css'

const MyPreset = definePreset(Aura, {
  // ... theme config
})

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: 'none'
    }
  }
})
app.mount('#app')
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import { router } from './router'
import './styles/main.css'

// PWA：autoUpdate，有新版本时后台拉取、下次加载生效
registerSW({ immediate: true })

createApp(App).use(createPinia()).use(i18n).use(router).mount('#app')

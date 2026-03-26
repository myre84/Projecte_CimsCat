// Aquest fitxer és el punt d'entrada tècnic del frontend.
// És el primer codi nostre que executa Vite quan arrenca l'aplicació.

// Carreguem els estils globals principals del projecte.
import './assets/main.css'

// createApp crea la instància principal de Vue.
import { createApp } from 'vue'

// Pinia és la llibreria que fem servir per l'estat global (usuari, sessió, etc.).
import { createPinia } from 'pinia'

// App és el component arrel que acabarem muntant a la pàgina.
import App from './App.vue'

// Router ens permet canviar de vistes sense recarregar tota la web.
import router from './router'

// Importem la store de l'usuari perquè volem recuperar la sessió guardada abans de pintar la web.
import { useUserStore } from './stores/user'

// Creem la instància principal de Vue.
const app = createApp(App)

// Creem també la instància de Pinia.
const pinia = createPinia()

// Connectem Pinia a l'app perquè tots els components puguin compartir estat.
app.use(pinia)

// Connectem també el router perquè funcionin les rutes.
app.use(router)

// Abans de muntar l'aplicació, recuperem la sessió desada a localStorage.
// Això fa que, si l'usuari recarrega la pàgina, no "perdi" el login visualment.
useUserStore(pinia).loadFromStorage()

// Finalment, pintem tota l'aplicació dins del div #app del index.html.
app.mount('#app')

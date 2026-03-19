// Aquesta store guarda la informació global de l'usuari.
// La fem amb Pinia perquè diferents components puguin saber si hi ha sessió iniciada.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Quan carreguem l'app, intentem recuperar la sessió guardada al navegador.
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // Aquesta propietat ens diu de manera senzilla si hi ha usuari autenticat.
  const isAuthenticated = computed(() => !!token.value)

  function setUser(userData, userToken) {
    // Guardem les dades de l'usuari i el token a memòria.
    user.value = userData
    token.value = userToken

    // També ho guardem a localStorage perquè si recarreguem la pàgina no es perdi la sessió.
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    // Quan l'usuari tanca sessió, netegem tant l'estat intern com el localStorage.
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Exposem tot el que necessitarem des d'altres components.
  return { token, user, isAuthenticated, setUser, logout }
})

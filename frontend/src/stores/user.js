// Aquesta store guarda la informació global de l'usuari.
// La fem amb Pinia perquè diferents components puguin saber si hi ha sessió iniciada.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function readStoredUser() {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  // Quan carreguem l'app, intentem recuperar la sessió guardada al navegador.
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(readStoredUser())

  // Aquesta propietat ens diu de manera senzilla si hi ha usuari autenticat.
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.rol === 'admin')

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
  return { token, user, isAuthenticated, isAdmin, setUser, logout }
})

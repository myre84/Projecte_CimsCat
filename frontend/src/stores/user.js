// Aquesta store guarda la informació global de l'usuari.
// La fem amb Pinia perquè diferents components puguin saber si hi ha sessió iniciada.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'

function readStoredUser() {
  // Aquesta funció auxiliar intenta recuperar l'usuari guardat a localStorage.
  // Ho fem separat perquè ens sigui més net i fàcil de reaprofitar.
  const storedUser = localStorage.getItem('user')

  if (!storedUser) return null

  try {
    // Si tot és correcte, convertim el text JSON a objecte.
    return JSON.parse(storedUser)
  } catch {
    // Si hi ha un error de format, netegem la dada per no arrossegar un estat corrupte.
    localStorage.removeItem('user')
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  // token guarda el JWT actual de la sessió.
  const token = ref(null)

  // user guarda les dades bàsiques de l'usuari autenticat.
  const user = ref(null)

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

  function loadFromStorage() {
    // Aquesta funció reconstrueix la sessió a memòria a partir del que hi hagi guardat al navegador.
    token.value = localStorage.getItem('token') || null
    user.value = readStoredUser()
  }

  async function login(credentials) {
    // Al login adaptem les dades del formulari al format que espera backend.
    const { data } = await api.post('/auth/login', {
      mail: credentials.email.trim().toLowerCase(),
      contrasenya: credentials.password,
    })

    // Si tot va bé, guardem usuari i token tant a memòria com a localStorage.
    setUser(data.user, data.token)
    return data
  }

  async function register(payload) {
    // Al registre també adaptem els noms dels camps perquè coincideixin amb el contracte del backend.
    const { data } = await api.post('/auth/register', {
      nom: payload.nom.trim(),
      cognom: payload.cognom.trim(),
      nomUsuari: payload.nomUsuari.trim().toLowerCase(),
      mail: payload.email.trim().toLowerCase(),
      contrasenya: payload.password,
      fotoPerfil: null,
    })

    setUser(data.user, data.token)
    return data
  }

  function logout() {
    // Quan l'usuari tanca sessió, netegem tant l'estat intern com el localStorage.
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  loadFromStorage()

  // Exposem tot el que necessitarem des d'altres components.
  // Això és el que després podrem importar i fer servir des de vistes i components.
  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    setUser,
    loadFromStorage,
    login,
    register,
    logout,
  }
})

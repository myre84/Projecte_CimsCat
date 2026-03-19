// Aquesta és la instància central d'Axios.
// La fem servir perquè totes les peticions al backend comparteixin la mateixa configuració base.
import axios from 'axios'
import { useUserStore } from '../stores/user'

// baseURL ens evita repetir "http://localhost:3000/api" a cada petició.
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  // Abans d'enviar qualsevol petició, comprovem si l'usuari té token.
  const userStore = useUserStore()
  if (userStore.token) {
    // Si hi ha token, l'afegim a la capçalera Authorization.
    // Això és útil per rutes protegides del backend.
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// Exportem la instància perquè la resta del projecte la reutilitzi.
export default api

// Aquesta és la instància central d'Axios.
// La fem servir perquè totes les peticions al backend comparteixin la mateixa configuració base.
// La idea és tenir un únic "client HTTP" en lloc d'anar fent fetch o axios.create a cada fitxer.
import axios from 'axios'

// baseURL ens evita repetir la base del backend a cada petició.
// Això simplifica molt el codi de les vistes.
const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  // Aquest interceptor s'executa just abans d'enviar qualsevol petició.
  // És molt útil perquè aquí podem injectar el token una sola vegada per a tot el projecte.
  // Abans d'enviar qualsevol petició, comprovem si l'usuari té token.
  const token = localStorage.getItem('token')

  if (token) {
    // Si hi ha token, l'afegim a la capçalera Authorization.
    // Això és útil per rutes protegides del backend.
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Exportem la instància perquè la resta del projecte la reutilitzi.
export default api

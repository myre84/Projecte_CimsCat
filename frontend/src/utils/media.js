// Aquest helper ens serveix per convertir una ruta d'imatge en una URL usable des del navegador.
// El necessitem perquè backend sovint retorna rutes relatives com "/uploads/cims/la-mola.jpg".
const BACKEND_BASE_URL = 'http://localhost:3000'

// Aquesta funció rep un path i decideix com l'ha de retornar.
// Segons el cas:
// - si ja és una URL completa, la deixa igual
// - si és una imatge temporal del frontend (data: o blob:), la deixa igual
// - si és una ruta relativa del backend, hi afegeix la base del servidor
export function resolveMediaUrl(path) {
  if (!path) return ''

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  if (path.startsWith('/')) {
    // Si comença per "/" vol dir que és una ruta relativa al backend.
    return `${BACKEND_BASE_URL}${path}`
  }

  // En qualsevol altre cas, hi posem igualment la base del backend davant.
  return `${BACKEND_BASE_URL}/${path}`
}

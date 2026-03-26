// Aquí configurem totes les rutes del frontend.
// Aquest fitxer és molt important perquè decideix:
// - quina vista es mostra en cada URL
// - quines pantalles necessiten login
// - quines pantalles estan restringides a admins
import { createRouter, createWebHistory } from 'vue-router'

function getStoredUser() {
  // Llegim el "user" guardat a localStorage per saber quin rol té l'usuari.
  const storedUser = localStorage.getItem('user')

  if (!storedUser) return null

  try {
    // Si el JSON és vàlid, el convertim a objecte JavaScript.
    return JSON.parse(storedUser)
  } catch {
    // Si està corrupte, el netegem per evitar errors futurs.
    localStorage.removeItem('user')
    return null
  }
}

function hasStoredToken() {
  // Aquesta funció ens serveix per saber ràpidament si hi ha sessió iniciada.
  return !!localStorage.getItem('token')
}

// En aquest array definim totes les pantalles que té l'app.
// Cada objecte representa una ruta.
const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/registre',
    name: 'Registre',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  { path: '/cim/:id', name: 'FitxaCim', component: () => import('../views/PeakDetailView.vue') },
  { path: '/publicacio/:id', name: 'Publicacio', component: () => import('../views/PublicationView.vue') },
  {
    path: '/crear-publicacio',
    name: 'CrearPublicacio',
    component: () => import('../views/CreatePublicationView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/planificar',
    name: 'PlanificarRuta',
    component: () => import('../views/PlanRouteView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/perfil/:id',
    name: 'Perfil',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/usuari/:id',
    name: 'PerfilAlie',
    component: () => import('../views/ForeignProfileView.vue'),
  },
  { path: '/cerca', name: 'Cerca', component: () => import('../views/SearchView.vue') },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

// Creem el router amb historial "net" del navegador.
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  // Cada vegada que l'usuari intenta entrar a una ruta, aquest guard es dispara.
  // Això ens permet validar permisos abans de mostrar la vista.
  const isAuthenticated = hasStoredToken()
  const storedUser = getStoredUser()

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta demana login i l'usuari no està autenticat, l'enviem a Login.
    return { name: 'Login' }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    // Si la ruta és només per convidats (login/registre) i ja hi ha sessió, el tornem a Home.
    return { name: 'Home' }
  }

  if (to.meta.requiresAdmin && storedUser?.rol !== 'admin') {
    // Si una ruta és d'admin i l'usuari no és admin, no hi pot entrar.
    return { name: 'Home' }
  }

  // Si cap condició bloqueja l'accés, deixem passar.
  return true
})

// Exportem el router perquè main.js el pugui connectar a l'app.
export default router

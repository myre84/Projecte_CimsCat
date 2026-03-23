import { createRouter, createWebHistory } from 'vue-router'

function getStoredUser() {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

function hasStoredToken() {
  return !!localStorage.getItem('token')
}

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
    alias: ['/planificar'],
    component: () => import('../views/CreatePublicationView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/perfil/:id', name: 'Perfil', component: () => import('../views/ProfileView.vue') },
  { path: '/cerca', name: 'Cerca', component: () => import('../views/SearchView.vue') },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isAuthenticated = hasStoredToken()
  const storedUser = getStoredUser()

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return { name: 'Home' }
  }

  if (to.meta.requiresAdmin && storedUser?.rol !== 'admin') {
    return { name: 'Home' }
  }

  return true
})

export default router

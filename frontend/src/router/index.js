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

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue') },
  { path: '/registre', name: 'Registre', component: () => import('../views/RegisterView.vue') },
  { path: '/cim/:id', name: 'FitxaCim', component: () => import('../views/PeakDetailView.vue') },
  { path: '/publicacio/:id', name: 'Publicacio', component: () => import('../views/PublicationView.vue') },
  {
    path: '/crear-publicacio',
    name: 'CrearPublicacio',
    alias: ['/planificar'],
    component: () => import('../views/CreatePublicationView.vue'),
  },
  { path: '/perfil/:id', name: 'Perfil', component: () => import('../views/ProfileView.vue') },
  { path: '/cerca', name: 'Cerca', component: () => import('../views/SearchView.vue') },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true

  const storedUser = getStoredUser()

  if (storedUser?.rol === 'admin') {
    return true
  }

  return { name: 'Home' }
})

export default router

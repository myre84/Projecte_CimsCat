import { createRouter, createWebHistory } from 'vue-router'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

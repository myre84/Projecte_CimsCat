<template>
  <!--
    Aquesta és la barra de navegació principal del projecte.
    Canvia part del seu contingut segons si l'usuari està autenticat o no.
  -->
  <nav class="navbar">
    <div class="navbar-left">
      <!-- Logo i nom del projecte. Clicant aquí tornem a la home. -->
      <RouterLink to="/" class="navbar-brand">
        <img src="/logo.svg" alt="CimsCat" class="navbar-logo" 
             onerror="this.style.display='none'" />
        <span class="navbar-name">CimsCat</span>
      </RouterLink>

      <!-- Aquest botó menú de moment és només visual. -->
      <button class="navbar-menu">☰</button>

      <!-- Cercador visual. Ara mateix encara no té lògica real de cerca. -->
      <div class="navbar-search">
        <input type="text" placeholder="Cerca..." />
        <button>🔍</button>
      </div>
    </div>

    <div class="navbar-right">
      <!-- Aquest botó canvia de ruta segons si l'usuari està loguejat o no. -->
      <RouterLink :to="planRouteLink" class="btn-plan">Planificar nova ruta</RouterLink>

      <!-- Si l'usuari està autenticat, mostrem el seu nom i un botó d'icona. -->
      <template v-if="userStore.isAuthenticated">
        <RouterLink to="/crear-publicacio" class="btn-create-publication">
          Crear publicació
        </RouterLink>
        <RouterLink v-if="userStore.isAdmin" to="/admin" class="btn-admin">
          Admin
        </RouterLink>
        <button class="btn-logout" type="button" @click="handleLogout">
          Tancar sessio
        </button>
        <RouterLink :to="`/perfil/${userStore.user?.id}`" class="btn-profile">
          <img
            v-if="profileImage"
            :src="profileImage"
            :alt="userStore.user?.nomUsuari || 'Perfil'"
            class="btn-profile__avatar"
          />
          <span v-else class="btn-profile__fallback">👤</span>
          <span class="btn-profile__name">{{ userStore.user?.nomUsuari }}</span>
        </RouterLink>
      </template>

      <!-- Si no està autenticat, mostrem els botons de login i registre. -->
      <template v-else>
        <RouterLink to="/login" class="btn-primary">Iniciar sessió</RouterLink>
        <RouterLink to="/registre" class="btn-primary">Registrar-se</RouterLink>
      </template>
    </div>
  </nav>
</template>



<script setup>
// computed ens permet construir una ruta dinàmica que depèn de l'estat d'autenticació.
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Agafem la store global de l'usuari per saber si hi ha sessió iniciada.
import { useUserStore } from '../stores/user'
import { resolveMediaUrl } from '../utils/media'

const router = useRouter()
const userStore = useUserStore()

// Aquesta variable reactiva decideix on enviem l'usuari quan clica "Planificar nova ruta".
// Ho fem així perquè una mateixa navbar pugui reaccionar a si hi ha login o no.
// Si l'usuari està autenticat, "Planificar nova ruta" porta a /planificar.
// Si no ho està, el fem passar abans per registre.
const planRouteLink = computed(() =>
  userStore.isAuthenticated ? '/planificar' : '/registre'
)

// Aquí preparem la foto de perfil que es mostrarà a la dreta.
// Si l'usuari no en té cap, més avall al template ensenyarem el ninot de fallback.
const profileImage = computed(() =>
  userStore.user?.fotoPerfil ? resolveMediaUrl(userStore.user.fotoPerfil) : ''
)

function handleLogout() {
  // Abans de tancar la sessió, demanem confirmació per no fer logout accidentalment.
  const confirmed = window.confirm('Vols tancar sessio?')

  if (!confirmed) return

  userStore.logout()
  router.push('/')
}

</script>

<style scoped>
/* Barra principal. */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background-color: var(--color-navbar);
  border-bottom: 1px solid var(--color-border);
  height: 60px;
}

/* Zona esquerra amb marca, menú i cerca. */
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Enllaç principal del logo. */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
}

/* Logo del projecte. */
.navbar-logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
}

/* Text "CimsCat" al costat del logo. */
.navbar-name {
  font-size: 0.75rem;
  color: var(--color-text);
  font-weight: 500;
}

/* Botó menú de tres ratlles. */
.navbar-menu {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text);
}

/* Contenidor del cercador. */
.navbar-search {
  display: flex;
  align-items: center;
  background: var(--color-input-background);
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  gap: 0.5rem;
}

/* Input del cercador. */
.navbar-search input {
  border: none;
  background: none;
  outline: none;
  width: 180px;
  font-size: 0.9rem;
  color: var(--color-text);
}

/* Color del placeholder del cercador. */
.navbar-search input::placeholder {
  color: var(--color-text-soft);
}

/* Botó de la lupa. */
.navbar-search button {
  background: none;
  border: none;
  cursor: pointer;
}

/* Zona dreta amb planificar, login, registre o nom d'usuari. */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Botó clar de planificar. */
.btn-plan {
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  text-decoration: none;
  background-color: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  border: 1px solid var(--color-border);
}

.btn-create-publication {
  /* Aquest botó destaca la creació de publicacions quan hi ha login. */
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  text-decoration: none;
  background-color: #eef3e9;
  color: #294637;
  border: 1px solid #cfd8ca;
}

/* Botons foscos de login i registre. */
.btn-primary {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
}

.btn-admin {
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  text-decoration: none;
  font-size: 0.85rem;
  background: #edf2ea;
  color: #294637;
  border: 1px solid #cfd8ca;
}

.btn-logout {
  background: #f5f4ef;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-profile {
  /* Bloc que ajunta foto de perfil + nom d'usuari en una sola peça visual. */
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--color-text);
}

.btn-profile__avatar,
.btn-profile__fallback {
  /* Tant la foto real com el fallback comparteixen la mateixa caixa circular. */
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f4ef;
  object-fit: cover;
  flex-shrink: 0;
}

.btn-profile__name {
  /* El nom el mantenim en una capsa fosca perquè visualment dialogui amb la resta de botons. */
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}
</style>

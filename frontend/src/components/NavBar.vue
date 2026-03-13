<template>
  <nav class="navbar">
    <div class="navbar-left">
      <RouterLink to="/" class="navbar-brand">
        <img src="/logo.svg" alt="CimsCat" class="navbar-logo" 
             onerror="this.style.display='none'" />
        <span class="navbar-name">CimsCat</span>
      </RouterLink>
      <button class="navbar-menu">☰</button>
      <div class="navbar-search">
        <input type="text" placeholder="Cerca..." />
        <button>🔍</button>
      </div>
    </div>

  <div class="navbar-right">
  <RouterLink :to="planRouteLink" class="btn-plan">Planificar nova ruta</RouterLink>

  <template v-if="userStore.isAuthenticated">
    <RouterLink :to="`/perfil/${userStore.user?.id}`" class="btn-user-name">
      {{ userStore.user?.nomUsuari }}
    </RouterLink>
    <button class="btn-icon">👤</button>
  </template>

  <template v-else>
    <RouterLink to="/login" class="btn-primary">Iniciar sessió</RouterLink>
    <RouterLink to="/registre" class="btn-primary">Registrar-se</RouterLink>
  </template>
</div>
  </nav>
</template>



<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const planRouteLink = computed(() =>
  userStore.isAuthenticated ? '/planificar' : '/registre'
)

</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background-color: var(--color-navbar);
  border-bottom: 1px solid var(--color-border);
  height: 60px;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
}
.navbar-logo {
  height: 40px;
  width: 40px;
  object-fit: contain;
}
.navbar-name {
  font-size: 0.75rem;
  color: var(--color-text);
  font-weight: 500;
}
.navbar-menu {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text);
}
.navbar-search {
  display: flex;
  align-items: center;
  background: var(--color-input-background);
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  gap: 0.5rem;
}
.navbar-search input {
  border: none;
  background: none;
  outline: none;
  width: 180px;
  font-size: 0.9rem;
  color: var(--color-text);
}
.navbar-search input::placeholder {
  color: var(--color-text-soft);
}
.navbar-search button {
  background: none;
  border: none;
  cursor: pointer;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.btn-plan {
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  text-decoration: none;
  background-color: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  border: 1px solid var(--color-border);
}
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
.btn-user-name {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-radius: 6px;
  padding: 0.4rem 1rem;
  text-decoration: none;
  font-size: 0.85rem;
}
.btn-icon {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
}
</style>
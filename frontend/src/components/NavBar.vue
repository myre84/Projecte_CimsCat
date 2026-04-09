<template>
  <!--
    Aquesta és la barra de navegació principal del projecte.
    Canvia part del seu contingut segons si l'usuari està autenticat o no.
  -->
  <nav class="navbar">
    <div class="navbar-left">
      <!-- Logo i nom del projecte. Clicant aquí tornem a la home. -->
      <RouterLink to="/" class="navbar-brand" @click="closeMobilePanels">
        <img src="/logo.svg" alt="CimsCat" class="navbar-logo" 
             onerror="this.style.display='none'" />
        <span class="navbar-name">CimsCat</span>
      </RouterLink>

      <button
        v-if="userStore.isAuthenticated"
        type="button"
        class="navbar-mobile-toggle"
        aria-label="Obrir menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        ☰
      </button>

      <!--
        Aquest cercador ja no depèn de la Home.
        La seva lògica viu en un composable compartit perquè funcioni igual
        a qualsevol pàgina del projecte.
      -->
      <form
        class="navbar-search"
        :class="{ 'navbar-search--mobile-open': isMobileSearchOpen }"
        @submit.prevent="handleSearchSubmit"
      >
        <input
          ref="searchInput"
          :value="searchText"
          type="text"
          placeholder="Cerca..."
          @focus="focusSearch"
          @input="handleSearchInput"
        />
        <div v-if="showSuggestions && hasSuggestions" class="navbar-search__dropdown">
          <template v-for="suggestion in suggestions" :key="`${suggestion.type}-${suggestion.label}`">
            <button
              v-if="suggestion.type === 'peak'"
              type="button"
              class="navbar-search__option"
              @mousedown.prevent="handlePeakSuggestionClick(suggestion)"
            >
              <span class="navbar-search__option-type">Cim</span>
              <span class="navbar-search__option-text">{{ suggestion.label }}</span>
            </button>

            <div v-else class="navbar-search__group">
              <button
                type="button"
                class="navbar-search__option navbar-search__option--group"
                @mousedown.prevent="handleComarcaSuggestionClick(suggestion)"
              >
                <span class="navbar-search__option-type">Comarca</span>
                <span class="navbar-search__option-text">{{ suggestion.label }}</span>
              </button>

              <div class="navbar-search__group-peaks">
                <button
                  v-for="peak in suggestion.peaks"
                  :key="peak.id"
                  type="button"
                  class="navbar-search__suboption"
                  @mousedown.prevent="handlePeakSuggestionClick(peak)"
                >
                  <span class="navbar-search__suboption-label">{{ peak.label }}</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </form>
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
        <RouterLink :to="`/perfil/${userStore.user?.id}`" class="btn-profile__name-link">
          <span class="btn-profile__name">{{ userStore.user?.nomUsuari }}</span>
        </RouterLink>
        <RouterLink :to="`/perfil/${userStore.user?.id}`" class="btn-profile">
          <img
            v-if="profileImage"
            :src="profileImage"
            :alt="userStore.user?.nomUsuari || 'Perfil'"
            class="btn-profile__avatar"
          />
          <span v-else class="btn-profile__fallback">👤</span>
        </RouterLink>
      </template>

      <!-- Si no està autenticat, mostrem els botons de login i registre. -->
      <template v-else>
        <RouterLink to="/login" class="btn-primary">Iniciar sessió</RouterLink>
        <RouterLink to="/registre" class="btn-primary">Registrar-se</RouterLink>
      </template>
    </div>

    <div class="navbar-mobile-actions">
      <button
        type="button"
        class="navbar-mobile-icon"
        aria-label="Obrir cerca"
        @click="toggleMobileSearch"
      >
        🔍
      </button>

      <template v-if="userStore.isAuthenticated">
        <RouterLink :to="`/perfil/${userStore.user?.id}`" class="navbar-mobile-profile">
          <img
            v-if="profileImage"
            :src="profileImage"
            :alt="userStore.user?.nomUsuari || 'Perfil'"
            class="btn-profile__avatar"
          />
          <span v-else class="btn-profile__fallback">👤</span>
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/login" class="navbar-mobile-auth-link" @click="closeMobilePanels">
          Iniciar sessió
        </RouterLink>
        <RouterLink to="/registre" class="navbar-mobile-auth-link" @click="closeMobilePanels">
          Registrar-se
        </RouterLink>
      </template>
    </div>

    <div v-if="userStore.isAuthenticated && isMobileMenuOpen" class="navbar-mobile-menu">
      <RouterLink :to="planRouteLink" class="navbar-mobile-menu__link" @click="closeMobilePanels">
        Planificar nova ruta
      </RouterLink>
      <RouterLink to="/crear-publicacio" class="navbar-mobile-menu__link" @click="closeMobilePanels">
        Crear publicació
      </RouterLink>
      <button class="navbar-mobile-menu__link navbar-mobile-menu__link--button" type="button" @click="handleLogout">
        Tancar sessio
      </button>
    </div>
  </nav>
</template>



<script setup>
// computed ens permet construir una ruta dinàmica que depèn de l'estat d'autenticació.
// nextTick ens ajuda a posar el focus al cercador just després d'obrir-lo en mòbil.
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

// Agafem la store global de l'usuari per saber si hi ha sessió iniciada.
import { useUserStore } from '../stores/user'
import { usePeakSearch } from '../composables/usePeakSearch'
import { resolveMediaUrl } from '../utils/media'

const router = useRouter()
const userStore = useUserStore()
const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const searchInput = ref(null)

const {
  searchText,
  suggestions,
  hasSuggestions,
  showSuggestions,
  focusSearch,
  updateSearchValue,
  submitSearch,
  closeSuggestions,
  selectPeakSuggestion,
  selectComarcaSuggestion,
} = usePeakSearch()

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
  closeMobilePanels()
  router.push('/')
}

function handleSearchInput(event) {
  updateSearchValue(event.target.value)
}

async function handleSearchSubmit() {
  closeMobileMenu()
  await submitSearch()
  closeMobilePanels()
}

async function handlePeakSuggestionClick(peak) {
  await selectPeakSuggestion(peak)
  closeMobilePanels()
}

function handleComarcaSuggestionClick(comarca) {
  selectComarcaSuggestion(comarca)
}

async function toggleMobileSearch() {
  isMobileSearchOpen.value = !isMobileSearchOpen.value

  if (isMobileSearchOpen.value) {
    closeMobileMenu()
    await nextTick()
    searchInput.value?.focus()
    await focusSearch()
  } else {
    closeSuggestions()
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function closeMobilePanels() {
  isMobileMenuOpen.value = false
  isMobileSearchOpen.value = false
  closeSuggestions()
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
  position: relative;
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

/* Contenidor del cercador. */
.navbar-search {
  position: relative;
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
.navbar-search__dropdown {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 0;
  right: auto;
  width: min(360px, calc(100vw - 2rem));
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.35rem;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: #fff;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
  z-index: 30;
}

.navbar-search__option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 0.75rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}

.navbar-search__option:hover {
  background: #f5f4ef;
}

.navbar-search__option-type {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  min-width: 58px;
  font-weight: 600;
}

.navbar-search__option-text {
  font-size: 0.92rem;
  font-weight: 600;
}

.navbar-search__group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.navbar-search__option--group {
  background: #faf8f1;
}

.navbar-search__group-peaks {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0 0.35rem 0.25rem 4.5rem;
}

.navbar-search__suboption {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: none;
  border-radius: 12px;
  background: #f7f5ee;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.navbar-search__suboption:hover {
  background: #f1eee3;
}

.navbar-search__suboption-label {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Zona dreta amb planificar, login, registre o nom d'usuari. */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.navbar-mobile-actions,
.navbar-mobile-toggle,
.navbar-mobile-menu {
  display: none;
}

/* Botó clar de planificar. */
.btn-plan {
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
  text-decoration: none;
  background-color: #ffffff;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-create-publication {
  /* Aquest botó destaca la creació de publicacions quan hi ha login. */
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
  text-decoration: none;
  background-color: #ffffff;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Botons foscos de login i registre. */
.btn-primary {
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-button-primary);
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-admin {
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  text-decoration: none;
  font-size: 0.95rem;
  background: #ffffff;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-logout {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: 1px solid var(--color-button-primary);
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-profile {
  /* La foto queda com a element separat a la dreta de tot. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-text);
}

.btn-profile__name-link {
  text-decoration: none;
}

.btn-profile__avatar,
.btn-profile__fallback {
  /* Tant la foto real com el fallback comparteixen la mateixa caixa circular. */
  width: 54px;
  height: 54px;
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
  /* El nom queda separat de la foto i en negre, tal com al wireframe. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-radius: 16px;
  padding: 0.65rem 1.1rem;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .navbar {
    height: auto;
    min-height: 68px;
    padding: 0.6rem 0.75rem;
    gap: 0.65rem;
  }

  .navbar-left {
    flex: 1;
    gap: 0.55rem;
    min-width: 0;
  }

  .navbar-name,
  .navbar-right {
    display: none;
  }

  .navbar-brand {
    gap: 0;
  }

  .navbar-mobile-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1.2rem;
    cursor: pointer;
  }

  .navbar-search {
    position: relative;
    flex: 1;
    min-width: 0;
    display: none;
    z-index: 35;
    box-shadow: none;
  }

  .navbar-search--mobile-open {
    display: flex;
  }

  .navbar-mobile-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
  }

  .navbar-mobile-icon {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .navbar-mobile-auth-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0.5rem 0.8rem;
    border-radius: 14px;
    border: 1px solid var(--color-button-primary);
    background: var(--color-button-primary);
    color: var(--color-button-primary-text);
    text-decoration: none;
    font-size: 0.82rem;
    white-space: nowrap;
  }

  .navbar-mobile-profile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .btn-primary--mobile {
    padding: 0.5rem 0.8rem;
    font-size: 0.82rem;
  }

  .btn-profile__avatar,
  .btn-profile__fallback {
    width: 42px;
    height: 42px;
  }

  .navbar-search input {
    width: 100%;
    min-width: 0;
  }

  .navbar-mobile-menu {
    position: absolute;
    top: calc(100% + 0.45rem);
    left: 0.8rem;
    width: min(280px, calc(100vw - 1.6rem));
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.5rem;
    border-radius: 14px;
    border: 1px solid var(--color-border);
    background: #fff;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
    z-index: 35;
  }

  .navbar-mobile-menu__link {
    padding: 0.8rem 0.9rem;
    border-radius: 10px;
    text-decoration: none;
    color: var(--color-text);
    background: #f8f7f3;
    border: 1px solid transparent;
    text-align: left;
    font: inherit;
  }

  .navbar-mobile-menu__link--button {
    border: none;
    cursor: pointer;
  }
}

@media (max-width: 640px) {
  .navbar {
    min-height: 64px;
    padding: 0.55rem 0.6rem;
  }

  .navbar-mobile-actions {
    gap: 0.4rem;
  }

  .navbar-mobile-auth-link {
    padding: 0.45rem 0.68rem;
    font-size: 0.76rem;
  }
}
</style>

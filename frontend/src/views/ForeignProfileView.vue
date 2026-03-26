<template>
  <!--
    Aquesta vista és per a perfils aliens.
    Aquí és molt important no barrejar el perfil propi amb el perfil d'una altra persona.
    Per això aquesta pàgina només mostra:
    - nom
    - avatar
    - últimes publicacions públiques
    I deixem fora qualsevol secció personal o privada.
  -->
  <section class="foreign-profile-view">
    <!-- Estat simple de càrrega mentre arriben les dades -->
    <div v-if="isLoading" class="foreign-profile-state">
      Carregant perfil públic...
    </div>

    <!-- Estat d'error si backend no respon o l'usuari no existeix -->
    <div v-else-if="errorMessage" class="foreign-profile-state foreign-profile-state--error">
      {{ errorMessage }}
    </div>

    <!-- Contingut principal quan ja tenim dades -->
    <article v-else-if="profile" class="foreign-profile-card">
      <header class="foreign-profile-header">
        <!-- Mateixa idea visual que al perfil propi: contingut a l'esquerra, foto a la dreta -->
        <div class="foreign-profile-header__main">
          <div class="foreign-profile-header__identity">
            <h1 class="foreign-profile-header__title">{{ fullName }}</h1>
          </div>

          <!--
            En perfil aliè mantenim només la secció pública de publicacions.
            No mostrem likes personals, ni cims guardats, ni editar perfil.
          -->
          <HorizontalCarousel
            title="Últimes publicacions"
            :items="publications"
            empty-text="Aquest usuari encara no té publicacions visibles."
          >
            <template #item="{ item }">
              <ProfilePublicationCard :publication="item" />
            </template>
          </HorizontalCarousel>
        </div>

        <img :src="profileImage" :alt="fullName" class="foreign-profile-header__avatar" />
      </header>

      <!-- Placeholder simple d'awards per mantenir el buit funcional reservat -->
      <section class="foreign-profile-section foreign-profile-section--placeholder">
        <h2 class="foreign-profile-section__title">Awards</h2>
        <p class="foreign-profile-section__text">
          Aquesta part quedarà disponible més endavant quan es defineixi i s’implementi la part
          d’estadístiques i insígnies.
        </p>
      </section>
    </article>
  </section>
</template>

<script setup>
// Aquí fem servir el mateix patró reactiu del perfil propi, però simplificat.
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import HorizontalCarousel from '../components/HorizontalCarousel.vue'
import ProfilePublicationCard from '../components/ProfilePublicationCard.vue'
import { resolveMediaUrl } from '../utils/media'

const route = useRoute()

// Estat principal de la vista
const profile = ref(null)
const publications = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

// Imatge de suport si l'usuari no té avatar o la ruta falla
const fallbackAvatar =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'

const fullName = computed(() => {
  // Muntem el nom visible de la mateixa manera que al perfil propi.
  if (!profile.value) return ''
  return [profile.value.nom, profile.value.cognom].filter(Boolean).join(' ') || profile.value.nomUsuari
})

const profileImage = computed(
  () => resolveMediaUrl(profile.value?.fotoPerfil) || fallbackAvatar,
)

function getApiErrorMessage(error, fallbackMessage) {
  // Intentem aprofitar el text que hagi donat backend abans d'ensenyar un missatge genèric.
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallbackMessage
  )
}

async function fetchForeignProfile() {
  // Aquesta funció carrega el perfil públic i les seves publicacions.
  // No demanem likes ni saved perquè aquestes parts són privades del perfil propi.
  isLoading.value = true
  errorMessage.value = ''

  try {
    const userId = String(route.params.id)

    // Fem les dues peticions en paral·lel perquè la càrrega sigui més àgil.
    const [profileResponse, publicationsResponse] = await Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/users/${userId}/publications`),
    ])

    // Guardem el resultat a l'estat reactiu.
    profile.value = profileResponse.data.user
    publications.value = publicationsResponse.data.publications || []
  } catch (error) {
    // Si alguna cosa falla, netegem les dades i mostrem error.
    profile.value = null
    publications.value = []
    errorMessage.value = getApiErrorMessage(error, 'No hem pogut carregar aquest perfil públic.')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    // Tornem a carregar cada vegada que canvia l'id de la URL.
    fetchForeignProfile()
  },
  { immediate: true },
)
</script>

<style scoped>
/* Contenidor general de la pàgina */
.foreign-profile-view {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

/* Aparença bàsica dels estats i de la targeta principal */
.foreign-profile-state,
.foreign-profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
}

.foreign-profile-state--error {
  border-color: #e2caca;
  background: #fff7f7;
  color: #9a4d4d;
}

/* Header amb dues columnes: contingut i avatar */
.foreign-profile-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 2rem;
}

/* Columna esquerra del header */
.foreign-profile-header__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.foreign-profile-header__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 1.02;
  color: var(--color-text);
}

/* Avatar del perfil aliè */
.foreign-profile-header__avatar {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: #f2f1ec;
}

/* Separació vertical entre les diferents seccions de la pàgina */
.foreign-profile-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Caixa provisional per a awards futurs */
.foreign-profile-section--placeholder {
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: #f4f1e6;
  border: 1px dashed #d8d2bc;
}

.foreign-profile-section__title {
  margin: 0 0 0.5rem;
  font-size: 1.55rem;
}

.foreign-profile-section__text {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

@media (max-width: 760px) {
  /* En mòbil eliminem la doble columna i ho apilem */
  .foreign-profile-header {
    grid-template-columns: 1fr;
  }

  .foreign-profile-header__avatar {
    width: 160px;
    height: 160px;
  }
}
</style>

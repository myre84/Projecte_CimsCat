<template>
  <!--
    Aquesta és la vista del perfil propi.
    La idea d'aquesta pàgina és:
    1) carregar les dades del mateix usuari autenticat
    2) mostrar-les en un format semblant al wireframe
    3) separar bé cada tipus de contingut:
       - publicacions pròpies
       - publicacions amb like (visualment "guardades")
       - cims guardats
    4) mostrar rutes planificades i awards amb dades del backend
  -->
  <section class="profile-view">
    <!-- Si encara estem esperant la resposta del backend, mostrem aquest estat simple -->
    <div v-if="isLoading" class="profile-state">
      Carregant perfil...
    </div>

    <!-- Si alguna crida falla, ensenyem un missatge d'error en comptes de deixar la pàgina buida -->
    <div v-else-if="errorMessage" class="profile-state profile-state--error">
      {{ errorMessage }}
    </div>

    <!-- Quan ja tenim dades del perfil, renderitzem el contingut real -->
    <article v-else-if="profile" class="profile-card">
      <header class="profile-header">
        <div class="profile-header__main">
          <div class="profile-header__identity">
            <h1 class="profile-header__title">{{ fullName }}</h1>
          </div>

          <button class="profile-header__edit" type="button" @click="isEditModalOpen = true">
            Editar perfil
          </button>
        </div>

        <!--
          Aquesta columna dreta representa la part de "identitat":
          foto de perfil.
        -->
        <div class="profile-header__aside">
          <img :src="profileImage" :alt="fullName" class="profile-header__avatar" />
        </div>
      </header>

      <HorizontalCarousel
        title="Últimes publicacions"
        :items="ownPublications"
        empty-text="Encara no has publicat cap sortida."
      >
        <template #item="{ item }">
          <ProfilePublicationCard :publication="item" />
        </template>
      </HorizontalCarousel>

      <!--
        Aquesta secció visualment diu "Publicacions guardades",
        però tècnicament ve de l'endpoint de likes.
        Ho fem així perquè el text és més natural per l'usuari final.
      -->
      <HorizontalCarousel
        title="Publicacions guardades"
        :items="likedPublications"
        empty-text="Encara no has donat like a cap publicació."
      >
        <template #item="{ item }">
          <ProfilePublicationCard :publication="item" />
        </template>
      </HorizontalCarousel>

      <!-- Aquí sí parlem de cims oficials guardats, no de publicacions -->
      <HorizontalCarousel
        title="Cims guardats"
        :items="savedPeaks"
        empty-text="Encara no tens cap cim guardat."
      >
        <template #item="{ item }">
          <ProfilePeakCard :peak="item" />
        </template>
      </HorizontalCarousel>

      <HorizontalCarousel
        title="Rutes planificades"
        :items="plannedRoutes"
        empty-text="Encara no tens cap ruta planificada guardada."
      >
        <template #item="{ item }">
          <article class="profile-route-card">
            <h3 class="profile-route-card__title">{{ item.nom || 'Ruta sense nom' }}</h3>
            <p class="profile-route-card__meta">
              {{ item.tipusActivitat || 'senderisme' }} · {{ item.ritme || 'moderat' }} ·
              {{ formatRouteType(item.tipusRecorregut) }}
            </p>
            <p class="profile-route-card__stats">
              {{ formatDistance(item.distanciaKm) }} · {{ formatTime(item.tempsMin) }} ·
              {{ item.waypointsCount || 0 }} punts
            </p>
            <p class="profile-route-card__peak">
              {{ item.peak?.nom || 'Cim no disponible' }} · {{ item.peak?.comarca || 'Comarca' }}
            </p>
            <p class="profile-route-card__date">Guardada {{ formatDate(item.createdAt) }}</p>
            <RouterLink :to="`/planificar?routeId=${item.id}`" class="profile-route-card__link">
              Veure ruta
            </RouterLink>
          </article>
        </template>
      </HorizontalCarousel>

      <section class="profile-section profile-section--awards">
        <h2 class="profile-section__title">Awards</h2>
        <p class="profile-section__text">
          Aquest bloc mostra estadístiques, reptes i insígnies calculats des dels endpoints oficials
          del backend.
        </p>

        <ProfileStatsBanner :stats="stats" />

        <p v-if="isCatalogLoading" class="profile-awards-note">
          Carregant dades d&apos;awards...
        </p>

        <p v-else-if="awardsError" class="profile-awards-note profile-awards-note--error">
          {{ awardsError }}
        </p>

        <div class="profile-awards-grid">
          <AwardDonutCard
            v-for="challenge in challenges"
            :key="challenge.id"
            :challenge="challenge"
          />
        </div>

        <BadgeGrid :badges="badges" />
      </section>
    </article>

    <!--
      El modal només apareix quan l'usuari clica "Editar perfil".
      Li passem:
      - el formulari inicial
      - l'estat de loading del guardat
      - els esdeveniments de tancar i enviar
    -->
    <EditProfileModal
      v-if="isEditModalOpen"
      :initial-form="editForm"
      :loading="isSavingProfile"
      @close="isEditModalOpen = false"
      @submit="handleProfileUpdate"
    />
  </section>
</template>

<script setup>
// computed ens serveix per derivar valors sense haver-los de recalcular a mà tota l'estona.
// ref ens permet guardar l'estat reactiu d'aquesta vista.
// watch ens ajuda a reaccionar quan canvia la URL.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'
import HorizontalCarousel from '../components/HorizontalCarousel.vue'
import ProfilePublicationCard from '../components/ProfilePublicationCard.vue'
import ProfilePeakCard from '../components/ProfilePeakCard.vue'
import EditProfileModal from '../components/EditProfileModal.vue'
import ProfileStatsBanner from '../components/ProfileStatsBanner.vue'
import AwardDonutCard from '../components/AwardDonutCard.vue'
import BadgeGrid from '../components/BadgeGrid.vue'
import { useUserStore } from '../stores/user'
import { resolveMediaUrl } from '../utils/media'
import { useProfileAwards } from '../composables/useProfileAwards'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Aquí guardem les diferents peces de dades que volem mostrar al perfil.
const profile = ref(null)
const ownPublications = ref([])
const likedPublications = ref([])
const savedPeaks = ref([])
const plannedRoutes = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const isEditModalOpen = ref(false)
const isSavingProfile = ref(false)
const { stats, challenges, badges, isCatalogLoading, awardsError } = useProfileAwards(
  ownPublications,
  computed(() => userStore.user?.id || ''),
)

// Si el backend no retorna cap foto o la foto falla, fem servir aquesta imatge de suport.
const fallbackAvatar =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'

const fullName = computed(() => {
  // Aquí intentem construir el nom gran del perfil de la manera més amigable possible.
  // Si tenim nom i cognom, els unim.
  // Si no, mostrem el nom d'usuari.
  if (!profile.value) return ''
  return [profile.value.nom, profile.value.cognom].filter(Boolean).join(' ') || profile.value.nomUsuari
})

const profileImage = computed(() => resolveMediaUrl(profile.value?.fotoPerfil) || fallbackAvatar)

const editForm = computed(() => ({
  // Aquesta computed prepara l'objecte base que rebrà el modal.
  // Ho fem així perquè el modal sempre rebi dades actualitzades del perfil.
  nom: profile.value?.nom || '',
  cognom: profile.value?.cognom || '',
  nomUsuari: profile.value?.nomUsuari || '',
  fotoPerfil: profile.value?.fotoPerfil || '',
}))
function getApiErrorMessage(error, fallbackMessage) {
  // Intentem recuperar el missatge més concret que ens hagi tornat el backend.
  // Si no hi ha cap text útil, fem servir el missatge genèric que ens arriba per paràmetre.
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallbackMessage
  )
}

function normalizeSavedPeaks(items) {
  // El backend ens retorna cada element guardat embolicat dins d'un objecte "saved".
  // Aquí el que fem és aplanar la forma perquè la targeta del cim ho tingui més fàcil.
  return (items || []).map((item) => ({
    ...item.peak,
    savedAt: item.savedAt,
  }))
}

function normalizeLikedPublications(items) {
  // Amb els likes passa una cosa semblant:
  // backend retorna un objecte de like que conté la publicació.
  // Aquí convertim cada element en una publicació "normal" per reutilitzar la targeta.
  return (items || []).map((item) => ({
    ...item.publication,
    likedAt: item.likedAt,
  }))
}

async function fetchOwnProfile() {
  // Aquesta ruta queda reservada al perfil propi.
  // Si l'id de la URL no és el de l'usuari loguejat, el redirigim al perfil aliè.
  const currentUserId = userStore.user?.id
  const targetUserId = String(route.params.id)

  if (!currentUserId) {
    router.push('/login')
    return
  }

  if (targetUserId !== currentUserId) {
    router.replace(`/usuari/${targetUserId}`)
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // Fem totes les peticions en paral·lel perquè la pàgina carregui més ràpid.
    const [profileResponse, publicationsResponse, likesResponse, savedResponse, routesResponse] = await Promise.all([
      api.get(`/users/${currentUserId}`),
      api.get(`/users/${currentUserId}/publications`),
      api.get(`/users/${currentUserId}/likes`),
      api.get(`/users/${currentUserId}/saved`),
      api.get(`/users/${currentUserId}/routes`),
    ])

    // Guardem cada bloc de dades a l'estat reactiu corresponent.
    profile.value = profileResponse.data.user
    ownPublications.value = publicationsResponse.data.publications || []
    likedPublications.value = normalizeLikedPublications(likesResponse.data.likes)
    savedPeaks.value = normalizeSavedPeaks(savedResponse.data.saved)
    plannedRoutes.value = routesResponse.data.routes || []
  } catch (error) {
    // Si alguna crida falla, netegem la vista perquè no quedin dades a mig estat.
    profile.value = null
    ownPublications.value = []
    likedPublications.value = []
    savedPeaks.value = []
    plannedRoutes.value = []
    errorMessage.value = getApiErrorMessage(error, 'No hem pogut carregar el teu perfil.')
  } finally {
    isLoading.value = false
  }
}

function formatDistance(value) {
  const number = Number(value || 0)
  return `${number.toLocaleString('ca-ES', {
    minimumFractionDigits: Number.isInteger(number) ? 0 : 1,
    maximumFractionDigits: 1,
  })} km`
}

function formatTime(minutesValue) {
  const minutes = Number(minutesValue || 0)
  if (!Number.isFinite(minutes) || minutes <= 0) return '0 min'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return `${hours} h ${rest.toString().padStart(2, '0')} min`
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'data no disponible'
  return date.toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRouteType(value) {
  const labels = {
    'one-way': 'anada',
    'round-trip': 'anada i tornada',
    circular: 'circular',
  }

  return labels[value] || value || 'anada'
}

async function handleProfileUpdate(payload) {
  // Aquesta funció s'executa quan el modal ens envia el formulari ja validat.
  isSavingProfile.value = true

  try {
    const currentUserId = userStore.user?.id
    let fotoPerfil = payload.fotoPerfil

    if (payload.fotoPerfilFile) {
      const formData = new FormData()
      formData.append('image', payload.fotoPerfilFile)

      const uploadResponse = await api.post('/uploads/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      fotoPerfil = uploadResponse.data.file.url
    }

    const { fotoPerfilFile, ...profilePayload } = payload
    const { data } = await api.put(`/users/${currentUserId}`, {
      ...profilePayload,
      fotoPerfil,
    })

    // Actualitzem el perfil de la vista amb la resposta nova.
    profile.value = data.user

    // També actualitzem la store global perquè el navbar i la resta de l'app
    // reflecteixin el nom o la foto nous sense haver de recarregar la pàgina.
    userStore.setUser(
      {
        ...userStore.user,
        ...data.user,
      },
      userStore.token,
    )

    isEditModalOpen.value = false
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut actualitzar el perfil.'))
  } finally {
    isSavingProfile.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    // Cada vegada que la URL del perfil canvia, tornem a carregar el perfil.
    // Amb immediate: true també fem la primera càrrega quan la vista es munta.
    fetchOwnProfile()
  },
  { immediate: true },
)
</script>

<style scoped>
/* Amplada màxima i espai lateral de la pàgina sencera del perfil */
.profile-view {
  max-width: 1160px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

/* Estil bàsic per als estats de loading/error */
.profile-state {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
}

.profile-state--error {
  background: #fff7f7;
  border-color: #e2caca;
  color: #9a4d4d;
}

/* El contingut intern del perfil s'apila verticalment per seccions */
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

/* Header principal del perfil: identitat textual a l'esquerra i foto/edició a la dreta */
.profile-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 2rem;
  align-items: start;
}

/* Columna principal del header: només la identitat principal */
.profile-header__main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.9rem;
  min-height: 100%;
}

.profile-header__title {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1.02;
  color: var(--color-text);
}

/* Columna dreta: foto i boto d'editar */
.profile-header__aside {
  display: flex;
  justify-content: flex-end;
}

.profile-header__avatar {
  width: 136px;
  height: 136px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: #f2f1ec;
}

/* Boto d'editar perfil */
.profile-header__edit {
  border: none;
  border-radius: 12px;
  background: #efe9f7;
  color: var(--color-text);
  padding: 0.7rem 0.95rem;
  cursor: pointer;
  font: inherit;
}

/* Caixes placeholder per a funcionalitats futures */
.profile-section--placeholder {
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: #f4f1e6;
  border: 1px dashed #d8d2bc;
}

/* El bloc d'awards ja va connectat amb backend, per això li donem un estil "real". */
.profile-section--awards {
  padding: 1.25rem 1.35rem;
  border-radius: 16px;
  background: #f4f1e6;
  border: 1px solid #d8d2bc;
}

.profile-section__title {
  margin: 0 0 0.65rem;
  font-size: 1.65rem;
  color: var(--color-text);
}

.profile-section__text {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.profile-awards-note {
  margin: 1rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.6;
}

.profile-awards-note--error {
  color: #9a3e34;
}

.profile-awards-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-route-card {
  width: 260px;
  min-width: 260px;
  min-height: 260px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.profile-route-card__title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.2rem;
}

.profile-route-card__meta,
.profile-route-card__stats,
.profile-route-card__peak,
.profile-route-card__date {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.45;
}

.profile-route-card__date {
  font-size: 0.92rem;
}

.profile-route-card__link {
  width: fit-content;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  background: #fff;
  margin-top: 0.25rem;
}

@media (max-width: 900px) {
  .profile-header {
    grid-template-columns: minmax(0, 1fr) 92px;
    align-items: start;
    gap: 1rem;
  }

  .profile-header__main {
    grid-column: 1;
    grid-row: 1;
    gap: 0.7rem;
  }

  .profile-header__aside {
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
    align-self: start;
  }

  .profile-header__avatar {
    width: 88px;
    height: 88px;
  }

  .profile-header__edit {
    padding: 0.6rem 0.9rem;
  }

  .profile-awards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

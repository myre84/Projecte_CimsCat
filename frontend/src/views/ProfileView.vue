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
    4) deixar preparades seccions futures com Awards i Rutes planificades
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
        <!--
          Aquest bloc esquerre és la "part editorial" del perfil:
          nom gran + primera secció de contingut.
          Ho fem així perquè visualment s'assembla més al wireframe.
        -->
        <div class="profile-header__main">
          <div class="profile-header__identity">
            <h1 class="profile-header__title">{{ fullName }}</h1>
          </div>

          <!--
            Primera fila important del perfil:
            últimes publicacions pròpies de l'usuari.
            Reutilitzem el component de carousel perquè després el puguem fer servir
            també a altres seccions.
          -->
          <HorizontalCarousel
            title="Últimes publicacions"
            :items="ownPublications"
            empty-text="Encara no has publicat cap sortida."
          >
            <template #item="{ item }">
              <ProfilePublicationCard :publication="item" />
            </template>
          </HorizontalCarousel>
        </div>

        <!--
          Aquesta columna dreta representa la part de "identitat":
          foto de perfil + acció principal d'editar.
        -->
        <div class="profile-header__aside">
          <img :src="profileImage" :alt="fullName" class="profile-header__avatar" />

          <button class="profile-header__edit" type="button" @click="isEditModalOpen = true">
            Editar perfil
          </button>
        </div>
      </header>

      <!--
        Aquesta secció visualment diu "Publicacions guardades",
        però tècnicament ve de l'endpoint de likes.
        Ho fem així perquè el text és més natural per l'usuari final.
      -->
      <HorizontalCarousel
        title="Publicacions guardades"
        description="Aquesta secció mostra les publicacions a les quals has donat like."
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

      <!-- Placeholder conscient: aquesta part encara no té backend ni lògica real d'usuari -->
      <section class="profile-section profile-section--placeholder">
        <h2 class="profile-section__title">Rutes planificades</h2>
        <p class="profile-section__text">
          Aquesta part quedarà disponible quan s’implementi la funcionalitat de planificar rutes i
          la seva relació amb el perfil de l’usuari.
        </p>
      </section>

      <!-- Placeholder visual per a les estadístiques i insígnies futures -->
      <section class="profile-section profile-section--placeholder">
        <h2 class="profile-section__title">Awards</h2>
        <p class="profile-section__text">
          Aquest bloc queda reservat per a estadístiques, insígnies i reptes. De moment només el
          deixem preparat visualment per al futur.
        </p>

        <div class="profile-awards-grid">
          <article class="profile-award-stat">0 km aquest any</article>
          <article class="profile-award-stat">0 km aquest mes</article>
          <article class="profile-award-stat">0 km aquesta setmana</article>
          <div class="profile-award-box">Gràfica de progrés pendent</div>
          <div class="profile-award-box">Reptes i llistats pendents</div>
          <div class="profile-award-box">Insígnies pendents</div>
        </div>
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
import { useUserStore } from '../stores/user'
import { resolveMediaUrl } from '../utils/media'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// Aquí guardem les diferents peces de dades que volem mostrar al perfil.
const profile = ref(null)
const ownPublications = ref([])
const likedPublications = ref([])
const savedPeaks = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const isEditModalOpen = ref(false)
const isSavingProfile = ref(false)

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
    const [profileResponse, publicationsResponse, likesResponse, savedResponse] = await Promise.all([
      api.get(`/users/${currentUserId}`),
      api.get(`/users/${currentUserId}/publications`),
      api.get(`/users/${currentUserId}/likes`),
      api.get(`/users/${currentUserId}/saved`),
    ])

    // Guardem cada bloc de dades a l'estat reactiu corresponent.
    profile.value = profileResponse.data.user
    ownPublications.value = publicationsResponse.data.publications || []
    likedPublications.value = normalizeLikedPublications(likesResponse.data.likes)
    savedPeaks.value = normalizeSavedPeaks(savedResponse.data.saved)
  } catch (error) {
    // Si alguna crida falla, netegem la vista perquè no quedin dades a mig estat.
    profile.value = null
    ownPublications.value = []
    likedPublications.value = []
    savedPeaks.value = []
    errorMessage.value = getApiErrorMessage(error, 'No hem pogut carregar el teu perfil.')
  } finally {
    isLoading.value = false
  }
}

async function handleProfileUpdate(payload) {
  // Aquesta funció s'executa quan el modal ens envia el formulari ja validat.
  isSavingProfile.value = true

  try {
    const currentUserId = userStore.user?.id
    const { data } = await api.put(`/users/${currentUserId}`, payload)

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

/* Estil bàsic compartit per als estats de loading/error i la targeta principal */
.profile-state,
.profile-card {
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
}

/* Header principal del perfil: contingut a l'esquerra i identitat a la dreta */
.profile-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 2rem;
  align-items: start;
}

/* Columna principal del header: nom + primera secció */
.profile-header__main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

.profile-header__avatar {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
  justify-self: center;
  align-self: center;
  background: #f2f1ec;
}

/* Boto d'editar perfil */
.profile-header__edit {
  border: none;
  border-radius: 12px;
  background: #efe9f7;
  color: var(--color-text);
  padding: 0.9rem 1rem;
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

/* Graella d'awards provisional mentre no hi hagi dades reals */
.profile-awards-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.profile-award-stat,
.profile-award-box {
  border-radius: 14px;
  border: 1px solid #ddd8c6;
  background: #fffaf1;
  padding: 1rem;
  color: var(--color-text-soft);
}

.profile-award-box {
  min-height: 120px;
  display: grid;
  place-items: center;
  text-align: center;
}

@media (max-width: 900px) {
  /* En pantalles petites passem a una sola columna perquè el layout respiri millor */
  .profile-header {
    grid-template-columns: 1fr;
  }

  .profile-header__aside {
    align-items: flex-start;
  }

  .profile-header__avatar {
    width: 170px;
    height: 170px;
  }

  .profile-awards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

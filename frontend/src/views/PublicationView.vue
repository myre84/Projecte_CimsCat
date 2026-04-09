<template>
  <!--
    Aquesta és la pàgina final d'una publicació.
    Aquí volem que l'usuari vegi la seva sortida de manera "editorial":
    títol, autor, fitxa tècnica, galeria, comentaris i enllaç al cim.
  -->
  <section class="publication-view">
    <div v-if="isLoading" class="publication-state">
      <p class="publication-state__title">Carregant publicació...</p>
      <p class="publication-state__text">Estem recuperant el detall complet de la sortida.</p>
    </div>

    <div v-else-if="errorMessage" class="publication-state publication-state--error">
      <p class="publication-state__title">No hem pogut carregar la publicació</p>
      <p class="publication-state__text">{{ errorMessage }}</p>
      <button class="publication-state__button" type="button" @click="fetchPublication">
        Tornar-ho a provar
      </button>
    </div>

    <article v-else-if="publication" class="publication-card">
      <p v-if="isUsingMockPublication" class="publication-mock-notice">
        S&apos;està mostrant una publicació temporal mentre el backend de publicacions no està disponible.
      </p>

      <header class="publication-header">
        <div class="publication-header__top">
          <div class="publication-header__main">
            <p class="publication-eyebrow">Pàgina de publicació</p>
            <h1 class="publication-title">{{ publication.titol }}</h1>

            <RouterLink :to="authorProfileLink" class="publication-author">
              <span class="publication-author__label">by {{ authorName }}</span>
              <img
                :src="authorImage"
                :alt="publication.author.nomUsuari || publication.author.nom || 'Autor'"
                class="publication-author__avatar"
              />
            </RouterLink>
          </div>

          <div class="publication-header__actions">
            <button
              class="publication-like"
              :class="{ 'publication-like--active': isLiked }"
              type="button"
              :aria-pressed="isLiked"
              @click="handleLikeClick"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12.1 20.3 4.7 13a4.8 4.8 0 0 1 0-6.8 4.7 4.7 0 0 1 6.7 0l.6.6.6-.6a4.7 4.7 0 0 1 6.7 0 4.8 4.8 0 0 1 0 6.8l-7.4 7.3a.5.5 0 0 1-.8 0Z"
                />
              </svg>
              <span>{{ publication.stats.likesCount }}</span>
            </button>

            <RouterLink
              v-if="publication.peak?.id"
              :to="`/cim/${publication.peak.id}`"
              class="publication-peak-link"
            >
              Veure cim
            </RouterLink>
          </div>
        </div>
      </header>

      <section class="publication-banner">
        <h2 class="publication-section-title publication-section-title--banner">Fitxa tècnica ruta</h2>

        <div class="publication-banner__grid">
          <article class="publication-chip">Distància: {{ formatDistance(publication.distanciaKm) }}</article>
          <article class="publication-chip">Desnivell positiu: {{ formatMeters(publication.desnivellPosM) }}</article>
          <article class="publication-chip">Desnivell negatiu: {{ formatAltitudeValue(publication.desnivellNegM) }}</article>
          <article class="publication-chip">Dif. tècnica: {{ formatDifficulty(publication.dificultat) }}</article>
          <article class="publication-chip">Altitud màx: {{ formatAltitudeValue(publication.altitudMaxM) }}</article>
          <article class="publication-chip">Altitud mín: {{ formatAltitudeValue(publication.altitudMinM) }}</article>
          <article class="publication-chip">Temps: {{ formatTime(publication.tempsMin) }}</article>
          <article class="publication-chip">Data realització: {{ formatMonthYear(publication.dataActivitat) }}</article>
          <article class="publication-chip">Comarca: {{ publication.peak?.comarca || 'No informada' }}</article>
          <article class="publication-chip">Cim associat: {{ publication.peak?.nom || 'No informat' }}</article>
        </div>
      </section>

      <section class="publication-copy">
        <h2 class="publication-section-title">Descripció</h2>
        <p class="publication-description">{{ publication.descripcio }}</p>
      </section>

      <section class="publication-gallery">
        <div class="publication-gallery__header">
          <h2 class="publication-section-title">Imatges destacades</h2>
          <p class="publication-gallery__count">{{ galleryImages.length }} imatges</p>
        </div>

        <div v-if="galleryImages.length" class="publication-gallery__viewer">
          <button
            class="publication-gallery__nav"
            type="button"
            @click="showPreviousImage"
            :disabled="galleryImages.length < 2"
            aria-label="Imatge anterior"
          >
            ←
          </button>

          <div class="publication-gallery__frame">
            <img
              :src="galleryImages[activeImageIndex].src"
              :alt="galleryImages[activeImageIndex].alt"
              class="publication-gallery__image"
            />
          </div>

          <button
            class="publication-gallery__nav"
            type="button"
            @click="showNextImage"
            :disabled="galleryImages.length < 2"
            aria-label="Imatge següent"
          >
            →
          </button>
        </div>

        <div v-if="galleryImages.length > 1" class="publication-gallery__thumbs">
          <button
            v-for="(image, index) in galleryImages"
            :key="image.id"
            class="publication-gallery__thumb"
            :class="{ 'publication-gallery__thumb--active': index === activeImageIndex }"
            type="button"
            @click="activeImageIndex = index"
          >
            <img :src="image.src" :alt="image.alt" />
          </button>
        </div>

        <p v-else-if="!galleryImages.length" class="publication-gallery__empty">
          No hi ha imatges disponibles per aquesta publicació.
        </p>
      </section>

      <section class="publication-map-placeholder">
        <div>
          <h2 class="publication-section-title">Mapa de la ruta</h2>
          <p class="publication-map-placeholder__text">
            Aquesta secció s’activarà quan estigui connectada la part de planificar ruta.
          </p>
        </div>

        <a
          v-if="publication.trackUrl"
          class="publication-map-placeholder__track"
          :href="publication.trackUrl"
          target="_blank"
          rel="noreferrer"
        >
          Guardar track
        </a>
      </section>

      <section class="publication-comments">
        <div class="publication-comments__header">
          <h2 class="publication-section-title">Comentaris</h2>
          <span class="publication-comments__count">
            {{ publication.stats.commentsCount }} comentaris
          </span>
        </div>

        <form class="publication-comments__form" @submit.prevent="handleCommentSubmit">
          <label class="publication-comments__label" for="comment-input">
            Afegir comentari
          </label>
          <textarea
            id="comment-input"
            v-model="commentDraft"
            class="publication-comments__textarea"
            rows="4"
            placeholder="Escriu la teva aportació sobre aquesta sortida..."
          />
          <div class="publication-comments__actions">
            <p v-if="commentNotice" class="publication-comments__notice">
              {{ commentNotice }}
            </p>
            <button class="publication-comments__button" type="submit">
              Publicar comentari
            </button>
          </div>
        </form>

        <div v-if="publication.comments.length" class="publication-comments__list">
          <article
            v-for="comment in publication.comments"
            :key="comment.id"
            class="publication-comment"
          >
            <img
              :src="resolveMediaUrl(comment.author.fotoPerfil) || fallbackAvatar"
              :alt="comment.author.nomUsuari || comment.author.nom || 'Usuari'"
              class="publication-comment__avatar"
            />
            <div class="publication-comment__body">
              <div class="publication-comment__top">
                <strong>{{ formatAuthor(comment.author) }}</strong>
                <span>{{ formatLongDate(comment.createdAt) }}</span>
              </div>
              <p>{{ comment.text }}</p>
            </div>
          </article>
        </div>

        <p v-else class="publication-comments__empty">
          Encara no hi ha comentaris en aquesta publicació.
        </p>
      </section>
    </article>
  </section>
</template>

<script setup>
// computed ens ajuda a construir derivades de la publicació, com la galeria o l'estat del like.
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'
import { useUserStore } from '../stores/user'
import { resolveMediaUrl } from '../utils/media'
import { findMockPublicationById } from '../utils/mockPublications'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const publication = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isUsingMockPublication = ref(false)
const activeImageIndex = ref(0)
const commentDraft = ref('')
const commentNotice = ref('')

// Aquesta imatge és el fallback del perfil si l'autor o un comentarista no tenen foto.
const fallbackAvatar =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80'

const galleryImages = computed(() => {
  // Construïm la galeria final així:
  // 1) si hi ha images, fem servir aquestes
  // 2) si no hi ha images però sí portada, la convertim en una galeria d'1 sola imatge
  // 3) si no hi ha res, retornem una llista buida
  if (!publication.value) return []

  const images = publication.value.images?.length
    ? publication.value.images
    : publication.value.portadaUrl
      ? [{ id: 'cover', imageUrl: publication.value.portadaUrl }]
      : []

  return images.map((image, index) => ({
    id: image.id || `img-${index}`,
    src: resolveMediaUrl(image.imageUrl || image.portadaUrl || publication.value.portadaUrl),
    alt: `${publication.value.titol} - imatge ${index + 1}`,
  }))
})

const isLiked = computed(() => {
  // El "like actiu" és només de lectura mentre backend no tingui toggle like.
  if (!publication.value || !userStore.user?.id) return false
  return publication.value.likes.some((like) => like.user.id === userStore.user.id)
})

const authorName = computed(() => {
  if (!publication.value) return ''
  return formatAuthor(publication.value.author)
})

const authorImage = computed(
  () => resolveMediaUrl(publication.value?.author?.fotoPerfil) || fallbackAvatar,
)

const authorProfileLink = computed(() => {
  const authorId = publication.value?.author?.id

  if (!authorId) return '/login'

  return userStore.user?.id === authorId ? `/perfil/${authorId}` : `/usuari/${authorId}`
})

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    'No hem pogut recuperar la publicació.'
  )
}

async function fetchPublication() {
  // Primer intentem carregar la publicació real.
  // Si falla, busquem si existeix una versió temporal al localStorage o als mocks.
  isLoading.value = true
  errorMessage.value = ''
  commentNotice.value = ''
  isUsingMockPublication.value = false

  try {
    const { data } = await api.get(`/publicacions/${route.params.id}`)
    publication.value = data.publication
    activeImageIndex.value = 0
  } catch (error) {
    const fallbackPublication = findMockPublicationById(String(route.params.id))

    if (fallbackPublication) {
      publication.value = fallbackPublication
      activeImageIndex.value = 0
      isUsingMockPublication.value = true
      errorMessage.value = ''
    } else {
      publication.value = null
      errorMessage.value = getApiErrorMessage(error)
    }
  } finally {
    isLoading.value = false
  }
}

function handleLikeClick() {
  // De moment, si no hi ha login, enviem a login.
  // Si hi ha login, deixem un avís perquè encara falta la part backend del toggle.
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  commentNotice.value =
    'El botó de like ja queda preparat al frontend, però encara falta l’endpoint de toggle al backend.'
}

function handleCommentSubmit() {
  // La lectura de comentaris ja existeix, però la creació no.
  // Per això aquí només deixem el formulari preparat i informem del bloqueig real.
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (!commentDraft.value.trim()) {
    commentNotice.value = 'Escriu algun text abans d’enviar el comentari.'
    return
  }

  commentNotice.value =
    'La llista de comentaris ja es llegeix del backend, però falta l’endpoint de creació per publicar-ne de nous.'
}

function showPreviousImage() {
  // Aquestes dues funcions només mouen l'índex de la galeria.
  if (galleryImages.value.length < 2) return
  activeImageIndex.value =
    (activeImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
}

function showNextImage() {
  if (galleryImages.value.length < 2) return
  activeImageIndex.value = (activeImageIndex.value + 1) % galleryImages.value.length
}

function formatAuthor(author) {
  return author?.nomUsuari || [author?.nom, author?.cognom].filter(Boolean).join(' ') || 'Autor desconegut'
}

function formatMeters(value) {
  return `${value} m`
}

function formatDistance(value) {
  // Apliquem format català perquè es vegi "21,17" en comptes de "21.17".
  const numericValue = Number(value)
  return `${numericValue.toLocaleString('ca-ES', {
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
    maximumFractionDigits: 2,
  })} Km`
}

function formatDifficulty(value) {
  if (!value) return 'No informada'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatAltitudeValue(value) {
  return String(value ?? 'No informada')
}

function formatTime(value) {
  // Backend ens dona minuts i aquí ho convertim a un format més humà.
  const total = Number(value)
  const hours = Math.floor(total / 60)
  const minutes = total % 60

  if (!hours) return `${minutes} min`
  if (!minutes) return `${hours} h`
  return `${hours} h ${minutes} min`
}

function formatLongDate(value) {
  return new Date(value).toLocaleDateString('ca-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMonthYear(value) {
  const formatted = new Date(value).toLocaleDateString('ca-ES', {
    month: 'long',
    year: 'numeric',
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

watch(
  () => route.params.id,
  () => {
    fetchPublication()
  },
  { immediate: true },
)
</script>

<style scoped>
.publication-view {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.publication-state,
.publication-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.75rem;
}

.publication-state__title {
  margin: 0 0 0.35rem;
  font-size: 1.65rem;
  color: var(--color-text);
}

.publication-state__text {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

.publication-state--error {
  border-color: #e1c6c6;
  background: #fff7f7;
}

.publication-state__button {
  margin-top: 1rem;
  border: none;
  border-radius: 10px;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  padding: 0.8rem 1.2rem;
  cursor: pointer;
}

.publication-mock-notice {
  margin: 0 0 1rem;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: #f3f5ea;
  border: 1px solid #d8dfc6;
  color: #4d6146;
}

.publication-header {
  margin-bottom: 1.5rem;
}

.publication-header__top {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.publication-eyebrow {
  margin: 0 0 0.4rem;
  color: #8a9581;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.publication-title {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  line-height: 1.02;
  color: var(--color-text);
}

.publication-author {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.publication-author__avatar,
.publication-comment__avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.publication-author__label {
  font-size: 1.85rem;
  font-weight: 500;
}

.publication-header__actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.publication-like,
.publication-peak-link,
.publication-comments__button,
.publication-map-placeholder__track {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  text-decoration: none;
  cursor: pointer;
}

.publication-like {
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text);
}

.publication-like svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.publication-like--active {
  color: #8b3c4a;
  background: #fff2f4;
  border-color: #e8c9cf;
}

.publication-like--active svg {
  fill: currentColor;
}

.publication-peak-link,
.publication-comments__button,
.publication-map-placeholder__track {
  border: none;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
}

.publication-banner {
  margin-top: 1rem;
}

.publication-banner__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.publication-chip {
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: #ece7f3;
  color: #2c2437;
  font-weight: 500;
}

.publication-copy,
.publication-gallery,
.publication-map-placeholder,
.publication-comments {
  margin-top: 2rem;
}

.publication-section-title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.publication-section-title--banner {
  margin-bottom: 1.1rem;
  font-size: 1.95rem;
}

.publication-description {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.8;
  font-size: 1.08rem;
  white-space: pre-line;
  max-width: 78ch;
}

.publication-gallery {
  padding: 1.35rem;
  border-radius: 18px;
  background: #f4f1f8;
}

.publication-gallery__header,
.publication-comments__header,
.publication-comments__actions,
.publication-map-placeholder {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.publication-gallery__count,
.publication-comments__count,
.publication-map-placeholder__text,
.publication-comments__notice,
.publication-gallery__empty,
.publication-comments__empty {
  margin: 0;
  color: var(--color-text-soft);
}

.publication-gallery__viewer {
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  gap: 1rem;
  align-items: center;
}

.publication-gallery__frame {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  min-height: 290px;
}

.publication-gallery__image {
  width: 100%;
  height: 100%;
  min-height: 290px;
  object-fit: cover;
  display: block;
}

.publication-gallery__nav {
  border: none;
  background: transparent;
  font-size: 2rem;
  color: var(--color-text);
  cursor: pointer;
}

.publication-gallery__nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.publication-gallery__thumbs {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.publication-gallery__thumb {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
}

.publication-gallery__thumb img {
  width: 100%;
  height: 128px;
  object-fit: cover;
  display: block;
}

.publication-gallery__thumb--active {
  border-color: #3f5d4f;
}

.publication-map-placeholder {
  padding: 1.35rem;
  border: 1px solid #d7d2df;
  border-radius: 18px;
  background: linear-gradient(180deg, #eef4de 0%, #d8e2bd 100%);
  min-height: 260px;
  position: relative;
  overflow: hidden;
}

.publication-map-placeholder::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 58%;
  background:
    linear-gradient(135deg, rgba(129, 160, 92, 0.28) 25%, transparent 25%) 0 0 / 26px 26px,
    linear-gradient(225deg, rgba(129, 160, 92, 0.18) 25%, transparent 25%) 0 0 / 26px 26px,
    linear-gradient(45deg, rgba(236, 142, 54, 0.88), rgba(227, 104, 41, 0.88));
  clip-path: polygon(0 66%, 16% 57%, 34% 61%, 52% 46%, 67% 50%, 82% 33%, 100% 40%, 100% 100%, 0 100%);
  opacity: 0.72;
}

.publication-comments__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.publication-comments__label {
  font-weight: 600;
}

.publication-comments__textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1rem;
  min-height: 120px;
  resize: vertical;
  background: #fff;
}

.publication-comments__list {
  margin-top: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.publication-comment {
  display: flex;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #fff;
}

.publication-comment__body {
  flex: 1;
}

.publication-comment__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.publication-comment__top span {
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.publication-comment__body p {
  margin: 0.4rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.7;
}

@media (max-width: 900px) {
  .publication-comments__header,
  .publication-comments__actions,
  .publication-map-placeholder {
    flex-direction: column;
    align-items: flex-start;
  }

  .publication-banner__grid {
    grid-template-columns: 1fr 1fr;
  }

  .publication-gallery__frame,
  .publication-gallery__image {
    min-height: 280px;
  }

  .publication-gallery__thumbs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .publication-view {
    padding: 1rem 0.5rem 2rem;
  }

  .publication-card,
  .publication-state {
    padding: 1.1rem;
  }

  .publication-header__top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 1rem;
  }

  .publication-header__main {
    min-width: 0;
  }

  .publication-author {
    width: fit-content;
  }

  .publication-header__actions {
    flex-direction: column;
    align-items: flex-end;
    grid-column: 2;
    grid-row: 1 / span 2;
    justify-self: end;
    align-self: start;
    margin-top: 0;
  }

  .publication-like,
  .publication-peak-link {
    min-width: 120px;
  }

  .publication-banner__grid {
    grid-template-columns: 1fr;
  }

  .publication-gallery__viewer {
    grid-template-columns: 1fr;
  }

  .publication-gallery__nav {
    display: none;
  }

  .publication-gallery__frame,
  .publication-gallery__image {
    min-height: 220px;
  }

  .publication-comment {
    flex-direction: column;
  }
}
</style>

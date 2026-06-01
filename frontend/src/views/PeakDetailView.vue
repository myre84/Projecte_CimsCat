<template>
  <!--
    Aquesta és la fitxa tècnica d'un cim.
    Aquí intentem mostrar:
    - la informació oficial del cim
    - la seva imatge
    - i les publicacions relacionades que apunten a aquest cim
  -->
  <section class="peak-detail-view">
    <div v-if="isLoading" class="peak-detail-state">
      <p class="peak-detail-state__title">Carregant fitxa del cim...</p>
      <p class="peak-detail-state__text">Estem recuperant la informació tècnica del cim.</p>
    </div>

    <div v-else-if="errorMessage" class="peak-detail-state peak-detail-state--error">
      <p class="peak-detail-state__title">No hem pogut carregar el cim</p>
      <p class="peak-detail-state__text">{{ errorMessage }}</p>
      <button class="peak-detail-state__button" type="button" @click="fetchPeakDetail">
        Tornar-ho a provar
      </button>
    </div>

    <div v-else-if="peak" class="peak-detail-card">
      <p class="peak-detail-eyebrow">Fitxa Cim</p>

      <div class="peak-detail-layout">
        <section class="peak-detail-main">
          <header class="peak-detail-header">
            <h1 class="peak-detail-title">{{ peak.nom }}</h1>
            <p class="peak-detail-elevation">{{ formatMeters(peak.alcada) }}</p>
            <p v-if="peak.comarca" class="peak-detail-comarca">{{ peak.comarca }}</p>
            <p v-if="peak.descripcio" class="peak-detail-description">{{ peak.descripcio }}</p>
          </header>

          <section class="peak-detail-section">
            <h2 class="peak-detail-section__title">Localització</h2>
            <ul class="peak-detail-list">
              <li v-for="item in locationItems" :key="item.label">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </section>

          <section class="peak-detail-section">
            <h2 class="peak-detail-section__title">Accessos principals</h2>
            <ul class="peak-detail-list">
              <li v-for="item in accessItems" :key="item.label">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </section>

          <section class="peak-detail-section">
            <h2 class="peak-detail-section__title">Característiques tècniques</h2>
            <ul class="peak-detail-list">
              <li v-for="item in technicalItems" :key="item.label">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </section>

          <section class="peak-detail-section">
            <h2 class="peak-detail-section__title">Refugis i punts d&apos;interès</h2>
            <ul class="peak-detail-list">
              <li v-for="item in refugeItems" :key="item.label">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </section>
        </section>

        <aside class="peak-detail-sidebar">
          <img
            :src="resolvedPeakImage"
            :alt="peak.nom"
            class="peak-detail-image"
          />

          <section class="peak-detail-sidebar__section">
            <h2 class="peak-detail-sidebar__title">Publicacions sobre el cim</h2>

            <div v-if="peak.publications.length" class="publication-list">
              <RouterLink
                v-for="publication in peak.publications"
                :key="publication.id"
                :to="`/publicacio/${publication.id}`"
                class="publication-card"
              >
                <img
                  :src="resolvePublicationImage(publication)"
                  :alt="publication.titol"
                  class="publication-card__image"
                />

                <div class="publication-card__content">
                  <h3 class="publication-card__title">{{ publication.titol }}</h3>
                  <p class="publication-card__author">by {{ formatAuthor(publication.author) }}</p>
                  <button class="publication-card__button" type="button">
                    Veure pàgina del cim
                  </button>
                </div>
              </RouterLink>
            </div>

            <p v-else class="peak-detail-sidebar__empty">
              Encara no hi ha publicacions relacionades amb aquest cim.
            </p>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
// computed ens serveix per construir llistes derivades segons les dades del cim.
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import { resolveMediaUrl } from '../utils/media'
import { getLocalPeakImage } from '../utils/peakImages'

const route = useRoute()

const peak = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

// Si el cim no té imatge o la ruta és incorrecta, fem servir una foto de suport.
const fallbackImage =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80'

// Aquesta computed construeix la URL final de la imatge del cim.
const resolvedPeakImage = computed(
  () => resolveMediaUrl(peak.value?.imatgeUrl) || getLocalPeakImage(peak.value) || fallbackImage,
)

const locationItems = computed(() => {
  // Reconstruïm la localització només amb els camps reals que retorna el backend.
  if (!peak.value) return []

  const items = []

  if (peak.value.massis) items.push({ label: 'Massís', value: peak.value.massis })
  if (peak.value.lat && peak.value.lon) {
    items.push({
      label: 'Coordenades',
      value: `${Number(peak.value.lat).toFixed(4)}, ${Number(peak.value.lon).toFixed(4)}`,
    })
  }
  if (peak.value.zonaProtegida) items.push({ label: 'Zona protegida', value: peak.value.zonaProtegida })

  return items
})

const accessItems = computed(() => {
  // Si hi ha una ruta vinculada al cim, la fem servir com a accés principal.
  // Si no n'hi ha, la secció queda buida.
  if (!peak.value) return []

  const primaryRoute = peak.value.routes?.[0]
  if (!primaryRoute) return []

  const items = []

  items.push({ label: primaryRoute.nom, value: primaryRoute.tipusActivitat || 'Ruta principal' })
  if (primaryRoute.distanciaKm) items.push({ label: 'Distància', value: formatDistance(primaryRoute.distanciaKm) })
  if (primaryRoute.desnivellPosM || primaryRoute.desnivellPosM === 0) {
    items.push({ label: 'Desnivell positiu', value: formatMeters(primaryRoute.desnivellPosM) })
  }
  if (primaryRoute.tempsMin || primaryRoute.tempsMin === 0) {
    items.push({ label: 'Temps estimat', value: formatTime(primaryRoute.tempsMin) })
  }
  if (peak.value.dificultat) items.push({ label: 'Dificultat tècnica', value: peak.value.dificultat })

  return items
})

const technicalItems = computed(() => {
  // Aquest bloc mostra només característiques pròpies del cim o de la ruta principal.
  // No hi posem estadístiques internes com guardats, publicacions o rutes vinculades.
  if (!peak.value) return []

  const primaryRoute = peak.value.routes?.[0]
  const items = [
    { label: 'Alçada', value: formatMeters(peak.value.alcada) },
  ]

  if (peak.value.dificultat) items.push({ label: 'Dificultat', value: peak.value.dificultat })
  if (primaryRoute?.distanciaKm) items.push({ label: 'Distància', value: formatDistance(primaryRoute.distanciaKm) })
  if (primaryRoute?.desnivellPosM || primaryRoute?.desnivellPosM === 0) {
    items.push({ label: 'Desnivell positiu', value: formatMeters(primaryRoute.desnivellPosM) })
  }
  if (primaryRoute?.tempsMin || primaryRoute?.tempsMin === 0) {
    items.push({ label: 'Temps estimat', value: formatTime(primaryRoute.tempsMin) })
  }
  if (primaryRoute?.altitudMaxM || primaryRoute?.altitudMaxM === 0) {
    items.push({ label: 'Altitud màxima', value: formatMeters(primaryRoute.altitudMaxM) })
  }
  if (primaryRoute?.altitudMinM || primaryRoute?.altitudMinM === 0) {
    items.push({ label: 'Altitud mínima', value: formatMeters(primaryRoute.altitudMinM) })
  }
  if (primaryRoute?.ritme) items.push({ label: 'Ritme', value: primaryRoute.ritme })

  return items
})

const refugeItems = computed(() => {
  // Mostrem refugis i punts d'interes reals del backend quan existeixen.
  if (!peak.value) return []

  const items = peak.value.pointsOfInterest || []
  if (!items.length) return []

  return items.map((item) => {
    const label = item.tipus === 'refugi' ? 'Refugi' : "Punt d'interes"
    const parts = [item.nom]

    if (Number.isFinite(Number(item.altitud))) {
      parts.push(formatMeters(item.altitud))
    }

    if (item.descripcio) {
      parts.push(item.descripcio)
    }

    if (Number.isFinite(item.lat) && Number.isFinite(item.lon)) {
      parts.push(`${Number(item.lat).toFixed(4)}, ${Number(item.lon).toFixed(4)}`)
    }

    return { label, value: parts.join(' · ') }
  })
})

function resolvePublicationImage(publication) {
  // Cada publicació relacionada pot tenir portada pròpia.
  // Si no en té, reutilitzem la del cim per no deixar buits visuals.
  return resolveMediaUrl(publication.portadaUrl) || resolvedPeakImage.value
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    "No s'ha pogut recuperar la fitxa del cim."
  )
}

async function fetchPeakDetail() {
  // Carreguem sempre la fitxa real del backend.
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await api.get(`/peaks/${route.params.id}`)
    peak.value = data.peak
  } catch (error) {
    peak.value = null
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function formatDistance(value) {
  return `${value} km`
}

function formatMeters(value) {
  return `${value} m`
}

function formatTime(value) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  if (!hours) return `${minutes} min`
  if (!minutes) return `${hours} h`
  return `${hours} h ${minutes} min`
}

function formatAuthor(author) {
  // Preferim el nom d'usuari, i si no existeix muntem nom + cognom.
  return author?.nomUsuari || [author?.nom, author?.cognom].filter(Boolean).join(' ') || 'Autor desconegut'
}

watch(
  () => route.params.id,
  () => {
    fetchPeakDetail()
  },
  { immediate: true }
)
</script>

<style scoped>
.peak-detail-view {
  padding: 1.35rem 1.5rem 2rem;
}

.peak-detail-card {
  background: var(--color-surface);
  max-width: 1180px;
  margin: 0 auto;
}

.peak-detail-eyebrow {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: #a5a5a0;
}

.peak-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 390px);
  gap: 2.1rem;
  align-items: start;
  padding: 1.6rem 1.8rem;
  border: 1px solid #c8c8c2;
}

.peak-detail-notice {
  margin: 0 0 1rem;
  padding: 0.65rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #d9decf;
  background: #f4f7ef;
  color: #48604f;
  line-height: 1.5;
  font-size: 0.92rem;
}

.peak-detail-header {
  margin-bottom: 1.35rem;
}

.peak-detail-title {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 3.6rem);
  line-height: 1.05;
  color: var(--color-text);
  letter-spacing: 0;
}

.peak-detail-elevation {
  margin: 0.45rem 0 0;
  font-size: 1.18rem;
  font-weight: 700;
  color: #6f6f6a;
}

.peak-detail-comarca {
  margin: 0.15rem 0 0;
  font-weight: 700;
  color: #6f6f6a;
}

.peak-detail-description {
  max-width: 620px;
  margin: 0.5rem 0 0;
  color: #77776f;
  font-size: 1.02rem;
  line-height: 1.5;
}

.peak-detail-section + .peak-detail-section {
  margin-top: 1.65rem;
}

.peak-detail-section__title,
.peak-detail-sidebar__title {
  margin: 0 0 0.55rem;
  font-size: 1.34rem;
  line-height: 1.2;
  color: #6d6d68;
}

.peak-detail-list {
  margin: 0;
  padding-left: 1.2rem;
  color: #66665f;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 0.25rem;
}

.peak-detail-list li + li {
  margin-top: 0.2rem;
}

.peak-detail-list strong {
  color: #575752;
}

.peak-detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.peak-detail-image {
  width: 100%;
  aspect-ratio: 1 / 1.18;
  height: auto;
  object-fit: cover;
  border: 1px solid #b9b9b4;
  background: #f4f4f1;
}

.publication-list {
  display: grid;
  gap: 0.55rem;
}

.publication-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 0.75rem;
  border: 1px solid #d7d7d2;
  border-radius: 4px;
  padding: 0.55rem;
  text-decoration: none;
  color: inherit;
  background: #fff;
}

.publication-card__image {
  width: 100%;
  height: 82px;
  object-fit: cover;
}

.publication-card__title {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.3;
  color: var(--color-text);
}

.publication-card__author {
  margin: 0.15rem 0 0.45rem;
  font-size: 0.74rem;
  color: #8b8b85;
}

.publication-card__button {
  border: 1px solid var(--color-border);
  background: #f4f4f1;
  color: #4d4d48;
  font-size: 0.72rem;
  padding: 0.28rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
  pointer-events: none;
}

.peak-detail-sidebar__empty {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.5;
}

.peak-detail-state {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  background: #fafaf8;
}

.peak-detail-state--error {
  border-color: #d7b3b3;
  background: #fff8f8;
}

.peak-detail-state__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.peak-detail-state__text {
  margin: 0.65rem 0 0;
  line-height: 1.6;
  color: var(--color-text-soft);
}

.peak-detail-state__button {
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  padding: 0.7rem 1rem;
  cursor: pointer;
}

@media (max-width: 900px) {
  .peak-detail-layout {
    grid-template-columns: 1fr;
  }

  .peak-detail-sidebar {
    order: -1;
  }

  .peak-detail-image {
    height: 240px;
  }
}
</style>

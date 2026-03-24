<template>
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
          <p v-if="isUsingMockData" class="peak-detail-notice">
            S&apos;estan mostrant dades temporals mentre el backend del detall del cim no està disponible.
          </p>

          <header class="peak-detail-header">
            <h1 class="peak-detail-title">{{ peak.nom }}</h1>
            <p class="peak-detail-elevation">{{ formatMeters(peak.alcada) }}</p>
            <p v-if="peak.comarca" class="peak-detail-comarca">{{ peak.comarca }}</p>
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import { peakDetailsMock } from '../mocks/peakDetails'
import { resolveMediaUrl } from '../utils/media'

const route = useRoute()

const peak = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isUsingMockData = ref(false)

const fallbackImage =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80'

const resolvedPeakImage = computed(() => resolveMediaUrl(peak.value?.imatgeUrl) || fallbackImage)

const locationItems = computed(() => {
  if (!peak.value) return []
  if (peak.value.detailSections?.location) return peak.value.detailSections.location

  const items = []

  if (peak.value.massis) items.push({ label: 'Massís', value: peak.value.massis })
  if (peak.value.comarca) items.push({ label: 'Comarca', value: peak.value.comarca })
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
  if (!peak.value) return []
  if (peak.value.detailSections?.access) return peak.value.detailSections.access

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
  if (!peak.value) return []
  if (peak.value.detailSections?.technical) return peak.value.detailSections.technical

  const primaryRoute = peak.value.routes?.[0]
  const items = [
    { label: 'Alçada', value: formatMeters(peak.value.alcada) },
    { label: 'Cims guardats', value: String(peak.value.stats.savedCount) },
    { label: 'Publicacions relacionades', value: String(peak.value.stats.publicacionsCount) },
    { label: 'Rutes vinculades', value: String(peak.value.stats.rutesCount) },
  ]

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
  if (!peak.value) return []
  if (peak.value.detailSections?.refuges) return peak.value.detailSections.refuges

  return peak.value.routes?.[0]?.points?.map((point) => ({
    label: point.nomPunt || point.etiqueta || 'Punt',
    value: `${Number(point.lat).toFixed(4)}, ${Number(point.lon).toFixed(4)}`,
  })) || []
})

function resolvePublicationImage(publication) {
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
  isLoading.value = true
  errorMessage.value = ''
  isUsingMockData.value = false

  try {
    const { data } = await api.get(`/peaks/${route.params.id}`)
    peak.value = data.peak
  } catch (error) {
    const fallbackPeak = peakDetailsMock[String(route.params.id)]

    if (fallbackPeak) {
      peak.value = fallbackPeak
      isUsingMockData.value = true
      errorMessage.value = ''
    } else {
      peak.value = null
      errorMessage.value = getApiErrorMessage(error)
    }
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
  padding: 1.5rem;
}

.peak-detail-card {
  background: var(--color-surface);
}

.peak-detail-eyebrow {
  margin: 0 0 0.9rem;
  font-size: 0.95rem;
  color: #b3b3b0;
}

.peak-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1.5rem;
  padding: 1.2rem;
  border: 1px solid var(--color-border);
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
  margin-bottom: 1rem;
}

.peak-detail-title {
  margin: 0;
  font-size: 2.1rem;
  line-height: 1.05;
  color: var(--color-text);
}

.peak-detail-elevation {
  margin: 0.45rem 0 0;
  font-weight: 700;
  color: #6f6f6a;
}

.peak-detail-comarca {
  margin: 0.15rem 0 0;
  font-weight: 700;
  color: #6f6f6a;
}

.peak-detail-section + .peak-detail-section {
  margin-top: 1.4rem;
}

.peak-detail-section__title,
.peak-detail-sidebar__title {
  margin: 0 0 0.55rem;
  font-size: 1.15rem;
  color: #6d6d68;
}

.peak-detail-list {
  margin: 0;
  padding-left: 1.2rem;
  color: #66665f;
  line-height: 1.45;
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
  gap: 1rem;
}

.peak-detail-image {
  width: 100%;
  height: 345px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.publication-list {
  display: grid;
  gap: 0.7rem;
}

.publication-card {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 0.65rem;
  border: 1px solid var(--color-border);
  padding: 0.45rem;
  text-decoration: none;
  color: inherit;
  background: #fff;
}

.publication-card__image {
  width: 100%;
  height: 74px;
  object-fit: cover;
}

.publication-card__title {
  margin: 0;
  font-size: 0.9rem;
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

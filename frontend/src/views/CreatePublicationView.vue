<template>
  <!--
    Aquesta és la pantalla on l'usuari prepara una publicació nova.
    No és el planificador de ruta: aquí el que fem és omplir la fitxa
    que després acabarà convertida en una PublicationView.
  -->
  <section class="create-publication-view">
    <article class="create-publication-card">
      <header class="create-publication-header">
        <div>
          <p class="create-publication-eyebrow">Nova publicació</p>
          <h1 class="create-publication-title">Comparteix la teva sortida</h1>
        </div>

        <aside class="create-publication-summary">
          <strong>{{ form.titol.trim() || 'Sense títol encara' }}</strong>
          <p>{{ selectedPeakSummary }}</p>
          <p>{{ imagePreviews.length }} imatges seleccionades</p>
        </aside>
      </header>

      <div v-if="isLoadingPeaks" class="create-publication-state">
        Carregant catàleg de cims...
      </div>

      <div v-else-if="peaksError && !isUsingMockPeaks" class="create-publication-state create-publication-state--error">
        {{ peaksError }}
      </div>

      <form v-else class="create-publication-form" @submit.prevent="handleSubmit">
        <section class="create-publication-section">
          <h2 class="create-publication-section__title">Informació principal</h2>

          <div class="create-publication-grid create-publication-grid--two">
            <label class="create-publication-field">
              <span>Títol</span>
              <input v-model="form.titol" type="text" placeholder="Ex. Cel de Catalunya!!!" />
            </label>

            <label class="create-publication-field">
              <span>Cim relacionat</span>
              <select v-model="form.cimId">
                <option value="">Selecciona un cim</option>
                <option v-for="peak in peaks" :key="peak.id" :value="peak.id">
                  {{ peak.nom }} · {{ peak.comarca }}
                </option>
              </select>
            </label>

            <label class="create-publication-field">
              <span>Dificultat</span>
              <input
                v-model="form.dificultat"
                type="text"
                placeholder="Ex. moderada"
              />
            </label>

            <label class="create-publication-field">
              <span>Data de l'activitat</span>
              <input v-model="form.dataActivitat" type="date" />
            </label>

          </div>
        </section>

        <section class="create-publication-section">
          <h2 class="create-publication-section__title">Fitxa tècnica</h2>

          <div class="create-publication-grid create-publication-grid--three">
            <label class="create-publication-field">
              <span>Distància (km)</span>
              <input v-model="form.distanciaKm" type="number" min="0" step="0.1" />
            </label>

            <label class="create-publication-field">
              <span>Desnivell positiu (m)</span>
              <input v-model="form.desnivellPosM" type="number" min="0" step="1" />
            </label>

            <label class="create-publication-field">
              <span>Desnivell negatiu (m)</span>
              <input v-model="form.desnivellNegM" type="number" min="0" step="1" />
            </label>

            <label class="create-publication-field">
              <span>Temps estimat (h:mm)</span>
              <input
                v-model="form.tempsEstimathhmm"
                type="text"
                inputmode="numeric"
                placeholder="Ex. 02:30"
              />
            </label>

            <label class="create-publication-field">
              <span>Altitud màxima (m)</span>
              <input v-model="form.altitudMaxM" type="number" min="0" step="1" />
            </label>

            <label class="create-publication-field">
              <span>Altitud mínima (m)</span>
              <input v-model="form.altitudMinM" type="number" min="0" step="1" />
            </label>
          </div>
        </section>

        <section class="create-publication-section">
          <h2 class="create-publication-section__title">Relat de la sortida</h2>
          <label class="create-publication-field">
            <span>Descripció</span>
            <textarea
              v-model="form.descripcio"
              rows="8"
              placeholder="Explica com ha anat la sortida, els consells, les sensacions i qualsevol detall rellevant."
            />
          </label>
        </section>

        <section class="create-publication-section">
          <div class="create-publication-upload__top">
            <h2 class="create-publication-section__title">Fotos</h2>
          </div>

          <label class="create-publication-upload">
            <span>Selecciona imatges</span>
            <input type="file" accept="image/*" multiple @change="handleFilesChange" />
          </label>

          <div v-if="imagePreviews.length" class="create-publication-previews">
            <article
              v-for="image in imagePreviews"
              :key="image.id"
              class="create-publication-preview"
            >
              <img :src="image.src" :alt="image.name" />
              <div>
                <strong>{{ image.name }}</strong>
                <p>{{ formatFileSize(image.size) }}</p>
              </div>
              <button
                class="create-publication-preview__remove"
                type="button"
                @click="removeImage(image.id)"
              >
                Treure
              </button>
            </article>
          </div>
        </section>

        <section class="create-publication-section">
          <h2 class="create-publication-section__title">Rutes guardades</h2>

          <label class="create-publication-field">
            <span>Ruta guardada</span>
            <select
              v-model="form.rutaPlanificadaId"
              :disabled="!userStore.isAuthenticated || isLoadingRoutes"
            >
              <option value="">Sense ruta guardada</option>
              <option v-for="route in userRoutes" :key="route.id" :value="route.id">
                {{ formatRouteLabel(route) }}
              </option>
            </select>
            <small v-if="!userStore.isAuthenticated" class="create-publication-route-note">
              Inicia sessió per veure les teves rutes guardades.
            </small>
            <small v-else-if="routesError" class="create-publication-route-note create-publication-route-note--error">
              {{ routesError }}
            </small>
            <small
              v-else-if="userStore.isAuthenticated && !isLoadingRoutes && !userRoutes.length"
              class="create-publication-route-note"
            >
              Encara no tens cap ruta guardada. Desa’n una al planificador i torna aquí.
            </small>
          </label>
        </section>

        <section class="create-publication-section">
          <div class="create-publication-upload__top">
            <h2 class="create-publication-section__title">Track i mapa</h2>
          </div>

          <div class="create-publication-track-placeholder">
            <div>
              <strong>{{ selectedRouteSummaryTitle }}</strong>
              <p>
                {{ selectedRouteSummaryText }}
              </p>
              <p v-if="selectedRouteError" class="create-publication-route-note create-publication-route-note--error">
                {{ selectedRouteError }}
              </p>
              <div v-if="hasSelectedRouteMap" ref="routePreviewMapContainer" class="create-publication-route-map" />
              <p v-else class="create-publication-route-note">Selecciona una ruta per veure el mapa.</p>
            </div>
          </div>
        </section>

        <div v-if="validationErrors.length" class="create-publication-errors">
          <p class="create-publication-errors__title">Revisa aquests camps:</p>
          <ul>
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <p v-if="submitMessage" class="create-publication-message">
          {{ submitMessage }}
        </p>

        <div class="create-publication-actions">
          <button class="create-publication-submit" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Publicant...' : 'Publicar sortida' }}
          </button>
        </div>
      </form>
    </article>
  </section>
</template>

<script setup>
// Aquesta vista és bastant completa perquè combina:
// - càrrega de cims
// - validacions
// - selecció d'imatges
// - intent de creació real al backend
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRouter } from 'vue-router'
import api from '../api/axios'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// Aquesta llista és el fallback de cims per quan GET /peaks falla.
// Hem posat ids reals del seed perquè, si backend es recupera, el formulari no quedi conceptualmente desalineat.
const fallbackPeaks = [
  { id: 'cim_la_mola', nom: 'La Mola', comarca: 'Valles Occidental', alcada: 1104 },
  { id: 'cim_pedraforca', nom: 'Pedraforca', comarca: 'Bergueda', alcada: 2506 },
  { id: 'cim_puigmal', nom: 'Puigmal', comarca: 'Ripolles', alcada: 2910 },
  { id: 'cim_matagalls', nom: 'Matagalls', comarca: 'Osona', alcada: 1697 },
  { id: 'cim_canigo', nom: 'Canigo', comarca: 'Conflent', alcada: 2784 },
  { id: 'cim_turo_home', nom: 'Turo de l Home', comarca: 'Valles Oriental', alcada: 1706 },
  { id: 'cim_bastiments', nom: 'Bastiments', comarca: 'Ripolles', alcada: 2881 },
  { id: 'cim_puigpedros', nom: 'Puigpedros', comarca: 'Cerdanya', alcada: 2914 },
  { id: 'cim_comabona', nom: 'Comabona', comarca: 'Bergueda', alcada: 2554 },
  { id: 'cim_carlit', nom: 'Carlit', comarca: 'Alta Cerdanya', alcada: 2921 },
]

const peaks = ref([])
const isLoadingPeaks = ref(true)
const peaksError = ref('')
const isUsingMockPeaks = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref([])
const submitMessage = ref('')
const selectedFiles = ref([])
const imagePreviews = ref([])
const userRoutes = ref([])
const isLoadingRoutes = ref(false)
const routesError = ref('')
const selectedRouteDetail = ref(null)
const selectedRouteError = ref('')
const routePreviewMapContainer = ref(null)
let routePreviewMap = null
let routePreviewMarkers = null
let routePreviewLine = null

// form agrupa tot el que l'usuari escriu al formulari.
const form = ref({
  titol: '',
  cimId: '',
  rutaPlanificadaId: '',
  dificultat: '',
  dataActivitat: '',
  trackUrl: '',
  distanciaKm: '',
  desnivellPosM: '',
  desnivellNegM: '',
  tempsEstimathhmm: '',
  altitudMaxM: '',
  altitudMinM: '',
  descripcio: '',
})

const selectedPeakSummary = computed(() => {
  // Aquesta targeta de resum de dalt es va actualitzant mentre l'usuari va omplint camps.
  const peak = peaks.value.find((item) => item.id === form.value.cimId)
  if (!peak) return 'Encara no hi ha cap cim seleccionat'
  return `${peak.nom} · ${peak.comarca} · ${peak.alcada} m`
})

const selectedRoute = computed(() =>
  userRoutes.value.find((route) => route.id === form.value.rutaPlanificadaId) || null,
)

const selectedRouteSummaryTitle = computed(() =>
  selectedRoute.value ? `Ruta guardada: ${selectedRoute.value.nom}` : 'Cap ruta guardada seleccionada',
)

const selectedRouteSummaryText = computed(() => {
  if (!selectedRoute.value) {
    return 'Selecciona una ruta guardada per previsualitzar-la al mapa.'
  }

  const distance = Number(selectedRoute.value.distanciaKm || 0).toLocaleString('ca-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })

  return `${distance} km · ${selectedRoute.value.waypointsCount || 0} punts · ${
    selectedRoute.value.peak?.nom || 'Cim'
  }`
})

const selectedRouteWaypoints = computed(() => {
  const points = selectedRouteDetail.value?.waypoints || []
  return [...points]
    .filter((point) => Number.isFinite(point?.lat) && Number.isFinite(point?.lon))
    .sort((a, b) => (a.ordreIndex ?? 0) - (b.ordreIndex ?? 0))
})

const hasSelectedRouteMap = computed(() => selectedRouteWaypoints.value.length >= 2)

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallbackMessage
  )
}

function formatRouteLabel(route) {
  const distance = Number(route.distanciaKm || 0)
  const distanceLabel = distance.toLocaleString('ca-ES', {
    minimumFractionDigits: Number.isInteger(distance) ? 0 : 1,
    maximumFractionDigits: 1,
  })
  const peakName = route.peak?.nom || 'Cim'
  return `${route.nom} · ${distanceLabel} km · ${peakName} · #${route.id.slice(-6)}`
}

async function fetchPeaks() {
  // Intentem carregar el catàleg real de cims.
  // Si falla, fem servir el fallback perquè la pantalla continuï sent usable.
  isLoadingPeaks.value = true
  peaksError.value = ''
  isUsingMockPeaks.value = false

  try {
    const { data } = await api.get('/peaks')
    peaks.value = data.peaks || []
  } catch (error) {
    if (fallbackPeaks.length) {
      peaks.value = fallbackPeaks
      peaksError.value = ''
      isUsingMockPeaks.value = true
    } else {
      peaks.value = []
      peaksError.value = getApiErrorMessage(error, 'No hem pogut carregar els cims per vincular la publicació.')
    }
  } finally {
    isLoadingPeaks.value = false
  }
}

async function fetchUserRoutes() {
  const userId = userStore.user?.id
  if (!userId) {
    userRoutes.value = []
    routesError.value = ''
    return
  }

  isLoadingRoutes.value = true
  routesError.value = ''

  try {
    const { data } = await api.get(`/users/${userId}/routes`)
    userRoutes.value = data.routes || []
  } catch (error) {
    userRoutes.value = []
    routesError.value = getApiErrorMessage(error, 'No hem pogut carregar les rutes planificades.')
  } finally {
    isLoadingRoutes.value = false
  }
}

async function fetchSelectedRouteDetail(routeId) {
  if (!routeId) {
    selectedRouteDetail.value = null
    selectedRouteError.value = ''
    return
  }

  selectedRouteError.value = ''

  try {
    const { data } = await api.get(`/routes/${routeId}`)
    selectedRouteDetail.value = data.route || null
  } catch (error) {
    selectedRouteDetail.value = null
    selectedRouteError.value = getApiErrorMessage(error, 'No hem pogut carregar el mapa de la ruta guardada.')
  }
}

function clearRoutePreviewMap() {
  if (routePreviewMap) {
    routePreviewMap.remove()
    routePreviewMap = null
  }
  routePreviewMarkers = null
  routePreviewLine = null
}

async function renderRoutePreviewMap() {
  if (!hasSelectedRouteMap.value) {
    clearRoutePreviewMap()
    return
  }

  await nextTick()

  if (!routePreviewMapContainer.value) return

  if (!routePreviewMap) {
    routePreviewMap = L.map(routePreviewMapContainer.value)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(routePreviewMap)
  }

  if (!routePreviewMarkers) {
    routePreviewMarkers = L.layerGroup().addTo(routePreviewMap)
  } else {
    routePreviewMarkers.clearLayers()
  }

  if (routePreviewLine) {
    routePreviewLine.remove()
    routePreviewLine = null
  }

  const latLngs = selectedRouteWaypoints.value.map((point, index) => {
    const label = point.nomPunt || point.etiqueta || `Punt ${index + 1}`
    L.marker([point.lat, point.lon]).bindTooltip(label, { direction: 'top' }).addTo(routePreviewMarkers)
    return [point.lat, point.lon]
  })

  routePreviewLine = L.polyline(latLngs, { color: '#2d6a4f', weight: 4 }).addTo(routePreviewMap)
  routePreviewMap.fitBounds(L.latLngBounds(latLngs).pad(0.15))

  setTimeout(() => {
    routePreviewMap?.invalidateSize()
  }, 0)
}

function handleFilesChange(event) {
  // En lloc de reemplaçar la selecció anterior, anem acumulant imatges.
  // Això permet a l'usuari afegir-les en diverses tandes.
  const files = Array.from(event.target.files || [])

  if (!files.length) return

  const nextImages = files.map((file, index) => ({
    id: `${file.name}-${file.size}-${Date.now()}-${index}`,
    name: file.name,
    size: file.size,
    file,
    src: URL.createObjectURL(file),
  }))

  imagePreviews.value = [...imagePreviews.value, ...nextImages]
  selectedFiles.value = imagePreviews.value.map((image) => image.file)
  event.target.value = ''
}

function clearImagePreviews() {
  // Quan sortim de la pantalla o netegem previews, alliberem les URL temporals creades amb createObjectURL.
  imagePreviews.value.forEach((image) => URL.revokeObjectURL(image.src))
  imagePreviews.value = []
  selectedFiles.value = []
}

function removeImage(imageId) {
  // Això deixa eliminar una imatge concreta de la selecció abans de publicar.
  const imageToRemove = imagePreviews.value.find((image) => image.id === imageId)
  if (imageToRemove) {
    URL.revokeObjectURL(imageToRemove.src)
  }

  imagePreviews.value = imagePreviews.value.filter((image) => image.id !== imageId)
  selectedFiles.value = imagePreviews.value.map((image) => image.file)
}

function validateForm() {
  // Aquí fem tota la validació de frontend abans d'enviar res.
  // És útil perquè l'usuari rebi feedback immediat sense dependre del backend.
  const errors = []
  const payload = form.value
  const parsedTime = parseTimeToMinutes(payload.tempsEstimathhmm)

  if (!payload.titol.trim()) errors.push('El títol és obligatori.')
  if (!payload.cimId) errors.push('Has de seleccionar un cim.')
  if (!payload.dificultat.trim()) errors.push('La dificultat és obligatòria.')
  if (!payload.dataActivitat) errors.push("La data de l'activitat és obligatòria.")
  if (!payload.descripcio.trim()) errors.push('La descripció és obligatòria.')
  if (!selectedFiles.value.length) errors.push('Has d’afegir almenys una imatge.')
  if (selectedFiles.value.length > 10) errors.push('Només es permeten fins a 10 imatges.')

  const numericFields = [
    ['distanciaKm', 'La distància'],
    ['desnivellPosM', 'El desnivell positiu'],
    ['desnivellNegM', 'El desnivell negatiu'],
    ['altitudMaxM', "L'altitud màxima"],
    ['altitudMinM', "L'altitud mínima"],
  ]

  numericFields.forEach(([field, label]) => {
    const value = Number(payload[field])
    if (!Number.isFinite(value) || value < 0) {
      errors.push(`${label} ha de ser un valor numèric vàlid.`)
    }
  })

  if (parsedTime === null || parsedTime <= 0) {
    errors.push('El temps estimat ha de tenir el format hh:mm, per exemple 02:30.')
  }

  if (
    Number.isFinite(Number(payload.altitudMaxM)) &&
    Number.isFinite(Number(payload.altitudMinM)) &&
    Number(payload.altitudMaxM) < Number(payload.altitudMinM)
  ) {
    errors.push("L'altitud màxima no pot ser inferior a la mínima.")
  }

  if (payload.trackUrl && !/^https?:\/\//i.test(payload.trackUrl.trim())) {
    errors.push("Si informes l'enllaç del track, ha de començar per http:// o https://.")
  }

  validationErrors.value = errors
  return !errors.length
}

async function uploadImages() {
  // Aquest és el primer pas del contracte real:
  // pugem imatges i backend ens retorna les URLs relatives.
  const uploadData = new FormData()
  selectedFiles.value.forEach((file) => {
    uploadData.append('images', file)
  })

  const { data } = await api.post('/uploads/publicacions', uploadData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return (data.files || []).map((file) => file.url)
}

async function handleSubmit() {
  // Aquest és el flux principal:
  // 1) validar
  // 2) pujar imatges
  // 3) intentar crear publicació real
  // 4) si falla, mostrar l'error retornat pel backend
  submitMessage.value = ''

  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const imageUrls = await uploadImages()

    const payload = {
      cimId: form.value.cimId,
      titol: form.value.titol.trim(),
      descripcio: form.value.descripcio.trim(),
      dataActivitat: new Date(form.value.dataActivitat).toISOString(),
      tipusActivitat: 'senderisme',
      dificultat: form.value.dificultat.trim().toLowerCase(),
      distanciaKm: Number(form.value.distanciaKm),
      desnivellPosM: Number(form.value.desnivellPosM),
      desnivellNegM: Number(form.value.desnivellNegM),
      tempsMin: parseTimeToMinutes(form.value.tempsEstimathhmm),
      altitudMaxM: Number(form.value.altitudMaxM),
      altitudMinM: Number(form.value.altitudMinM),
      imageUrls,
    }

    if (form.value.rutaPlanificadaId) {
      payload.rutaPlanificadaId = form.value.rutaPlanificadaId
    }

    if (form.value.trackUrl.trim()) {
      payload.trackUrl = form.value.trackUrl.trim()
    }

    const { data } = await api.post('/publicacions', payload)
    router.push(`/publicacio/${data.publication.id}`)
  } catch (error) {
    submitMessage.value = getApiErrorMessage(
      error,
      'No hem pogut publicar la sortida. Revisa les dades i torna-ho a provar.',
    )
  } finally {
    isSubmitting.value = false
  }
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function parseTimeToMinutes(value) {
  // L'usuari escriu el temps en format humà (hh:mm),
  // però backend vol minuts. Aquesta funció fa la conversió.
  const normalized = value.trim()
  if (!normalized) return null

  const match = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (minutes > 59) return null

  return hours * 60 + minutes
}

onMounted(() => {
  fetchPeaks()
  fetchUserRoutes()
})

watch(
  () => userStore.user?.id,
  () => {
    fetchUserRoutes()
  },
)

watch(
  () => form.value.rutaPlanificadaId,
  (routeId) => {
    fetchSelectedRouteDetail(routeId || '')
  },
)

watch(
  () => selectedRouteWaypoints.value,
  () => {
    renderRoutePreviewMap()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  clearImagePreviews()
  clearRoutePreviewMap()
})
</script>

<style scoped>
.create-publication-view {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.create-publication-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.8rem;
}

.create-publication-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.create-publication-eyebrow {
  margin: 0 0 0.35rem;
  color: #8a9581;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.create-publication-title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.15rem);
  line-height: 1.04;
  color: var(--color-text);
}

.create-publication-subtitle {
  margin: 0.8rem 0 0;
  color: var(--color-text-soft);
  max-width: 60ch;
}

.create-publication-summary {
  min-width: 250px;
  padding: 1rem 1.1rem;
  border-radius: 16px;
  background: #f4f1f8;
  border: 1px solid #e0dbe8;
}

.create-publication-summary__label {
  margin: 0 0 0.5rem;
  color: #7a7188;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.create-publication-summary strong {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 1.1rem;
  color: var(--color-text);
}

.create-publication-summary p {
  margin: 0.25rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.6;
}

.create-publication-state {
  padding: 1rem;
  border-radius: 12px;
  background: #f6f6f1;
  color: var(--color-text-soft);
}

.create-publication-state--error {
  background: #fff5f5;
  color: #915454;
  border: 1px solid #e3c8c8;
}

.create-publication-mock-notice {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: #f3f5ea;
  border: 1px solid #d8dfc6;
  color: #4d6146;
}

.create-publication-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.create-publication-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-publication-section__title {
  margin: 0;
  font-size: 1.35rem;
  color: var(--color-text);
}

.create-publication-grid {
  display: grid;
  gap: 1rem;
}

.create-publication-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.create-publication-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.create-publication-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  color: var(--color-text);
  font-weight: 600;
}

.create-publication-field input,
.create-publication-field select,
.create-publication-field textarea {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  background: #fff;
  color: var(--color-text);
}

.create-publication-route-note {
  margin-top: 0.35rem;
  font-size: 0.86rem;
  color: var(--color-text-soft);
}

.create-publication-route-note--error {
  color: #915454;
}

.create-publication-route-refresh {
  margin-top: 0.5rem;
  align-self: flex-start;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  color: var(--color-text);
  padding: 0.42rem 0.72rem;
  cursor: pointer;
  font: inherit;
  font-size: 0.9rem;
}

.create-publication-upload__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.create-publication-upload__hint {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.create-publication-upload {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  font-weight: 600;
}

.create-publication-track-placeholder {
  padding: 1.1rem 1.2rem;
  border: 1px dashed #d8d2e1;
  border-radius: 16px;
  background: #faf8fd;
}

.create-publication-track-placeholder strong {
  display: block;
  color: var(--color-text);
}

.create-publication-track-placeholder p {
  margin: 0.5rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.7;
  max-width: 58ch;
}

.create-publication-route-map {
  margin-top: 0.9rem;
  height: 250px;
  border-radius: 12px;
  border: 1px solid #d8d2e1;
  overflow: hidden;
}

.create-publication-upload input {
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  background: #fafafa;
}

.create-publication-previews {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}

.create-publication-preview {
  display: flex;
  gap: 0.85rem;
  align-items: center;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: #fff;
}

.create-publication-preview img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
}

.create-publication-preview p {
  margin: 0.25rem 0 0;
  color: var(--color-text-soft);
}

.create-publication-errors {
  padding: 1rem 1.2rem;
  border-radius: 14px;
  background: #fff5f5;
  border: 1px solid #e3c8c8;
  color: #894d4d;
}

.create-publication-errors__title {
  margin: 0 0 0.45rem;
  font-weight: 700;
}

.create-publication-errors ul {
  margin: 0;
  padding-left: 1.2rem;
}

.create-publication-message {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: #f6f4ff;
  color: #594d80;
}

.create-publication-actions {
  display: flex;
  justify-content: flex-end;
}

.create-publication-submit {
  border: none;
  border-radius: 12px;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  padding: 0.95rem 1.5rem;
  cursor: pointer;
}

.create-publication-submit:disabled {
  opacity: 0.6;
  cursor: progress;
}

@media (max-width: 900px) {
  .create-publication-header,
  .create-publication-grid--two,
  .create-publication-grid--three {
    grid-template-columns: 1fr;
  }

  .create-publication-upload__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-publication-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .create-publication-view {
    padding: 1rem 0.5rem 2rem;
  }

  .create-publication-card {
    padding: 1.1rem;
  }
}
</style>

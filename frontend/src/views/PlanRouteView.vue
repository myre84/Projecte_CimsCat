<template>
  <section class="plan-route-view">
    <header class="plan-route-header">
      <h1 class="plan-route-title">Planificar Ruta</h1>
      <label class="plan-route-search">
        <span>Buscar cim, comarca o ruta</span>
        <input type="search" placeholder="Buscar cim, comarca o ruta..." />
      </label>
    </header>

    <section class="plan-route-map-card">
      <div class="plan-route-map__frame">
        <div ref="mapContainer" class="plan-route-map__canvas"></div>

        <aside class="route-panel">
          <h2>La teva ruta</h2>

          <div v-if="isLoadingPeaks" class="plan-route-state">
            Carregant catàleg de cims...
          </div>

          <div v-else-if="peaksError && !isUsingMockPeaks" class="plan-route-state plan-route-state--error">
            {{ peaksError }}
          </div>

          <div v-else class="plan-route-form">
            <label class="plan-route-field">
              <span>Cim principal</span>
              <select v-model="form.cimId">
                <option value="">Selecciona un cim</option>
                <option v-for="peak in peaks" :key="peak.id" :value="peak.id">
                  {{ peak.nom }} · {{ peak.comarca }}
                </option>
              </select>
            </label>

            <label class="plan-route-field">
              <span>Nom de la ruta</span>
              <input v-model="form.nom" type="text" placeholder="Ex. Ruta circular al Pedraforca" />
            </label>

            <div class="route-panel__row">
              <span>Esport</span>
              <select v-model="form.tipusActivitat">
                <option value="senderisme">Senderisme</option>
                <option value="trail">Trail running</option>
                <option value="alpinisme">Alpinisme</option>
                <option value="btt">BTT</option>
              </select>
            </div>

            <div class="route-panel__row">
              <span>Ritme</span>
              <select v-model="form.ritme">
                <option value="relaxat">Relaxat</option>
                <option value="moderat">Moderat</option>
                <option value="rapid">Ràpid</option>
              </select>
            </div>

            <div class="route-panel__row">
              <span>Tipus</span>
              <select v-model="form.tipusRecorregut">
                <option value="one-way">Anada</option>
                <option value="round-trip">Anada i tornada</option>
                <option value="circular">Circular</option>
              </select>
            </div>

            <section class="plan-route-waypoints">
              <div class="plan-route-waypoints__header">
                <h3>Punts de pas</h3>
                <span>{{ waypoints.length }} punts</span>
              </div>

              <p v-if="!waypoints.length" class="plan-route-waypoints__empty">
                Fes clic al mapa per afegir punts.
              </p>

              <article v-for="(point, index) in waypoints" :key="point.id" class="plan-route-waypoint">
                <div class="plan-route-waypoint__row">
                  <strong>{{ index === 0 ? 'A' : index + 1 }}</strong>
                  <span>{{ formatCoords(point.lat, point.lng) }}</span>
                </div>
                <input v-model="point.nomPunt" type="text" :placeholder="`Punt de pas ${index + 1}`" />
                <button class="plan-route-waypoint__remove" type="button" @click="removeWaypoint(point.id)">
                  Treure
                </button>
              </article>
            </section>

            <div v-if="saveError" class="plan-route-message plan-route-message--error">
              {{ saveError }}
            </div>
            <div v-else-if="saveSuccess" class="plan-route-message">
              {{ saveSuccess }}
            </div>
          </div>
        </aside>

        <button class="plan-route-save" type="button" :disabled="!canSave" @click="handleSave">
          {{ isSaving ? 'Guardant...' : saveButtonLabel }}
        </button>
      </div>
    </section>

    <section class="route-technical">
      <h2>Fitxa tècnica ruta</h2>

      <div class="route-technical__grid">
        <article class="route-card">
          <h3>Tipus de camins i superfícies</h3>

          <div class="route-bars">
            <h4>Tipus de camí</h4>
            <div class="route-bar">
              <span style="width: 44%"></span>
              <span style="width: 31%"></span>
              <span style="width: 25%"></span>
            </div>
            <p><strong>Sender de muntanya:</strong> {{ formattedDistance }}</p>
            <p><strong>Pista forestal:</strong> pendent de dades reals</p>
            <p><strong>Sender tècnic:</strong> pendent de dades reals</p>
          </div>

          <div class="route-bars">
            <h4>Superfícies</h4>
            <div class="route-bar route-bar--surface">
              <span style="width: 52%"></span>
              <span style="width: 28%"></span>
              <span style="width: 20%"></span>
            </div>
            <p><strong>Camí natural:</strong> estimació visual</p>
            <p><strong>Grava o pista:</strong> pendent de dades reals</p>
            <p><strong>Desconegut:</strong> pendent de classificació</p>
          </div>
        </article>

        <article class="route-card route-card--details">
          <h3>Detalls de la ruta</h3>

          <div class="route-summary-grid">
            <article>
              <span>Distància</span>
              <strong>{{ formattedDistance }}</strong>
            </article>
            <article>
              <span>Temps estimat</span>
              <strong>{{ formattedTime }}</strong>
            </article>
            <article>
              <span>Desnivell +</span>
              <strong>{{ positiveElevation }} m</strong>
            </article>
            <article>
              <span>Desnivell -</span>
              <strong>{{ negativeElevation }} m</strong>
            </article>
          </div>

          <div class="route-elevation">
            <div class="route-elevation__line"></div>
            <span class="route-elevation__point route-elevation__point--one">A</span>
            <span class="route-elevation__point route-elevation__point--two">!</span>
            <span class="route-elevation__point route-elevation__point--three">!</span>
          </div>

          <p class="route-note">
            La informació tècnica avançada del relleu, les superfícies i els trams exposats queda preparada com a millora futura.
          </p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const route = useRoute()

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

const mapContainer = ref(null)
let map = null
let markersLayer = null
let polyline = null

const form = ref({
  nom: '',
  cimId: '',
  tipusActivitat: 'senderisme',
  ritme: 'moderat',
  tipusRecorregut: 'circular',
})

const waypoints = ref([])
const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref('')
const savedRoute = ref(null)
const editingRouteId = ref('')

const canSave = computed(() => {
  return (
    userStore.isAuthenticated &&
    waypoints.value.length >= 2 &&
    form.value.cimId &&
    !isSaving.value
  )
})

const saveButtonLabel = computed(() => {
  if (isSaving.value) return editingRouteId.value ? 'Guardant canvis...' : 'Guardant...'
  if (editingRouteId.value) return 'Guardar canvis'
  return savedRoute.value ? 'Ruta guardada' : 'Guardar ruta'
})

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    fallbackMessage
  )
}

async function fetchPeaks() {
  isLoadingPeaks.value = true
  peaksError.value = ''
  isUsingMockPeaks.value = false

  try {
    const { data } = await api.get('/peaks')
    peaks.value = data.peaks || []
  } catch (error) {
    if (fallbackPeaks.length) {
      peaks.value = fallbackPeaks
      isUsingMockPeaks.value = true
      peaksError.value = ''
    } else {
      peaks.value = []
      peaksError.value = getApiErrorMessage(error, 'No hem pogut carregar els cims.')
    }
  } finally {
    isLoadingPeaks.value = false
  }
}

async function loadRouteForEditing(routeId) {
  if (!routeId) return

  saveError.value = ''
  saveSuccess.value = ''

  try {
    const { data } = await api.get(`/routes/${routeId}`)
    const routeDetail = data.route
    if (!routeDetail) return

    editingRouteId.value = routeDetail.id
    savedRoute.value = routeDetail
    form.value = {
      nom: routeDetail.nom || '',
      cimId: routeDetail.cimId || '',
      tipusActivitat: routeDetail.tipusActivitat || 'senderisme',
      ritme: routeDetail.ritme || 'moderat',
      tipusRecorregut: routeDetail.tipusRecorregut || 'circular',
    }
    waypoints.value = [...(routeDetail.waypoints || [])]
      .sort((a, b) => (a.ordreIndex ?? 0) - (b.ordreIndex ?? 0))
      .map((point, index) => ({
        id: point.id || `wp-loaded-${index}`,
        lat: Number(point.lat),
        lng: Number(point.lon),
        nomPunt: point.nomPunt || '',
        etiqueta: point.etiqueta || '',
      }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))

    await renderWaypoints()
  } catch (error) {
    saveError.value = getApiErrorMessage(error, 'No hem pogut carregar aquesta ruta.')
  }
}

function addWaypoint(latlng) {
  waypoints.value.push({
    id: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    lat: latlng.lat,
    lng: latlng.lng,
    nomPunt: '',
    etiqueta: '',
  })
}

function removeWaypoint(id) {
  waypoints.value = waypoints.value.filter((point) => point.id !== id)
}

function formatCoords(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

function roundKm(value) {
  return Math.round(value * 10) / 10
}

function computeDistanceKm(points) {
  if (points.length < 2) return 0

  const toRad = (deg) => (deg * Math.PI) / 180
  let total = 0

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]
    const b = points[i]
    const dLat = toRad(b.lat - a.lat)
    const dLon = toRad(b.lng - a.lng)
    const lat1 = toRad(a.lat)
    const lat2 = toRad(b.lat)

    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
    total += 6371 * c
  }

  return total
}

const distanceKm = computed(() => roundKm(computeDistanceKm(waypoints.value)))
const positiveElevation = computed(() => 0)
const negativeElevation = computed(() => 0)
const estimatedTimeMin = computed(() => {
  if (!distanceKm.value) return 0
  const minutes = Math.round((distanceKm.value / 4) * 60)
  return Math.max(minutes, 1)
})

const formattedDistance = computed(() => `${distanceKm.value.toLocaleString('ca-ES')} km`)
const formattedTime = computed(() => {
  if (!estimatedTimeMin.value) return '0 min'
  const hours = Math.floor(estimatedTimeMin.value / 60)
  const minutes = estimatedTimeMin.value % 60
  if (!hours) return `${minutes} min`
  if (!minutes) return `${hours} h`
  return `${hours} h ${minutes} min`
})

async function renderWaypoints() {
  if (!map) return
  await nextTick()

  if (!markersLayer) {
    markersLayer = L.layerGroup().addTo(map)
  } else {
    markersLayer.clearLayers()
  }

  if (polyline) {
    polyline.remove()
    polyline = null
  }

  const latLngs = waypoints.value.map((point, index) => {
    const icon = L.divIcon({
      className: 'plan-route-marker',
      html: `<div class="plan-route-marker__dot">${index + 1}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    L.marker([point.lat, point.lng], { icon }).addTo(markersLayer)
    return [point.lat, point.lng]
  })

  if (latLngs.length >= 2) {
    polyline = L.polyline(latLngs, { color: '#2d6a4f', weight: 4 }).addTo(map)
    const bounds = L.latLngBounds(latLngs).pad(0.2)
    map.fitBounds(bounds)
  } else if (latLngs.length === 1) {
    map.setView(latLngs[0], 13)
  }

  setTimeout(() => {
    map?.invalidateSize()
  }, 0)
}

async function handleSave() {
  saveError.value = ''
  saveSuccess.value = ''

  if (!userStore.isAuthenticated) {
    saveError.value = 'Cal iniciar sessió per guardar la ruta.'
    return
  }

  if (!form.value.cimId) {
    saveError.value = 'Selecciona un cim abans de guardar.'
    return
  }

  if (!form.value.nom.trim()) {
    saveError.value = 'El nom de la ruta és obligatori.'
    return
  }

  if (waypoints.value.length < 2) {
    saveError.value = 'Calen almenys 2 punts per guardar la ruta.'
    return
  }

  isSaving.value = true

  try {
    const payload = {
      cimId: form.value.cimId,
      nom: form.value.nom.trim(),
      tipusActivitat: form.value.tipusActivitat.trim(),
      ritme: form.value.ritme.trim(),
      tipusRecorregut: form.value.tipusRecorregut,
      distanciaKm: distanceKm.value,
      desnivellPosM: positiveElevation.value,
      desnivellNegM: negativeElevation.value,
      tempsMin: estimatedTimeMin.value || 1,
      altitudMaxM: 0,
      altitudMinM: 0,
      trackUrl: null,
      notes:
        'Ruta provisional creada des del planificador. Encara no segueix un motor real de camins.',
      waypoints: waypoints.value.map((point, index) => ({
        etiqueta: point.etiqueta?.trim() || null,
        nomPunt: point.nomPunt?.trim() || '',
        lat: point.lat,
        lon: point.lng,
        ordreIndex: index,
      })),
    }

    const wasEditing = Boolean(editingRouteId.value)
    const { data } = wasEditing
      ? await api.put(`/routes/${editingRouteId.value}`, payload)
      : await api.post('/routes', payload)
    savedRoute.value = data.route
    if (data.route?.id) editingRouteId.value = data.route.id
    saveSuccess.value = wasEditing ? 'Ruta actualitzada correctament.' : 'Ruta guardada correctament.'
  } catch (error) {
    saveError.value = getApiErrorMessage(error, 'No hem pogut guardar la ruta.')
  } finally {
    isSaving.value = false
  }
}

watch(waypoints, () => {
  renderWaypoints()
}, { deep: true })

watch(
  () => form.value.cimId,
  (cimId) => {
    if (!map || !cimId) return

    const peak = peaks.value.find((item) => item.id === cimId)
    const lat = Number(peak?.lat)
    const lon = Number(peak?.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

    map.flyTo([lat, lon], 13, { duration: 0.7 })
  },
)

onMounted(async () => {
  await fetchPeaks()

  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([41.95, 1.9], 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  map.on('click', (event) => {
    addWaypoint(event.latlng)
  })

  requestAnimationFrame(() => {
    map?.invalidateSize()
  })

  setTimeout(() => {
    map?.invalidateSize()
  }, 250)

  setTimeout(() => {
    map?.invalidateSize()
  }, 750)

  await loadRouteForEditing(String(route.query.routeId || ''))
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  markersLayer = null
  polyline = null
})
</script>

<style scoped>
.plan-route-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.4rem 1rem 3rem;
  background: #fff;
}

.plan-route-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1.2rem;
}

.plan-route-title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.05;
  color: var(--color-text);
}

.plan-route-search {
  min-width: min(390px, 100%);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
}

.plan-route-search input {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: #f1edf3;
  color: var(--color-text);
  min-height: 42px;
}

.plan-route-map-card {
  margin-bottom: 1.25rem;
}

.plan-route-map__frame {
  position: relative;
  border-radius: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #f4f1f8;
  min-height: 470px;
}

.plan-route-map__canvas {
  height: 470px;
  width: 100%;
  min-height: 470px;
  background: #f4f1f8;
  z-index: 1;
}

.route-panel {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 500;
  width: min(330px, calc(100% - 2rem));
  max-height: calc(100% - 2rem);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  padding: 0.85rem;
}

.route-panel h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-text);
}

.route-panel__row {
  display: grid;
  grid-template-columns: 85px 1fr;
  align-items: center;
  gap: 0.7rem;
  border-top: 1px solid #eee9e3;
  padding: 0.65rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
}

.plan-route-state {
  padding: 0.8rem;
  border-radius: 8px;
  background: #f6f6f1;
  color: var(--color-text-soft);
}

.plan-route-state--error {
  background: #fff5f5;
  color: #915454;
  border: 1px solid #e3c8c8;
}

.plan-route-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plan-route-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.plan-route-field input,
.plan-route-field select,
.route-panel__row select {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
  background: #fff;
  color: var(--color-text);
  min-width: 0;
}

.plan-route-waypoints {
  border-top: 1px solid #eee9e3;
  padding-top: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.plan-route-waypoints__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.plan-route-waypoints__header h3 {
  margin: 0;
  font-size: 0.95rem;
}

.plan-route-waypoints__empty {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.88rem;
}

.plan-route-waypoint {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.55rem;
  background: #fff;
  display: grid;
  gap: 0.45rem;
}

.plan-route-waypoint__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.82rem;
  color: var(--color-text-soft);
}

.plan-route-waypoint input {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.55rem 0.75rem;
}

.plan-route-waypoint__remove {
  align-self: flex-end;
  border: none;
  border-radius: 10px;
  background: #f5e7ea;
  color: #7c3c49;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
}

.plan-route-message {
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  background: #f2f8f1;
  color: #2d6a4f;
  border: 1px solid #d4e2cd;
  font-size: 0.9rem;
}

.plan-route-message--error {
  background: #fff5f5;
  color: #915454;
  border-color: #e3c8c8;
}

.plan-route-save {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 500;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.plan-route-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.route-technical {
  margin-top: 1rem;
}

.route-technical h2 {
  margin: 0 0 0.9rem;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: var(--color-text);
}

.route-technical__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.25rem;
}

.route-card {
  background: #f4f1ec;
  padding: 1rem;
  border: 1px solid #e5dfd4;
}

.route-card h3 {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  color: var(--color-text);
}

.route-bars {
  background: #fff;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.route-bars h4 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
}

.route-bars p {
  margin: 0.45rem 0 0;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.route-bar {
  display: flex;
  height: 18px;
  overflow: hidden;
  border-radius: 4px;
  background: #e6e0d5;
  margin-bottom: 0.7rem;
}

.route-bar span:nth-child(1) {
  background: #aeb998;
}

.route-bar span:nth-child(2) {
  background: #c8c0ad;
}

.route-bar span:nth-child(3) {
  background: #9d8564;
}

.route-bar--surface span:nth-child(1) {
  background: #bcc9a6;
}

.route-bar--surface span:nth-child(2) {
  background: #d2c8b9;
}

.route-bar--surface span:nth-child(3) {
  background: #856a48;
}

.route-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.route-summary-grid article {
  background: #fff;
  border-radius: 10px;
  padding: 0.8rem;
}

.route-summary-grid span {
  display: block;
  color: var(--color-text-soft);
  font-size: 0.85rem;
}

.route-summary-grid strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-text);
  font-size: 1.1rem;
}

.route-elevation {
  position: relative;
  height: 170px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.route-elevation::before {
  content: "";
  position: absolute;
  inset: 20px;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size: 70px 44px;
}

.route-elevation__line {
  position: absolute;
  left: 8%;
  right: 8%;
  bottom: 42%;
  height: 65px;
  border-top: 4px solid #7c1d1d;
  border-radius: 55% 45% 0 0;
  transform: skewY(-7deg);
}

.route-elevation__point {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #f2a400;
  color: #fff;
  font-size: 0.75rem;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.route-elevation__point--one {
  left: 16%;
  top: 45%;
  background: #6c8f47;
}

.route-elevation__point--two {
  left: 48%;
  top: 34%;
}

.route-elevation__point--three {
  right: 18%;
  top: 29%;
}

.route-note {
  margin: 0;
  padding: 1rem;
  border-radius: 10px;
  background: #eee7d8;
  color: #5f574a;
  line-height: 1.5;
}

.plan-route-marker__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2d6a4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

@media (max-width: 980px) {
  .plan-route-header {
    flex-direction: column;
    align-items: stretch;
  }

  .route-technical__grid {
    grid-template-columns: 1fr;
  }

  .route-panel {
    position: relative;
    top: auto;
    left: auto;
    width: auto;
    max-height: none;
    margin: 0;
    border-radius: 0;
  }
}

@media (max-width: 640px) {
  .plan-route-view {
    padding: 1rem 0.5rem 2rem;
  }

  .route-summary-grid {
    grid-template-columns: 1fr;
  }

  .plan-route-map__canvas {
    height: 360px;
  }
}
</style>

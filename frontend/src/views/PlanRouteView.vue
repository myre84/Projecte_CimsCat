<template>
  <section class="plan-route-view">
    <header class="plan-route-header">
      <div>
        <p class="plan-route-eyebrow">Planificador de rutes</p>
        <h1 class="plan-route-title">Planificar nova ruta</h1>
      </div>

      <div class="plan-route-header__status">
        <p v-if="!userStore.isAuthenticated" class="plan-route-auth">
          Inicia sessio per guardar rutes planificades.
        </p>
      </div>
    </header>

    <div class="plan-route-grid">
      <section class="plan-route-map">
        <div class="plan-route-map__frame">
          <div ref="mapContainer" class="plan-route-map__canvas"></div>
          <div class="plan-route-map__overlay">
            Fes clic al mapa per afegir punts. Pots editar el nom de cada punt a la dreta.
          </div>
        </div>

        <div class="plan-route-stats">
          <article class="plan-route-stat">
            <span>Distancia</span>
            <strong>{{ formattedDistance }}</strong>
          </article>
          <article class="plan-route-stat">
            <span>Temps estimat</span>
            <strong>{{ formattedTime }}</strong>
          </article>
          <article class="plan-route-stat">
            <span>Desnivell +</span>
            <strong>{{ positiveElevation }} m</strong>
          </article>
          <article class="plan-route-stat">
            <span>Desnivell -</span>
            <strong>{{ negativeElevation }} m</strong>
          </article>
        </div>
      </section>

      <aside class="plan-route-panel">
        <div v-if="isLoadingPeaks" class="plan-route-state">
          Carregant cataleg de cims...
        </div>

        <div v-else-if="peaksError && !isUsingMockPeaks" class="plan-route-state plan-route-state--error">
          {{ peaksError }}
        </div>

        <div v-else class="plan-route-form">

          <label class="plan-route-field">
            <span>Nom de la ruta</span>
            <input v-model="form.nom" type="text" placeholder="Ex. Ruta circular a La Mola" />
          </label>

          <label class="plan-route-field">
            <span>Cim principal</span>
            <select v-model="form.cimId">
              <option value="">Selecciona un cim</option>
              <option v-for="peak in peaks" :key="peak.id" :value="peak.id">
                {{ peak.nom }} · {{ peak.comarca }}
              </option>
            </select>
          </label>

          <div class="plan-route-grid-mini">
            <label class="plan-route-field">
              <span>Tipus activitat</span>
              <input v-model="form.tipusActivitat" type="text" placeholder="senderisme" />
            </label>
            <label class="plan-route-field">
              <span>Ritme</span>
              <input v-model="form.ritme" type="text" placeholder="moderat" />
            </label>
          </div>

          <label class="plan-route-field">
            <span>Tipus de recorregut</span>
            <select v-model="form.tipusRecorregut">
              <option value="one-way">one-way</option>
              <option value="round-trip">round-trip</option>
              <option value="circular">circular</option>
            </select>
          </label>

          <section class="plan-route-waypoints">
            <div class="plan-route-waypoints__header">
              <h2>Punts de ruta</h2>
              <span>{{ waypoints.length }} punts</span>
            </div>

            <p v-if="!waypoints.length" class="plan-route-waypoints__empty">
              Encara no hi ha punts. Fes clic al mapa per afegir-los.
            </p>

            <article v-for="(point, index) in waypoints" :key="point.id" class="plan-route-waypoint">
              <div class="plan-route-waypoint__row">
                <strong>Punt {{ index + 1 }}</strong>
                <span>{{ formatCoords(point.lat, point.lng) }}</span>
              </div>
              <label>
                Nom punt
                <input v-model="point.nomPunt" type="text" placeholder="Punt A" />
              </label>
              <label>
                Etiqueta
                <input v-model="point.etiqueta" type="text" placeholder="sortida, cim, pas..." />
              </label>
              <button class="plan-route-waypoint__remove" type="button" @click="removeWaypoint(point.id)">
                Treure punt
              </button>
            </article>
          </section>

          <div v-if="saveError" class="plan-route-message plan-route-message--error">
            {{ saveError }}
          </div>
          <div v-else-if="saveSuccess" class="plan-route-message">
            {{ saveSuccess }}
          </div>

          <button class="plan-route-submit" type="button" :disabled="!canSave" @click="handleSave">
            {{ isSaving ? 'Guardant...' : saveButtonLabel }}
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api/axios'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

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

const canSave = computed(() => {
  return (
    userStore.isAuthenticated &&
    waypoints.value.length >= 2 &&
    form.value.cimId &&
    !isSaving.value
  )
})

const saveButtonLabel = computed(() => (savedRoute.value ? 'Ruta guardada' : 'Guardar ruta'))

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
    saveError.value = 'Cal iniciar sessio per guardar la ruta.'
    return
  }

  if (!form.value.cimId) {
    saveError.value = 'Selecciona un cim abans de guardar.'
    return
  }

  if (!form.value.nom.trim()) {
    saveError.value = 'El nom de la ruta es obligatori.'
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

    const { data } = await api.post('/routes', payload)
    savedRoute.value = data.route
    saveSuccess.value = 'Ruta guardada correctament.'
  } catch (error) {
    saveError.value = getApiErrorMessage(error, 'No hem pogut guardar la ruta.')
  } finally {
    isSaving.value = false
  }
}

watch(waypoints, () => {
  renderWaypoints()
}, { deep: true })

onMounted(() => {
  fetchPeaks()

  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([41.95, 1.9], 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  map.on('click', (event) => {
    addWaypoint(event.latlng)
  })

  setTimeout(() => {
    map?.invalidateSize()
  }, 0)
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
  padding: 2rem 0 3rem;
}

.plan-route-header {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 1.75rem;
}

.route-planner-hero {
  border-radius: 22px;
  padding: 1.4rem;
  margin-bottom: 1rem;
}

.route-planner-hero__content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
}

.route-planner-eyebrow {
  margin: 0 0 0.35rem;
  color: #7f8977;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  font-weight: 700;
}

.route-planner-hero h1,
.route-sidebar h2,
.route-elevation-copy h2 {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 3.3rem);
  line-height: 1.04;
  color: var(--color-text);
}

.plan-route-text {
  margin: 0.8rem 0 0;
  color: var(--color-text-soft);
  max-width: 68ch;
  line-height: 1.7;
}

.plan-route-warning {
  margin: 0.8rem 0 0;
  color: #7b6a45;
  background: #fff7e1;
  border: 1px solid #e7d9b2;
  padding: 0.7rem 0.9rem;
  border-radius: 12px;
  max-width: 58ch;
}

.plan-route-header__status {
  min-width: 220px;
}

.plan-route-auth {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: #fff2f4;
  border: 1px solid #ead1d8;
  color: #8b3c4a;
}

.plan-route-auth--ok {
  background: #f2f8f1;
  border-color: #d4e2cd;
  color: #2d6a4f;
}

.plan-route-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.6rem;
}

.plan-route-map__frame {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: #f4f1f8;
  min-height: 420px;
}

.plan-route-map__canvas {
  height: 420px;
  width: 100%;
}

.plan-route-map__overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(15, 24, 21, 0.75);
  color: #fff;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.plan-route-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.plan-route-stat {
  background: #f3f5ea;
  border: 1px solid #d8dfc6;
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plan-route-stat span {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.plan-route-stat strong {
  font-size: 1.1rem;
  color: var(--color-text);
}

.plan-route-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
}

.plan-route-state {
  padding: 1rem;
  border-radius: 12px;
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
  gap: 1rem;
}

.plan-route-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  color: var(--color-text);
}

.plan-route-field input,
.plan-route-field select {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  background: #fff;
  color: var(--color-text);
}

.plan-route-grid-mini {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.plan-route-waypoints {
  border: 1px solid #e0dbe8;
  border-radius: 14px;
  padding: 0.9rem;
  background: #faf8fd;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.plan-route-waypoints__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.plan-route-waypoints__header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.plan-route-waypoints__empty {
  margin: 0;
  color: var(--color-text-soft);
}

.plan-route-waypoint {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.plan-route-waypoint__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.92rem;
  color: var(--color-text-soft);
}

.plan-route-waypoint label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.plan-route-waypoint input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
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
  padding: 0.8rem 0.9rem;
  border-radius: 12px;
  background: #f2f8f1;
  color: #2d6a4f;
  border: 1px solid #d4e2cd;
}

.plan-route-message--error {
  background: #fff5f5;
  color: #915454;
  border-color: #e3c8c8;
}

.plan-route-submit {
  border: none;
  border-radius: 12px;
  padding: 0.95rem 1rem;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  cursor: pointer;
}

.plan-route-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  .plan-route-grid {
    grid-template-columns: 1fr;
  }

  .plan-route-header {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .plan-route-view {
    padding: 1rem 0.5rem 2rem;
  }

  .plan-route-grid-mini {
    grid-template-columns: 1fr;
  }

  .plan-route-stats {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <!--
    Vista de planificació de ruta.
    Estructura principal:
    1) Hero superior: títol + estat de guardat.
    2) Shell central: sidebar de configuració + mapa interactiu.
    3) Panell tècnic: resum de mètriques + gràfic d'elevació.
  -->
  <section class="route-planner-view">
    <header class="route-planner-hero">
      <p class="route-planner-eyebrow">Planificador de rutes</p>
      <div class="route-planner-hero__content">
        <div>
          <h1>Planificar nova ruta</h1>
          <p>
            Afegeix punts al mapa, configura el tipus de sortida i revisa una lectura tecnica
            provisional abans de guardar-la.
          </p>
        </div>

        <button class="route-save-button" type="button" disabled>
          Guardar ruta
          <span>Pendent de backend</span>
        </button>
      </div>
    </header>

    <section class="route-planner-shell">
      <aside class="route-sidebar" aria-label="Configuracio de la ruta">
        <div class="route-sidebar__header">
          <p class="route-planner-eyebrow">La teva ruta</p>
          <h2>{{ routeTitle }}</h2>
          <p>Clica sobre el mapa per afegir waypoints en ordre.</p>
        </div>

        <div class="route-controls">
          <label>
            Tipus d'activitat
            <select v-model="activityType">
              <option value="senderisme">Senderisme</option>
              <option value="trail">Trail running</option>
              <option value="alpinisme">Alpinisme</option>
              <option value="btt">BTT</option>
            </select>
          </label>

          <label>
            Ritme
            <select v-model="pace">
              <option value="relaxat">Relaxat</option>
              <option value="moderat">Moderat</option>
              <option value="rapid">Rapid</option>
            </select>
          </label>

          <label>
            Tipus de recorregut
            <select v-model="routeType">
              <option value="one-way">Anada</option>
              <option value="round-trip">Anada i tornada</option>
              <option value="circular">Circular</option>
            </select>
          </label>
        </div>

        <p class="route-provisional-warning">
          Traçat provisional: encara no segueix camins reals. La ruta fiable quedarà disponible quan
          es connecti el motor de rutes.
        </p>

        <p v-if="routeType === 'circular'" class="route-warning">
          <span v-if="isCircularRouteClosed">Ruta circular tancada manualment al punt inicial.</span>
          <span v-else>
            Ruta circular seleccionada. Afegeix manualment els punts de retorn fins arribar al punt
            inicial.
          </span>
        </p>

        <p v-if="circularCloseHint" class="route-note">
          {{ circularCloseHint }}
        </p>

        <p v-if="routeType === 'round-trip'" class="route-note">
          En mode anada i tornada, la distancia estimada compta el retorn pel mateix recorregut.
        </p>

        <div class="waypoint-panel">
          <div class="waypoint-panel__title">
            <h3>Waypoints</h3>
            <button v-if="waypoints.length" type="button" @click="clearWaypoints">
              Netejar
            </button>
          </div>

          <ol v-if="waypoints.length" class="waypoint-list">
            <li v-for="(waypoint, index) in waypoints" :key="waypoint.id">
              <span class="waypoint-letter">{{ getWaypointLetter(index) }}</span>

              <div class="waypoint-info">
                <input
                  v-model="waypoint.name"
                  :aria-label="`Nom del waypoint ${getWaypointLetter(index)}`"
                />
                <small>{{ formatCoordinate(waypoint.lat) }}, {{ formatCoordinate(waypoint.lng) }}</small>
              </div>

              <div class="waypoint-actions">
                <button
                  type="button"
                  :disabled="index === 0"
                  aria-label="Pujar waypoint"
                  @click="moveWaypoint(index, -1)"
                >
                  ↑
                </button>
                <button
                  type="button"
                  :disabled="index === waypoints.length - 1"
                  aria-label="Baixar waypoint"
                  @click="moveWaypoint(index, 1)"
                >
                  ↓
                </button>
                <button type="button" aria-label="Eliminar waypoint" @click="removeWaypoint(index)">
                  ×
                </button>
              </div>
            </li>
          </ol>

          <p v-else class="empty-waypoints">
            Encara no hi ha punts. El primer clic al mapa sera el punt A.
          </p>
        </div>
      </aside>

      <main class="route-map-area">
        <div class="route-map-toolbar">
          <div>
            <strong>{{ waypoints.length }}</strong>
            <span>punts afegits</span>
          </div>
          <div>
            <strong>{{ formattedDistance }}</strong>
            <span>distancia estimada</span>
          </div>
          <div>
            <strong>{{ estimatedTime }}</strong>
            <span>temps estimat</span>
          </div>
        </div>

        <div ref="mapContainer" class="route-map"></div>
      </main>
    </section>

    <section class="route-technical-panel">
      <div class="route-summary-grid">
        <article>
          <span>Distancia</span>
          <strong>{{ formattedDistance }}</strong>
        </article>
        <article>
          <span>Desnivell positiu</span>
          <strong>{{ positiveElevation }} m</strong>
        </article>
        <article>
          <span>Desnivell negatiu</span>
          <strong>{{ negativeElevation }} m</strong>
        </article>
        <article>
          <span>Dificultat orientativa</span>
          <strong>{{ difficultyLabel }}</strong>
        </article>
      </div>

      <div class="route-elevation-section">
        <div class="route-elevation-copy">
          <p class="route-planner-eyebrow">Perfil d'elevacio</p>
          <h2>Lectura provisional de la ruta</h2>
          <p>
            Aquest perfil es una estimacio visual generada al frontend. Quan el backend o un servei
            d'elevacio estigui disponible, es podra substituir per dades reals.
          </p>
        </div>

        <RouteElevationChart :points="elevationProfile" />
      </div>
    </section>
  </section>
</template>

<script setup>
// computed: valors derivats (distància, temps, desnivell, etc.).
// ref: estat reactiu (waypoints, tipus de ruta...).
// lifecycle hooks: inicialitzar i destruir mapa Leaflet amb seguretat.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import RouteElevationChart from '../components/RouteElevationChart.vue'

// Centre per defecte: Catalunya (decisió UX per no demanar geolocalització).
const CATALONIA_CENTER = [41.82, 1.86]
// Radi terrestre per càlcul aproximat amb fórmula haversine.
const EARTH_RADIUS_KM = 6371

// Controls que l'usuari manipula des del sidebar.
const activityType = ref('senderisme')
const pace = ref('moderat')
const routeType = ref('one-way')
const waypoints = ref([])
const mapContainer = ref(null)
const circularCloseHint = ref('')

// Referències internes de Leaflet (mapa, capa de marcadors, línia de ruta).
let map = null
let waypointLayer = null
let routeLine = null

const routeTitle = computed(() => {
  // Títol automàtic de ruta segons primer i últim waypoint.
  if (!waypoints.value.length) return 'Ruta sense punts'
  const firstPoint = waypoints.value[0]?.name || 'Punt A'
  const lastPoint = waypoints.value.at(-1)?.name || getWaypointLetter(waypoints.value.length - 1)
  return waypoints.value.length === 1 ? firstPoint : `${firstPoint} - ${lastPoint}`
})

const baseDistance = computed(() => {
  // Distància base: suma tram a tram entre waypoints consecutius.
  if (waypoints.value.length < 2) return 0

  return waypoints.value.slice(1).reduce((total, waypoint, index) => {
    return total + getDistanceBetween(waypoints.value[index], waypoint)
  }, 0)
})

const estimatedDistance = computed(() => {
  // Si és anada+tornada dupliquem distància.
  // Si és circular o anada, deixem distància base.
  if (routeType.value === 'round-trip') return baseDistance.value * 2
  return baseDistance.value
})

const formattedDistance = computed(() => {
  if (!estimatedDistance.value) return '0 km'
  return `${estimatedDistance.value.toFixed(1)} km`
})

const elevationProfile = computed(() => {
  // PERFIL PROVISIONAL:
  // De moment no tenim motor de rutes per camins + elevació real.
  // Així que generem un perfil suau per visualitzar la UX del planificador.
  if (waypoints.value.length < 2) return []

  const samples = Math.max(6, waypoints.value.length * 3)
  const distanceStep = estimatedDistance.value / Math.max(1, samples - 1)
  const activityOffset = {
    senderisme: 90,
    trail: 120,
    alpinisme: 220,
    btt: 70,
  }[activityType.value]

  return Array.from({ length: samples }, (_, index) => {
    const progress = index / Math.max(1, samples - 1)
    const wave = Math.sin(progress * Math.PI) * activityOffset
    const smallVariation = Math.sin(index * 1.7) * 28
    const waypointInfluence = waypoints.value.length * 18

    return {
      distance: Number((distanceStep * index).toFixed(1)),
      elevation: Math.max(120, Math.round(520 + wave + smallVariation + waypointInfluence)),
    }
  })
})

const positiveElevation = computed(() => calculateElevationGain(elevationProfile.value, 'positive'))
const negativeElevation = computed(() => calculateElevationGain(elevationProfile.value, 'negative'))

const isCircularRouteClosed = computed(() => {
  // Detectem si l'usuari ha tancat "manualment" la circular
  // (últim punt molt proper al primer punt).
  if (routeType.value !== 'circular' || waypoints.value.length < 3) return false
  return getDistanceBetween(waypoints.value[0], waypoints.value.at(-1)) <= 0.06
})

const estimatedTime = computed(() => {
  if (!estimatedDistance.value) return '0 h'

  const speedByPace = {
    relaxat: 3.2,
    moderat: 4.2,
    rapid: 5.4,
  }

  const activityMultiplier = {
    senderisme: 1,
    trail: 0.78,
    alpinisme: 1.45,
    btt: 0.58,
  }

  const hours =
    (estimatedDistance.value / speedByPace[pace.value]) * activityMultiplier[activityType.value] +
    positiveElevation.value / 700

  const totalMinutes = Math.max(10, Math.round(hours * 60))
  const hourPart = Math.floor(totalMinutes / 60)
  const minutePart = totalMinutes % 60

  if (!hourPart) return `${minutePart} min`
  return minutePart ? `${hourPart} h ${minutePart} min` : `${hourPart} h`
})

const difficultyLabel = computed(() => {
  if (waypoints.value.length < 2) return 'Sense dades'
  if (activityType.value === 'alpinisme' || positiveElevation.value > 700) return 'Exigent'
  if (estimatedDistance.value > 12 || positiveElevation.value > 350) return 'Moderada'
  return 'Suau'
})

function getWaypointLetter(index) {
  return String.fromCharCode(65 + index)
}

function formatCoordinate(value) {
  return Number(value).toFixed(4)
}

function createWaypointIcon(index) {
  return L.divIcon({
    className: 'route-waypoint-icon',
    html: `<span>${getWaypointLetter(index)}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function addWaypoint(event) {
  const index = waypoints.value.length
  circularCloseHint.value = ''

  waypoints.value.push({
    id: `${Date.now()}-${index}`,
    name: `Punt ${getWaypointLetter(index)}`,
    lat: event.latlng.lat,
    lng: event.latlng.lng,
  })
}

function removeWaypoint(index) {
  waypoints.value.splice(index, 1)
}

function moveWaypoint(index, direction) {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= waypoints.value.length) return

  const nextWaypoints = [...waypoints.value]
  const current = nextWaypoints[index]
  nextWaypoints[index] = nextWaypoints[targetIndex]
  nextWaypoints[targetIndex] = current
  waypoints.value = nextWaypoints
}

function clearWaypoints() {
  waypoints.value = []
  circularCloseHint.value = ''
}

function closeCircularRouteFromStart() {
  if (routeType.value !== 'circular') return

  if (waypoints.value.length < 3) {
    circularCloseHint.value = 'Necessites almenys tres punts per tancar una ruta circular.'
    return
  }

  if (isCircularRouteClosed.value) {
    circularCloseHint.value = 'La ruta circular ja esta tancada manualment al punt inicial.'
    return
  }

  const distanceToStart = getDistanceBetween(waypoints.value.at(-1), waypoints.value[0])

  if (distanceToStart > 0.2) {
    circularCloseHint.value =
      'Per tancar-la sense inventar una recta falsa, afegeix punts de retorn fins apropar-te al punt A.'
    return
  }

  const index = waypoints.value.length
  waypoints.value.push({
    id: `${Date.now()}-${index}`,
    name: 'Retorn al punt A',
    lat: waypoints.value[0].lat,
    lng: waypoints.value[0].lng,
  })
  circularCloseHint.value = 'Ruta circular tancada manualment al punt A.'
}

function renderWaypoints() {
  if (!map) return

  if (!waypointLayer) {
    waypointLayer = L.layerGroup().addTo(map)
  }

  waypointLayer.clearLayers()

  waypoints.value.forEach((waypoint, index) => {
    const marker = L.marker([waypoint.lat, waypoint.lng], { icon: createWaypointIcon(index) })
      .bindPopup(`<strong>${getWaypointLetter(index)} · ${waypoint.name}</strong>`)
      .addTo(waypointLayer)

    if (index === 0) {
      marker.on('click', closeCircularRouteFromStart)
    }
  })

  if (routeLine) {
    routeLine.remove()
    routeLine = null
  }

  if (waypoints.value.length >= 2) {
    routeLine = L.polyline(
      waypoints.value.map((waypoint) => [waypoint.lat, waypoint.lng]),
      {
        color: '#2f2f2f',
        weight: 4,
        opacity: 0.72,
        dashArray: '10 12',
        lineCap: 'round',
        lineJoin: 'round',
      },
    ).addTo(map)
  }
}

function getDistanceBetween(origin, destination) {
  const lat1 = toRadians(origin.lat)
  const lat2 = toRadians(destination.lat)
  const deltaLat = toRadians(destination.lat - origin.lat)
  const deltaLng = toRadians(destination.lng - origin.lng)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(value) {
  return (value * Math.PI) / 180
}

function calculateElevationGain(points, type) {
  if (points.length < 2) return 0

  return points.slice(1).reduce((total, point, index) => {
    const difference = point.elevation - points[index].elevation
    if (type === 'positive' && difference > 0) return total + difference
    if (type === 'negative' && difference < 0) return total + Math.abs(difference)
    return total
  }, 0)
}

onMounted(async () => {
  await nextTick()

  map = L.map(mapContainer.value, {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView(CATALONIA_CENTER, 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  waypointLayer = L.layerGroup().addTo(map)
  map.on('click', addWaypoint)

  setTimeout(() => map?.invalidateSize(), 150)
})

watch(waypoints, renderWaypoints, { deep: true })
watch(routeType, () => {
  circularCloseHint.value = ''
})

onBeforeUnmount(() => {
  if (!map) return
  map.off('click', addWaypoint)
  map.remove()
  map = null
})
</script>

<style scoped>
.route-planner-view {
  width: min(1500px, calc(100% - 3rem));
  margin: 0 auto;
  padding: 2rem 0 3rem;
}

.route-planner-hero,
.route-planner-shell,
.route-technical-panel {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
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
  color: var(--color-text);
}

.route-planner-hero h1 {
  font-size: clamp(2.3rem, 5vw, 4.5rem);
  line-height: 0.95;
}

.route-planner-hero p,
.route-sidebar p,
.route-elevation-copy p {
  color: var(--color-text-soft);
  line-height: 1.6;
}

.route-planner-hero__content p {
  max-width: 64ch;
  margin: 0.8rem 0 0;
}

.route-save-button {
  min-width: 190px;
  border: 1px solid #c9c3b4;
  border-radius: 999px;
  background: #eee9dd;
  color: #756f65;
  padding: 0.8rem 1.1rem;
  font-weight: 800;
  cursor: not-allowed;
}

.route-save-button span {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.route-planner-shell {
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  min-height: 650px;
  border-radius: 24px;
  overflow: hidden;
}

.route-sidebar {
  border-right: 1px solid var(--color-border);
  padding: 1.25rem;
  background:
    linear-gradient(180deg, rgba(237, 232, 214, 0.7), rgba(255, 255, 255, 0.96)),
    var(--color-surface);
  overflow-y: auto;
}

.route-sidebar__header h2 {
  font-size: 2rem;
}

.route-sidebar__header p {
  margin: 0.55rem 0 0;
}

.route-controls {
  display: grid;
  gap: 0.85rem;
  margin: 1.35rem 0 1rem;
}

.route-controls label {
  display: grid;
  gap: 0.4rem;
  font-weight: 800;
}

.route-controls select,
.waypoint-info input {
  width: 100%;
  border: 1px solid #c9c3b4;
  border-radius: 14px;
  background: #fffdf8;
  color: var(--color-text);
  padding: 0.7rem 0.85rem;
  font: inherit;
}

.route-provisional-warning,
.route-warning,
.route-note {
  border-radius: 14px;
  margin: 0 0 1rem;
  padding: 0.85rem;
  line-height: 1.55;
}

.route-provisional-warning {
  border: 1px solid #d7c48f;
  background: #fff9e8;
  color: #62502a;
}

.route-warning {
  border: 1px solid #d5b15f;
  background: #fff6da;
  color: #6f4d00;
}

.route-note {
  border: 1px solid #cfd8c7;
  background: #f0f6ea;
  color: #3f5b34;
}

.waypoint-panel {
  border-top: 1px solid #d9d3c4;
  padding-top: 1rem;
}

.waypoint-panel__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.waypoint-panel__title h3 {
  margin: 0;
}

.waypoint-panel__title button,
.waypoint-actions button {
  border: 1px solid #c9c3b4;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text);
  padding: 0.38rem 0.7rem;
  cursor: pointer;
}

.waypoint-actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.waypoint-list {
  display: grid;
  gap: 0.8rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.waypoint-list li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
  border: 1px solid #e0dacb;
  border-radius: 16px;
  background: #fffdf8;
  padding: 0.75rem;
}

.waypoint-letter {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  font-weight: 900;
}

.waypoint-info {
  display: grid;
  gap: 0.35rem;
}

.waypoint-info small {
  color: var(--color-text-soft);
}

.waypoint-actions {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.empty-waypoints {
  border: 1px dashed #c9c3b4;
  border-radius: 16px;
  margin: 1rem 0 0;
  padding: 1rem;
  background: #fffdf8;
}

.route-map-area {
  display: grid;
  grid-template-rows: auto minmax(480px, 1fr);
  min-width: 0;
  background: #ece9df;
}

.route-map-toolbar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.route-map-toolbar div {
  background: #fffdf8;
  padding: 0.95rem 1rem;
}

.route-map-toolbar strong,
.route-map-toolbar span {
  display: block;
}

.route-map-toolbar strong {
  font-size: 1.35rem;
}

.route-map-toolbar span {
  color: var(--color-text-soft);
  font-size: 0.82rem;
}

.route-map {
  min-height: 560px;
  width: 100%;
  z-index: 0;
}

.route-technical-panel {
  border-radius: 24px;
  margin-top: 1rem;
  padding: 1.25rem;
}

.route-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}

.route-summary-grid article {
  border: 1px solid #ded8c9;
  border-radius: 16px;
  background: #fffdf8;
  padding: 1rem;
}

.route-summary-grid span,
.route-summary-grid strong {
  display: block;
}

.route-summary-grid span {
  color: var(--color-text-soft);
}

.route-summary-grid strong {
  margin-top: 0.25rem;
  font-size: 1.35rem;
}

.route-elevation-section {
  display: grid;
  grid-template-columns: minmax(220px, 0.32fr) minmax(0, 1fr);
  gap: 1.2rem;
  align-items: stretch;
}

.route-elevation-copy {
  border: 1px solid #ded8c9;
  border-radius: 18px;
  padding: 1rem;
  background: #fffdf8;
}

.route-elevation-copy h2 {
  font-size: 1.7rem;
}

.route-elevation-copy p:last-child {
  margin-bottom: 0;
}

:deep(.route-waypoint-icon) {
  background: var(--color-button-primary);
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
  color: #fff;
  display: grid;
  font-weight: 900;
  place-items: center;
}

:deep(.route-waypoint-icon span) {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

@media (max-width: 1100px) {
  .route-planner-view {
    width: min(100% - 1.5rem, 980px);
  }

  .route-planner-shell,
  .route-elevation-section {
    grid-template-columns: 1fr;
  }

  .route-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
}

@media (max-width: 720px) {
  .route-planner-view {
    width: calc(100% - 0.8rem);
    padding: 1rem 0 2rem;
  }

  .route-planner-hero,
  .route-technical-panel {
    border-radius: 18px;
    padding: 1rem;
  }

  .route-planner-hero__content {
    align-items: stretch;
    flex-direction: column;
  }

  .route-save-button {
    width: 100%;
  }

  .route-planner-shell {
    border-radius: 18px;
  }

  .route-map-toolbar,
  .route-summary-grid {
    grid-template-columns: 1fr;
  }

  .route-map {
    min-height: 430px;
  }
}
</style>

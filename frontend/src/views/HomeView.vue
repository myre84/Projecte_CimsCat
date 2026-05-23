<template>
  <!--
    Aquesta és la vista principal de la home.
    Aquí ajuntem tres blocs grans:
    1) la part visual de dalt amb el carrusel/hero,
    2) la navbar pròpia de la home,
    3) la zona inferior amb les cards destacades i el mapa.
  -->
  <section class="home-view">
    <!-- Hero superior amb imatge, text i punts del carrusel. -->
    <section class="hero">
      <div class="hero__media">
        <!--
          currentSlide ens diu quina imatge del llistat heroImages s'ha de mostrar.
          Amb :src fem que la imatge vagi canviant dinàmicament.
        -->
        <img :src="heroSlides[currentSlide].image" alt="Paisatge de muntanya" class="hero__image" />

        <!--
          Aquesta capa fosca a sobre de la foto fa que el text es pugui llegir millor.
          Visualment actua com a overlay del hero.
        -->
        <div class="hero__overlay">
          <p class="hero__subtitle">{{ heroSlides[currentSlide].text }}</p>
        </div>
      </div>

      <!--
        Aquests botons petits són els punts del carrusel.
        Fem un v-for perquè es generi un punt per cada imatge del hero.
      -->
      <div class="hero__dots">
        <!-- Si l'usuari clica un punt, saltem directament a aquella imatge. -->
        <button
          v-for="(slide, index) in heroSlides"
          :key="index"
          class="hero__dot"
          :class="{ 'hero__dot--active': index === currentSlide }"
          @click="currentSlide = index"
        ></button>
      </div>

      <!-- Títol principal de la home. -->
      <div class="hero__text-block">
        <h1 class="hero__title">CimsCat</h1>
        <p class="hero__intro">
          Una plataforma per descobrir cims, preparar sortides i compartir experiències de muntanya.
        </p>
      </div>
    </section>

    <!--
      A la home volem la navbar just sota el hero.
      Per això la cridem aquí en lloc de deixar-la només al layout general.
    -->
    <NavBar class="home-navbar" />

    <!-- Secció de cims/publicacions destacades. -->
    <section class="featured-section">
      <div class="featured-section__header">
        <h2 class="featured-section__title">Cims destacats</h2>
      </div>

      <div class="featured-section__content">
        <!--
          Columna esquerra: cards destacades.
          Fem un v-for per reutilitzar el component PeakCard per cada publicació.
        -->
        <div ref="cardsContainer" class="featured-section__cards">
          <p v-if="isLoadingPeaks" class="featured-section__status">
            Carregant cims destacats...
          </p>

          <p v-else-if="peaksError" class="featured-section__status featured-section__status--error">
            {{ peaksError }}
          </p>

          <p
            v-else-if="!displayedPublications.length"
            class="featured-section__status featured-section__status--empty"
          >
            Ara mateix no hi ha cims per mostrar.
          </p>

          <PeakCard
            v-for="publication in displayedPublications"
            :key="publication.id"
            :publication="publication"
            class="featured-section__card"
            :class="{ 'featured-section__card--selected': selectedPeakId === publication.peakId }"
            :ref="(el) => setPeakCardRef(publication.peakId, el)"
            @click="handleCardSelect(publication)"
          />
        </div>

        <!-- Columna dreta: el contenidor on Leaflet dibuixarà el mapa. -->
        <div class="featured-section__map">
          <div ref="mapContainer" class="map-container"></div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
// computed ens serveix per derivar dades a partir d'altres.
// onMounted/onBeforeUnmount ens deixen executar codi quan el component es crea o es destrueix.
// ref ens serveix per guardar valors reactius o referències a elements del DOM.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

// Leaflet és la llibreria que fem servir per pintar el mapa.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Component de targeta reutilitzable per no embrutar massa la HomeView.
import PeakCard from '../components/PeakCard.vue'

// Navbar reutilitzada a la home.
import NavBar from '../components/NavBar.vue'
import api from '../api/axios'
import { resolveMediaUrl } from '../utils/media'

// Aquest és un marcador personalitzat perquè el punt del mapa sigui més coherent amb l'estètica del projecte.
// En lloc d'usar el marcador blau per defecte de Leaflet, construïm un petit "pin" verd.
function createPeakIcon(isSelected = false) {
  const size = isSelected ? 42 : 32
  const background = isSelected ? '#184f39' : '#2d6a4f'
  const borderWidth = isSelected ? 4 : 3

  return L.divIcon({
    className: '',
    html: `<div style="
    width: ${size}px; height: ${size}px;
    background: ${background};
    border: ${borderWidth}px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 12px rgba(0,0,0,0.42);
  "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const peakIcon = createPeakIcon(false)
const selectedPeakIcon = createPeakIcon(true)

// Aquí preparem els cims destacats que volem mostrar a la home.
// Les ordenem de més guardats a menys guardats perquè la home ha d'ensenyar els favorits.
const peaks = ref([])
const isLoadingPeaks = ref(true)
const peaksError = ref('')
const selectedPeakId = ref(null)
const cardsContainer = ref(null)
const peakCardRefs = new Map()
const markerByPeakId = new Map()

function mapPeakToCard(peak) {
  return {
    id: peak.id,
    peakId: peak.id,
    publicationId: `${peak.id}-featured`,
    peakName: peak.nom,
    elevation: peak.alcada,
    region: peak.comarca || 'Comarca no informada',
    authorName: 'CimsCat',
    savedCount: peak.stats.savedCount,
    excerpt:
      peak.zonaProtegida ||
      peak.massis ||
      peak.dificultat ||
      'Consulta la fitxa del cim per veure’n més informació.',
    imageUrl:
      resolveMediaUrl(peak.imatgeUrl) ||
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
    lat: peak.lat,
    lng: peak.lon,
  }
}

const displayedPublications = computed(() => {
  return [...peaks.value]
    .sort((a, b) => b.stats.savedCount - a.stats.savedCount)
    .map(mapPeakToCard)
})

// Llista d'imatges del carrusel.
// Ara mateix també són imatges externes temporals per avançar en el frontend.
const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    text: 'Explora cims i descobreix nous racons de muntanya.',
  },
  {
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
    text: 'Crea la teva ruta i prepara cada sortida amb calma.',
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
    text: 'Publica la teva sortida i comparteix-la amb la comunitat.',
  },
]

// currentSlide controla quina imatge del hero s'està mostrant.
const currentSlide = ref(0)

// Aquesta ref apunta al div real del mapa quan Vue ja l'ha pintat al DOM.
const mapContainer = ref(null)

// Guardem aquí la instància del mapa per poder-la eliminar després.
let map = null
let markerLayer = null

// Guardem també l'interval del carrusel per netejar-lo quan sortim de la pantalla.
let slideInterval = null

function getApiErrorMessage(error) {
  // Aquesta funció intenta rescatar el missatge més útil possible del backend.
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    'No hem pogut carregar els cims destacats.'

  if (message.includes("Can't reach database server")) {
    return 'El backend no pot connectar amb la base de dades ara mateix.'
  }

  return message
}

function setPeakCardRef(peakId, el) {
  if (!el) {
    peakCardRefs.delete(peakId)
    return
  }

  peakCardRefs.set(peakId, el.$el || el)
}

function scrollToPeakCard(peakId) {
  const container = cardsContainer.value
  const card = peakCardRefs.get(peakId)

  if (!container || !card) return

  const containerRect = container.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const currentScroll = container.scrollTop
  const cardTopInsideContainer = cardRect.top - containerRect.top + currentScroll
  const centeredTop = cardTopInsideContainer - (container.clientHeight / 2) + (card.clientHeight / 2)

  container.scrollTo({
    top: Math.max(0, centeredTop),
    behavior: 'smooth',
  })
}

function updateMarkerIcons() {
  markerByPeakId.forEach((marker, peakId) => {
    marker.setIcon(peakId === selectedPeakId.value ? selectedPeakIcon : peakIcon)
  })
}

function selectPeak(publication, options = {}) {
  selectedPeakId.value = publication.peakId
  updateMarkerIcons()

  if (options.scrollCard) {
    scrollToPeakCard(publication.peakId)
  }

  const marker = markerByPeakId.get(publication.peakId)
  if (marker && options.openPopup) {
    marker.openPopup()
  }

  const lat = Number(publication.lat)
  const lng = Number(publication.lng)

  if (map && Number.isFinite(lat) && Number.isFinite(lng) && options.centerMap) {
    const targetZoom = Math.max(map.getZoom(), 10)
    map.flyTo([lat, lng], targetZoom, { duration: 0.55 })
  }
}

function handleCardSelect(publication) {
  selectPeak(publication, {
    centerMap: true,
    openPopup: true,
  })
}

async function renderMarkers() {
  // Aquesta funció pinta al mapa un marcador per cada cim destacat que tingui coordenades.
  if (!map) return

  await nextTick()

  if (markerLayer) {
    markerLayer.clearLayers()
  } else {
    markerLayer = L.layerGroup().addTo(map)
  }

  markerByPeakId.clear()
  const markers = []

  displayedPublications.value.forEach((publication) => {
    // Si algun cim no té lat/lng, l'ignorem per evitar errors a Leaflet.
    if (!publication.lat || !publication.lng) return

    const marker = L.marker([publication.lat, publication.lng], { icon: peakIcon })
      .bindPopup(`
        <strong>${publication.peakName}</strong><br/>
        ${publication.region}
      `)

    marker.on('click', () => {
      selectPeak(publication, {
        scrollCard: true,
      })
    })

    markerLayer.addLayer(marker)
    markerByPeakId.set(publication.peakId, marker)
    markers.push(marker)
  })

  if (markers.length) {
    map.invalidateSize()
    const bounds = L.featureGroup(markers).getBounds().pad(0.2)
    map.fitBounds(bounds)
  }

  setTimeout(() => {
    map?.invalidateSize()
  }, 0)
}

async function fetchPeaks() {
  // Aquí demanem al backend el catàleg de cims.
  // Si la crida falla, deixem la secció en estat d'error perquè l'usuari ho vegi.
  isLoadingPeaks.value = true
  peaksError.value = ''

  try {
    const { data } = await api.get('/peaks')
    peaks.value = data.peaks || []

    await renderMarkers()
  } catch (error) {
    peaks.value = []
    peaksError.value = getApiErrorMessage(error)
  } finally {
    isLoadingPeaks.value = false
  }
}

onMounted(() => {
  // Quan la vista es carrega, fem que el carrusel canviï d'imatge cada 3.5 segons.
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroSlides.length
  }, 3500)

  // Si encara no tenim el contenidor del mapa, parem aquí per evitar errors.
  if (!mapContainer.value) return

  // Inicialitzem Leaflet dins del div referenciat per mapContainer.
  // Posem una vista inicial aproximada centrada a Catalunya.
  map = L.map(mapContainer.value).setView([41.95, 1.9], 8)

  // Afegim la capa base del mapa des d'OpenStreetMap.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  setTimeout(() => {
    map?.invalidateSize()
  }, 0)

  fetchPeaks()
})

onBeforeUnmount(() => {
  // Si hi ha un interval actiu del carrusel, l'aturem per no deixar processos vius.
  if (slideInterval) {
    clearInterval(slideInterval)
  }

  // També eliminem el mapa de Leaflet quan sortim de la vista.
  // Això evita problemes si l'usuari entra i surt de la home diverses vegades.
  if (map) {
    map.remove()
    map = null
  }

  markerLayer = null
})
</script>

<style scoped>
/* Contenidor general de la home. */
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

/* Bloc superior del hero. */
.hero {
  background: var(--color-surface);
  padding: 1rem 1rem 0.5rem;
}

/* La part visual que conté la imatge del carrusel. */
.hero__media {
  position: relative;
}

/* Imatge gran del hero. */
.hero__image {
  width: 100%;
  height: 460px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

/* Capa fosca suau sobre la foto per fer més llegible el text. */
.hero__overlay {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2rem;
  gap: 0.75rem;
}

/* Zona del text principal que hi ha sota la imatge. */
.hero__text-block {
  text-align: center;
  padding: 1.2rem 1rem 0.35rem;
}

/* Títol principal "CimsCat". */
.hero__title {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 64px;
  line-height: 1.05;
  color: var(--color-text);
  text-align: center;
  letter-spacing: -0.02em;
}

.hero__intro {
  max-width: 620px;
  margin: 0.7rem auto 0;
  color: var(--color-text-soft);
  font-size: 1.08rem;
  line-height: 1.5;
}

/* Subtítol que apareix a sobre de la imatge. */
.hero__subtitle {
  margin: 0;
  max-width: 58ch;
  color: rgba(255,255,255,0.92);
  line-height: 1.5;
  font-size: 1.5rem;
  text-align: center;
  text-shadow: 0 1px 8px rgba(0,0,0,0.6);
  padding: 0 1rem;
}

/* Contenidor dels punts del carrusel. */
.hero__dots {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.7rem 0 0.2rem;
}

/* Cada punt del carrusel. */
.hero__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #c3c3c3;
  cursor: pointer;
}

/* Punt actiu del carrusel. */
.hero__dot--active {
  background: #444;
}

/* La navbar a la home queda enganxada al bloc de dalt sense marge extra. */
.home-navbar {
  margin-top: 0;
}

/* Secció dels destacats. */
.featured-section {
  background: var(--color-surface);
  padding: 3rem 1rem 2rem;
}

.featured-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

/* Títol de secció. */
.featured-section__title {
  margin: 0;
  font-size: 2.3rem;
  color: var(--color-text);
}

.featured-section__button {
  min-height: 42px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text);
  padding: 0.65rem 0.95rem;
  cursor: pointer;
}

/* Layout a dues columnes: cards a l'esquerra i mapa a la dreta. */
.featured-section__content {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 1.4rem;
  align-items: stretch;
  margin-bottom: 1rem;
}

/* Columna scrollable de cards. */
.featured-section__cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 0.6rem;
  scrollbar-width: auto;
  scrollbar-color: #c0c0c0 #f0f0f0;
}

.featured-section__status {
  margin: 0;
  padding: 1rem;
  border-radius: 10px;
  background: #f5f5f0;
  color: var(--color-text-soft);
  line-height: 1.5;
}

.featured-section__status--error {
  background: #fff5f5;
  color: #8a5252;
  border: 1px solid #e5c8c8;
}

.featured-section__status--empty {
  background: #f4f2fb;
  color: #625a86;
  border: 1px solid #dcd6f3;
}

.featured-section__card {
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.featured-section__card--selected {
  border-color: #2d6a4f;
  background: #f7fbf8;
  box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.16);
  transform: translateY(-1px);
}

/* Personalitzem una mica l'scrollbar per semblar-nos més al wireframe. */
.featured-section__cards::-webkit-scrollbar {
  width: 8px;
}

.featured-section__cards::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 99px;
}

.featured-section__cards::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 99px;
  border: 2px solid #f0f0f0;
}

/* Columna del mapa. */
.featured-section__map {
  min-height: 100%;
}

/* Contenidor on Leaflet injecta el mapa. */
.map-container {
  width: 100%;
  min-height: 100%;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

/* Quan la pantalla és més petita, apilem cards i mapa un sota l'altre. */
@media (max-width: 900px) {
  .featured-section__header {
    align-items: flex-start;
  }

  .featured-section__content {
    grid-template-columns: 1fr;
  }

  .map-container {
    min-height: 300px;
  }
}

/* Ajustos específics per mòbil. */
@media (max-width: 640px) {
  .hero {
    padding: 0.75rem 0.35rem 0.75rem;
  }

  .hero__image {
    height: 260px;
  }

  .featured-section {
    padding: 1rem 0.35rem 0;
  }

  .featured-section__title {
    font-size: 1.8rem;
  }

  .map-container {
    min-height: 260px;
  }
}

</style>

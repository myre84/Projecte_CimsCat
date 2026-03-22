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
        <img :src="heroImages[currentSlide]" alt="Paisatge de muntanya" class="hero__image" />

        <!--
          Aquesta capa fosca a sobre de la foto fa que el text es pugui llegir millor.
          Visualment actua com a overlay del hero.
        -->
        <div class="hero__overlay">
          <p class="hero__subtitle">Explora cims, descobreix rutes i guarda les millors sortides.</p>
        </div>
      </div>

      <!--
        Aquests botons petits són els punts del carrusel.
        Fem un v-for perquè es generi un punt per cada imatge del hero.
      -->
      <div class="hero__dots">
        <!-- Si l'usuari clica un punt, saltem directament a aquella imatge. -->
        <button
          v-for="(image, index) in heroImages"
          :key="index"
          class="hero__dot"
          :class="{ 'hero__dot--active': index === currentSlide }"
          @click="currentSlide = index"
        ></button>
      </div>

      <!-- Títol principal de la home. -->
      <div class="hero__text-block">
        <h1 class="hero__title">CimsCat</h1>
      </div>
    </section>

    <!--
      A la home volem la navbar just sota el hero.
      Per això la cridem aquí en lloc de deixar-la només al layout general.
    -->
    <NavBar class="home-navbar" />

    <!-- Secció de cims/publicacions destacades. -->
    <section class="featured-section">
      <h2 class="featured-section__title">Cims destacats</h2>

      <div class="featured-section__content">
        <!--
          Columna esquerra: cards destacades.
          Fem un v-for per reutilitzar el component PeakCard per cada publicació.
        -->
        <div class="featured-section__cards">
          <PeakCard
            v-for="publication in featuredPublications"
            :key="publication.id"
            :publication="publication"
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// Leaflet és la llibreria que fem servir per pintar el mapa.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Component de targeta reutilitzable per no embrutar massa la HomeView.
import PeakCard from '../components/PeakCard.vue'

// Navbar reutilitzada a la home.
import NavBar from '../components/NavBar.vue'

// Dades mock temporals.
// Les fem servir perquè el backend encara no ens dóna aquest endpoint.
import { homeFeaturedPublications } from '../mocks/homeFeaturedPublications'

// Aquest és un marcador personalitzat perquè el punt del mapa sigui més coherent amb l'estètica del projecte.
// En lloc d'usar el marcador blau per defecte de Leaflet, construïm un petit "pin" verd.
const peakIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 32px; height: 32px;
    background: #2d6a4f;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
})

// Aquí preparem les publicacions que volem mostrar a la home.
// Les ordenem de més likes a menys likes perquè la home ha d'ensenyar les més destacades.
const featuredPublications = computed(() =>
  [...homeFeaturedPublications].sort((a, b) => b.likes - a.likes)
)

// Llista d'imatges del carrusel.
// Ara mateix també són imatges externes temporals per avançar en el frontend.
const heroImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
]

// currentSlide controla quina imatge del hero s'està mostrant.
const currentSlide = ref(0)

// Aquesta ref apunta al div real del mapa quan Vue ja l'ha pintat al DOM.
const mapContainer = ref(null)

// Guardem aquí la instància del mapa per poder-la eliminar després.
let map = null

// Guardem també l'interval del carrusel per netejar-lo quan sortim de la pantalla.
let slideInterval = null

onMounted(() => {
  // Quan la vista es carrega, fem que el carrusel canviï d'imatge cada 3.5 segons.
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
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

  // Recorrem totes les publicacions destacades i, si tenen coordenades, hi afegim un marcador.
  featuredPublications.value.forEach((publication) => {
    if (!publication.lat || !publication.lng) return

    // Cada marcador mostra un petit popup amb el nom del cim i la zona.
    L.marker([publication.lat, publication.lng], { icon: peakIcon })
      .addTo(map)
      .bindPopup(`
        <strong>${publication.peakName}</strong><br/>
        ${publication.region}
      `)
  })
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
  padding: 1.2rem 1rem 0.2rem;
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

/* Subtítol que apareix a sobre de la imatge. */
.hero__subtitle {
  margin: 0;
  max-width: 52ch;
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

/* Títol de secció. */
.featured-section__title {
  margin: 0 0 1.5rem;
  font-size: 2.3rem;
  color: var(--color-text);
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

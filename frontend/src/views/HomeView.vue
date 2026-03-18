<template>
  <section class="home-view">
    <section class="hero">
      <div class="hero__media">
        <img :src="heroImages[currentSlide]" alt="Paisatge de muntanya" class="hero__image" />
        <div class="hero__overlay">
          <p class="hero__subtitle">Explora cims, descobreix rutes i guarda les millors sortides.</p>
        </div>
      </div>

      <div class="hero__dots">
        <button
          v-for="(image, index) in heroImages"
          :key="index"
          class="hero__dot"
          :class="{ 'hero__dot--active': index === currentSlide }"
          @click="currentSlide = index"
        ></button>
      </div>

      <div class="hero__text-block">
        <h1 class="hero__title">CimsCat</h1>
      </div>
    </section>

    <NavBar class="home-navbar" />

    <section class="featured-section">
      <h2 class="featured-section__title">Cims destacats</h2>

      <div class="featured-section__content">
        <div class="featured-section__cards">
          <PeakCard
            v-for="publication in featuredPublications"
            :key="publication.id"
            :publication="publication"
          />
        </div>

        <div class="featured-section__map">
          <div ref="mapContainer" class="map-container"></div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import PeakCard from '../components/PeakCard.vue'
import NavBar from '../components/NavBar.vue'
import { homeFeaturedPublications } from '../mocks/homeFeaturedPublications'

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

const featuredPublications = computed(() =>
  [...homeFeaturedPublications].sort((a, b) => b.likes - a.likes)
)

const heroImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
]

const currentSlide = ref(0)
const mapContainer = ref(null)

let map = null
let slideInterval = null

onMounted(() => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
  }, 3500)

  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([41.95, 1.9], 8)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  featuredPublications.value.forEach((publication) => {
    if (!publication.lat || !publication.lng) return

    L.marker([publication.lat, publication.lng], { icon: peakIcon })
      .addTo(map)
      .bindPopup(`
        <strong>${publication.peakName}</strong><br/>
        ${publication.region}
      `)
  })
})

onBeforeUnmount(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }

  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.hero {
  background: var(--color-surface);
  padding: 1rem 1rem 0.5rem;
}

.hero__media {
  position: relative;
}

.hero__image {
  width: 100%;
  height: 460px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

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

.hero__text-block {
  text-align: center;
  padding: 1.2rem 1rem 0.2rem;
}

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

.hero__dots {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  margin: 0.7rem 0 0.2rem;
}

.hero__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #c3c3c3;
  cursor: pointer;
}

.hero__dot--active {
  background: #444;
}


.home-navbar {
  margin-top: 0;
}

.featured-section {
  background: var(--color-surface);
  padding: 3rem 1rem 2rem;
}

.featured-section__title {
  margin: 0 0 1.5rem;
  font-size: 2.3rem;
  color: var(--color-text);
}

.featured-section__content {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 1.4rem;
  align-items: stretch;
  margin-bottom: 1rem;
}

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

.featured-section__map {
  min-height: 100%;
}

.map-container {
  width: 100%;
  min-height: 100%;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 900px) {
  .featured-section__content {
    grid-template-columns: 1fr;
  }

  .map-container {
    min-height: 300px;
  }
}

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

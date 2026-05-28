<template>
  <!--
    Aquesta targeta és per als cims guardats del perfil.
    Aquí no parlem de publicacions d'usuari, sinó de fitxes oficials de cim.
    Aquest detall és important perquè aquesta secció representa el concepte `saved`
    del projecte, no pas `likes`.
  -->
  <article class="profile-peak-card">
    <!-- Imatge principal del cim -->
    <img :src="peakImage" :alt="peak.nom" class="profile-peak-card__image" />

    <!-- Informació bàsica del cim -->
    <div class="profile-peak-card__content">
      <h3 class="profile-peak-card__title">{{ peak.nom }}</h3>
      <p class="profile-peak-card__meta">{{ peak.alcada }} m</p>
      <p class="profile-peak-card__meta">{{ peak.comarca }}</p>
      <RouterLink :to="`/cim/${peak.id}`" class="profile-peak-card__link">
        Veure pàgina del cim
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
// computed ens ajuda a preparar la imatge final del cim.
import { computed } from 'vue'
import { resolveMediaUrl } from '../utils/media'
import { getLocalPeakImage } from '../utils/peakImages'

// Esperem rebre un objecte cim ja preparat per pintar.
const props = defineProps({
  peak: {
    type: Object,
    required: true,
  },
})

const peakImage = computed(
  () =>
    // Si el cim té imatge pròpia, la resolem.
    // Si no, fem servir una imatge fallback per no deixar la targeta buida.
    resolveMediaUrl(props.peak.imatgeUrl) ||
    getLocalPeakImage(props.peak) ||
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
)
</script>

<style scoped>
/* Targeta base del cim guardat */
.profile-peak-card {
  width: 260px;
  min-width: 260px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

/* Imatge superior del cim */
.profile-peak-card__image {
  width: 100%;
  height: 155px;
  object-fit: cover;
  display: block;
}

/* Informació textual de la targeta */
.profile-peak-card__content {
  padding: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.profile-peak-card__title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
  color: var(--color-text);
}

/* Text secundari per alcada i comarca */
.profile-peak-card__meta {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

/* Enllaç a la fitxa oficial del cim */
.profile-peak-card__link {
  width: fit-content;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  background: #fff;
  margin-top: 0.35rem;
}
</style>

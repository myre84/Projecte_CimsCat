<template>
  <!--
    Aquesta targeta representa una publicació destacada de la home.
    La fem component perquè després es pugui reutilitzar en altres pantalles.
  -->
  <article class="peak-card">
    <!-- Imatge principal de la publicació/cim. -->
    <img :src="publication.imageUrl" :alt="publication.peakName" class="peak-card__image" />

    <div class="peak-card__content">
      <!-- Part superior de la card: informació a l'esquerra i botó de guardar a la dreta. -->
      <div class="peak-card__top">
        <div>
          <h3 class="peak-card__title">{{ publication.peakName }}</h3>
          <p class="peak-card__meta">{{ publication.elevation }} m</p>
          <p class="peak-card__meta">{{ publication.region }}</p>
          <p class="peak-card__meta peak-card__meta--accent">
            {{ savedCount }} guardats
          </p>
        </div>

        <!--
          Aquest botó marca el cim com a guardat.
          Si l'usuari no està autenticat, el redirigim a registre.
          Si està autenticat, canviem l'estat de guardat localment.
        -->
        <button
          class="peak-card__save"
          :class="{ 'peak-card__save--active': isSaved }"
          :aria-pressed="isSaved"
          :title="isSaved ? 'Treure de guardats' : 'Guardar cim'"
          :data-tooltip="isSaved ? 'Treure de guardats' : 'Guardar cim'"
          @click="handleSave"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 3.75h10a1.25 1.25 0 0 1 1.25 1.25v15.01a.25.25 0 0 1-.4.2L12 15.75l-5.85 4.46a.25.25 0 0 1-.4-.2V5A1.25 1.25 0 0 1 7 3.75Z"
            />
          </svg>
        </button>
      </div>

      <!-- Descripció breu de la publicació. -->
      <p class="peak-card__excerpt">{{ publication.excerpt }}</p>

      <!-- Enllaç cap a la fitxa del cim. -->
      <RouterLink :to="`/cim/${publication.peakId}`" class="peak-card__link">
        Veure pagina del cim
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
// ref ens serveix per guardar l'estat local del guardat dins la targeta.
import { ref } from 'vue'

// useRouter el fem servir per navegar per codi, per exemple quan volem enviar a registre.
import { useRouter } from 'vue-router'

// Accedim a la store global per saber si l'usuari està loguejat o no.
import { useUserStore } from '../stores/user'

// Aquesta card espera rebre una publicació sencera des del component pare.
const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const userStore = useUserStore()

// isSaved controla només l'estat visual actual del guardat dins aquesta card.
const isSaved = ref(false)

// Guardem també el recompte de guardats per mantenir el feedback visual coherent.
const savedCount = ref(props.publication.savedCount)

function handleSave() {
  // Si l'usuari no està autenticat, no pot guardar cims i l'enviem a registre.
  if (!userStore.isAuthenticated) {
    router.push('/registre')
    return
  }

  // Si està autenticat, canviem l'estat local del guardat.
  isSaved.value = !isSaved.value

  // També sumem o restem 1 al comptador local.
  // Això de moment és només visual perquè encara no ho connectem a favorits reals de backend.
  savedCount.value += isSaved.value ? 1 : -1
}
</script>

<style scoped>
/* Targeta principal. */
.peak-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 1rem;
  padding: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

/* Imatge de la publicació. */
.peak-card__image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
}

/* Contingut textual i botó. */
.peak-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* Part superior amb informació i like. */
.peak-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

/* Títol del cim. */
.peak-card__title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-text);
}

/* Dades secundàries com altitud i comarca. */
.peak-card__meta {
  margin: 0.15rem 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.peak-card__meta--accent {
  color: #2d6a4f;
  font-weight: 600;
}

/* Descripció curta. */
.peak-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.95rem;
}

/* Botó de guardar. */
.peak-card__save {
  width: 44px;
  height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  color: #5c625a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.peak-card__save svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.peak-card__save::after {
  content: attr(data-tooltip);
  position: absolute;
  right: calc(100% + 0.65rem);
  top: 50%;
  transform: translateY(-50%) scale(0.96);
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  padding: 0.45rem 0.7rem;
  border-radius: 8px;
  background: rgba(39, 52, 43, 0.96);
  color: #fff;
  font-size: 0.82rem;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.peak-card__save:hover::after,
.peak-card__save:focus-visible::after {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.peak-card__save--active {
  background: #edf4ee;
  color: #2d6a4f;
  border-color: #9fc0a9;
}

/* Botó/enllaç per entrar a la fitxa del cim. */
.peak-card__link {
  width: fit-content;
  text-decoration: none;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  background: var(--color-button-secondary);
  font-size: 0.88rem;
}

/* En pantalles petites apilem la imatge i el contingut. */
@media (max-width: 640px) {
  .peak-card {
    grid-template-columns: 1fr;
  }

  .peak-card__image {
    height: 180px;
  }
}
</style>

<template>
  <!--
    Aquesta targeta representa una publicació destacada de la home.
    La fem component perquè després es pugui reutilitzar en altres pantalles.
  -->
  <article class="peak-card">
    <!-- Imatge principal de la publicació/cim. -->
    <img :src="publication.imageUrl" :alt="publication.peakName" class="peak-card__image" />

    <div class="peak-card__content">
      <!-- Part superior de la card: informació a l'esquerra i botó de like a la dreta. -->
      <div class="peak-card__top">
        <div>
          <h3 class="peak-card__title">{{ publication.peakName }}</h3>
          <p class="peak-card__meta">{{ publication.elevation }} m</p>
          <p class="peak-card__meta">{{ publication.region }}</p>
        </div>

        <!--
          Aquest botó fa de "like".
          Si l'usuari no està autenticat, el redirigim a registre.
          Si està autenticat, canviem l'estat del cor localment.
        -->
        <button class="peak-card__like" @click="handleLike">
          {{ isLiked ? '❤' : '♡' }}
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
// ref ens serveix per guardar l'estat del like dins la targeta.
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

// isLiked controla només l'estat visual actual del cor dins aquesta card.
const isLiked = ref(false)

// Guardem també el recompte de likes per si volem mostrar-lo o modificar-lo després.
const likesCount = ref(props.publication.likes)

function handleLike() {
  // Si l'usuari no està autenticat, no pot fer like i l'enviem a registre.
  if (!userStore.isAuthenticated) {
    router.push('/registre')
    return
  }

  // Si està autenticat, canviem l'estat local del cor.
  isLiked.value = !isLiked.value

  // També sumem o restem 1 al comptador local.
  // Això de moment és només visual perquè encara no ho connectem a backend.
  likesCount.value += isLiked.value ? 1 : -1
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

/* Descripció curta. */
.peak-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.95rem;
}

/* Botó del cor. */
.peak-card__like {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.8rem;
  color: var(--color-text);
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

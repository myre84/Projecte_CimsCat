<template>
  <!--
    Aquesta targeta la fem per a publicacions dins del perfil.
    Ens interessa una peça molt simple: imatge, títol, autor i un enllaç a la publicació.
    La reutilitzem tant a:
    - Últimes publicacions
    - Publicacions guardades
  -->
  <article class="profile-publication-card">
    <!-- Imatge principal de la publicació -->
    <img
      :src="coverImage"
      :alt="publication.titol"
      class="profile-publication-card__image"
    />

    <!-- Text i acció de la targeta -->
    <div class="profile-publication-card__content">
      <h3 class="profile-publication-card__title">{{ publication.titol }}</h3>
      <p class="profile-publication-card__author">by {{ authorName }}</p>
      <RouterLink :to="`/publicacio/${publication.id}`" class="profile-publication-card__link">
        Veure publicació
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
// computed ens va bé perquè coverImage i authorName depenen de la publicació rebuda.
import { computed } from 'vue'
import { resolveMediaUrl } from '../utils/media'

// Aquesta targeta espera rebre una publicació completa o prou completa per pintar-se.
const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
})

const coverImage = computed(
  () =>
    // Intentem diverses fonts d'imatge:
    // 1) portada pròpia de la publicació
    // 2) imatge del cim associat
    // 3) fallback extern si no hi ha res més
    resolveMediaUrl(
      props.publication.portadaUrl ||
        props.publication.cim?.imatgeUrl ||
        props.publication.peak?.imatgeUrl,
    ) ||
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
)

const authorName = computed(() => {
  // Igual que en altres pantalles, provem primer nom d'usuari.
  // Si no hi és, intentem altres camps de l'autor.
  return (
    props.publication.author?.nomUsuari ||
    props.publication.author?.nom ||
    props.publication.nomUsuari ||
    'Usuari'
  )
})
</script>

<style scoped>
/* Targeta base de la publicació */
.profile-publication-card {
  width: 260px;
  min-width: 260px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
}

/* Imatge superior */
.profile-publication-card__image {
  width: 100%;
  height: 155px;
  object-fit: cover;
  display: block;
}

/* Bloc intern amb text i botó */
.profile-publication-card__content {
  padding: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.profile-publication-card__title {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.2;
  color: var(--color-text);
}

/* Autor en format més secundari */
.profile-publication-card__author {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

/* Enllaç a la pàgina de la publicació */
.profile-publication-card__link {
  width: fit-content;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  background: #fff;
}
</style>

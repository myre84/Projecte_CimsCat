<template>
  <!--
    Aquest component ens serveix per reutilitzar el mateix patró de carrusel
    a diferents seccions del perfil. La idea és simple: una fila horitzontal
    amb scroll i dos botons per desplaçar-nos cap a l'esquerra o la dreta.
    El component no sap quin contingut hi ha dins:
    això li arriba des del pare mitjançant slots.
  -->
  <section class="horizontal-carousel">
    <!-- Capçalera de la secció -->
    <div class="horizontal-carousel__header">
      <h2 class="horizontal-carousel__title">{{ title }}</h2>
      <slot name="header-extra" />
    </div>

    <!-- Descripció opcional per afegir context a la secció -->
    <div v-if="description" class="horizontal-carousel__description">
      {{ description }}
    </div>

    <!-- Si hi ha items, mostrem el carrusel real -->
    <div v-if="items.length" class="horizontal-carousel__body">
      <button
        class="horizontal-carousel__arrow"
        type="button"
        aria-label="Desplaçar a l'esquerra"
        @click="scrollByAmount(-1)"
      >
        ←
      </button>

      <!--
        Aquesta és la pista horitzontal que es desplaça.
        A dins hi renderitzem un slot per cada element rebut.
      -->
      <div ref="trackRef" class="horizontal-carousel__track">
        <slot
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          name="item"
          :item="item"
          :index="index"
        />
      </div>

      <button
        class="horizontal-carousel__arrow"
        type="button"
        aria-label="Desplaçar a la dreta"
        @click="scrollByAmount(1)"
      >
        →
      </button>
    </div>

    <!-- Si no hi ha dades, mostrem l'estat buit -->
    <div v-else class="horizontal-carousel__empty">
      {{ emptyText }}
    </div>
  </section>
</template>

<script setup>
// Aquest component només gestiona la part visual i el desplaçament horitzontal.
// El contingut concret de cada targeta ens el passa el pare amb slots.
import { ref } from 'vue'

// Definim les propietats perquè aquest carrusel sigui reutilitzable a diferents seccions.
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: 'No hi ha elements per mostrar en aquesta secció.',
  },
  description: {
    type: String,
    default: '',
  },
})

// Referència al contenidor que es desplaça.
const trackRef = ref(null)

function scrollByAmount(direction) {
  // Fem un scroll aproximat a l'amplada d'una targeta gran per mantenir
  // un comportament simple i fàcil d'entendre.
  if (!trackRef.value) return

  trackRef.value.scrollBy({
    left: direction * 320,
    behavior: 'smooth',
  })
}

function getItemKey(item, index) {
  // Si l'element ja té id, l'aprofitem; si no, fem servir l'índex.
  // Això evita warnings de Vue quan fem v-for.
  return item?.id || item?.peak?.id || item?.publication?.id || index
}
</script>

<style scoped>
/* El component s'organitza en vertical: títol, descripció i contingut */
.horizontal-carousel {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

/* Capçalera de la secció */
.horizontal-carousel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.horizontal-carousel__title {
  margin: 0;
  font-size: 1.85rem;
  color: var(--color-text);
}

/* Text opcional explicatiu */
.horizontal-carousel__description {
  color: var(--color-text-soft);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Cos del carrusel: fletxa esquerra, pista central, fletxa dreta */
.horizontal-carousel__body {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.85rem;
  align-items: center;
}

/* La pista interior real que es desplaça horitzontalment */
.horizontal-carousel__track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 0.35rem;
  scrollbar-width: thin;
}

.horizontal-carousel__track::-webkit-scrollbar {
  height: 8px;
}

.horizontal-carousel__track::-webkit-scrollbar-thumb {
  background: #d7d8cf;
  border-radius: 999px;
}

/* Botons rodons de navegació lateral */
.horizontal-carousel__arrow {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.35rem;
}

/* Estat buit quan no hi ha dades */
.horizontal-carousel__empty {
  padding: 1.15rem 1.25rem;
  border: 1px dashed #d9ddd0;
  border-radius: 14px;
  background: #fbfbf7;
  color: var(--color-text-soft);
}

@media (max-width: 720px) {
  /* En pantalles petites traiem les fletxes i deixem només l'scroll tàctil */
  .horizontal-carousel__body {
    grid-template-columns: 1fr;
  }

  .horizontal-carousel__arrow {
    display: none;
  }
}
</style>

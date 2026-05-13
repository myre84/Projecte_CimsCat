<template>
  <!--
    Banner superior d'estadístiques.
    Mostrem 3 targetes de km:
    - setmana
    - mes
    - any
  -->
  <section class="stats-banner">
    <article v-for="stat in stats" :key="stat.id" class="stats-banner__card">
      <span class="stats-banner__label">{{ stat.label }}</span>
      <strong class="stats-banner__value">{{ stat.value }} km</strong>
    </article>
  </section>
</template>

<script setup>
// "stats" és un array d'objectes amb forma:
// { id, label, value }
// Exemple: { id: 'week', label: 'Km aquesta setmana', value: 12.4 }
defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.stats-banner {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.stats-banner__card {
  border-radius: 14px;
  background: #fffaf1;
  border: 1px solid #ddd8c6;
  padding: 0.95rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stats-banner__label {
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.stats-banner__value {
  color: var(--color-text);
  font-size: 1.5rem;
}

@media (max-width: 760px) {
  .stats-banner {
    grid-template-columns: 1fr;
  }
}
</style>

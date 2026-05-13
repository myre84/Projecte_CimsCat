<template>
  <!--
    Graella d'insígnies del perfil.
    Cada badge pot estar desbloquejada o bloquejada.
    Ho marquem amb classes diferents per donar feedback visual.
  -->
  <section class="badge-grid">
    <article
      v-for="badge in badges"
      :key="badge.id"
      class="badge-grid__item"
      :class="{
        'badge-grid__item--locked': !badge.unlocked,
        'badge-grid__item--unlocked': badge.unlocked,
      }"
      :title="badge.description"
      :style="{
        '--badge-accent': badge.accent || '#5b4b1d',
        '--badge-soft': badge.soft || '#fffaf1',
        '--badge-filter': badge.iconFilter || 'none',
      }"
    >
      <div class="badge-grid__icon">
        <img v-if="badge.image" :src="badge.image" :alt="badge.title" class="badge-grid__image" />
        <span v-else>{{ badge.icon }}</span>
      </div>
      <h3>{{ badge.title }}</h3>
      <p>{{ badge.description }}</p>
    </article>
  </section>
</template>

<script setup>
// Rebem un array de badges ja preparats des del composable.
// Cada element porta, com a mínim:
// - title / description
// - unlocked (true/false)
// - image o icon
// - colors d'accent (accent + soft)
defineProps({
  badges: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.badge-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.badge-grid__item {
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--badge-accent) 24%, #ddd8c6);
  background: linear-gradient(180deg, var(--badge-soft) 0%, #fffdf7 100%);
  padding: 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  text-align: center;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.badge-grid__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--badge-accent) 18%, rgba(0, 0, 0, 0.08));
}

.badge-grid__item--unlocked {
  transform: translateY(-1px) scale(1.01);
  box-shadow:
    0 12px 28px color-mix(in srgb, var(--badge-accent) 16%, rgba(0, 0, 0, 0.08)),
    0 0 0 1px color-mix(in srgb, var(--badge-accent) 14%, transparent);
}

.badge-grid__item--locked {
  opacity: 0.5;
  filter: saturate(0.75);
}

.badge-grid__icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--badge-accent) 14%, #fff7df);
  color: var(--badge-accent);
  font-weight: 700;
  overflow: hidden;
  padding: 0.75rem;
}

.badge-grid__item--unlocked .badge-grid__icon {
  background: color-mix(in srgb, var(--badge-accent) 20%, #fff4d9);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--badge-accent) 12%, transparent);
}

.badge-grid__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: var(--badge-filter);
}

.badge-grid__item--unlocked .badge-grid__image {
  filter: var(--badge-filter) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));
}

.badge-grid__item h3,
.badge-grid__item p {
  margin: 0;
}

.badge-grid__item h3 {
  color: color-mix(in srgb, var(--badge-accent) 45%, var(--color-text));
}

.badge-grid__item p {
  color: var(--color-text-soft);
  font-size: 0.88rem;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .badge-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .badge-grid {
    grid-template-columns: 1fr;
  }
}
</style>

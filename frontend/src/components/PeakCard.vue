<template>
  <article class="peak-card">
    <img :src="publication.imageUrl" :alt="publication.peakName" class="peak-card__image" />

    <div class="peak-card__content">
      <div class="peak-card__top">
        <div>
          <h3 class="peak-card__title">{{ publication.peakName }}</h3>
          <p class="peak-card__meta">{{ publication.elevation }} m</p>
          <p class="peak-card__meta">{{ publication.region }}</p>
        </div>

        <button class="peak-card__like" @click="handleLike">
          {{ isLiked ? '❤' : '♡' }}
        </button>
      </div>

      <p class="peak-card__excerpt">{{ publication.excerpt }}</p>

      <RouterLink :to="`/cim/${publication.peakId}`" class="peak-card__link">
        Veure pagina del cim
      </RouterLink>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const userStore = useUserStore()

const isLiked = ref(false)
const likesCount = ref(props.publication.likes)

function handleLike() {
  if (!userStore.isAuthenticated) {
    router.push('/registre')
    return
  }

  isLiked.value = !isLiked.value
  likesCount.value += isLiked.value ? 1 : -1
}
</script>

<style scoped>
.peak-card {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 1rem;
  padding: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.peak-card__image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
}

.peak-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.peak-card__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.peak-card__title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--color-text);
}

.peak-card__meta {
  margin: 0.15rem 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
}

.peak-card__excerpt {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.95rem;
}

.peak-card__like {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.8rem;
  color: var(--color-text);
}

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

@media (max-width: 640px) {
  .peak-card {
    grid-template-columns: 1fr;
  }

  .peak-card__image {
    height: 180px;
  }
}
</style>

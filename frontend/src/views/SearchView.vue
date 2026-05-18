<template>
  <section class="search-view">
    <header class="search-header">
      <div>
        <p class="search-header__eyebrow">Cerca</p>
        <h1 class="search-header__title">Troba cims</h1>
      </div>
      <p class="search-header__count">{{ filteredPeaks.length }} resultats</p>
    </header>

    <section class="search-panel">
      <label class="search-field search-field--wide">
        <span>Text</span>
        <input
          v-model.trim="filters.search"
          type="search"
          placeholder="Nom, comarca, massis o descripcio"
          @keyup.enter="fetchPeaks"
        />
      </label>

      <label class="search-field">
        <span>Comarca</span>
        <select v-model="filters.comarca">
          <option value="">Totes</option>
          <option v-for="value in filterOptions.comarques" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </label>

      <label class="search-field">
        <span>Dificultat</span>
        <select v-model="filters.dificultat">
          <option value="">Totes</option>
          <option v-for="value in filterOptions.dificultats" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </label>

      <label class="search-field">
        <span>Zona protegida</span>
        <select v-model="filters.zonaProtegida">
          <option value="">Totes</option>
          <option v-for="value in filterOptions.zonesProtegides" :key="value" :value="value">
            {{ value }}
          </option>
        </select>
      </label>

      <label class="search-field">
        <span>Altitud minima</span>
        <input v-model.number="filters.minAlcada" type="number" min="0" step="50" />
      </label>

      <label class="search-field">
        <span>Altitud maxima</span>
        <input v-model.number="filters.maxAlcada" type="number" min="0" step="50" />
      </label>

      <div class="search-panel__actions">
        <button class="search-button search-button--primary" type="button" @click="fetchPeaks">
          Cercar
        </button>
        <button class="search-button" type="button" @click="resetFilters">
          Netejar
        </button>
      </div>
    </section>

    <p v-if="isLoading" class="search-state">Carregant cims...</p>
    <p v-else-if="errorMessage" class="search-state search-state--error">{{ errorMessage }}</p>
    <p v-else-if="!filteredPeaks.length" class="search-state">No hi ha cims amb aquests filtres.</p>

    <section v-else class="search-results">
      <article v-for="peak in filteredPeaks" :key="peak.id" class="search-card">
        <img :src="getPeakImage(peak)" :alt="peak.nom" class="search-card__image" />
        <div class="search-card__content">
          <div>
            <h2 class="search-card__title">{{ peak.nom }}</h2>
            <p class="search-card__meta">
              {{ peak.alcada }} m · {{ peak.comarca }} · {{ peak.dificultat }}
            </p>
            <p class="search-card__meta">{{ peak.massis || 'Massis no informat' }}</p>
          </div>

          <div class="search-card__stats">
            <span>{{ peak.stats?.publicacionsCount ?? 0 }} publicacions</span>
            <span>{{ peak.stats?.savedCount ?? 0 }} guardats</span>
          </div>

          <RouterLink :to="`/cim/${peak.id}`" class="search-card__link">
            Obrir fitxa
          </RouterLink>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../api/axios'
import { resolveMediaUrl } from '../utils/media'

const peaks = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const filters = reactive({
  search: '',
  comarca: '',
  dificultat: '',
  zonaProtegida: '',
  minAlcada: '',
  maxAlcada: '',
})

const filterOptions = computed(() => {
  const comarques = new Set()
  const dificultats = new Set()
  const zonesProtegides = new Set()

  peaks.value.forEach((peak) => {
    if (peak.comarca) comarques.add(peak.comarca)
    if (peak.dificultat) dificultats.add(peak.dificultat)
    if (peak.zonaProtegida) zonesProtegides.add(peak.zonaProtegida)
  })

  return {
    comarques: [...comarques].sort((a, b) => a.localeCompare(b, 'ca')),
    dificultats: [...dificultats].sort((a, b) => a.localeCompare(b, 'ca')),
    zonesProtegides: [...zonesProtegides].sort((a, b) => a.localeCompare(b, 'ca')),
  }
})

const filteredPeaks = computed(() => peaks.value)

function buildParams() {
  const params = {}

  if (filters.search) params.search = filters.search
  if (filters.comarca) params.comarca = filters.comarca
  if (filters.dificultat) params.dificultat = filters.dificultat
  if (filters.zonaProtegida) params.zonaProtegida = filters.zonaProtegida
  if (filters.minAlcada !== '' && filters.minAlcada !== null) params.minAlcada = filters.minAlcada
  if (filters.maxAlcada !== '' && filters.maxAlcada !== null) params.maxAlcada = filters.maxAlcada

  return params
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    'No hem pogut carregar els resultats de cerca.'
  )
}

function getPeakImage(peak) {
  return (
    resolveMediaUrl(peak.imatgeUrl) ||
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80'
  )
}

async function fetchPeaks() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await api.get('/peaks', { params: buildParams() })
    peaks.value = data.peaks || []
  } catch (error) {
    peaks.value = []
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function resetFilters() {
  filters.search = ''
  filters.comarca = ''
  filters.dificultat = ''
  filters.zonaProtegida = ''
  filters.minAlcada = ''
  filters.maxAlcada = ''
  fetchPeaks()
}

onMounted(fetchPeaks)
</script>

<style scoped>
.search-view {
  max-width: 1160px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.search-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-end;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
}

.search-header__eyebrow {
  margin: 0 0 0.3rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.search-header__title {
  margin: 0;
  color: var(--color-text);
  font-size: 2rem;
}

.search-header__count {
  margin: 0;
  color: var(--color-text-soft);
}

.search-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.search-field--wide {
  grid-column: span 3;
}

.search-field span {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.search-field input,
.search-field select {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  background: #fff;
  color: var(--color-text);
  font-size: 0.95rem;
}

.search-panel__actions {
  display: flex;
  gap: 0.75rem;
  align-items: end;
}

.search-button {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 1rem;
  background: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  cursor: pointer;
}

.search-button--primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-color: var(--color-button-primary);
}

.search-state {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  color: var(--color-text-soft);
}

.search-state--error {
  background: #fff4f3;
  color: #9a3e34;
  border-color: #efc9c2;
}

.search-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.search-card {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.85rem;
}

.search-card__image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}

.search-card__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.8rem;
}

.search-card__title {
  margin: 0 0 0.35rem;
  color: var(--color-text);
  font-size: 1.35rem;
}

.search-card__meta {
  margin: 0.2rem 0;
  color: var(--color-text-soft);
}

.search-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-card__stats span {
  border: 1px solid #d6dfd1;
  border-radius: 999px;
  background: #eef2ea;
  color: #31513e;
  padding: 0.3rem 0.65rem;
  font-size: 0.85rem;
}

.search-card__link {
  width: fit-content;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
  background: #fff;
}

@media (max-width: 820px) {
  .search-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-panel {
    grid-template-columns: 1fr;
  }

  .search-field--wide {
    grid-column: auto;
  }

  .search-results {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .search-card {
    grid-template-columns: 1fr;
  }
}
</style>

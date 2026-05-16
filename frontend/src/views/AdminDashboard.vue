<template>
  <section class="admin-dashboard">
    <div v-if="isLoading" class="admin-feedback">
      Carregant dades reals del panell d&apos;administracio...
    </div>

    <div v-else-if="errorMessage" class="admin-feedback admin-feedback--error">
      {{ errorMessage }}
    </div>

    <header class="admin-dashboard__header">
      <div>
        <p class="admin-dashboard__eyebrow">Panell d'administracio</p>
        <h1>Gestio de plataforma</h1>
        <p class="admin-dashboard__lead">
          Des d'aqui pots revisar el cataleg real de cims i connectar la gestio admin que ja
          existeix al backend.
        </p>
      </div>

      <div class="admin-dashboard__summary">
        <span class="admin-dashboard__badge">Rol actual: {{ userStore.user?.rol || 'usuari' }}</span>
        <span class="admin-dashboard__badge">Cims visibles: {{ peaks.length }}</span>
      </div>
    </header>

    <section class="admin-section">
      <div class="admin-section__title-row">
        <div>
          <p class="admin-section__eyebrow">Gestio de cims</p>
          <h2>Llistat actual</h2>
        </div>
        <button class="admin-button admin-button--primary admin-button--clickable" type="button" @click="openCreateModal">
          Crear nou cim
        </button>
      </div>

      <p class="admin-section__note">
        La part de cims ja es connecta a backend per llistar, crear i editar. L&apos;eliminacio encara
        queda pendent perque no hi ha endpoint `DELETE /peaks/:id`.
      </p>

      <label class="admin-search">
        <span>Cercar cims</span>
        <input
          v-model.trim="peakSearchQuery"
          type="text"
          placeholder="Nom, comarca o massis..."
        />
      </label>

      <p class="admin-section__note admin-section__note--small">
        Resultats: {{ filteredPeaks.length }} de {{ peaks.length }} cims
      </p>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cim</th>
              <th>Altitud</th>
              <th>Zona</th>
              <th>Guardats</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="peak in filteredPeaks" :key="peak.id">
              <td>{{ peak.nom }}</td>
              <td>{{ peak.alcada }} m</td>
              <td>{{ peak.comarca }}</td>
              <td>{{ peak.stats?.savedCount ?? 0 }}</td>
              <td class="admin-table__actions">
                <button class="admin-button admin-button--clickable" type="button" @click="openEditModal(peak)">
                  Editar
                </button>
                <button class="admin-button admin-button--danger" disabled>Eliminar</button>
              </td>
            </tr>
            <tr v-if="!filteredPeaks.length">
              <td colspan="5" class="admin-table__empty">
                No hi ha cims que coincideixin amb la cerca actual.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-section">
      <div class="admin-section__title-row">
        <div>
          <p class="admin-section__eyebrow">Moderacio</p>
          <h2>Moderacio (preparat per backend)</h2>
        </div>
      </div>

      <p class="admin-section__note">
        Aquest cercador de moderacio ja deixa preparada la UX. Quan backend publiqui l endpoint
        global, nomes caldra canviar la font de dades.
      </p>

      <label class="admin-search">
        <span>Cerca global moderacio</span>
        <input
          v-model.trim="moderationSearchQuery"
          type="text"
          placeholder="Usuari, publicacio, comentari o paraula..."
        />
      </label>

      <p class="admin-section__note admin-section__note--small">
        Blocs visibles: {{ filteredModerationSections.length }} de {{ moderationSections.length }}
      </p>

      <div class="moderation-grid">
        <article
          v-for="section in filteredModerationSections"
          :key="section.title"
          class="moderation-card"
        >
          <h3>{{ section.title }}</h3>
          <p>{{ section.description }}</p>
          <button class="admin-button admin-button--danger" disabled>
            {{ section.action }}
          </button>
          <span class="moderation-card__status">{{ section.status }}</span>
        </article>
      </div>

      <p v-if="!filteredModerationSections.length" class="admin-empty">
        No hi ha blocs de moderacio que coincideixin amb aquesta cerca.
      </p>
    </section>

    <AdminPeakModal
      v-if="isPeakModalOpen"
      :mode="peakModalMode"
      :initial-peak="editingPeak"
      :loading="isSavingPeak"
      @close="closePeakModal"
      @submit="handlePeakSubmit"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../api/axios'
import AdminPeakModal from '../components/AdminPeakModal.vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const peaks = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const isPeakModalOpen = ref(false)
const peakModalMode = ref('create')
const editingPeak = ref(null)
const isSavingPeak = ref(false)
const peakSearchQuery = ref('')
const moderationSearchQuery = ref('')

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.response?.data?.error?.message || fallbackMessage
}

async function fetchPeaks() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data } = await api.get('/peaks')
    peaks.value = data.peaks || []
  } catch (error) {
    peaks.value = []
    errorMessage.value = getApiErrorMessage(error, 'No hem pogut carregar el cataleg de cims.')
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  peakModalMode.value = 'create'
  editingPeak.value = null
  isPeakModalOpen.value = true
}

function openEditModal(peak) {
  peakModalMode.value = 'edit'
  editingPeak.value = peak
  isPeakModalOpen.value = true
}

function closePeakModal() {
  isPeakModalOpen.value = false
  editingPeak.value = null
}

async function uploadPeakImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post('/uploads/peaks', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data.file.url
}

async function handlePeakSubmit({ form, file }) {
  isSavingPeak.value = true

  try {
    const finalImageUrl = file ? await uploadPeakImage(file) : form.imatgeUrl
    const payload = {
      ...form,
      imatgeUrl: finalImageUrl,
      zonaProtegida: form.zonaProtegida || undefined,
    }

    if (peakModalMode.value === 'create') {
      await api.post('/peaks', payload)
    } else {
      await api.put(`/peaks/${editingPeak.value.id}`, payload)
    }

    closePeakModal()
    await fetchPeaks()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut guardar el cim.'))
  } finally {
    isSavingPeak.value = false
  }
}

const moderationSections = [
  {
    title: 'Publicacions',
    description: 'La moderacio admin global de publicacions segueix pendent: el DELETE de publicacions es owner-only.',
    action: 'Eliminar publicacio',
    status: 'Pendent de backend admin',
  },
  {
    title: 'Comentaris',
    description: 'L eliminacio de comentaris ja existeix per owner de la publicacio i admin, pero falta un endpoint admin de llistat global per moderar en bloc.',
    action: 'Eliminar comentari',
    status: 'Pendent de backend admin',
  },
  {
    title: 'Usuaris',
    description: 'La gestio administrativa d usuaris encara no te endpoint de moderacio o eliminacio.',
    action: 'Eliminar perfil',
    status: 'Pendent de backend admin',
  },
]

const filteredPeaks = computed(() => {
  const query = peakSearchQuery.value.toLowerCase()
  if (!query) return peaks.value

  return peaks.value.filter((peak) => {
    const name = String(peak.nom || '').toLowerCase()
    const comarca = String(peak.comarca || '').toLowerCase()
    const massis = String(peak.massis || '').toLowerCase()
    return name.includes(query) || comarca.includes(query) || massis.includes(query)
  })
})

const filteredModerationSections = computed(() => {
  const query = moderationSearchQuery.value.toLowerCase()
  if (!query) return moderationSections

  return moderationSections.filter((section) => {
    return (
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.action.toLowerCase().includes(query) ||
      section.status.toLowerCase().includes(query)
    )
  })
})

onMounted(fetchPeaks)
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-feedback {
  background: #f4f1e6;
  border: 1px solid #d8d2bc;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  color: var(--color-text-soft);
}

.admin-feedback--error {
  background: #fff4f3;
  border-color: #efc9c2;
  color: #9a3e34;
}

.admin-dashboard__header,
.admin-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
}

.admin-dashboard__header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.admin-dashboard__header h1,
.admin-section h2,
.moderation-card h3 {
  margin: 0;
  color: var(--color-text);
}

.admin-dashboard__eyebrow,
.admin-section__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.admin-dashboard__lead,
.admin-section__note,
.moderation-card p {
  margin: 0.75rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.5;
}

.admin-section__note--small {
  margin-top: 0.55rem;
  font-size: 0.9rem;
}

.admin-dashboard__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.admin-dashboard__badge,
.moderation-card__status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #eef2ea;
  color: #31513e;
  padding: 0.4rem 0.8rem;
  font-size: 0.88rem;
  border: 1px solid #d6dfd1;
}

.admin-section__title-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-search {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
}

.admin-search span {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.admin-search input {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  font-size: 0.98rem;
  background: #fff;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.admin-table th,
.admin-table td {
  padding: 0.95rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  color: var(--color-text);
}

.admin-table th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-soft);
}

.admin-table__empty {
  color: var(--color-text-soft);
  text-align: center;
}

.admin-table__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.admin-button {
  border: 1px solid var(--color-border);
  background: #f4f4ef;
  color: var(--color-text);
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
  cursor: not-allowed;
  font-size: 0.9rem;
}

.admin-button--clickable {
  cursor: pointer;
}

.admin-button--primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: none;
}

.admin-button--danger {
  background: #fff1ef;
  color: #9a3e34;
  border-color: #efc9c2;
}

.moderation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.moderation-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: #faf9f5;
}

.admin-empty {
  margin: 1rem 0 0;
  color: var(--color-text-soft);
}

@media (max-width: 900px) {
  .admin-dashboard__header,
  .admin-section__title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-dashboard__summary {
    justify-content: flex-start;
  }

  .moderation-grid {
    grid-template-columns: 1fr;
  }
}
</style>

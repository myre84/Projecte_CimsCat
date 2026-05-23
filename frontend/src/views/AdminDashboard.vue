<template>
  <section class="admin-dashboard">
    <div v-if="isLoading" class="admin-feedback">
      Carregant dades reals del panell d&apos;administració...
    </div>

    <div v-else-if="errorMessage" class="admin-feedback admin-feedback--error">
      {{ errorMessage }}
    </div>

    <header class="admin-dashboard__header">
      <div>
        <p class="admin-dashboard__eyebrow">Panell d'administració</p>
        <h1>Gestio de plataforma</h1>
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
                <button
                  class="admin-button admin-button--danger admin-button--clickable"
                  type="button"
                  @click="handlePeakDelete(peak)"
                >
                  Eliminar
                </button>
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
          <h2>Moderacio</h2>
        </div>
      </div>

      <label class="admin-search">
        <span>Cerca global de moderació</span>
        <input
          v-model.trim="moderationSearchQuery"
          type="text"
          placeholder="Usuari, publicació, comentari o paraula..."
        />
      </label>

      <p class="admin-section__note admin-section__note--small">
        Comentaris: {{ adminComments.length }} · Publicacions: {{ adminPublicacions.length }} · Usuaris: {{ adminUsers.length }}
      </p>

      <div v-if="isLoadingModeration" class="admin-feedback">Carregant moderació...</div>
      <div v-else-if="moderationError" class="admin-feedback admin-feedback--error">{{ moderationError }}</div>
      <div v-else class="moderation-live">
        <div class="moderation-live__block">
          <h3>Comentaris</h3>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Usuari</th>
                  <th>Publicacio</th>
                  <th>Text</th>
                  <th>Accio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="comment in adminComments" :key="comment.id">
                  <td>{{ comment.author?.nomUsuari || '-' }}</td>
                  <td>{{ comment.publication?.titol || '-' }}</td>
                  <td>{{ comment.text }}</td>
                  <td>
                    <button
                      class="admin-button admin-button--danger admin-button--clickable"
                      type="button"
                      @click="handleCommentDelete(comment)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="!adminComments.length">
                  <td colspan="4" class="admin-table__empty">No hi ha comentaris per aquest filtre.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="moderation-live__block">
          <h3>Publicacions</h3>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Titol</th>
                  <th>Usuari</th>
                  <th>Cim</th>
                  <th>Accio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="publication in adminPublicacions" :key="publication.id">
                  <td>{{ publication.titol }}</td>
                  <td>{{ publication.author?.nomUsuari || '-' }}</td>
                  <td>{{ publication.peak?.nom || '-' }}</td>
                  <td>
                    <button
                      class="admin-button admin-button--danger admin-button--clickable"
                      type="button"
                      @click="handlePublicationDelete(publication)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="!adminPublicacions.length">
                  <td colspan="4" class="admin-table__empty">No hi ha publicacions per aquest filtre.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="moderation-live__block">
          <h3>Usuaris</h3>
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Usuari</th>
                  <th>Mail</th>
                  <th>Rol</th>
                  <th>Accions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="targetUser in adminUsers" :key="targetUser.id">
                  <td>{{ targetUser.nomUsuari }}</td>
                  <td>{{ targetUser.mail }}</td>
                  <td>{{ targetUser.rol }}</td>
                  <td class="admin-table__actions">
                    <button
                      class="admin-button admin-button--clickable"
                      type="button"
                      @click="toggleUserRole(targetUser)"
                    >
                      Rol {{ targetUser.rol === 'admin' ? 'usuari' : 'admin' }}
                    </button>
                    <button
                      class="admin-button admin-button--danger admin-button--clickable"
                      type="button"
                      @click="handleUserDelete(targetUser)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="!adminUsers.length">
                  <td colspan="4" class="admin-table__empty">No hi ha usuaris per aquest filtre.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
import { computed, onMounted, ref, watch } from 'vue'
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
const isLoadingModeration = ref(false)
const moderationError = ref('')
const adminComments = ref([])
const adminPublicacions = ref([])
const adminUsers = ref([])

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
    errorMessage.value = getApiErrorMessage(error, 'No hem pogut carregar el catàleg de cims.')
  } finally {
    isLoading.value = false
  }
}

async function fetchModerationData() {
  isLoadingModeration.value = true
  moderationError.value = ''

  try {
    const query = moderationSearchQuery.value
    const [commentsRes, publicationsRes, usersRes] = await Promise.all([
      api.get('/admin/comments', { params: { q: query || undefined } }),
      api.get('/admin/publicacions', { params: { q: query || undefined } }),
      api.get('/admin/users', { params: { q: query || undefined } }),
    ])

    adminComments.value = commentsRes.data.comments || []
    adminPublicacions.value = publicationsRes.data.publicacions || []
    adminUsers.value = usersRes.data.users || []
  } catch (error) {
    adminComments.value = []
    adminPublicacions.value = []
    adminUsers.value = []
    moderationError.value = getApiErrorMessage(error, 'No hem pogut carregar la moderació del panell.')
  } finally {
    isLoadingModeration.value = false
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

async function handlePeakDelete(peak) {
  if (!window.confirm(`Vols eliminar el cim "${peak.nom}"?`)) return

  try {
    await api.delete(`/peaks/${peak.id}`)
    await fetchPeaks()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut eliminar el cim.'))
  }
}

async function handleCommentDelete(comment) {
  if (!window.confirm('Vols eliminar aquest comentari?')) return

  try {
    await api.delete(`/comments/${comment.id}`)
    await fetchModerationData()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut eliminar el comentari.'))
  }
}

async function handlePublicationDelete(publication) {
  if (!window.confirm(`Vols eliminar la publicació "${publication.titol}"?`)) return

  try {
    await api.delete(`/admin/publicacions/${publication.id}`)
    await fetchModerationData()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut eliminar la publicació.'))
  }
}

async function toggleUserRole(targetUser) {
  const nextRole = targetUser.rol === 'admin' ? 'usuari' : 'admin'
  if (!window.confirm(`Vols canviar el rol de ${targetUser.nomUsuari} a ${nextRole}?`)) return

  try {
    await api.patch(`/admin/users/${targetUser.id}`, { rol: nextRole })
    await fetchModerationData()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut canviar el rol.'))
  }
}

async function handleUserDelete(targetUser) {
  if (!window.confirm(`Vols eliminar l'usuari ${targetUser.nomUsuari}?`)) return

  try {
    await api.delete(`/admin/users/${targetUser.id}`)
    await fetchModerationData()
  } catch (error) {
    window.alert(getApiErrorMessage(error, 'No hem pogut eliminar l usuari.'))
  }
}

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

watch(moderationSearchQuery, () => {
  fetchModerationData()
})

onMounted(async () => {
  await Promise.all([fetchPeaks(), fetchModerationData()])
})
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

.moderation-live {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.moderation-live__block {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1rem;
  background: #faf9f5;
}

.moderation-live__block h3 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
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

  .moderation-live__block {
    padding: 0.8rem;
  }
}
</style>

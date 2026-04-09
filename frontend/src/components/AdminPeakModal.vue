<template>
  <div class="admin-peak-modal__backdrop" @click.self="$emit('close')">
    <div class="admin-peak-modal">
      <header class="admin-peak-modal__header">
        <div>
          <p class="admin-peak-modal__eyebrow">Gestio de cims</p>
          <h2>{{ mode === 'create' ? 'Crear nou cim' : 'Editar cim' }}</h2>
        </div>
        <button type="button" class="admin-peak-modal__close" @click="$emit('close')">✕</button>
      </header>

      <form class="admin-peak-modal__form" @submit.prevent="handleSubmit">
        <div class="admin-peak-modal__grid">
          <label class="admin-peak-modal__field">
            <span>Nom</span>
            <input v-model.trim="form.nom" type="text" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Comarca</span>
            <input v-model.trim="form.comarca" type="text" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Massís</span>
            <input v-model.trim="form.massis" type="text" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Dificultat</span>
            <input v-model.trim="form.dificultat" type="text" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Altitud</span>
            <input v-model.number="form.alcada" type="number" min="0" step="1" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Latitud</span>
            <input v-model.number="form.lat" type="number" step="0.000001" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Longitud</span>
            <input v-model.number="form.lon" type="number" step="0.000001" />
          </label>

          <label class="admin-peak-modal__field">
            <span>Zona protegida</span>
            <input v-model.trim="form.zonaProtegida" type="text" placeholder="Opcional" />
          </label>
        </div>

        <label class="admin-peak-modal__field admin-peak-modal__field--full">
          <span>Descripcio</span>
          <textarea v-model.trim="form.descripcio" rows="5" />
        </label>

        <div class="admin-peak-modal__upload">
          <div class="admin-peak-modal__upload-copy">
            <span>Imatge del cim</span>
            <small>Pots pujar una imatge nova o mantenir la ruta actual.</small>
          </div>

          <div class="admin-peak-modal__upload-actions">
            <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
            <input
              v-model.trim="form.imatgeUrl"
              type="text"
              placeholder="/uploads/peaks/nom-fitxer.jpg"
            />
          </div>
        </div>

        <div v-if="previewImage" class="admin-peak-modal__preview">
          <img :src="previewImage" :alt="form.nom || 'Previsualitzacio del cim'" />
        </div>

        <p v-if="errorMessage" class="admin-peak-modal__error">{{ errorMessage }}</p>

        <footer class="admin-peak-modal__footer">
          <button type="button" class="admin-peak-modal__button" @click="$emit('close')">
            Cancel·lar
          </button>
          <button type="submit" class="admin-peak-modal__button admin-peak-modal__button--primary" :disabled="loading">
            {{ loading ? 'Guardant...' : mode === 'create' ? 'Crear cim' : 'Guardar canvis' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { resolveMediaUrl } from '../utils/media'

const props = defineProps({
  mode: {
    type: String,
    default: 'create',
  },
  initialPeak: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

const fileInput = ref(null)
const selectedFile = ref(null)
const errorMessage = ref('')

const form = reactive({
  nom: '',
  comarca: '',
  massis: '',
  dificultat: '',
  alcada: '',
  lat: '',
  lon: '',
  descripcio: '',
  imatgeUrl: '',
  zonaProtegida: '',
})

const previewImage = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value)
  }

  return resolveMediaUrl(form.imatgeUrl)
})

function fillForm(peak) {
  form.nom = peak?.nom || ''
  form.comarca = peak?.comarca || ''
  form.massis = peak?.massis || ''
  form.dificultat = peak?.dificultat || ''
  form.alcada = peak?.alcada ?? ''
  form.lat = peak?.lat ?? ''
  form.lon = peak?.lon ?? ''
  form.descripcio = peak?.descripcio || ''
  form.imatgeUrl = peak?.imatgeUrl || ''
  form.zonaProtegida = peak?.zonaProtegida || ''
  selectedFile.value = null
  errorMessage.value = ''
}

function validateForm() {
  errorMessage.value = ''

  const requiredTextFields = [
    ['nom', form.nom],
    ['comarca', form.comarca],
    ['massis', form.massis],
    ['dificultat', form.dificultat],
    ['descripcio', form.descripcio],
  ]

  const missingTextField = requiredTextFields.find(([, value]) => !String(value).trim())
  if (missingTextField) {
    errorMessage.value = `El camp ${missingTextField[0]} es obligatori.`
    return false
  }

  const requiredNumbers = [
    ['alcada', form.alcada],
    ['lat', form.lat],
    ['lon', form.lon],
  ]

  const invalidNumberField = requiredNumbers.find(([, value]) => !Number.isFinite(Number(value)))
  if (invalidNumberField) {
    errorMessage.value = `El camp ${invalidNumberField[0]} ha de ser numeric.`
    return false
  }

  if (!selectedFile.value && !form.imatgeUrl.trim()) {
    errorMessage.value = "Cal indicar una imatge o pujar-ne una."
    return false
  }

  return true
}

function handleFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null
  errorMessage.value = ''
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    form: {
      nom: form.nom.trim(),
      comarca: form.comarca.trim(),
      massis: form.massis.trim(),
      dificultat: form.dificultat.trim(),
      alcada: Number(form.alcada),
      lat: Number(form.lat),
      lon: Number(form.lon),
      descripcio: form.descripcio.trim(),
      imatgeUrl: form.imatgeUrl.trim(),
      zonaProtegida: form.zonaProtegida.trim(),
    },
    file: selectedFile.value,
  })
}

watch(
  () => props.initialPeak,
  (peak) => {
    fillForm(peak)
  },
  { immediate: true },
)
</script>

<style scoped>
.admin-peak-modal__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(22, 24, 20, 0.52);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 120;
}

.admin-peak-modal {
  width: min(100%, 880px);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: #fff;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 1.4rem;
}

.admin-peak-modal__header,
.admin-peak-modal__footer,
.admin-peak-modal__upload {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.admin-peak-modal__header h2 {
  margin: 0.2rem 0 0;
}

.admin-peak-modal__eyebrow {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.admin-peak-modal__close {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
}

.admin-peak-modal__form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-peak-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.admin-peak-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.admin-peak-modal__field--full {
  width: 100%;
}

.admin-peak-modal__field input,
.admin-peak-modal__field textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  font: inherit;
  background: #fff;
}

.admin-peak-modal__upload {
  padding: 1rem;
  border-radius: 14px;
  background: #f7f6f1;
  border: 1px solid var(--color-border);
  align-items: flex-start;
}

.admin-peak-modal__upload-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admin-peak-modal__upload-actions {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: min(100%, 320px);
}

.admin-peak-modal__upload-actions input[type='file'] {
  font: inherit;
}

.admin-peak-modal__preview img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.admin-peak-modal__error {
  margin: 0;
  color: #9a3e34;
}

.admin-peak-modal__footer {
  justify-content: flex-end;
}

.admin-peak-modal__button {
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: #fff;
  padding: 0.75rem 1rem;
  font: inherit;
  cursor: pointer;
}

.admin-peak-modal__button--primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border-color: var(--color-button-primary);
}

@media (max-width: 700px) {
  .admin-peak-modal__grid {
    grid-template-columns: 1fr;
  }

  .admin-peak-modal__upload,
  .admin-peak-modal__header,
  .admin-peak-modal__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

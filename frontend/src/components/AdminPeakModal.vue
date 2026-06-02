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
        <div class="admin-peak-modal__body">
          <div class="admin-peak-modal__content">
            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading">
                <p>Dades bàsiques</p>
                <small>Informació principal que es mostrarà a la fitxa pública del cim.</small>
              </div>

              <div class="admin-peak-modal__grid">
                <label class="admin-peak-modal__field">
                  <span>Nom</span>
                  <input v-model.trim="form.nom" type="text" placeholder="Aneto" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Comarca o zona</span>
                  <input v-model.trim="form.comarca" type="text" placeholder="Vall de Benasc" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Massís</span>
                  <input v-model.trim="form.massis" type="text" placeholder="Posets-Aneto" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Dificultat</span>
                  <input v-model.trim="form.dificultat" type="text" placeholder="alta" />
                </label>
              </div>
            </section>

            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading">
                <p>Localització</p>
                <small>Les coordenades accepten punt o coma decimal.</small>
              </div>

              <div class="admin-peak-modal__grid admin-peak-modal__grid--three">
                <label class="admin-peak-modal__field">
                  <span>Altitud</span>
                  <input v-model="form.alcada" inputmode="numeric" type="text" placeholder="3404" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Latitud</span>
                  <input v-model.trim="form.lat" inputmode="decimal" type="text" placeholder="42.6311" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Longitud</span>
                  <input v-model.trim="form.lon" inputmode="decimal" type="text" placeholder="0.6566" />
                </label>
              </div>

              <label class="admin-peak-modal__field admin-peak-modal__field--full">
                <span>Zona protegida</span>
                <input
                  v-model.trim="form.zonaProtegida"
                  type="text"
                  placeholder="Parc Natural Posets-Maladeta"
                />
              </label>
            </section>

            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading">
                <p>Accessos principals</p>
                <small>Dades oficials que es mostren a la fitxa pública del cim.</small>
              </div>

              <div class="admin-peak-modal__grid">
                <label class="admin-peak-modal__field">
                  <span>Situació administrativa</span>
                  <input v-model.trim="form.situacioAdministrativa" type="text" placeholder="Pallars Sobirà, límit amb França" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Accés principal</span>
                  <input v-model.trim="form.accesPrincipal" type="text" placeholder="Vall Ferrera" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Punt de partida</span>
                  <input v-model.trim="form.puntPartida" type="text" placeholder="Refugi de Vallferrera" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Temps habitual</span>
                  <input v-model.trim="form.tempsHabitual" type="text" placeholder="7 - 9 hores" />
                </label>
              </div>

              <label class="admin-peak-modal__field admin-peak-modal__field--full">
                <span>Ruta habitual</span>
                <input
                  v-model.trim="form.rutaHabitual"
                  type="text"
                  placeholder="Refugi de Vallferrera → Estany de Sotllo → Coll de Sotllo → Pica d'Estats"
                />
              </label>

              <div class="admin-peak-modal__grid">
                <label class="admin-peak-modal__field">
                  <span>Distància habitual (km)</span>
                  <input v-model.trim="form.distanciaHabitualKm" inputmode="decimal" type="text" placeholder="16" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Desnivell habitual (m)</span>
                  <input v-model.trim="form.desnivellHabitualM" inputmode="numeric" type="text" placeholder="1200" />
                </label>
              </div>
            </section>

            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading">
                <p>Característiques tècniques</p>
                <small>Informació de muntanya que completa la fitxa del cim.</small>
              </div>

              <div class="admin-peak-modal__grid">
                <label class="admin-peak-modal__field">
                  <span>Orientació</span>
                  <input v-model.trim="form.orientacio" type="text" placeholder="Sud / Nord" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Tipus de terreny</span>
                  <input v-model.trim="form.tipusTerreny" type="text" placeholder="Tarteres, blocs de granit i colls rocosos" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Punt clau</span>
                  <input v-model.trim="form.puntClau" type="text" placeholder="Coll de Sotllo" />
                </label>

                <label class="admin-peak-modal__field">
                  <span>Grau d'exposició</span>
                  <input v-model.trim="form.grauExposicio" type="text" placeholder="Mitjà" />
                </label>
              </div>
            </section>

            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading">
                <p>Descripció de la fitxa</p>
                <small>Text públic del cim. Es pot deixar breu i professional.</small>
              </div>

              <label class="admin-peak-modal__field admin-peak-modal__field--full">
                <span>Descripció</span>
                <textarea
                  v-model.trim="form.descripcio"
                  rows="6"
                  placeholder="L'Aneto és el cim més alt dels Pirineus i una de les ascensions més emblemàtiques de l'alta muntanya pirinenca."
                />
              </label>
            </section>

            <section class="admin-peak-modal__section">
              <div class="admin-peak-modal__section-heading admin-peak-modal__section-heading--row">
                <div>
                  <p>Refugis i punts d'interès</p>
                  <small>Es guardaran a la base de dades i es mostraran a la fitxa pública.</small>
                </div>
                <button type="button" class="admin-peak-modal__button" @click="addPoint">
                  Afegir punt
                </button>
              </div>

              <div v-if="form.pointsOfInterest.length" class="admin-peak-modal__points">
                <div
                  v-for="(point, index) in form.pointsOfInterest"
                  :key="point.localId"
                  class="admin-peak-modal__point"
                >
                  <div class="admin-peak-modal__grid admin-peak-modal__grid--three">
                    <label class="admin-peak-modal__field">
                      <span>Tipus</span>
                      <select v-model="point.tipus">
                        <option value="refugi">Refugi</option>
                        <option value="estany">Estany</option>
                        <option value="coll">Coll</option>
                        <option value="punt_partida">Punt de partida</option>
                        <option value="punt_interes">Punt d'interès</option>
                      </select>
                    </label>

                    <label class="admin-peak-modal__field">
                      <span>Nom</span>
                      <input v-model.trim="point.nom" type="text" placeholder="Refugi de Vallferrera" />
                    </label>

                    <label class="admin-peak-modal__field">
                      <span>Altitud</span>
                      <input v-model.trim="point.altitud" inputmode="numeric" type="text" placeholder="1940" />
                    </label>
                  </div>

                  <label class="admin-peak-modal__field admin-peak-modal__field--full">
                    <span>Descripció</span>
                    <input v-model.trim="point.descripcio" type="text" placeholder="Punt de sortida principal" />
                  </label>

                  <div class="admin-peak-modal__grid admin-peak-modal__grid--three">
                    <label class="admin-peak-modal__field">
                      <span>Latitud</span>
                      <input v-model.trim="point.lat" inputmode="decimal" type="text" placeholder="Opcional" />
                    </label>

                    <label class="admin-peak-modal__field">
                      <span>Longitud</span>
                      <input v-model.trim="point.lon" inputmode="decimal" type="text" placeholder="Opcional" />
                    </label>

                    <button type="button" class="admin-peak-modal__button admin-peak-modal__button--danger" @click="removePoint(index)">
                      Eliminar punt
                    </button>
                  </div>
                </div>
              </div>

              <p v-else class="admin-peak-modal__empty">Encara no hi ha punts d'interès per aquest cim.</p>
            </section>
          </div>

          <aside class="admin-peak-modal__media-panel">
            <div class="admin-peak-modal__media-copy">
              <p>Imatge del cim</p>
              <small>Puja una imatge nova o mantén la ruta actual.</small>
            </div>

            <div v-if="previewImage" class="admin-peak-modal__preview">
              <img :src="previewImage" :alt="form.nom || 'Previsualitzacio del cim'" />
            </div>
            <div v-else class="admin-peak-modal__preview admin-peak-modal__preview--empty">
              Sense imatge seleccionada
            </div>

            <div class="admin-peak-modal__upload-actions">
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
              <input
                v-model.trim="form.imatgeUrl"
                type="text"
                placeholder="/uploads/peaks/aneto.jpg"
              />
            </div>
          </aside>
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
  situacioAdministrativa: '',
  accesPrincipal: '',
  puntPartida: '',
  rutaHabitual: '',
  distanciaHabitualKm: '',
  desnivellHabitualM: '',
  tempsHabitual: '',
  orientacio: '',
  tipusTerreny: '',
  puntClau: '',
  grauExposicio: '',
  pointsOfInterest: [],
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
  form.situacioAdministrativa = peak?.situacioAdministrativa || ''
  form.accesPrincipal = peak?.accesPrincipal || ''
  form.puntPartida = peak?.puntPartida || ''
  form.rutaHabitual = peak?.rutaHabitual || ''
  form.distanciaHabitualKm = peak?.distanciaHabitualKm ?? ''
  form.desnivellHabitualM = peak?.desnivellHabitualM ?? ''
  form.tempsHabitual = peak?.tempsHabitual || ''
  form.orientacio = peak?.orientacio || ''
  form.tipusTerreny = peak?.tipusTerreny || ''
  form.puntClau = peak?.puntClau || ''
  form.grauExposicio = peak?.grauExposicio || ''
  form.pointsOfInterest = normalizePoints(peak?.pointsOfInterest || [])
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
    ['alcada', parseLocaleNumber(form.alcada)],
    ['lat', parseLocaleNumber(form.lat)],
    ['lon', parseLocaleNumber(form.lon)],
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

  const optionalNumbers = [
    ['distanciaHabitualKm', form.distanciaHabitualKm],
    ['desnivellHabitualM', form.desnivellHabitualM],
  ]

  const invalidOptionalNumber = optionalNumbers.find(([, value]) => {
    if (String(value ?? '').trim() === '') return false
    return !Number.isFinite(parseLocaleNumber(value))
  })

  if (invalidOptionalNumber) {
    errorMessage.value = `El camp ${invalidOptionalNumber[0]} ha de ser numeric.`
    return false
  }

  const invalidPoint = form.pointsOfInterest.find((point) => {
    if (!point.tipus || !point.nom.trim()) return true
    const numericFields = [point.altitud, point.lat, point.lon]
    return numericFields.some((value) => String(value ?? '').trim() !== '' && !Number.isFinite(parseLocaleNumber(value)))
  })

  if (invalidPoint) {
    errorMessage.value = "Revisa els punts d'interès: tipus, nom i camps numèrics."
    return false
  }

  return true
}

function parseLocaleNumber(value) {
  if (typeof value === 'number') return value
  const normalized = String(value || '').trim().replace(',', '.')
  return Number(normalized)
}

function handleFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null
  errorMessage.value = ''
}

function normalizePoints(points) {
  return points.map((point, index) => ({
    localId: point.id || `point-${Date.now()}-${index}`,
    tipus: point.tipus || 'punt_interes',
    nom: point.nom || '',
    descripcio: point.descripcio || '',
    lat: point.lat ?? '',
    lon: point.lon ?? '',
    altitud: point.altitud ?? '',
  }))
}

function addPoint() {
  form.pointsOfInterest.push({
    localId: `point-${Date.now()}-${form.pointsOfInterest.length}`,
    tipus: 'punt_interes',
    nom: '',
    descripcio: '',
    lat: '',
    lon: '',
    altitud: '',
  })
}

function removePoint(index) {
  form.pointsOfInterest.splice(index, 1)
}

function optionalText(value) {
  return String(value || '').trim() || null
}

function optionalNumber(value) {
  if (String(value ?? '').trim() === '') return null
  return parseLocaleNumber(value)
}

function handleSubmit() {
  if (!validateForm()) return

  emit('submit', {
    form: {
      nom: form.nom.trim(),
      comarca: form.comarca.trim(),
      massis: form.massis.trim(),
      dificultat: form.dificultat.trim(),
      alcada: parseLocaleNumber(form.alcada),
      lat: parseLocaleNumber(form.lat),
      lon: parseLocaleNumber(form.lon),
      descripcio: form.descripcio.trim(),
      imatgeUrl: form.imatgeUrl.trim(),
      zonaProtegida: optionalText(form.zonaProtegida),
      situacioAdministrativa: optionalText(form.situacioAdministrativa),
      accesPrincipal: optionalText(form.accesPrincipal),
      puntPartida: optionalText(form.puntPartida),
      rutaHabitual: optionalText(form.rutaHabitual),
      distanciaHabitualKm: optionalNumber(form.distanciaHabitualKm),
      desnivellHabitualM: optionalNumber(form.desnivellHabitualM),
      tempsHabitual: optionalText(form.tempsHabitual),
      orientacio: optionalText(form.orientacio),
      tipusTerreny: optionalText(form.tipusTerreny),
      puntClau: optionalText(form.puntClau),
      grauExposicio: optionalText(form.grauExposicio),
    },
    file: selectedFile.value,
    pointsOfInterest: form.pointsOfInterest.map((point) => ({
      tipus: point.tipus,
      nom: point.nom.trim(),
      descripcio: optionalText(point.descripcio),
      lat: optionalNumber(point.lat),
      lon: optionalNumber(point.lon),
      altitud: optionalNumber(point.altitud),
    })),
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
  width: min(100%, 1080px);
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
  gap: 1.15rem;
}

.admin-peak-modal__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 1.25rem;
  align-items: start;
}

.admin-peak-modal__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-peak-modal__section,
.admin-peak-modal__media-panel {
  border: 1px solid #d4d4ce;
  border-radius: 14px;
  background: #fff;
  padding: 1rem;
}

.admin-peak-modal__section-heading,
.admin-peak-modal__media-copy {
  margin-bottom: 0.85rem;
}

.admin-peak-modal__section-heading--row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.admin-peak-modal__section-heading p,
.admin-peak-modal__media-copy p {
  margin: 0;
  font-weight: 700;
  color: var(--color-text);
}

.admin-peak-modal__section-heading small,
.admin-peak-modal__media-copy small {
  display: block;
  margin-top: 0.25rem;
  color: var(--color-text-soft);
  line-height: 1.4;
}

.admin-peak-modal__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.admin-peak-modal__grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
.admin-peak-modal__field textarea,
.admin-peak-modal__field select {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  font: inherit;
  background: #fff;
}

.admin-peak-modal__field input::placeholder,
.admin-peak-modal__field textarea::placeholder,
.admin-peak-modal__upload-actions input::placeholder {
  color: #aaa9a3;
}

.admin-peak-modal__upload-actions {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.admin-peak-modal__upload-actions input[type='file'] {
  font: inherit;
}

.admin-peak-modal__upload-actions input[type='text'] {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font: inherit;
}

.admin-peak-modal__preview img {
  width: 100%;
  aspect-ratio: 4 / 3;
  height: auto;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.admin-peak-modal__preview--empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  border-radius: 14px;
  border: 1px dashed #bbb9b2;
  background: #f8f7f3;
  color: var(--color-text-soft);
}

.admin-peak-modal__error {
  margin: 0;
  color: #9a3e34;
}

.admin-peak-modal__points {
  display: grid;
  gap: 0.9rem;
}

.admin-peak-modal__point {
  display: grid;
  gap: 0.8rem;
  border: 1px solid #e0dfd9;
  border-radius: 12px;
  padding: 0.85rem;
  background: #fbfaf7;
}

.admin-peak-modal__empty {
  margin: 0;
  color: var(--color-text-soft);
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

.admin-peak-modal__button--danger {
  border-color: #c9a19a;
  color: #8b372d;
}

@media (max-width: 900px) {
  .admin-peak-modal__body {
    grid-template-columns: 1fr;
  }

  .admin-peak-modal__media-panel {
    order: -1;
  }
}

@media (max-width: 700px) {
  .admin-peak-modal__grid {
    grid-template-columns: 1fr;
  }

  .admin-peak-modal__header,
  .admin-peak-modal__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

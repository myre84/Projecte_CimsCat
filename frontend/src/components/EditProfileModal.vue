<template>
  <!--
    Fem el modal com una capa per sobre de la pàgina.
    És només per al perfil propi i serveix per editar els camps bàsics que el backend permet.
    Aquí la idea és:
    - obrir una finestra per sobre del perfil
    - deixar editar quatre camps senzills
    - validar una mica abans d'enviar
  -->
  <!--
    @click.self fa que el modal es tanqui si cliquem al fons fosc,
    però no si cliquem dins de la targeta blanca.
  -->
  <div class="edit-profile-modal" @click.self="$emit('close')">
    <article class="edit-profile-modal__card">
      <!-- Capçalera del modal -->
      <div class="edit-profile-modal__header">
        <div>
          <p class="edit-profile-modal__eyebrow">Perfil</p>
          <h2 class="edit-profile-modal__title">Editar perfil</h2>
        </div>

        <button class="edit-profile-modal__close" type="button" @click="$emit('close')">
          ✕
        </button>
      </div>

      <!-- Formulari del modal -->
      <form class="edit-profile-modal__form" @submit.prevent="handleSubmit">
        <label class="edit-profile-modal__field">
          <span>Nom</span>
          <input v-model="localForm.nom" type="text" />
        </label>

        <label class="edit-profile-modal__field">
          <span>Cognom</span>
          <input v-model="localForm.cognom" type="text" />
        </label>

        <label class="edit-profile-modal__field">
          <span>Nom d'usuari</span>
          <input v-model="localForm.nomUsuari" type="text" />
        </label>

        <label class="edit-profile-modal__field">
          <span>Foto de perfil</span>
          <input type="file" accept="image/*" @change="handleImageSelection" />
          <small class="edit-profile-modal__hint">
            Pots triar una imatge del teu ordinador o escriure una ruta/manualment si ja tens una URL.
          </small>
        </label>

        <label class="edit-profile-modal__field">
          <span>Foto de perfil (URL o path)</span>
          <input v-model="localForm.fotoPerfil" type="text" placeholder="/uploads/usuaris/..." />
        </label>

        <div v-if="localForm.fotoPerfil" class="edit-profile-modal__preview">
          <img :src="localForm.fotoPerfil" alt="Previsualitzacio de la foto de perfil" />
        </div>

        <!-- Si tenim errors de validació, els ensenyem aquí -->
        <div v-if="errors.length" class="edit-profile-modal__errors">
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <!-- Botons finals d'acció -->
        <div class="edit-profile-modal__actions">
          <button type="button" class="edit-profile-modal__secondary" @click="$emit('close')">
            Cancel·lar
          </button>
          <button type="submit" class="edit-profile-modal__primary" :disabled="loading">
            {{ loading ? 'Guardant...' : 'Guardar canvis' }}
          </button>
        </div>
      </form>
    </article>
  </div>
</template>

<script setup>
// ref guarda l'estat local del formulari i watch ens ajuda a sincronitzar-lo amb el pare.
import { ref, watch } from 'vue'

// Rebrem des del perfil el formulari inicial i si l'acció de guardar està carregant.
const props = defineProps({
  initialForm: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])

// Aquest és el formulari local del modal.
// És local perquè no volem modificar directament el perfil original mentre l'usuari escriu.
const localForm = ref({
  nom: '',
  cognom: '',
  nomUsuari: '',
  fotoPerfil: '',
})

const errors = ref([])

watch(
  () => props.initialForm,
  (value) => {
    // Cada vegada que s'obre el modal o canvien les dades d'entrada,
    // copiem aquestes dades al formulari local.
    localForm.value = {
      nom: value.nom || '',
      cognom: value.cognom || '',
      nomUsuari: value.nomUsuari || '',
      fotoPerfil: value.fotoPerfil || '',
    }
    errors.value = []
  },
  { immediate: true, deep: true },
)

function handleSubmit() {
  // Aquí fem una validació bàsica abans d'enviar res al perfil.
  const nextErrors = []

  if (!localForm.value.nom.trim()) nextErrors.push('El nom és obligatori.')
  if (!localForm.value.cognom.trim()) nextErrors.push('El cognom és obligatori.')
  if (!/^[a-z0-9._]{3,30}$/.test(localForm.value.nomUsuari.trim().toLowerCase())) {
    nextErrors.push("El nom d'usuari ha de tenir 3-30 caràcters amb minúscules, números, . o _.")
  }

  errors.value = nextErrors
  if (nextErrors.length) return

  // Si tot és correcte, enviem cap al component pare només les dades netes.
  emit('submit', {
    nom: localForm.value.nom.trim(),
    cognom: localForm.value.cognom.trim(),
    nomUsuari: localForm.value.nomUsuari.trim().toLowerCase(),
    fotoPerfil: localForm.value.fotoPerfil.trim() || null,
  })
}

function handleImageSelection(event) {
  // Aquí agafem el fitxer del selector del navegador.
  // Com que backend no té encara un endpoint específic d'uploads d'usuari,
  // el convertim a data URL per poder-lo desar dins del camp fotoPerfil.
  const [file] = event.target.files || []
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    if (typeof reader.result === 'string') {
      localForm.value.fotoPerfil = reader.result
    }
  }

  reader.readAsDataURL(file)
}
</script>

<style scoped>
/* Fons fosc que tapa tota la pantalla */
.edit-profile-modal {
  position: fixed;
  inset: 0;
  background: rgba(31, 34, 27, 0.45);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

/* Targeta blanca central del modal */
.edit-profile-modal__card {
  width: min(100%, 620px);
  background: var(--color-surface);
  border-radius: 18px;
  border: 1px solid var(--color-border);
  padding: 1.5rem;
}

/* Capçalera amb títol i botó de tancar */
.edit-profile-modal__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

/* Text petit superior */
.edit-profile-modal__eyebrow {
  margin: 0 0 0.35rem;
  color: #8a9581;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.edit-profile-modal__title {
  margin: 0;
  font-size: 2rem;
  color: var(--color-text);
}

/* Botó petit de tancar */
.edit-profile-modal__close {
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 10px;
  width: 42px;
  height: 42px;
  cursor: pointer;
}

/* Graella vertical del formulari */
.edit-profile-modal__form {
  margin-top: 1.25rem;
  display: grid;
  gap: 1rem;
}

/* Cada camp té etiqueta + input */
.edit-profile-modal__field {
  display: grid;
  gap: 0.4rem;
  color: var(--color-text);
  font-weight: 600;
}

/* Aparença dels inputs */
.edit-profile-modal__field input {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  font: inherit;
}

.edit-profile-modal__hint {
  color: var(--color-text-soft);
  font-weight: 400;
}

.edit-profile-modal__preview {
  display: flex;
  justify-content: flex-start;
}

.edit-profile-modal__preview img {
  width: 112px;
  height: 112px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: #f2f1ec;
}

/* Caixa d'errors */
.edit-profile-modal__errors {
  border: 1px solid #e2caca;
  background: #fff7f7;
  color: #9a4d4d;
  border-radius: 12px;
  padding: 0.9rem 1rem;
}

.edit-profile-modal__errors ul {
  margin: 0;
  padding-left: 1.1rem;
}

/* Zona de botons finals */
.edit-profile-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.edit-profile-modal__secondary,
.edit-profile-modal__primary {
  border-radius: 10px;
  padding: 0.8rem 1rem;
  cursor: pointer;
  font: inherit;
}

/* Botó secundari de cancel·lar */
.edit-profile-modal__secondary {
  border: 1px solid var(--color-border);
  background: #fff;
}

/* Botó principal de guardar */
.edit-profile-modal__primary {
  border: none;
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
}
</style>

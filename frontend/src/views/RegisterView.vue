<template>
  <!--
    Aquesta és la pantalla de registre.
    Aquí recollim les dades mínimes que el backend ens demana per crear un compte.
  -->
  <section class="auth-shell">
    <div class="auth-panel">
      <header class="auth-topbar">
        <RouterLink to="/" class="auth-topbar__brand">
          <img src="/logo.svg" alt="CimsCat" class="auth-topbar__logo" />
          <span>CimsCat</span>
        </RouterLink>
      </header>

      <div class="auth-content auth-content--register">
        <h1>Pagina de Registre</h1>

        <form class="register-layout" @submit.prevent="handleSubmit">
          <div class="register-fields">
            <label class="auth-field">
              <span>Nom:</span>
              <input
                v-model.trim="form.nom"
                type="text"
                autocomplete="given-name"
                placeholder="Introdueix el teu nom"
              />
              <small v-if="errors.nom">{{ errors.nom }}</small>
            </label>

            <label class="auth-field">
              <span>Cognoms:</span>
              <input
                v-model.trim="form.cognom"
                type="text"
                autocomplete="family-name"
                placeholder="Introdueix els teus cognoms"
              />
              <small v-if="errors.cognom">{{ errors.cognom }}</small>
            </label>

            <label class="auth-field">
              <span>Nom d'usuari:</span>
              <input
                v-model.trim="form.nomUsuari"
                type="text"
                autocomplete="username"
                placeholder="Nom d'usuari en minuscules"
              />
              <small v-if="errors.nomUsuari">{{ errors.nomUsuari }}</small>
            </label>

            <label class="auth-field">
              <span>Correu electronic:</span>
              <input
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                placeholder="Introdueix la teva adreca de correu"
              />
              <small v-if="errors.email">{{ errors.email }}</small>
            </label>

            <label class="auth-field">
              <span>Contrasenya:</span>
              <input
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                placeholder="Ha de tenir minim 8 caracters"
              />
              <small v-if="errors.password">{{ errors.password }}</small>
            </label>

            <label class="auth-field">
              <span>Repeteix la Contrasenya:</span>
              <input
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Ha de coincidir amb l'anterior"
              />
              <small v-if="errors.confirmPassword">{{ errors.confirmPassword }}</small>
            </label>
          </div>

          <div class="register-side">
            <p class="register-side__label">Tria la foto de perfil</p>

            <div class="register-avatar">
              <div class="register-avatar__icon">
                <div class="register-avatar__head"></div>
                <div class="register-avatar__body"></div>
              </div>
            </div>

            <button class="register-browse" type="button" disabled>Navega...</button>
            <p class="register-side__note">La foto quedara pendent fins connectar aquesta part al backend.</p>
          </div>

          <p v-if="serverError" class="auth-error register-feedback">{{ serverError }}</p>

          <button class="auth-submit register-submit" type="submit" :disabled="loading">
            {{ loading ? 'Creant compte...' : 'Crear Compte' }}
          </button>
        </form>
      </div>

      <footer class="auth-footer">CIMSCAT</footer>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  nom: '',
  cognom: '',
  nomUsuari: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  nom: '',
  cognom: '',
  nomUsuari: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const serverError = ref('')

function resetErrors() {
  // Amb això netegem tots els errors del formulari d'una sola passada.
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
  serverError.value = ''
}

function validateForm() {
  // Cada cop que validem, comencem des d'un estat net.
  resetErrors()

  let isValid = true

  if (!form.nom) {
    errors.nom = 'El nom es obligatori.'
    isValid = false
  }

  if (!form.cognom) {
    errors.cognom = 'El cognom es obligatori.'
    isValid = false
  }

  if (!form.nomUsuari) {
    errors.nomUsuari = "El nom d'usuari es obligatori."
    isValid = false
  } else if (!/^[a-z0-9._]{3,30}$/.test(form.nomUsuari)) {
    errors.nomUsuari = "Fes servir 3-30 caracters amb minuscules, numeros, punt o guio baix."
    isValid = false
  }

  if (!form.email) {
    errors.email = 'El correu electronic es obligatori.'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Introdueix un correu electronic valid.'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'La contrasenya es obligatoria.'
    isValid = false
  } else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,30}$/.test(form.password)) {
    errors.password = 'Ha de tenir 8-30 caracters, una majuscula i un numero.'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Has de repetir la contrasenya.'
    isValid = false
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Les contrasenyes no coincideixen.'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  // Igual que al login, primer validem i només després intentem el registre real.
  if (!validateForm()) return

  loading.value = true

  try {
    // La store s'encarrega de traduir el formulari al contracte real del backend.
    const result = await userStore.register(form)

    if (result.token) {
      // Si backend ja ens retorna token, entrem directament a l'app.
      router.push('/')
    } else {
      // Si en algun moment backend registrés sense loguejar automàticament, ens preparem per enviar a login.
      router.push('/login')
    }
  } catch (error) {
    serverError.value = error.response?.data?.error?.message || 'No hem pogut crear el compte.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell {
  min-height: 100%;
  padding: 1rem;
}

.auth-panel {
  width: min(100%, 1040px);
  margin: 0 auto;
  background: #fff;
  border: 1px solid #c6c6c6;
}

.auth-topbar {
  background: #d9d9d9;
  padding: 0.65rem 1rem;
}

.auth-topbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e1e1e;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
}

.auth-topbar__logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.auth-content {
  padding: 2.4rem 1.75rem 1.8rem;
}

.auth-content--register h1 {
  margin: 0 0 2.25rem;
  text-align: center;
  font-size: clamp(3rem, 6vw, 4rem);
  line-height: 1;
  color: #111;
}

.register-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  column-gap: 5rem;
  row-gap: 1rem;
  align-items: start;
  max-width: 760px;
  margin: 0 auto;
}

.register-fields {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #1e1e1e;
}

.auth-field span {
  font-size: 0.95rem;
}

.auth-field input {
  width: 100%;
  max-width: 340px;
  height: 44px;
  border: 2px solid #4b7057;
  border-radius: 12px;
  padding: 0 1rem;
  background: #f6f6f2;
  color: #1e1e1e;
  font: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.auth-field input::placeholder {
  color: #989898;
}

.auth-field small,
.auth-error {
  color: #a13e35;
}

.register-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.2rem;
}

.register-side__label,
.register-side__note {
  color: #1e1e1e;
  font-size: 0.92rem;
  text-align: center;
}

.register-side__note {
  color: #7a7a7a;
  line-height: 1.4;
  max-width: 220px;
}

.register-avatar {
  width: 140px;
  height: 140px;
  border: 1.5px solid #777;
  border-radius: 28px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.register-avatar__icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.register-avatar__head {
  width: 34px;
  height: 34px;
  border: 8px solid #26222a;
  border-radius: 50%;
}

.register-avatar__body {
  width: 78px;
  height: 30px;
  border: 8px solid #26222a;
  border-bottom: none;
  border-radius: 80px 80px 0 0;
}

.register-browse {
  border: 1px solid #9c9c9c;
  border-radius: 8px;
  background: #efefef;
  color: #2a2a2a;
  padding: 0.45rem 0.85rem;
  font: inherit;
}

.register-feedback {
  grid-column: 1 / -1;
  max-width: 600px;
}

.auth-submit {
  height: 54px;
  border: 2px solid #5d8068;
  border-radius: 14px;
  background: #b8c7b5;
  color: #264634;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.18);
}

.auth-submit:disabled {
  opacity: 0.75;
  cursor: wait;
}

.register-submit {
  width: 240px;
  justify-self: center;
  align-self: center;
  margin-top: 0.6rem;
}

.auth-footer {
  background: #d9d9d9;
  padding: 1rem 1.4rem;
  color: #1e1e1e;
  font-size: 1rem;
}

@media (max-width: 860px) {
  .register-layout {
    grid-template-columns: 1fr;
    justify-items: center;
    row-gap: 1.3rem;
  }

  .register-fields {
    width: 100%;
    align-items: center;
  }

  .auth-field {
    width: 100%;
    max-width: 340px;
  }

  .register-submit {
    width: 100%;
    max-width: 340px;
  }
}
</style>

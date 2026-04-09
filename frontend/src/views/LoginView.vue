<template>
  <!--
    Aquesta és la pantalla d'inici de sessió.
    La fem molt simple perquè el flux important aquí és:
    1) omplir correu i contrasenya
    2) validar mínimament
    3) demanar el login a la store
  -->
  <section class="auth-shell">
    <div class="auth-panel">
      <header class="auth-topbar">
        <RouterLink to="/" class="auth-topbar__brand">
          <img src="/logo.svg" alt="CimsCat" class="auth-topbar__logo" />
          <span>CimsCat</span>
        </RouterLink>
      </header>

      <div class="auth-content auth-content--login">
        <h1>Log in</h1>

        <form class="auth-form auth-form--login" @submit.prevent="handleSubmit">
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
              autocomplete="current-password"
              placeholder="Introdueix la teva contrasenya"
            />
            <small v-if="errors.password">{{ errors.password }}</small>
          </label>

          <p v-if="serverError" class="auth-error">{{ serverError }}</p>

          <button class="auth-submit" type="submit" :disabled="loading">
            {{ loading ? 'Entrant...' : 'Iniciar sessio' }}
          </button>
        </form>
      </div>

      <div class="auth-illustration">
        <img src="/abres_login.png" alt="Paisatge de bosc" />
      </div>
    </div>
  </section>
</template>

<script setup>
// reactive ens va bé per formularis amb diversos camps i errors.
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const serverError = ref('')

function validateForm() {
  // Sempre netegem errors abans de tornar a validar.
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  let isValid = true

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
  }

  return isValid
}

async function handleSubmit() {
  // Si la validació falla, no intentem anar al backend.
  if (!validateForm()) return

  loading.value = true

  try {
    // La store encapsula la petició real al backend i la persistència de la sessió.
    await userStore.login(form)
    router.push('/')
  } catch (error) {
    // Aquí mostrem el missatge del backend si existeix.
    serverError.value = error.response?.data?.error?.message || 'No hem pogut iniciar sessio.'
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
  /* Aquesta "targeta" central és la caixa principal del login. */
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
  padding: 2.4rem 1.5rem 2rem;
}

.auth-content--login {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-content h1 {
  margin: 0 0 1.8rem;
  font-size: clamp(3rem, 7vw, 4.2rem);
  line-height: 1;
  color: #111;
}

.auth-form {
  width: 100%;
}

.auth-form--login {
  max-width: 330px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-bottom: 1rem;
  color: #1e1e1e;
}

.auth-field span {
  font-size: 0.95rem;
}

.auth-field input {
  height: 48px;
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

.auth-submit {
  display: block;
  width: 100%;
  margin-top: 2rem;
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

.auth-illustration img {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
}
</style>

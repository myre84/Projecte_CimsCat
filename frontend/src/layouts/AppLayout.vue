<template>
  <!--
    Aquest layout és l'esquelet principal de l'aplicació.
    La idea és que totes les pàgines comparteixin una mateixa estructura general.
  -->
  <div class="app-layout">
    <div class="app-shell">
      <!--
        A la home ja mostrem la navbar dins la mateixa vista per adaptar-nos millor al wireframe.
        Per això aquí la mostrem només si NO estem a la ruta Home.
      -->
      <NavBar v-if="!isHome" />

      <!-- Aquí Vue Router injecta la vista actual. -->
      <main class="main-content">
        <RouterView />
      </main>

      <!-- El footer sí que el mantenim a totes les pàgines. -->
      <Footer />
    </div>
  </div>
</template>

<script setup>
// computed ens deixa crear una variable reactiva a partir de la ruta actual.
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Aquests dos components formen l'esquelet general compartit.
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'

const route = useRoute()

// Si la ruta actual es diu "Home", retornem true.
// Això ens serveix per decidir si la navbar surt des del layout o des de la pròpia vista.
const isHome = computed(() => route.name === 'Home')
</script>

<style scoped>
/* Fons general exterior de l'aplicació. */
.app-layout {
  min-height: 100vh;
  background: #efefec;
  padding: 1rem 0;
}

/* Contenidor principal centrat on viu tota la web. */
.app-shell {
  max-width: 1320px;
  margin: 0 auto;
  background: var(--color-surface);
  min-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* La zona principal creix per ocupar l'espai disponible entre navbar i footer. */
.main-content {
  flex: 1;
}
</style>

<template>
  <!--
    Aquest fitxer és el punt d'entrada visual de la nostra aplicació Vue.
    Aquí no hi posem contingut propi, perquè hem decidit que tota l'estructura
    general de la web visqui dins del layout principal.

    Dit d'una altra manera:
    - App.vue és la "porta d'entrada" del frontend
    - AppLayout s'encarrega de pintar navbar, footer i les vistes
  -->
  <AppLayout />
</template>

<script setup>
// Importem el layout principal perquè aquest component només actua com a contenidor arrel.
import AppLayout from './layouts/AppLayout.vue'
</script>

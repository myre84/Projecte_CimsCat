<template>
  <div class="app-layout">
    <div class="app-shell">
      <NavBar v-if="!isHome" />
      <main class="main-content">
        <RouterView />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'Home')
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #efefec;
  padding: 1rem 0;
}

.app-shell {
  max-width: 1320px;
  margin: 0 auto;
  background: var(--color-surface);
  min-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.main-content {
  flex: 1;
}
</style>

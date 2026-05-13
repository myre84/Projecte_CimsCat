<template>
  <!--
    Targeta d'un repte (challenge) del perfil.
    Aquesta peça mostra:
    1) un donut amb percentatge de progrés
    2) un resum curt del repte
    3) la llista de cims completats (si toca)
  -->
  <article class="award-card">
    <div class="award-card__top">
      <div class="award-card__chart-wrap">
        <canvas ref="canvasRef"></canvas>
        <div class="award-card__center">
          <strong>{{ percentage }}%</strong>
          <span>{{ challenge.current }}/{{ challenge.total }}</span>
        </div>
      </div>

      <div class="award-card__summary">
        <h3>{{ challenge.title }}</h3>
        <p>{{ challenge.note }}</p>
      </div>
    </div>

    <div v-if="!challenge.compact" class="award-card__list">
      <h4>Cims completats</h4>
      <ul v-if="challenge.completedPeaks?.length">
        <li v-for="peak in challenge.completedPeaks" :key="peak">{{ peak }}</li>
      </ul>
      <p v-else>Encara no tens cap cim registrat per aquest repte.</p>
    </div>
  </article>
</template>

<script setup>
// computed: per calcular el percentatge en temps real.
// onMounted / onBeforeUnmount: per crear i destruir el Chart quan toca.
// watch: per redibuixar el donut si canvien dades del repte.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

// El component rep UN repte ja normalitzat des de useProfileAwards.
const props = defineProps({
  challenge: {
    type: Object,
    required: true,
  },
})

const canvasRef = ref(null)
let chartInstance = null

const percentage = computed(() => {
  // Convertim a Number per evitar problemes si arriba string des d'API.
  const total = Number(props.challenge.total || 0)
  const current = Number(props.challenge.current || 0)
  // Si no hi ha total, no podem calcular percentatge.
  if (!total) return 0
  // Math.min(100, ...) evita que visualment passi de 100%.
  return Math.min(100, Math.round((current / total) * 100))
})

function renderChart() {
  // Si encara no tenim el canvas del DOM, no podem pintar.
  if (!canvasRef.value) return

  // Abans de dibuixar, destruïm el gràfic anterior per evitar "memory leaks".
  chartInstance?.destroy()

  // Dades segures per construir el donut.
  const total = Number(props.challenge.total || 0)
  const current = Math.min(Number(props.challenge.current || 0), total || 0)
  const remaining = Math.max(0, total - current)

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          // Si total és 0, posem [0,1] per evitar errors de divisió/render a Chart.js.
          data: total ? [current, remaining] : [0, 1],
          backgroundColor: [props.challenge.accentColor || '#4f7b64', '#ebe7d8'],
          borderWidth: 0,
          cutout: '72%',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  })
}

onMounted(renderChart)
// Quan canvia progressió, objectiu o color d'accent, repintem el donut.
watch(() => [props.challenge.current, props.challenge.total, props.challenge.accentColor], renderChart)
// Quan desapareix el component (canvi de pàgina), netegem el gràfic.
onBeforeUnmount(() => chartInstance?.destroy())
</script>

<style scoped>
.award-card {
  border-radius: 16px;
  border: 1px solid #ddd8c6;
  background: #fffaf1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.award-card__top {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}

.award-card__chart-wrap {
  width: 150px;
  height: 150px;
  position: relative;
}

.award-card__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.award-card__center strong {
  font-size: 1.35rem;
}

.award-card__center span,
.award-card__summary p,
.award-card__list p,
.award-card__list ul {
  color: var(--color-text-soft);
}

.award-card__summary h3,
.award-card__list h4 {
  margin: 0 0 0.35rem;
}

.award-card__summary p,
.award-card__list p {
  margin: 0;
  line-height: 1.5;
}

.award-card__list ul {
  margin: 0;
  padding-left: 1rem;
  line-height: 1.55;
}

@media (max-width: 720px) {
  .award-card__top {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
}
</style>

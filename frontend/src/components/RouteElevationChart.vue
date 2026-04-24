<template>
  <article class="route-elevation-card">
    <div v-if="hasPoints" class="route-elevation-card__chart">
      <canvas ref="canvasRef"></canvas>
    </div>

    <div v-else class="route-elevation-card__empty">
      <strong>Perfil pendent</strong>
      <p>Afegeix almenys dos waypoints al mapa per veure una estimacio d'elevacio.</p>
    </div>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  points: {
    type: Array,
    default: () => [],
  },
})

const canvasRef = ref(null)
let chartInstance = null

const hasPoints = computed(() => props.points.length >= 2)

function renderChart() {
  if (!canvasRef.value || !hasPoints.value) {
    chartInstance?.destroy()
    chartInstance = null
    return
  }

  chartInstance?.destroy()

  chartInstance = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels: props.points.map((point) => `${point.distance} km`),
      datasets: [
        {
          label: 'Elevacio estimada',
          data: props.points.map((point) => point.elevation),
          borderColor: '#31563d',
          backgroundColor: 'rgba(63, 107, 79, 0.18)',
          borderWidth: 3,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.parsed.y} m`
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6a6a6a', maxTicksLimit: 6 },
        },
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(154, 154, 154, 0.22)' },
          ticks: {
            color: '#6a6a6a',
            callback(value) {
              return `${value} m`
            },
          },
        },
      },
    },
  })
}

onMounted(renderChart)
watch(() => props.points, renderChart, { deep: true })
onBeforeUnmount(() => chartInstance?.destroy())
</script>

<style scoped>
.route-elevation-card {
  min-height: 280px;
  border: 1px solid #ded8c9;
  border-radius: 18px;
  background: #fffdf8;
  padding: 1rem;
}

.route-elevation-card__chart {
  height: 280px;
}

.route-elevation-card__empty {
  min-height: 248px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.45rem;
  border: 1px dashed #c9c3b4;
  border-radius: 14px;
  color: var(--color-text-soft);
  text-align: center;
  padding: 1rem;
}

.route-elevation-card__empty strong {
  color: var(--color-text);
  font-size: 1.25rem;
}

.route-elevation-card__empty p {
  max-width: 34ch;
  margin: 0;
  line-height: 1.55;
}

@media (max-width: 720px) {
  .route-elevation-card,
  .route-elevation-card__chart {
    min-height: 240px;
  }

  .route-elevation-card__chart {
    height: 240px;
  }
}
</style>

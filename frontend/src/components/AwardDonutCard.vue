<template>
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  challenge: {
    type: Object,
    required: true,
  },
})

const canvasRef = ref(null)
let chartInstance = null

const percentage = computed(() => {
  const total = Number(props.challenge.total || 0)
  const current = Number(props.challenge.current || 0)
  if (!total) return 0
  return Math.min(100, Math.round((current / total) * 100))
})

function renderChart() {
  if (!canvasRef.value) return

  chartInstance?.destroy()

  const total = Number(props.challenge.total || 0)
  const current = Math.min(Number(props.challenge.current || 0), total || 0)
  const remaining = Math.max(0, total - current)

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      datasets: [
        {
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
watch(() => [props.challenge.current, props.challenge.total, props.challenge.accentColor], renderChart)
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

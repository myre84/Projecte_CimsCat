<template>
  <!--
    Aquesta pantalla és temporal.
    La fem perquè "Planificar ruta" ja no apunti erròniament a "Crear publicació".
    Així deixem separats dos fluxos que funcionalment són diferents.
  -->
  <section class="plan-route-view">
    <article class="plan-route-card">
      <p class="plan-route-eyebrow">Planificador de rutes</p>
      <h1 class="plan-route-title">Planificar nova ruta</h1>
      <p class="plan-route-text">
        Aquesta pantalla quedarà disponible quan es completi la implementació del planificador.
      </p>
      <p class="plan-route-text">
        De moment, la creació de publicacions ja es fa a través de la seva pàgina pròpia i queda separada
        del flux de planificació de rutes.
      </p>
    </article>
  </section>
</template>

<style scoped>
.plan-route-view {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
}

.plan-route-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 2rem;
}

.plan-route-eyebrow {
  margin: 0 0 0.35rem;
  color: #8a9581;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
}

.plan-route-title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.04;
  color: var(--color-text);
}

.plan-route-text {
  margin: 1rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.75;
  max-width: 58ch;
}

@media (max-width: 640px) {
  .plan-route-view {
    padding: 1rem 0.5rem 2rem;
  }

  .plan-route-card {
    padding: 1.2rem;
  }
}
</style>

<template>
  <section class="admin-dashboard">
    <header class="admin-dashboard__header">
      <div>
        <p class="admin-dashboard__eyebrow">Panell d'administracio</p>
        <h1>Gestio de plataforma</h1>
        <p class="admin-dashboard__lead">
          Des d'aqui pots revisar els cims destacats actuals i veure quines eines de moderacio
          queden pendents de connectar amb backend.
        </p>
      </div>

      <div class="admin-dashboard__summary">
        <span class="admin-dashboard__badge">Rol actual: {{ userStore.user?.rol || 'usuari' }}</span>
        <span class="admin-dashboard__badge">Cims visibles: {{ peaks.length }}</span>
      </div>
    </header>

    <section class="admin-section">
      <div class="admin-section__title-row">
        <div>
          <p class="admin-section__eyebrow">Gestio de cims</p>
          <h2>Llistat actual</h2>
        </div>
        <button class="admin-button admin-button--primary" disabled>
          Crear nou cim
        </button>
      </div>

      <p class="admin-section__note">
        La UI esta preparada, pero la creacio, edicio i eliminacio queden pendents de la connexio
        amb els endpoints reals del backend.
      </p>

      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Cim</th>
              <th>Altitud</th>
              <th>Zona</th>
              <th>Guardats</th>
              <th>Accions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="peak in peaks" :key="peak.id">
              <td>{{ peak.peakName }}</td>
              <td>{{ peak.elevation }} m</td>
              <td>{{ peak.region }}</td>
              <td>{{ peak.savedCount }}</td>
              <td class="admin-table__actions">
                <button class="admin-button" disabled>Editar</button>
                <button class="admin-button admin-button--danger" disabled>Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-section">
      <div class="admin-section__title-row">
        <div>
          <p class="admin-section__eyebrow">Moderacio</p>
          <h2>Accions disponibles al frontend</h2>
        </div>
      </div>

      <div class="moderation-grid">
        <article
          v-for="section in moderationSections"
          :key="section.title"
          class="moderation-card"
        >
          <h3>{{ section.title }}</h3>
          <p>{{ section.description }}</p>
          <button class="admin-button admin-button--danger" disabled>
            {{ section.action }}
          </button>
          <span class="moderation-card__status">Pendent de backend</span>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
// Aquest dashboard encara és sobretot visual.
// L'objectiu és deixar una base de panell admin encara que moltes accions
// reals encara depenguin del backend.
import { computed } from 'vue'
import { useUserStore } from '../stores/user'
import { homeFeaturedPublications } from '../mocks/homeFeaturedPublications'

const userStore = useUserStore()

const peaks = computed(() =>
  [...homeFeaturedPublications].sort((a, b) => b.savedCount - a.savedCount)
)

const moderationSections = [
  // Cada targeta de moderació representa una funcionalitat futura.
  {
    title: 'Publicacions',
    description: 'Preparat per revisar i eliminar publicacions quan existeixi l\'endpoint real.',
    action: 'Eliminar publicacio',
  },
  {
    title: 'Comentaris',
    description: 'Espai reservat per moderar comentaris reportats o contingut inadequat.',
    action: 'Eliminar comentari',
  },
  {
    title: 'Usuaris',
    description: 'UI llesta per gestionar perfils quan el backend permeti la moderacio.',
    action: 'Eliminar perfil',
  },
]
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-dashboard__header,
.admin-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 1.5rem;
}

.admin-dashboard__header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.admin-dashboard__header h1,
.admin-section h2,
.moderation-card h3 {
  margin: 0;
  color: var(--color-text);
}

.admin-dashboard__eyebrow,
.admin-section__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--color-text-soft);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.admin-dashboard__lead,
.admin-section__note,
.moderation-card p {
  margin: 0.75rem 0 0;
  color: var(--color-text-soft);
  line-height: 1.5;
}

.admin-dashboard__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.admin-dashboard__badge,
.moderation-card__status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #eef2ea;
  color: #31513e;
  padding: 0.4rem 0.8rem;
  font-size: 0.88rem;
  border: 1px solid #d6dfd1;
}

.admin-section__title-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.admin-table th,
.admin-table td {
  padding: 0.95rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  color: var(--color-text);
}

.admin-table th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-soft);
}

.admin-table__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.admin-button {
  border: 1px solid var(--color-border);
  background: #f4f4ef;
  color: var(--color-text);
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
  cursor: not-allowed;
  font-size: 0.9rem;
}

.admin-button--primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  border: none;
}

.admin-button--danger {
  background: #fff1ef;
  color: #9a3e34;
  border-color: #efc9c2;
}

.moderation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.moderation-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  background: #faf9f5;
}

@media (max-width: 900px) {
  .admin-dashboard__header,
  .admin-section__title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-dashboard__summary {
    justify-content: flex-start;
  }

  .moderation-grid {
    grid-template-columns: 1fr;
  }
}
</style>

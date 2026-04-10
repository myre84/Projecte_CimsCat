import { computed, ref } from 'vue'
import api from '../api/axios'
import awardAltIcon from '../assets/awards/award-alt-svgrepo-com.svg'
import binocularsIcon from '../assets/awards/binoculars-illustration-8-svgrepo-com.svg'
import goldMedalIcon from '../assets/awards/gold-medal.svg'
import hikingIcon from '../assets/awards/hiking-svgrepo-com.svg'
import hundredPointsIcon from '../assets/awards/hundred-points-svgrepo-com.svg'
import mapLocationIcon from '../assets/awards/map-location-svgrepo-com.svg'
import medalRibbonIcon from '../assets/awards/medal-ribbon-star-svgrepo-com.svg'
import mountainsAltitudeIcon from '../assets/awards/mountains-altitude.svg'
import rankingsIcon from '../assets/awards/rankings.svg'
import trophyIcon from '../assets/awards/trophy-base-svgrepo-com.svg'

const peaksCatalog = ref([])
const catalogLoaded = ref(false)
const isCatalogLoading = ref(false)

async function ensurePeaksCatalogLoaded() {
  if (catalogLoaded.value || isCatalogLoading.value) return

  isCatalogLoading.value = true

  try {
    const { data } = await api.get('/peaks')
    peaksCatalog.value = data.peaks || []
    catalogLoaded.value = true
  } catch {
    peaksCatalog.value = []
  } finally {
    isCatalogLoading.value = false
  }
}

function toDate(value) {
  const date = value ? new Date(value) : null
  return date instanceof Date && !Number.isNaN(date?.getTime()) ? date : null
}

function startOfWeek(date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1)
}

function roundKm(value) {
  return Math.round((value || 0) * 10) / 10
}

function groupByComarca(items) {
  return items.reduce((acc, item) => {
    if (!item?.comarca) return acc
    acc[item.comarca] = (acc[item.comarca] || 0) + 1
    return acc
  }, {})
}

function uniquePeakEntries(publications) {
  const entries = new Map()

  publications.forEach((publication) => {
    const peak = publication?.cim
    if (!peak?.id) return

    if (!entries.has(peak.id)) {
      entries.set(peak.id, {
        id: peak.id,
        nom: peak.nom,
        comarca: peak.comarca || '',
        alcada: Number(peak.alcada || 0),
      })
    }
  })

  return [...entries.values()]
}

export function useProfileAwards(publicationsSource, options = {}) {
  const compact = options.compact ?? false
  ensurePeaksCatalogLoaded()

  const publications = computed(() => publicationsSource.value || publicationsSource || [])
  const validPublications = computed(() =>
    publications.value.filter((publication) => publication?.cim?.id)
  )
  const completedPeaks = computed(() => uniquePeakEntries(validPublications.value))

  const stats = computed(() => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)
    const yearStart = startOfYear(now)

    let weekKm = 0
    let monthKm = 0
    let yearKm = 0

    validPublications.value.forEach((publication) => {
      const activityDate = toDate(publication.dataActivitat)
      const distance = Number(publication.distanciaKm || 0)

      if (!activityDate || Number.isNaN(distance)) return

      if (activityDate >= weekStart) weekKm += distance
      if (activityDate >= monthStart) monthKm += distance
      if (activityDate >= yearStart) yearKm += distance
    })

    return [
      { id: 'week', label: 'Km aquesta setmana', value: roundKm(weekKm) },
      { id: 'month', label: 'Km aquest mes', value: roundKm(monthKm) },
      { id: 'year', label: 'Km aquest any', value: roundKm(yearKm) },
    ]
  })

  const peaksOver3000 = computed(() =>
    completedPeaks.value.filter((peak) => peak.alcada >= 3000)
  )

  const catalogPeaksOver3000 = computed(() =>
    peaksCatalog.value.filter((peak) => Number(peak.alcada || 0) >= 3000)
  )

  const completedComarcaCounts = computed(() => groupByComarca(completedPeaks.value))
  const catalogComarcaCounts = computed(() => groupByComarca(peaksCatalog.value))

  const topComarca = computed(() => {
    const entries = Object.entries(completedComarcaCounts.value)
    if (!entries.length) return { comarca: '', count: 0 }
    const [comarca, count] = entries.sort((a, b) => b[1] - a[1])[0]
    return { comarca, count }
  })

  const exploredComarquesCount = computed(
    () => Object.keys(completedComarcaCounts.value).length
  )

  const completedComarques = computed(() =>
    Object.entries(catalogComarcaCounts.value)
      .filter(([, total]) => total > 0)
      .filter(([comarca, total]) => (completedComarcaCounts.value[comarca] || 0) >= total)
      .map(([comarca, total]) => ({ comarca, total }))
  )

  const challenges = computed(() => [
    {
      id: 'challenge-3000',
      title: '3000s dels Pirineus catalans',
      note: 'Calcul temporal amb els cims de +3000 m del cataleg actual.',
      current: peaksOver3000.value.length,
      total: catalogPeaksOver3000.value.length || 1,
      accentColor: '#d39b3f',
      completedPeaks: peaksOver3000.value.map((peak) => peak.nom),
      compact,
    },
    {
      id: 'challenge-fec',
      title: '100 cims de la FEC',
      note: 'Versio temporal basada en cims unics registrats al perfil.',
      current: completedPeaks.value.length,
      total: 100,
      accentColor: '#4f7b64',
      completedPeaks: completedPeaks.value.slice(0, 8).map((peak) => peak.nom),
      compact,
    },
  ])

  const badges = computed(() => {
    const uniqueCount = completedPeaks.value.length
    const count3000 = peaksOver3000.value.length
    const comarcaCompleted = completedComarques.value[0]

    return [
      {
        id: 'first-peak',
        title: 'Primer cim completat',
        description: 'Has publicat almenys una ascensio.',
        unlocked: uniqueCount >= 1,
        image: goldMedalIcon,
        accent: '#d95858',
        soft: '#fff0eb',
        iconFilter: 'none',
      },
      {
        id: 'ten-peaks',
        title: '10 cims completats',
        description: 'Has registrat 10 cims diferents.',
        unlocked: uniqueCount >= 10,
        image: trophyIcon,
        accent: '#d39b3f',
        soft: '#fff7e8',
        iconFilter: 'none',
      },
      {
        id: 'first-3000',
        title: 'Primer +3000',
        description: 'Has assolit un cim de mes de 3000 m.',
        unlocked: count3000 >= 1,
        image: hikingIcon,
        accent: '#5a7f63',
        soft: '#eef7ef',
        iconFilter: 'none',
      },
      {
        id: 'three-3000',
        title: 'Tres +3000',
        description: 'Ja tens tres cims de mes de 3000 m.',
        unlocked: count3000 >= 3,
        image: rankingsIcon,
        accent: '#4a67b7',
        soft: '#eef1ff',
        iconFilter: 'none',
      },
      {
        id: 'five-comarca',
        title: 'Explorador de comarques',
        description:
          exploredComarquesCount.value >= 5
            ? `Ja has registrat cims a ${exploredComarquesCount.value} comarques diferents.`
            : 'Completa cims a 5 comarques diferents.',
        unlocked: exploredComarquesCount.value >= 5,
        image: binocularsIcon,
        accent: '#8a623a',
        soft: '#fbf3e8',
        iconFilter: 'none',
      },
      {
        id: 'complete-comarca',
        title: 'Comarca completada',
        description: comarcaCompleted
          ? `Has completat tots els cims actuals de ${comarcaCompleted.comarca}.`
          : 'Completa tots els cims actuals d’una comarca del cataleg.',
        unlocked: Boolean(comarcaCompleted),
        image: mapLocationIcon,
        accent: '#45706a',
        soft: '#edf7f6',
        iconFilter: 'none',
      },
      {
        id: 'full-3000',
        title: 'Repte 3000s',
        description:
          catalogPeaksOver3000.value.length > 0 &&
          count3000 >= catalogPeaksOver3000.value.length
            ? 'Has completat tots els +3000 del cataleg actual.'
            : 'Completa tots els +3000 del cataleg actual.',
        unlocked:
          catalogPeaksOver3000.value.length > 0 &&
          count3000 >= catalogPeaksOver3000.value.length,
        image: mountainsAltitudeIcon,
        accent: '#6e5bb8',
        soft: '#f2efff',
        iconFilter: 'none',
      },
      {
        id: 'hundred-fec',
        title: '100 cims FEC',
        description:
          uniqueCount >= 100
            ? 'Has arribat als 100 cims diferents.'
            : 'Arriba als 100 cims diferents per desbloquejar-la.',
        unlocked: uniqueCount >= 100,
        image: hundredPointsIcon,
        accent: '#d9546a',
        soft: '#fff0f4',
        iconFilter: 'none',
      },
    ]
  })

  return {
    stats,
    challenges,
    badges,
    isCatalogLoading,
    hasTemporaryDefinitions: true,
  }
}

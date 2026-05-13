// Aquest composable centralitza tota la lògica del bloc d'awards:
// - carregar dades reals del backend (stats, challenges, badges)
// - normalitzar-les al format que espera la UI
// - exposar estat de loading/error i funció de refresh
import { computed, ref, watch } from 'vue'
import api from '../api/axios'
import binocularsIcon from '../assets/awards/binoculars-illustration-8-svgrepo-com.svg'
import goldMedalIcon from '../assets/awards/gold-medal.svg'
import hikingIcon from '../assets/awards/hiking-svgrepo-com.svg'
import hundredPointsIcon from '../assets/awards/hundred-points-svgrepo-com.svg'
import mapLocationIcon from '../assets/awards/map-location-svgrepo-com.svg'
import mountainsAltitudeIcon from '../assets/awards/mountains-altitude.svg'
import rankingsIcon from '../assets/awards/rankings.svg'
import trophyIcon from '../assets/awards/trophy-base-svgrepo-com.svg'

const BADGE_STYLE_BY_CODE = {
  first_publication: { image: goldMedalIcon, accent: '#cf5f52', soft: '#fff1eb' },
  first_peak: { image: goldMedalIcon, accent: '#d95858', soft: '#fff0eb' },
  ten_peaks: { image: trophyIcon, accent: '#d39b3f', soft: '#fff7e8' },
  first_3000: { image: hikingIcon, accent: '#5a7f63', soft: '#eef7ef' },
  three_3000: { image: rankingsIcon, accent: '#4a67b7', soft: '#eef1ff' },
  five_comarques: { image: binocularsIcon, accent: '#8a623a', soft: '#fbf3e8' },
  hundred_feec: { image: hundredPointsIcon, accent: '#d9546a', soft: '#fff0f4' },
  hundred_km: { image: mapLocationIcon, accent: '#45706a', soft: '#edf7f6' },
  thousand_elevation: { image: mountainsAltitudeIcon, accent: '#6e5bb8', soft: '#f2efff' },
}

const CHALLENGE_COLOR_BY_SLUG = {
  '3000s-pirineus': '#d39b3f',
  '100-cims-feec': '#4f7b64',
}

function toDate(value) {
  // Convertim amb protecció per evitar "Invalid Date" si backend envia null.
  const date = value ? new Date(value) : null
  return date instanceof Date && !Number.isNaN(date?.getTime()) ? date : null
}

function startOfWeek(date) {
  // Definim inici de setmana en dilluns.
  // JS retorna 0 = diumenge, així fem l'ajust manual.
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function roundKm(value) {
  // Arrodonim a 1 decimal per mantenir lectura humana (ex: 52.6 km).
  return Math.round((Number(value) || 0) * 10) / 10
}

function getCurrentMonthStat(byMonth) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return byMonth.find((item) => item.year === year && item.month === month)
}

function getCurrentYearStat(byYear) {
  const year = new Date().getFullYear()
  return byYear.find((item) => item.year === year)
}

function normalizeStats(statsPayload, publications) {
  // "byMonth" i "byYear" venen de backend (/users/:id/stats).
  const byMonth = statsPayload?.byMonth || []
  const byYear = statsPayload?.byYear || []

  // La setmana la recalcularem al frontend amb dataActivitat de publicacions,
  // perquè la UI sigui reactiva si apareix una publicació nova a la sessió.
  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekKm = (publications || []).reduce((sum, publication) => {
    const activityDate = toDate(publication?.dataActivitat)
    if (!activityDate || activityDate < weekStart) return sum
    return sum + Number(publication?.distanciaKm || 0)
  }, 0)

  const currentMonth = getCurrentMonthStat(byMonth)
  const currentYear = getCurrentYearStat(byYear)

  return [
    { id: 'week', label: 'Km aquesta setmana', value: roundKm(weekKm) },
    { id: 'month', label: 'Km aquest mes', value: roundKm(currentMonth?.totalKm || 0) },
    { id: 'year', label: 'Km aquest any', value: roundKm(currentYear?.totalKm || 0) },
  ]
}

function normalizeChallenge(challenge, compact) {
  // Transformem cada repte backend -> objecte de presentació per AwardDonutCard.
  return {
    id: challenge.id,
    title: challenge.name,
    note: challenge.description || 'Progres real calculat des del backend.',
    current: Number(challenge.current || 0),
    total: Number(challenge.target || 0) || 1,
    accentColor: CHALLENGE_COLOR_BY_SLUG[challenge.slug] || '#4f7b64',
    completedPeaks: (challenge.completedPeaks || []).map((peak) => peak.nom),
    compact,
  }
}

function normalizeBadge(badge) {
  // Si backend no envia iconUrl, agafem icona local mapejada per codi.
  const style = BADGE_STYLE_BY_CODE[badge.code] || {
    image: null,
    accent: '#5b4b1d',
    soft: '#fffaf1',
  }

  return {
    id: badge.id,
    title: badge.name,
    description: badge.description,
    unlocked: Boolean(badge.unlocked),
    unlockedAt: badge.unlockedAt || null,
    image: badge.iconUrl || style.image,
    accent: style.accent,
    soft: style.soft,
    iconFilter: 'none',
  }
}

export function useProfileAwards(publicationsSource, userIdSource, options = {}) {
  // compact=true s'usa al perfil aliè per simplificar visualment el detall.
  const compact = options.compact ?? false
  const stats = ref([])
  const challenges = ref([])
  const badges = ref([])
  const isAwardsLoading = ref(false)
  const awardsError = ref('')
  const rawStats = ref(null)

  const publications = computed(() => publicationsSource?.value || publicationsSource || [])
  const resolvedUserId = computed(() => userIdSource?.value || userIdSource || '')

  async function fetchAwards() {
    // Si no tenim id d'usuari, deixem l'estat net i no cridem API.
    if (!resolvedUserId.value) {
      stats.value = []
      challenges.value = []
      badges.value = []
      rawStats.value = null
      return
    }

    isAwardsLoading.value = true
    awardsError.value = ''

    try {
      // Carreguem en paral·lel per reduir temps d'espera.
      const [statsResponse, challengesResponse, badgesResponse] = await Promise.all([
        api.get(`/users/${resolvedUserId.value}/stats`),
        api.get(`/users/${resolvedUserId.value}/challenges`),
        api.get(`/users/${resolvedUserId.value}/badges`),
      ])

      rawStats.value = statsResponse.data?.stats || null
      // Transformació cap al model de vista.
      stats.value = normalizeStats(rawStats.value, publications.value)
      challenges.value = (challengesResponse.data?.challenges || []).map((item) =>
        normalizeChallenge(item, compact),
      )
      badges.value = (badgesResponse.data?.badges || []).map(normalizeBadge)
    } catch (error) {
      // Si falla, netegem tot per evitar dades mig velles a pantalla.
      stats.value = []
      challenges.value = []
      badges.value = []
      rawStats.value = null
      awardsError.value =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        "No hem pogut carregar el bloc d'awards."
    } finally {
      isAwardsLoading.value = false
    }
  }

  watch(resolvedUserId, fetchAwards, { immediate: true })
  watch(
    publications,
    () => {
      // Si canvien publicacions però tenim stats backend carregades,
      // recalcularem només la setmana sense tornar a cridar API.
      if (!rawStats.value) return
      stats.value = normalizeStats(rawStats.value, publications.value)
    },
    { deep: true },
  )

  return {
    stats,
    challenges,
    badges,
    isCatalogLoading: isAwardsLoading,
    hasTemporaryDefinitions: false,
    awardsError,
    refreshAwards: fetchAwards,
  }
}

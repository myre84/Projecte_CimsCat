// Aquest composable concentra tota la lògica del cercador global de cims.
// La idea és que la Navbar pugui funcionar igual a qualsevol pàgina del projecte
// sense dependre de la Home ni de les cards de "Cims destacats".
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '../api/axios'

// Deixem aquest estat a nivell de mòdul perquè es comparteixi entre instàncies
// del composable. Això ens va bé perquè quan la Navbar es desmunta i es torna
// a muntar en canviar de vista, no hàgim de demanar el catàleg de cims de zero
// cada vegada.
const catalogPeaks = ref([])
const searchText = ref('')
const showSuggestions = ref(false)
const isLoadingCatalog = ref(false)
const catalogLoaded = ref(false)

function normalizeText(value) {
  // Normalitzem accents i majúscules/minúscules perquè "Berguedà" i "bergueda"
  // es puguin comparar de forma flexible i més humana.
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function buildComarcaSuggestions(peaks, query) {
  // Agrupem els cims per comarca només quan la comarca coincideix amb el text.
  // Això ens permet mostrar un bloc "Comarca" i just a sota els cims que hi ha
  // dins aquella comarca, que és el comportament que hem acordat.
  const grouped = new Map()

  peaks.forEach((peak) => {
    if (!peak.comarca) return

    const comarcaKey = peak.comarca
    const normalizedComarca = normalizeText(comarcaKey)

    if (!normalizedComarca.includes(query)) return

    if (!grouped.has(comarcaKey)) {
      grouped.set(comarcaKey, [])
    }

    grouped.get(comarcaKey).push({
      id: peak.id,
      label: peak.nom,
      comarca: peak.comarca,
    })
  })

  return [...grouped.entries()].slice(0, 3).map(([comarca, peaksInComarca]) => ({
    type: 'comarca',
    label: comarca,
    peaks: peaksInComarca.slice(0, 5),
  }))
}

async function ensureCatalogLoaded() {
  // Carreguem el catàleg públic de cims una sola vegada.
  // Després ja fem totes les cerques en memòria per poder reaccionar ràpid
  // mentre l'usuari escriu al cercador.
  if (catalogLoaded.value || isLoadingCatalog.value) return

  isLoadingCatalog.value = true

  try {
    const { data } = await api.get('/peaks')
    catalogPeaks.value = data.peaks || []
    catalogLoaded.value = true
  } catch {
    catalogPeaks.value = []
  } finally {
    isLoadingCatalog.value = false
  }
}

export function usePeakSearch() {
  const router = useRouter()
  const route = useRoute()

  const normalizedQuery = computed(() => normalizeText(searchText.value))

  const peakSuggestions = computed(() => {
    if (!normalizedQuery.value) return []

    return catalogPeaks.value
      .filter((peak) => normalizeText(peak.nom).includes(normalizedQuery.value))
      .slice(0, 5)
      .map((peak) => ({
        type: 'peak',
        id: peak.id,
        label: peak.nom,
        comarca: peak.comarca,
      }))
  })

  const comarcaSuggestions = computed(() => {
    if (!normalizedQuery.value) return []
    return buildComarcaSuggestions(catalogPeaks.value, normalizedQuery.value)
  })

  const suggestions = computed(() => [...peakSuggestions.value, ...comarcaSuggestions.value])

  const hasSuggestions = computed(() => suggestions.value.length > 0)

  const bestPeakMatch = computed(() => {
    if (!normalizedQuery.value) return null

    // Primer intentem trobar una coincidència exacta de nom, que és el cas ideal
    // quan l'usuari prem Enter perquè llavors sí que podem obrir directament la
    // fitxa del cim amb confiança.
    const exactMatch = peakSuggestions.value.find(
      (peak) => normalizeText(peak.label) === normalizedQuery.value
    )

    if (exactMatch) return exactMatch

    // Si no hi ha coincidència exacta, agafem la primera coincidència de cim.
    // Això fa que Enter també sigui útil quan l'usuari escriu una part clara del
    // nom del cim.
    return peakSuggestions.value[0] || null
  })

  async function focusSearch() {
    await ensureCatalogLoaded()
    showSuggestions.value = hasSuggestions.value
  }

  async function updateSearchValue(value) {
    searchText.value = value
    await ensureCatalogLoaded()
    showSuggestions.value = Boolean(normalizedQuery.value) && hasSuggestions.value
  }

  function closeSuggestions() {
    showSuggestions.value = false
  }

  async function goToPeak(peakId) {
    // Quan l'usuari tria un cim o fa Enter sobre una coincidència clara,
    // naveguem directament a la fitxa tècnica del cim.
    closeSuggestions()
    searchText.value = ''

    if (route.name === 'FitxaCim' && route.params.id === peakId) {
      return
    }

    await router.push({ name: 'FitxaCim', params: { id: peakId } })
  }

  async function submitSearch() {
    await ensureCatalogLoaded()

    if (bestPeakMatch.value) {
      await goToPeak(bestPeakMatch.value.id)
      return
    }

    // Si només hi ha coincidència de comarca, no naveguem automàticament,
    // perquè una comarca no té fitxa pròpia. En aquest cas deixem el desplegable
    // visible perquè l'usuari pugui triar un dels cims d'aquella comarca.
    showSuggestions.value = hasSuggestions.value
  }

  function selectPeakSuggestion(peak) {
    return goToPeak(peak.id)
  }

  function selectComarcaSuggestion(comarca) {
    // Quan l'usuari toca el títol de la comarca, deixem el text escrit al camp
    // i mantenim el desplegable obert perquè pugui triar un dels cims d'aquella comarca.
    searchText.value = comarca.label
    showSuggestions.value = true
  }

  // Quan canviem de vista, tanquem el desplegable perquè no quedi "flotant"
  // després d'una navegació.
  watch(
    () => route.fullPath,
    () => {
      closeSuggestions()
    }
  )

  return {
    searchText,
    suggestions,
    hasSuggestions,
    showSuggestions,
    isLoadingCatalog,
    focusSearch,
    updateSearchValue,
    submitSearch,
    closeSuggestions,
    selectPeakSuggestion,
    selectComarcaSuggestion,
  }
}

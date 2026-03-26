// Aquest fitxer existeix per no quedar bloquejats quan backend falla.
// La idea és guardar publicacions temporals al localStorage i poder-les obrir després
// com si fossin una publicació real, encara que no estiguin a la base de dades.
import { peakDetailsMock } from '../mocks/peakDetails'

// Aquesta clau és el nom amb què guardem les publicacions temporals al navegador.
const STORAGE_KEY = 'mock_publications_frontend'

function readStoredMockPublications() {
  try {
    // Llegim les publicacions temporals guardades.
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Si hi ha un error de format, netegem la dada per no deixar l'estat corrupte.
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function writeStoredMockPublications(publications) {
  // Aquesta funció guarda al navegador la versió actualitzada del llistat temporal.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(publications))
}

function normalizePublication(publication, peak) {
  // Aquesta funció adapta una publicació temporal perquè tingui una forma molt semblant
  // a la que retorna backend a GET /publicacions/:id.
  const images = publication.images?.length
    ? publication.images
    : publication.portadaUrl
      ? [{ id: `${publication.id}-cover`, imageUrl: publication.portadaUrl }]
      : []

  return {
    ...publication,
    peak: publication.peak || (peak
      ? {
          id: peak.id,
          nom: peak.nom,
          comarca: peak.comarca,
          alcada: peak.alcada,
        }
      : null),
    images,
    likes: publication.likes || [],
    comments: publication.comments || [],
    stats: {
      likesCount: publication.stats?.likesCount || 0,
      commentsCount: publication.stats?.commentsCount || 0,
      imagesCount: publication.stats?.imagesCount || images.length,
    },
  }
}

export function saveMockPublication(publication) {
  // Si tornem a guardar una publicació amb el mateix id, primer l'eliminem i després la posem al davant.
  // Això ens evita duplicats i ens deixa l'última versió com la més recent.
  const stored = readStoredMockPublications().filter((item) => item.id !== publication.id)
  stored.unshift(publication)
  writeStoredMockPublications(stored)
}

export function findMockPublicationById(id) {
  // Primer intentem trobar la publicació entre les temporals creades per l'usuari.
  const storedPublication = readStoredMockPublications().find((item) => item.id === id)

  if (storedPublication) {
    return normalizePublication(storedPublication, storedPublication.peak)
  }

  // Si no existeix al localStorage, també busquem dins dels mocks de cims
  // perquè així podem obrir publicacions fictícies relacionades amb la fitxa del cim.
  for (const peak of Object.values(peakDetailsMock)) {
    const publication = peak.publications?.find((item) => item.id === id)

    if (publication) {
      return normalizePublication(publication, peak)
    }
  }

  // Si no la trobem enlloc, retornem null.
  return null
}

// Importo el client Prisma centralitzat del projecte.
// D'aquesta manera fem totes les consultes a BD amb la mateixa instancia.
const prisma = require('../../lib/prisma');

// Importo helper per crear errors de domini controlats.
// Ens permet retornar codis funcionals coherents (404, 409, etc.).
const { createAppError } = require('../../common/utils/http-error');

// Missatge unic per mantenir consistencia quan no existeix un usuari.
const USER_NOT_FOUND_MESSAGE = "No s'ha trobat cap usuari amb aquest id";

// Helper intern per comprovar existencia d'usuari.
// L'utilitzo en diversos casos (publications, saved peaks, update) per evitar codi duplicat.
async function ensureUserExists(userId) {
  // Fem consulta minima (nomes id) perque es mes eficient.
  const user = await prisma.usuari.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  // Si no trobem l'usuari, retornem 404 funcional.
  if (!user) {
    throw createAppError(404, 'USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE);
  }
}

// Obtenir perfil public per id.
// IMPORTANT: aqui nomes exposem camps segurs, mai mail ni contrasenyaHash.
async function getPublicUserProfileById(userId) {
  // Seleccio explicita de camps publics.
  const user = await prisma.usuari.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nomUsuari: true,
      nom: true,
      cognom: true,
      fotoPerfil: true,
      createdAt: true
    }
  });

  // Si l'usuari no existeix, retornem 404.
  if (!user) {
    throw createAppError(404, 'USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE);
  }

  // Retornem directament perfil public.
  return user;
}

// Traduccio d'errors d'unicitat de Prisma a codis funcionals de l'API.
function mapUniqueConstraintError(error) {
  // Prisma envia informacio del camp afectat a error.meta.target.
  const target = Array.isArray(error.meta && error.meta.target)
    ? error.meta.target
    : [error.meta && error.meta.target].filter(Boolean);

  // Si la col.lisio es de nomUsuari, retornem el codi acordat.
  if (target.includes('nomUsuari')) {
    return createAppError(409, 'USERNAME_ALREADY_EXISTS', 'Aquest nomUsuari ja esta en us');
  }

  // Fallback generic de conflicte d'unicitat.
  return createAppError(409, 'CONFLICT', 'Conflicte de dades per unicitat');
}

// Actualitzacio del propi perfil.
// Rebem updateData ja validat/normalitzat pel validator.
async function updateOwnProfile(userId, updateData) {
  // Comprovem existencia abans d'actualitzar per tenir 404 clar.
  await ensureUserExists(userId);

  try {
    // Update amb select explicit de camps segurs.
    const updatedUser = await prisma.usuari.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nomUsuari: true,
        nom: true,
        cognom: true,
        fotoPerfil: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Retornem usuari actualitzat en format segur.
    return updatedUser;
  } catch (error) {
    // Error d'unicitat (ex. nomUsuari repetit).
    if (error && error.code === 'P2002') {
      throw mapUniqueConstraintError(error);
    }

    // Prisma pot retornar P2025 si no troba registre a update.
    if (error && error.code === 'P2025') {
      throw createAppError(404, 'USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE);
    }

    // Qualsevol altre error inesperat es propaga cap al controller.
    throw error;
  }
}

// Retorna publicacions publiques d'un usuari.
// Llista ordenada de mes recent a mes antiga segons dataActivitat.
async function getUserPublicationsById(userId) {
  // Primer validem que existeix l'usuari (si no, 404).
  await ensureUserExists(userId);

  // Consulta principal de publicacions amb camps necessaris pel perfil frontend.
  const publications = await prisma.publicacio.findMany({
    where: { usuariId: userId },
    orderBy: { dataActivitat: 'desc' },
    select: {
      id: true,
      titol: true,
      descripcio: true,
      dataActivitat: true,
      dificultat: true,
      distanciaKm: true,
      desnivellPosM: true,
      desnivellNegM: true,
      tempsMin: true,
      altitudMaxM: true,
      altitudMinM: true,
      portadaUrl: true,
      trackUrl: true,
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true,
          imatgeUrl: true
        }
      },
      usuari: {
        select: {
          id: true,
          nomUsuari: true,
          fotoPerfil: true
        }
      },
      _count: {
        select: {
          likes: true,
          comentaris: true,
          imatges: true
        }
      }
    }
  });

  // Transformo la sortida de Prisma al contracte JSON de l'endpoint.
  // Aqui ja deixem preparat:
  // - cim resumit
  // - author resumit
  // - comptadors socials amb noms clars
  return publications.map((publication) => ({
    id: publication.id,
    titol: publication.titol,
    descripcio: publication.descripcio,
    dataActivitat: publication.dataActivitat,
    dificultat: publication.dificultat,
    distanciaKm: publication.distanciaKm,
    desnivellPosM: publication.desnivellPosM,
    desnivellNegM: publication.desnivellNegM,
    tempsMin: publication.tempsMin,
    altitudMaxM: publication.altitudMaxM,
    altitudMinM: publication.altitudMinM,
    portadaUrl: publication.portadaUrl,
    trackUrl: publication.trackUrl,
    cim: {
      id: publication.cim.id,
      nom: publication.cim.nom,
      alcada: publication.cim.alcada,
      comarca: publication.cim.comarca,
      massis: publication.cim.massis,
      imatgeUrl: publication.cim.imatgeUrl
    },
    author: {
      id: publication.usuari.id,
      nomUsuari: publication.usuari.nomUsuari,
      fotoPerfil: publication.usuari.fotoPerfil
    },
    counts: {
      likesCount: publication._count.likes,
      commentsCount: publication._count.comentaris,
      imagesCount: publication._count.imatges
    }
  }));
}

// Retorna cims guardats del propi usuari.
// Nomenclatura acordada:
// - likes => publicacions
// - saved => cims
async function getOwnSavedPeaksById(userId) {
  // Comprovem existencia d'usuari abans de consultar guardats.
  await ensureUserExists(userId);

  // Consulta de cims guardats ordenats per data de guardat (createdAt desc).
  const savedPeaks = await prisma.savedPeak.findMany({
    where: { usuariId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true,
          imatgeUrl: true,
          dificultat: true,
          lat: true,
          lon: true,
          zonaProtegida: true
        }
      }
    }
  });

  // Format final de resposta per /users/:id/saved:
  // [{ savedAt, peak: { ... } }]
  return savedPeaks.map((savedItem) => ({
    savedAt: savedItem.createdAt,
    peak: {
      id: savedItem.cim.id,
      nom: savedItem.cim.nom,
      alcada: savedItem.cim.alcada,
      comarca: savedItem.cim.comarca,
      massis: savedItem.cim.massis,
      imatgeUrl: savedItem.cim.imatgeUrl,
      dificultat: savedItem.cim.dificultat,
      lat: savedItem.cim.lat,
      lon: savedItem.cim.lon,
      zonaProtegida: savedItem.cim.zonaProtegida
    }
  }));
}

// Retorna publicacions a les quals el propi usuari ha donat like.
// IMPORTANT: la consulta surt de LikePublicacio filtrant per usuariId.
async function getOwnLikedPublicationsById(userId) {
  // Comprovem existencia d'usuari abans de consultar likes.
  await ensureUserExists(userId);

  // Consulta likes del usuari amb publicacio relacionada.
  const likedItems = await prisma.likePublicacio.findMany({
    where: { usuariId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      publicacio: {
        select: {
          id: true,
          titol: true,
          descripcio: true,
          dataActivitat: true,
          dificultat: true,
          distanciaKm: true,
          desnivellPosM: true,
          desnivellNegM: true,
          tempsMin: true,
          altitudMaxM: true,
          altitudMinM: true,
          portadaUrl: true,
          trackUrl: true,
          cim: {
            select: {
              id: true,
              nom: true,
              alcada: true,
              comarca: true,
              massis: true,
              imatgeUrl: true
            }
          },
          usuari: {
            select: {
              id: true,
              nomUsuari: true,
              fotoPerfil: true
            }
          },
          _count: {
            select: {
              likes: true,
              comentaris: true,
              imatges: true
            }
          }
        }
      }
    }
  });

  // Map final de sortida de servei per controller.
  return likedItems.map((likeItem) => ({
    likedAt: likeItem.createdAt,
    publication: {
      id: likeItem.publicacio.id,
      titol: likeItem.publicacio.titol,
      descripcio: likeItem.publicacio.descripcio,
      dataActivitat: likeItem.publicacio.dataActivitat,
      dificultat: likeItem.publicacio.dificultat,
      distanciaKm: likeItem.publicacio.distanciaKm,
      desnivellPosM: likeItem.publicacio.desnivellPosM,
      desnivellNegM: likeItem.publicacio.desnivellNegM,
      tempsMin: likeItem.publicacio.tempsMin,
      altitudMaxM: likeItem.publicacio.altitudMaxM,
      altitudMinM: likeItem.publicacio.altitudMinM,
      portadaUrl: likeItem.publicacio.portadaUrl,
      trackUrl: likeItem.publicacio.trackUrl,
      cim: {
        id: likeItem.publicacio.cim.id,
        nom: likeItem.publicacio.cim.nom,
        alcada: likeItem.publicacio.cim.alcada,
        comarca: likeItem.publicacio.cim.comarca,
        massis: likeItem.publicacio.cim.massis,
        imatgeUrl: likeItem.publicacio.cim.imatgeUrl
      },
      author: {
        id: likeItem.publicacio.usuari.id,
        nomUsuari: likeItem.publicacio.usuari.nomUsuari,
        fotoPerfil: likeItem.publicacio.usuari.fotoPerfil
      },
      counts: {
        likesCount: likeItem.publicacio._count.likes,
        commentsCount: likeItem.publicacio._count.comentaris,
        imagesCount: likeItem.publicacio._count.imatges
      }
    }
  }));
}

// Exporto serveis publics del modul users.
module.exports = {
  getPublicUserProfileById,
  updateOwnProfile,
  getUserPublicationsById,
  getOwnSavedPeaksById,
  getOwnLikedPublicationsById
};
// Importo Prisma centralitzat (singleton) per fer consultes a la base de dades.
// Aixo evita crear clients nous a cada request i manté el patró del projecte.
const prisma = require('../../lib/prisma');

// Importo helper per crear errors funcionals controlats.
// Exemple: 404 PEAK_NOT_FOUND quan no existeix el cim.
const { createAppError } = require('../../common/utils/http-error');

// Construeix de forma dinamica el "where" de Prisma per GET /peaks.
// La idea es:
// - nomes afegir condicions que realment s'han enviat
// - mantenir codi clar i facil de mantenir
function buildPeaksWhere(filters) {
  // Anirem acumulant condicions; al final les unirem amb AND.
  const andConditions = [];

  // Filtre de cerca lliure (search): busca parcialment i sense distingir maj/min
  // sobre nom, comarca i massis.
  if (filters.search) {
    andConditions.push({
      OR: [
        { nom: { contains: filters.search, mode: 'insensitive' } },
        { comarca: { contains: filters.search, mode: 'insensitive' } },
        { massis: { contains: filters.search, mode: 'insensitive' } }
      ]
    });
  }

  // Filtre estricte de comarca (equals) case-insensitive.
  if (filters.comarca) {
    andConditions.push({
      comarca: {
        equals: filters.comarca,
        mode: 'insensitive'
      }
    });
  }

  // Filtre estricte de massis (equals) case-insensitive.
  if (filters.massis) {
    andConditions.push({
      massis: {
        equals: filters.massis,
        mode: 'insensitive'
      }
    });
  }

  // Filtre estricte de dificultat (equals) case-insensitive.
  if (filters.dificultat) {
    andConditions.push({
      dificultat: {
        equals: filters.dificultat,
        mode: 'insensitive'
      }
    });
  }

  // Filtre de rang d'alcada (gte/lte) quan s'ha informat algun limit.
  if (filters.minAlcada !== null || filters.maxAlcada !== null) {
    // Objecte intern de Prisma per alcada.
    const alcadaFilter = {};

    // Si hi ha minim, alcada >= min.
    if (filters.minAlcada !== null) {
      alcadaFilter.gte = filters.minAlcada;
    }

    // Si hi ha maxim, alcada <= max.
    if (filters.maxAlcada !== null) {
      alcadaFilter.lte = filters.maxAlcada;
    }

    // Afegeixo condicio combinada d'alcada.
    andConditions.push({ alcada: alcadaFilter });
  }

  // Si no hi ha cap condicio, retornem where buit ({}) per obtenir tot el cataleg.
  if (!andConditions.length) {
    return {};
  }

  // Retornem un AND amb totes les condicions construides.
  return { AND: andConditions };
}

// Servei de GET /peaks.
// Retorna un llistat simple i lleuger, ideal per cataleg/home/mapa/cerca.
async function getPeaksList(filters) {
  // Construim filtre where i ordre dinamic segons validators.
  const where = buildPeaksWhere(filters);
  const orderBy = { [filters.sortBy]: filters.sortOrder };

  // Consulta principal:
  // - select nomes els camps necessaris
  // - _count per calcular stats sense carregar relacions completes
  const peaks = await prisma.cim.findMany({
    where,
    orderBy,
    select: {
      id: true,
      nom: true,
      alcada: true,
      comarca: true,
      massis: true,
      dificultat: true,
      lat: true,
      lon: true,
      imatgeUrl: true,
      zonaProtegida: true,
      _count: {
        select: {
          publicacions: true,
          rutesPlanificades: true,
          favoritsCims: true
        }
      }
    }
  });

  // Transformo la sortida de Prisma al contracte JSON estable de l'endpoint.
  // IMPORTANT: mantenim claus exactes demanades (peaks[i].stats.*).
  return peaks.map((peak) => ({
    id: peak.id,
    nom: peak.nom,
    alcada: peak.alcada,
    comarca: peak.comarca,
    massis: peak.massis,
    dificultat: peak.dificultat,
    lat: peak.lat,
    lon: peak.lon,
    imatgeUrl: peak.imatgeUrl,
    zonaProtegida: peak.zonaProtegida,
    stats: {
      publicacionsCount: peak._count.publicacions,
      rutesCount: peak._count.rutesPlanificades,
      favoritsCount: peak._count.favoritsCims
    }
  }));
}

// Servei de GET /peaks/:id.
// Retorna una fitxa rica del cim amb dades base, stats, rutes i publicacions resumides.
async function getPeakDetailById(id) {
  // Fem findUnique per id (sense slugs nous, tal com s'ha demanat).
  // Fem select explicit per controlar exactament que exposem a API.
  const peak = await prisma.cim.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      alcada: true,
      comarca: true,
      lat: true,
      lon: true,
      dificultat: true,
      descripcio: true,
      imatgeUrl: true,
      massis: true,
      zonaProtegida: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          publicacions: true,
          rutesPlanificades: true,
          favoritsCims: true
        }
      },
      // Incloem rutes vinculades al cim amb ordre estable.
      rutesPlanificades: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          nom: true,
          tipusActivitat: true,
          ritme: true,
          distanciaKm: true,
          desnivellPosM: true,
          desnivellNegM: true,
          tempsMin: true,
          altitudMaxM: true,
          altitudMinM: true,
          trackUrl: true,
          notes: true,
          // Dins cada ruta, incloem punts ordenats ascendentment per ordreIndex.
          puntsRuta: {
            orderBy: { ordreIndex: 'asc' },
            select: {
              id: true,
              etiqueta: true,
              nomPunt: true,
              lat: true,
              lon: true,
              ordreIndex: true
            }
          }
        }
      },
      // Incloem publicacions del cim amb dades resumides d'autor i comptadors.
      publicacions: {
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
          trackUrl: true,
          portadaUrl: true,
          // Autor resumit: no exposem camps sensibles.
          usuari: {
            select: {
              id: true,
              nomUsuari: true,
              nom: true,
              cognom: true,
              fotoPerfil: true
            }
          },
          // Comptadors socials de la publicacio.
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

  // Si no existeix el cim, retornem error funcional 404 coherent amb requisit.
  if (!peak) {
    throw createAppError(404, 'PEAK_NOT_FOUND', "No s'ha trobat cap cim amb aquest id");
  }

  // Mapeig final de Prisma -> contracte API de detall.
  // Observacio: Prisma ja retorna arrays buits quan no hi ha relacions,
  // per tant routes/publications/points es mantenen sempre com arrays.
  return {
    id: peak.id,
    nom: peak.nom,
    alcada: peak.alcada,
    comarca: peak.comarca,
    lat: peak.lat,
    lon: peak.lon,
    dificultat: peak.dificultat,
    descripcio: peak.descripcio,
    imatgeUrl: peak.imatgeUrl,
    massis: peak.massis,
    zonaProtegida: peak.zonaProtegida,
    createdAt: peak.createdAt,
    updatedAt: peak.updatedAt,
    stats: {
      publicacionsCount: peak._count.publicacions,
      rutesCount: peak._count.rutesPlanificades,
      favoritsCount: peak._count.favoritsCims
    },
    // Resum de rutes vinculades al cim.
    routes: peak.rutesPlanificades.map((route) => ({
      id: route.id,
      nom: route.nom,
      tipusActivitat: route.tipusActivitat,
      ritme: route.ritme,
      distanciaKm: route.distanciaKm,
      desnivellPosM: route.desnivellPosM,
      desnivellNegM: route.desnivellNegM,
      tempsMin: route.tempsMin,
      altitudMaxM: route.altitudMaxM,
      altitudMinM: route.altitudMinM,
      trackUrl: route.trackUrl,
      notes: route.notes,
      // Dades de punts de la ruta (ordenats per ordreIndex asc a la query).
      points: route.puntsRuta.map((point) => ({
        id: point.id,
        etiqueta: point.etiqueta,
        nomPunt: point.nomPunt,
        lat: point.lat,
        lon: point.lon,
        ordreIndex: point.ordreIndex
      }))
    })),
    // Resum de publicacions associades al cim.
    publications: peak.publicacions.map((publication) => ({
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
      trackUrl: publication.trackUrl,
      portadaUrl: publication.portadaUrl,
      // Autor resumit per UI de detall.
      author: {
        id: publication.usuari.id,
        nomUsuari: publication.usuari.nomUsuari,
        nom: publication.usuari.nom,
        cognom: publication.usuari.cognom,
        fotoPerfil: publication.usuari.fotoPerfil
      },
      // Stats socials calculades via _count.
      stats: {
        likesCount: publication._count.likes,
        commentsCount: publication._count.comentaris,
        imagesCount: publication._count.imatges
      }
    }))
  };
}

// Exporto serveis per usar-los al controller.
module.exports = {
  getPeaksList,
  getPeakDetailById
};

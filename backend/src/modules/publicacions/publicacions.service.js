// Importo instancia Prisma centralitzada del projecte.
// Des d'aqui fem totes les lectures/escriptures a base de dades.
const prisma = require('../../lib/prisma');

// Helper per crear errors de negoci amb format coherent.
const { createAppError } = require('../../common/utils/http-error');

// Helper per esborrar fitxers d'uploads de forma segura.
// El farem servir quan eliminem imatges associades a una publicacio.
const { safeDeleteUploadByUrl } = require('../../common/utils/upload-files');

// Comprovacio de negoci: el cim referenciat ha d'existir.
// Si no existeix, parem el flux amb error 404.
async function ensurePeakExists(cimId) {
  const peak = await prisma.cim.findUnique({
    where: { id: cimId },
    select: { id: true }
  });

  if (!peak) {
    throw createAppError(404, 'PEAK_NOT_FOUND', 'No s ha trobat cap cim amb aquest id');
  }
}

// Comprovacio de negoci: si s'informa rutaPlanificadaId, aquesta ruta:
// 1) ha d'existir
// 2) ha de ser propietat de l'usuari autenticat
//
// Aixi evitem que un usuari publiqui una activitat vinculant una ruta d'un altre.
async function ensureOwnedRouteOrThrow(rutaPlanificadaId, userId) {
  // Si no hi ha ruta associada, no cal validar res.
  if (!rutaPlanificadaId) {
    return;
  }

  const route = await prisma.rutaPlanificada.findUnique({
    where: { id: rutaPlanificadaId },
    select: { id: true, usuariId: true }
  });

  if (!route) {
    throw createAppError(404, 'ROUTE_NOT_FOUND', 'No s ha trobat cap ruta amb aquest id');
  }

  if (route.usuariId !== userId) {
    throw createAppError(403, 'FORBIDDEN_NOT_OWNER', 'La ruta no pertany a l usuari autenticat');
  }
}

// Mapper petit d'usuari per no repetir codi i no exposar camps sensibles.
function mapAuthorSummary(user) {
  return {
    id: user.id,
    nomUsuari: user.nomUsuari,
    nom: user.nom,
    cognom: user.cognom,
    fotoPerfil: user.fotoPerfil
  };
}

// Mapper resumit de cim per respostes de publicacions.
function mapPeakSummary(peak) {
  return {
    id: peak.id,
    nom: peak.nom,
    alcada: peak.alcada,
    comarca: peak.comarca,
    massis: peak.massis,
    dificultat: peak.dificultat,
    imatgeUrl: peak.imatgeUrl
  };
}

// Mapper d'imatge de publicacio.
function mapImage(image) {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    ordreIndex: image.ordreIndex,
    createdAt: image.createdAt
  };
}

// Mapper de comptadors socials.
// Convertim noms interns Prisma a noms de contracte API.
function mapStats(counts) {
  return {
    likesCount: counts.likes,
    commentsCount: counts.comentaris,
    imagesCount: counts.imatges
  };
}

// Mapper de llistat (GET /publicacions).
// Inclou camps rellevants pero en format lleuger.
function mapPublicationListItem(publication) {
  return {
    id: publication.id,
    titol: publication.titol,
    descripcio: publication.descripcio,
    dataActivitat: publication.dataActivitat,
    tipusActivitat: publication.tipusActivitat,
    dificultat: publication.dificultat,
    distanciaKm: publication.distanciaKm,
    desnivellPosM: publication.desnivellPosM,
    desnivellNegM: publication.desnivellNegM,
    tempsMin: publication.tempsMin,
    altitudMaxM: publication.altitudMaxM,
    altitudMinM: publication.altitudMinM,
    trackUrl: publication.trackUrl,
    portadaUrl: publication.portadaUrl,
    createdAt: publication.createdAt,
    updatedAt: publication.updatedAt,
    author: {
      id: publication.usuari.id,
      nomUsuari: publication.usuari.nomUsuari,
      nom: publication.usuari.nom,
      cognom: publication.usuari.cognom,
      fotoPerfil: publication.usuari.fotoPerfil
    },
    peak: mapPeakSummary(publication.cim),
    images: publication.imatges.map(mapImage),
    stats: mapStats(publication._count)
  };
}

// Mapper de detall (GET /publicacions/:id).
// Inclou relacions extres: ruta, likes i comentaris complets.
function mapPublicationDetail(publication) {
  return {
    id: publication.id,
    titol: publication.titol,
    descripcio: publication.descripcio,
    dataActivitat: publication.dataActivitat,
    tipusActivitat: publication.tipusActivitat,
    dificultat: publication.dificultat,
    distanciaKm: publication.distanciaKm,
    desnivellPosM: publication.desnivellPosM,
    desnivellNegM: publication.desnivellNegM,
    tempsMin: publication.tempsMin,
    altitudMaxM: publication.altitudMaxM,
    altitudMinM: publication.altitudMinM,
    trackUrl: publication.trackUrl,
    portadaUrl: publication.portadaUrl,
    createdAt: publication.createdAt,
    updatedAt: publication.updatedAt,
    author: mapAuthorSummary(publication.usuari),
    peak: mapPeakSummary(publication.cim),
    route: publication.rutaPlanificada
      ? {
          id: publication.rutaPlanificada.id,
          nom: publication.rutaPlanificada.nom,
          tipusActivitat: publication.rutaPlanificada.tipusActivitat,
          ritme: publication.rutaPlanificada.ritme,
          distanciaKm: publication.rutaPlanificada.distanciaKm,
          desnivellPosM: publication.rutaPlanificada.desnivellPosM,
          desnivellNegM: publication.rutaPlanificada.desnivellNegM,
          tempsMin: publication.rutaPlanificada.tempsMin,
          altitudMaxM: publication.rutaPlanificada.altitudMaxM,
          altitudMinM: publication.rutaPlanificada.altitudMinM,
          trackUrl: publication.rutaPlanificada.trackUrl,
          notes: publication.rutaPlanificada.notes
        }
      : null,
    images: publication.imatges.map(mapImage),
    likes: publication.likes.map((likeItem) => ({
      likedAt: likeItem.createdAt,
      user: mapAuthorSummary(likeItem.usuari)
    })),
    comments: publication.comentaris.map((comment) => ({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: mapAuthorSummary(comment.usuari)
    })),
    stats: mapStats(publication._count)
  };
}

// Helper intern de lectura per id.
// Si no existeix la publicacio, llancem 404 funcional.
// Aquest helper centralitza el select per no duplicar-lo.
async function getPublicationByIdOrThrow(publicationId) {
  const publication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: {
      id: true,
      usuariId: true,
      titol: true,
      descripcio: true,
      dataActivitat: true,
      tipusActivitat: true,
      dificultat: true,
      distanciaKm: true,
      desnivellPosM: true,
      desnivellNegM: true,
      tempsMin: true,
      altitudMaxM: true,
      altitudMinM: true,
      trackUrl: true,
      portadaUrl: true,
      createdAt: true,
      updatedAt: true,
      usuari: {
        select: {
          id: true,
          nomUsuari: true,
          nom: true,
          cognom: true,
          fotoPerfil: true
        }
      },
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true,
          dificultat: true,
          imatgeUrl: true
        }
      },
      rutaPlanificada: {
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
          notes: true
        }
      },
      imatges: {
        orderBy: { ordreIndex: 'asc' },
        select: {
          id: true,
          imageUrl: true,
          ordreIndex: true,
          createdAt: true
        }
      },
      likes: {
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          usuari: {
            select: {
              id: true,
              nomUsuari: true,
              nom: true,
              cognom: true,
              fotoPerfil: true
            }
          }
        }
      },
      comentaris: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          text: true,
          createdAt: true,
          updatedAt: true,
          usuari: {
            select: {
              id: true,
              nomUsuari: true,
              nom: true,
              cognom: true,
              fotoPerfil: true
            }
          }
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

  if (!publication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', 'No s ha trobat cap publicacio amb aquest id');
  }

  return publication;
}

// Servei de creacio de publicacio (POST /publicacions).
// Flux:
// 1) validar referencies (cim i ruta)
// 2) crear publicacio + imatges
// 3) retornar detall complet
async function createPublication(userId, payload) {
  // Regla: el cim ha d'existir.
  await ensurePeakExists(payload.cimId);
  // Regla: si hi ha ruta associada, ha de ser de l'usuari autenticat.
  await ensureOwnedRouteOrThrow(payload.rutaPlanificadaId || null, userId);

  const created = await prisma.publicacio.create({
    data: {
      // Claus foranes i camps base.
      usuariId: userId,
      cimId: payload.cimId,
      rutaPlanificadaId: payload.rutaPlanificadaId || null,
      titol: payload.titol,
      descripcio: payload.descripcio,
      dataActivitat: payload.dataActivitat,
      tipusActivitat: payload.tipusActivitat,
      dificultat: payload.dificultat,
      distanciaKm: payload.distanciaKm,
      desnivellPosM: payload.desnivellPosM,
      desnivellNegM: payload.desnivellNegM,
      tempsMin: payload.tempsMin,
      altitudMaxM: payload.altitudMaxM,
      altitudMinM: payload.altitudMinM,
      trackUrl: payload.trackUrl || null,
      // Politica de portada: primera imatge del array d'entrada.
      portadaUrl: payload.imageUrls[0],
      imatges: {
        // Creem totes les imatges en cascada amb ordreIndex incremental.
        create: payload.imageUrls.map((imageUrl, index) => ({
          imageUrl,
          ordreIndex: index
        }))
      }
    },
    select: { id: true }
  });
  // Retornem objecte ric i homogeni amb el mateix mapper de detall.
  const detail = await getPublicationDetailById(created.id);

  // Punt d'extensio: evaluacio de badges en segon pla.
  // No ha d'interrompre la creacio de la publicacio si falla.
  try {
    // Require dinamic per evitar possibles cycles a l'inici.
    // eslint-disable-next-line global-require
    const { evaluateAndAssignBadges } = require('../badges/badges.service');
    // No fem await bloquejant important; fem await pero capturem errors.
    await evaluateAndAssignBadges(userId).catch((err) => {
      // Important deixar rastre de l'error per debugeig.
      // No llanquem cap error al client.
      // eslint-disable-next-line no-console
      console.error('Badge evaluation failed after publication creation:', err);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Badge evaluation module error:', err);
  }

  return detail;
}

// Servei de llistat public (GET /publicacions).
// Accepta filtres opcionals per cim, usuari i tipusActivitat.
async function listPublicacions(filters) {
  // Construim where de forma dinamica segons query valida.
  const where = {};
  if (filters.cimId) {
    where.cimId = filters.cimId;
  }
  if (filters.usuariId) {
    where.usuariId = filters.usuariId;
  }
  if (filters.tipusActivitat) {
    // equals + insensitive per filtrar sense importar majuscules/minuscules.
    where.tipusActivitat = {
      equals: filters.tipusActivitat,
      mode: 'insensitive'
    };
  }

  const publications = await prisma.publicacio.findMany({
    where,
    orderBy: { dataActivitat: 'desc' },
    select: {
      id: true,
      titol: true,
      descripcio: true,
      dataActivitat: true,
      tipusActivitat: true,
      dificultat: true,
      distanciaKm: true,
      desnivellPosM: true,
      desnivellNegM: true,
      tempsMin: true,
      altitudMaxM: true,
      altitudMinM: true,
      trackUrl: true,
      portadaUrl: true,
      createdAt: true,
      updatedAt: true,
      usuari: {
        select: {
          id: true,
          nomUsuari: true,
          nom: true,
          cognom: true,
          fotoPerfil: true
        }
      },
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true,
          dificultat: true,
          imatgeUrl: true
        }
      },
      imatges: {
        orderBy: { ordreIndex: 'asc' },
        select: {
          id: true,
          imageUrl: true,
          ordreIndex: true,
          createdAt: true
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

  // Mapegem cada registre al contracte de resposta del llistat.
  return publications.map(mapPublicationListItem);
}

// Servei de detall (GET /publicacions/:id).
async function getPublicationDetailById(publicationId) {
  const publication = await getPublicationByIdOrThrow(publicationId);
  return mapPublicationDetail(publication);
}

// Servei d'update (PUT /publicacions/:id).
// Te la part mes sensible de negoci: permisos + consistencia d'imatges.
async function updatePublication(publicationId, userId, payload) {
  // Carreguem l'estat actual minim necessari per validar permisos i imatges.
  const existingPublication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: {
      id: true,
      usuariId: true,
      imatges: {
        orderBy: { ordreIndex: 'asc' },
        select: {
          id: true,
          imageUrl: true,
          ordreIndex: true
        }
      }
    }
  });

  if (!existingPublication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', 'No s ha trobat cap publicacio amb aquest id');
  }

  // Regla de seguretat: nomes propietari pot editar.
  if (existingPublication.usuariId !== userId) {
    throw createAppError(403, 'FORBIDDEN_NOT_OWNER', 'No tens permisos per modificar aquesta publicacio');
  }

  // Si venen canvis de cim, validem que existeixi.
  if (Object.prototype.hasOwnProperty.call(payload.updateData, 'cimId')) {
    await ensurePeakExists(payload.updateData.cimId);
  }

  // Si ve canvi de ruta, validem propietat/existencia.
  if (Object.prototype.hasOwnProperty.call(payload.updateData, 'rutaPlanificadaId')) {
    await ensureOwnedRouteOrThrow(payload.updateData.rutaPlanificadaId, userId);
  }

  // Preparem estructura rapida per saber quines imatges eliminar.
  const deleteImageIdsSet = new Set(payload.deleteImageIds);
  // Imatges actuals que s'han demanat eliminar.
  const imagesToDelete = existingPublication.imatges.filter((image) => deleteImageIdsSet.has(image.id));
  // Imatges actuals que es conserven.
  const remainingImages = existingPublication.imatges.filter((image) => !deleteImageIdsSet.has(image.id));

  // Regla funcional: una publicacio ha de tenir almenys 1 imatge final.
  const finalImagesCount = remainingImages.length + payload.newImageUrls.length;
  if (finalImagesCount < 1) {
    throw createAppError(400, 'INVALID_BODY', 'Una publicacio ha de tenir almenys una imatge');
  }

  // Guardem URLs per esborrar fitxers del disc un cop acabi la transaccio.
  const deletedImageUrls = imagesToDelete.map((image) => image.imageUrl);

  // Fem update en transaccio per mantenir consistencia BD.
  await prisma.$transaction(async (tx) => {
    // 1) Actualitzem camps de la publicacio.
    await tx.publicacio.update({
      where: { id: publicationId },
      data: payload.updateData
    });

    // 2) Esborrem registres d'imatges marcades per eliminar.
    if (imagesToDelete.length) {
      await tx.imatgePublicacio.deleteMany({
        where: {
          publicacioId: publicationId,
          id: { in: imagesToDelete.map((image) => image.id) }
        }
      });
    }

    // 3) Creem imatges noves al final de la cua actual.
    const createdImages = [];
    for (let index = 0; index < payload.newImageUrls.length; index += 1) {
      const created = await tx.imatgePublicacio.create({
        data: {
          publicacioId: publicationId,
          imageUrl: payload.newImageUrls[index],
          ordreIndex: remainingImages.length + index
        },
        select: {
          id: true,
          imageUrl: true,
          ordreIndex: true
        }
      });

      createdImages.push(created);
    }

    // 4) Muntem l'ordre final de les imatges.
    const finalImages = [...remainingImages, ...createdImages];

    // 5) Reindexem ordreIndex per deixar seqüencia neta 0..N-1.
    for (let index = 0; index < finalImages.length; index += 1) {
      await tx.imatgePublicacio.update({
        where: { id: finalImages[index].id },
        data: { ordreIndex: index }
      });
    }

    // 6) Recalculem portadaUrl segons primera imatge final.
    await tx.publicacio.update({
      where: { id: publicationId },
      data: {
        portadaUrl: finalImages[0].imageUrl
      }
    });
  });

  // Esborrem fitxers de disc fora de la transaccio de BD.
  // Si algun no existeix, el helper ja ho ignora de forma segura.
  await Promise.all(deletedImageUrls.map((url) => safeDeleteUploadByUrl(url)));

  // Retornem detall actualitzat complet.
  return getPublicationDetailById(publicationId);
}

// Servei d'esborrat (DELETE /publicacions/:id).
// Elimina registre i neteja fitxers associats.
async function deletePublication(publicationId, userId) {
  // Carreguem dades minimes per validar permisos i saber quins fitxers esborrar.
  const existingPublication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: {
      id: true,
      usuariId: true,
      portadaUrl: true,
      imatges: {
        select: {
          imageUrl: true
        }
      }
    }
  });

  if (!existingPublication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', 'No s ha trobat cap publicacio amb aquest id');
  }

  // Mateixa regla de seguretat: nomes propietari.
  if (existingPublication.usuariId !== userId) {
    throw createAppError(403, 'FORBIDDEN_NOT_OWNER', 'No tens permisos per eliminar aquesta publicacio');
  }

  // 1) Esborrem la publicacio de BD.
  await prisma.publicacio.delete({
    where: { id: publicationId }
  });

  // 2) Recollim totes les URLs candidates a esborrar del disc.
  // Incloem imatges secundaries i portada.
  const imageUrls = [
    ...existingPublication.imatges.map((image) => image.imageUrl),
    existingPublication.portadaUrl
  ].filter(Boolean);

  // 3) Esborrat fisic (safe) dels fitxers.
  await Promise.all(imageUrls.map((url) => safeDeleteUploadByUrl(url)));
}

// Exportem serveis per ser cridats des del controller.
module.exports = {
  createPublication,
  listPublicacions,
  getPublicationDetailById,
  updatePublication,
  deletePublication
};

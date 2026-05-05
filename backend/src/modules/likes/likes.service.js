const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');

// Comprovacio comuna: la publicacio objectiu ha d'existir.
async function ensurePublicationExists(publicationId) {
  const publication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: { id: true }
  });

  if (!publication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', 'No s ha trobat cap publicacio amb aquest id');
  }
}

// Compta likes actuals d'una publicacio per retornar estat actualitzat al client.
async function getPublicationLikesCount(publicationId) {
  return prisma.likePublicacio.count({
    where: { publicacioId: publicationId }
  });
}

// POST /publicacions/:id/likes
// Crea like explicit (no toggle) i falla amb 409 si ja existeix.
async function addLikeToPublication(publicationId, authUser) {
  if (!authUser || !authUser.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  await ensurePublicationExists(publicationId);

  const existingLike = await prisma.likePublicacio.findUnique({
    where: {
      usuariId_publicacioId: {
        usuariId: authUser.userId,
        publicacioId: publicationId
      }
    },
    select: {
      usuariId: true,
      publicacioId: true
    }
  });

  if (existingLike) {
    throw createAppError(409, 'LIKE_ALREADY_EXISTS', 'Aquest usuari ja ha donat like a la publicacio');
  }

  try {
    await prisma.likePublicacio.create({
      data: {
        usuariId: authUser.userId,
        publicacioId: publicationId
      }
    });
  } catch (error) {
    // Defensa extra per condicio de carrera si dos likes entren a la vegada.
    if (error && error.code === 'P2002') {
      throw createAppError(409, 'LIKE_ALREADY_EXISTS', 'Aquest usuari ja ha donat like a la publicacio');
    }

    throw error;
  }

  const likesCount = await getPublicationLikesCount(publicationId);

  return {
    publicationId,
    likedByMe: true,
    likesCount
  };
}

// DELETE /publicacions/:id/likes
// Elimina like explicit i falla amb 404 si no existeix.
async function removeLikeFromPublication(publicationId, authUser) {
  if (!authUser || !authUser.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  await ensurePublicationExists(publicationId);

  const existingLike = await prisma.likePublicacio.findUnique({
    where: {
      usuariId_publicacioId: {
        usuariId: authUser.userId,
        publicacioId: publicationId
      }
    },
    select: {
      usuariId: true,
      publicacioId: true
    }
  });

  if (!existingLike) {
    throw createAppError(404, 'LIKE_NOT_FOUND', 'No hi ha cap like d aquest usuari per aquesta publicacio');
  }

  await prisma.likePublicacio.delete({
    where: {
      usuariId_publicacioId: {
        usuariId: authUser.userId,
        publicacioId: publicationId
      }
    }
  });

  const likesCount = await getPublicationLikesCount(publicationId);

  return {
    publicationId,
    likedByMe: false,
    likesCount
  };
}

module.exports = {
  addLikeToPublication,
  removeLikeFromPublication
};

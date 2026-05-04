const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');

function mapCommentAuthor(user) {
  return {
    id: user.id,
    nomUsuari: user.nomUsuari,
    nom: user.nom,
    cognom: user.cognom,
    fotoPerfil: user.fotoPerfil
  };
}

function mapComment(comment) {
  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: mapCommentAuthor(comment.usuari)
  };
}

async function ensurePublicationExists(publicationId) {
  const publication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: { id: true }
  });

  if (!publication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', 'No s ha trobat cap publicacio amb aquest id');
  }
}

async function getPublicationCommentsCount(publicationId) {
  return prisma.comentari.count({
    where: { publicacioId: publicationId }
  });
}

// GET /publicacions/:id/comments
async function listCommentsByPublicationId(publicationId) {
  await ensurePublicationExists(publicationId);

  const comments = await prisma.comentari.findMany({
    where: { publicacioId: publicationId },
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
  });

  return comments.map(mapComment);
}

// POST /publicacions/:id/comments
async function createCommentOnPublication(publicationId, authUser, payload) {
  if (!authUser || !authUser.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  await ensurePublicationExists(publicationId);

  const createdComment = await prisma.comentari.create({
    data: {
      publicacioId: publicationId,
      usuariId: authUser.userId,
      text: payload.text
    },
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
  });

  const commentsCount = await getPublicationCommentsCount(publicationId);

  return {
    comment: mapComment(createdComment),
    commentsCount
  };
}

// DELETE /comments/:id
// Permes nomes per: propietari de la publicacio o admin.
async function deleteCommentById(commentId, authUser) {
  if (!authUser || !authUser.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  const existingComment = await prisma.comentari.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      publicacioId: true,
      publicacio: {
        select: {
          usuariId: true
        }
      }
    }
  });

  if (!existingComment) {
    throw createAppError(404, 'COMMENT_NOT_FOUND', 'No s ha trobat cap comentari amb aquest id');
  }

  const isPublicationOwner = authUser.userId === existingComment.publicacio.usuariId;
  const isAdmin = authUser.rol === 'admin';

  if (!isPublicationOwner && !isAdmin) {
    throw createAppError(
      403,
      'FORBIDDEN_COMMENT_DELETE',
      'No tens permisos per eliminar aquest comentari'
    );
  }

  const publicationId = existingComment.publicacioId;

  const [, commentsCount] = await prisma.$transaction([
    prisma.comentari.delete({
      where: { id: commentId }
    }),
    prisma.comentari.count({
      where: { publicacioId: publicationId }
    })
  ]);

  return {
    commentId,
    publicationId,
    commentsCount
  };
}

module.exports = {
  listCommentsByPublicationId,
  createCommentOnPublication,
  deleteCommentById
};

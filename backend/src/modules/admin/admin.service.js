const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');
const { safeDeleteUploadByUrl } = require('../../common/utils/upload-files');

const SENSITIVE_TERMS = ['idiota', 'imbecil', 'gilipollas', 'puta', 'mierda', 'subnormal'];

function mapAdminComment(row) {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    author: {
      id: row.usuari.id,
      nomUsuari: row.usuari.nomUsuari,
      nom: row.usuari.nom
    },
    publication: {
      id: row.publicacio.id,
      titol: row.publicacio.titol,
      usuariId: row.publicacio.usuariId
    }
  };
}

function mapAdminPublication(row) {
  return {
    id: row.id,
    titol: row.titol,
    descripcio: row.descripcio,
    createdAt: row.createdAt,
    author: {
      id: row.usuari.id,
      nomUsuari: row.usuari.nomUsuari
    },
    peak: {
      id: row.cim.id,
      nom: row.cim.nom
    },
    stats: {
      likesCount: row._count.likes,
      commentsCount: row._count.comentaris
    }
  };
}

function mapAdminUser(row) {
  return {
    id: row.id,
    nomUsuari: row.nomUsuari,
    nom: row.nom,
    cognom: row.cognom,
    mail: row.mail,
    rol: row.rol,
    createdAt: row.createdAt,
    stats: {
      publicationsCount: row._count.publicacions,
      commentsCount: row._count.comentaris,
      likesCount: row._count.likesPublicacions
    }
  };
}

function hasSensitiveText(text) {
  const normalized = String(text || '').toLowerCase();
  return SENSITIVE_TERMS.some((term) => normalized.includes(term));
}

async function getAdminComments(filters) {
  const where = {};

  if (filters.q) {
    where.OR = [
      { text: { contains: filters.q, mode: 'insensitive' } },
      { usuari: { nomUsuari: { contains: filters.q, mode: 'insensitive' } } },
      { publicacio: { titol: { contains: filters.q, mode: 'insensitive' } } }
    ];
  }

  if (filters.user) {
    where.usuari = {
      nomUsuari: { contains: filters.user, mode: 'insensitive' }
    };
  }

  if (filters.publication) {
    where.publicacio = {
      titol: { contains: filters.publication, mode: 'insensitive' }
    };
  }

  let comments = await prisma.comentari.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      text: true,
      createdAt: true,
      usuari: { select: { id: true, nomUsuari: true, nom: true } },
      publicacio: { select: { id: true, titol: true, usuariId: true } }
    }
  });

  if (filters.containsSensitive === true) {
    comments = comments.filter((comment) => hasSensitiveText(comment.text));
  }

  return comments.map(mapAdminComment);
}

async function getAdminPublicacions(filters) {
  const where = {};

  if (filters.q) {
    where.OR = [
      { titol: { contains: filters.q, mode: 'insensitive' } },
      { descripcio: { contains: filters.q, mode: 'insensitive' } },
      { usuari: { nomUsuari: { contains: filters.q, mode: 'insensitive' } } },
      { cim: { nom: { contains: filters.q, mode: 'insensitive' } } }
    ];
  }

  if (filters.user) {
    where.usuari = {
      nomUsuari: { contains: filters.user, mode: 'insensitive' }
    };
  }

  if (filters.peak) {
    where.cim = {
      nom: { contains: filters.peak, mode: 'insensitive' }
    };
  }

  const publications = await prisma.publicacio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titol: true,
      descripcio: true,
      createdAt: true,
      usuari: { select: { id: true, nomUsuari: true } },
      cim: { select: { id: true, nom: true } },
      _count: { select: { likes: true, comentaris: true } }
    }
  });

  return publications.map(mapAdminPublication);
}

async function getAdminUsers(filters) {
  const where = {};

  if (filters.q) {
    where.OR = [
      { nomUsuari: { contains: filters.q, mode: 'insensitive' } },
      { nom: { contains: filters.q, mode: 'insensitive' } },
      { cognom: { contains: filters.q, mode: 'insensitive' } },
      { mail: { contains: filters.q, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.usuari.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nomUsuari: true,
      nom: true,
      cognom: true,
      mail: true,
      rol: true,
      createdAt: true,
      _count: {
        select: {
          publicacions: true,
          comentaris: true,
          likesPublicacions: true
        }
      }
    }
  });

  return users.map(mapAdminUser);
}

async function updateAdminUserRole(userId, payload, authUserId) {
  if (userId === authUserId && payload.rol !== 'admin') {
    throw createAppError(400, 'VALIDATION_ERROR', 'No et pots treure el rol admin a tu mateix');
  }

  try {
    const user = await prisma.usuari.update({
      where: { id: userId },
      data: { rol: payload.rol },
      select: {
        id: true,
        nomUsuari: true,
        nom: true,
        cognom: true,
        mail: true,
        rol: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    if (error && error.code === 'P2025') {
      throw createAppError(404, 'USER_NOT_FOUND', "No s'ha trobat cap usuari amb aquest id");
    }
    throw error;
  }
}

async function deleteAdminPublication(publicationId) {
  const publication = await prisma.publicacio.findUnique({
    where: { id: publicationId },
    select: {
      id: true,
      portadaUrl: true,
      imatges: { select: { imageUrl: true } }
    }
  });

  if (!publication) {
    throw createAppError(404, 'PUBLICATION_NOT_FOUND', "No s'ha trobat cap publicacio amb aquest id");
  }

  await prisma.publicacio.delete({ where: { id: publicationId } });

  const imageUrls = [
    ...publication.imatges.map((item) => item.imageUrl),
    publication.portadaUrl
  ].filter(Boolean);
  await Promise.all(imageUrls.map((url) => safeDeleteUploadByUrl(url)));

  return { id: publicationId };
}

async function deleteAdminUser(userId, authUserId) {
  if (userId === authUserId) {
    throw createAppError(400, 'VALIDATION_ERROR', 'No et pots eliminar a tu mateix');
  }

  try {
    await prisma.usuari.delete({
      where: { id: userId }
    });

    return { id: userId };
  } catch (error) {
    if (error && error.code === 'P2025') {
      throw createAppError(404, 'USER_NOT_FOUND', "No s'ha trobat cap usuari amb aquest id");
    }
    throw error;
  }
}

async function getAdminSearch(q) {
  const query = String(q || '').trim();
  if (!query) {
    return {
      comments: [],
      publicacions: [],
      users: [],
      peaks: []
    };
  }

  const [comments, publicacions, users, peaks] = await Promise.all([
    getAdminComments({ q: query, user: null, publication: null, containsSensitive: null }),
    getAdminPublicacions({ q: query, user: null, peak: null }),
    getAdminUsers({ q: query }),
    prisma.cim.findMany({
      where: {
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { comarca: { contains: query, mode: 'insensitive' } },
          { massis: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { nom: 'asc' },
      take: 20,
      select: { id: true, nom: true, comarca: true, massis: true, alcada: true }
    })
  ]);

  return {
    comments: comments.slice(0, 20),
    publicacions: publicacions.slice(0, 20),
    users: users.slice(0, 20),
    peaks
  };
}

module.exports = {
  getAdminComments,
  getAdminPublicacions,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminPublication,
  deleteAdminUser,
  getAdminSearch
};

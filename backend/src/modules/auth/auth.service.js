// Importo el client Prisma centralitzat per parlar amb la BD.
const prisma = require('../../lib/prisma');

// Helpers de seguretat per contrasenya.
const { hashPassword, comparePassword } = require('../../common/utils/password');

// Helper de JWT per signar token d'acces.
const { signAccessToken } = require('../../common/utils/jwt');

// Helper de creacio d'errors controlats.
const { createAppError } = require('../../common/utils/http-error');

// Aquesta funcio "neteja" l'usuari abans de retornar-lo a client.
// IMPORTANT: no exposem mai contrasenyaHash.
function sanitizeUser(user) {
  return {
    id: user.id,
    nom: user.nom,
    cognom: user.cognom,
    nomUsuari: user.nomUsuari,
    mail: user.mail,
    rol: user.rol,
    fotoPerfil: user.fotoPerfil,
    createdAt: user.createdAt
  };
}

// Traduim errors de Prisma (unicitat) als codis funcionals de l'API.
function mapUniqueConstraintError(error) {
  // Prisma envia meta.target amb el camp (o camps) que han col.lidit.
  const target = Array.isArray(error.meta && error.meta.target)
    ? error.meta.target
    : [error.meta && error.meta.target].filter(Boolean);

  // Si el conflicte es al mail -> 409 amb codi de mail duplicat.
  if (target.includes('mail')) {
    return createAppError(409, 'EMAIL_ALREADY_EXISTS', 'Ja existeix un usuari amb aquest mail');
  }

  // Si el conflicte es al nomUsuari -> 409 amb codi de username duplicat.
  if (target.includes('nomUsuari')) {
    return createAppError(409, 'USERNAME_ALREADY_EXISTS', 'Aquest nomUsuari ja esta en us');
  }

  // Fallback generic de conflicte (per si Prisma retorna altra combinacio).
  return createAppError(409, 'CONFLICT', 'Conflicte de dades per unicitat');
}

// Cas d'us: registre d'usuari + auto-login.
async function registerUser(input) {
  // Comprovem en paral.lel si ja existeix mail o nomUsuari.
  const [existingByMail, existingByUsername] = await Promise.all([
    prisma.usuari.findUnique({ where: { mail: input.mail } }),
    prisma.usuari.findUnique({ where: { nomUsuari: input.nomUsuari } })
  ]);

  // Si el mail existeix, aturem amb 409.
  if (existingByMail) {
    throw createAppError(409, 'EMAIL_ALREADY_EXISTS', 'Ja existeix un usuari amb aquest mail');
  }

  // Si el nomUsuari existeix, aturem amb 409.
  if (existingByUsername) {
    throw createAppError(409, 'USERNAME_ALREADY_EXISTS', 'Aquest nomUsuari ja esta en us');
  }

  // Hashegem la contrasenya abans de desar-la.
  const contrasenyaHash = await hashPassword(input.contrasenya);

  // Creem l'usuari a base de dades.
  let createdUser;
  try {
    createdUser = await prisma.usuari.create({
      data: {
        nom: input.nom,
        cognom: input.cognom,
        nomUsuari: input.nomUsuari,
        mail: input.mail,
        contrasenyaHash,
        rol: 'usuari',
        fotoPerfil: input.fotoPerfil
      }
    });
  } catch (error) {
    // Si Prisma diu P2002, es un conflicte d'unicitat.
    if (error && error.code === 'P2002') {
      throw mapUniqueConstraintError(error);
    }

    // Qualsevol altre error el propaguem tal qual.
    throw error;
  }

  // Auto-login: generem token d'acces un cop creat l'usuari.
  const token = signAccessToken(createdUser);

  // Retornem token + usuari net.
  return {
    token,
    user: sanitizeUser(createdUser)
  };
}

// Cas d'us: login per mail + contrasenya.
async function loginUser(input) {
  // Segons requisit, busquem nomes per mail.
  const user = await prisma.usuari.findUnique({
    where: { mail: input.mail }
  });

  // Missatge generic (no revelem si el mail existeix o no).
  if (!user) {
    throw createAppError(401, 'INVALID_CREDENTIALS', 'Credencials incorrectes');
  }

  // Comparem contrasenya en clar amb hash guardat.
  const isPasswordValid = await comparePassword(input.contrasenya, user.contrasenyaHash);

  // Si no coincideix, mateix error generic 401.
  if (!isPasswordValid) {
    throw createAppError(401, 'INVALID_CREDENTIALS', 'Credencials incorrectes');
  }

  // Credencials correctes -> token nou de 7 dies.
  const token = signAccessToken(user);

  // Retornem token + usuari net.
  return {
    token,
    user: sanitizeUser(user)
  };
}

// Cas d'us: obtenir perfil de l'usuari autenticat actual.
async function getCurrentUser(auth) {
  // Si no hi ha auth o userId, token invalid.
  if (!auth || !auth.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  // Carreguem usuari actual des de BD per tenir dades fresques.
  const user = await prisma.usuari.findUnique({
    where: { id: auth.userId }
  });

  // Si no existeix, retornem USER_NOT_FOUND (401 segons requisit demanat).
  if (!user) {
    throw createAppError(401, 'USER_NOT_FOUND', 'Usuari no trobat');
  }

  // Retornem objecte sanejat.
  return sanitizeUser(user);
}

// Exportem casos d'us per al controller.
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};

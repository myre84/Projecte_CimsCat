// Importo helper comu per enviar errors amb el mateix format a tota l'API.
// Aixo evita que cada controller respongui errors d'una manera diferent.
const { sendError } = require('../../common/utils/http-error');

// Importo validators del modul users.
// Els validators s'encarreguen de validar i normalitzar l'entrada.
const {
  validateUserIdParam,
  validateOwnerAccess,
  validateOwnerOrAdminAccess,
  validateUpdateProfileBody
} = require('./users.validators');

// Importo serveis amb la logica de negoci i consultes Prisma.
// El controller nomes orquestra HTTP: entrada -> servei -> resposta.
const {
  getPublicUserProfileById,
  updateOwnProfile,
  getUserPublicationsById,
  getOwnSavedPeaksById,
  getOwnLikedPublicationsById
} = require('./users.service');

// Controller de GET /users/:id
// Endpoint public de perfil basic.
async function getUserProfile(req, res) {
  try {
    // 1) Valido id de params.
    const userId = validateUserIdParam(req.params);

    // 2) Carrego perfil public des del servei.
    const user = await getPublicUserProfileById(userId);

    // 3) Retorno resposta d'exit coherent amb el contracte del projecte.
    return res.status(200).json({
      ok: true,
      message: 'Perfil public recuperat correctament',
      user
    });
  } catch (error) {
    // Qualsevol error (validacio, domini o inesperat) passa pel formatador central.
    return sendError(res, error);
  }
}

// Controller de PUT /users/:id
// Endpoint protegit: nomes el propietari pot editar-se.
async function updateUserProfile(req, res) {
  try {
    // 1) Valido id de params.
    const userId = validateUserIdParam(req.params);

    // 2) Comprovo autoritzacio de propietari (req.auth ve de requireAuth).
    validateOwnerAccess(req.auth, userId);

    // 3) Valido i normalitzo body (whitelist de camps editables).
    const updateData = validateUpdateProfileBody(req.body);

    // 4) Faig update del perfil amb el servei.
    const user = await updateOwnProfile(userId, updateData);

    // 5) Resposta d'exit amb usuari actualitzat.
    return res.status(200).json({
      ok: true,
      message: 'Perfil actualitzat correctament',
      user
    });
  } catch (error) {
    // Error unificat (400, 403, 404, 409 o 500 segons el cas).
    return sendError(res, error);
  }
}

// Controller de GET /users/:id/publications
// Endpoint public de publicacions d'un usuari.
async function getUserPublications(req, res) {
  try {
    // 1) Valido id.
    const userId = validateUserIdParam(req.params);

    // 2) Recupero llista de publicacions des del servei.
    const publications = await getUserPublicationsById(userId);

    // 3) Retorno resposta d'exit amb count + llista.
    return res.status(200).json({
      ok: true,
      message: 'Publicacions de l usuari recuperades correctament',
      count: publications.length,
      publications
    });
  } catch (error) {
    // Error en format homogeni del projecte.
    return sendError(res, error);
  }
}

// Controller de GET /users/:id/saved
// Endpoint protegit de cims guardats.
async function getUserSavedPeaks(req, res) {
  try {
    // 1) Valido id.
    const userId = validateUserIdParam(req.params);

    // 2) Comprovo que qui consulta es el propietari.
    validateOwnerOrAdminAccess(req.auth, userId);

    // 3) Recupero cims guardats del servei (model SavedPeak).
    const saved = await getOwnSavedPeaksById(userId);

    // 4) Retorno resposta d'exit.
    return res.status(200).json({
      ok: true,
      message: 'Cims guardats recuperats correctament',
      count: saved.length,
      saved
    });
  } catch (error) {
    // Error en format comu.
    return sendError(res, error);
  }
}

// Controller de GET /users/:id/likes
// Endpoint protegit owner only de likes de publicacions.
async function getUserLikedPublications(req, res) {
  try {
    // 1) Valido id.
    const userId = validateUserIdParam(req.params);

    // 2) Comprovo que qui consulta es el propietari.
    validateOwnerAccess(req.auth, userId);

    // 3) Recupero likes de publicacions del servei.
    const likes = await getOwnLikedPublicationsById(userId);

    // 4) Retorno resposta d'exit.
    return res.status(200).json({
      ok: true,
      message: 'Likes recuperats correctament',
      count: likes.length,
      likes
    });
  } catch (error) {
    // Error en format comu.
    return sendError(res, error);
  }
}

// Exporto controllers per connectar-los a users.routes.js
module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserPublications,
  getUserSavedPeaks,
  getUserLikedPublications
};
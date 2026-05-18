// Helper comu per enviar errors amb format homogenitzat.
const { sendError } = require('../../common/utils/http-error');

// Validators del modul publicacions.
// S'encarreguen de validar params/query/body abans d'entrar al servei.
const {
  validatePublicationIdParam,
  validateCreatePublicationBody,
  validateListPublicacionsQuery,
  validateUpdatePublicationBody
} = require('./publicacions.validators');

// Funcions de negoci i accés a BD (Prisma).
// El controller només orquestra entrada/sortida HTTP.
const {
  createPublication,
  listPublicacions,
  getPublicationDetailById,
  updatePublication,
  deletePublication
} = require('./publicacions.service');

// POST /publicacions
// Crea una publicacio nova de l'usuari autenticat.
async function createPublicacio(req, res) {
  try {
    // userId ve del middleware requireAuth (payload JWT).
    const userId = req.auth && req.auth.userId;
    const isAdmin = req.auth && req.auth.rol === 'admin';

    // Validem i normalitzem el body abans de tocar BD.
    const payload = validateCreatePublicationBody(req.body);

    // Deleguem la logica real al service.
    const publication = await createPublication(userId, payload);

    // Resposta REST de creacio: 201 Created.
    return res.status(201).json({
      ok: true,
      message: 'Publicacio creada correctament',
      publication
    });
  } catch (error) {
    // Qualsevol error controlat/no controlat passa pel mateix canal.
    return sendError(res, error);
  }
}

// GET /publicacions
// Llista publicacions amb filtres opcionals via query.
async function getPublicacions(req, res) {
  try {
    // Validem i normalitzem filtres de query string.
    const filters = validateListPublicacionsQuery(req.query);

    // Demanem al service la llista ja mapejada al contracte de resposta.
    const publications = await listPublicacions(filters);

    return res.status(200).json({
      ok: true,
      message: 'Publicacions recuperades correctament',
      filters,
      count: publications.length,
      publications
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// GET /publicacions/:id
// Recupera el detall complet d'una publicacio concreta.
async function getPublicacioById(req, res) {
  try {
    // Validem id de parametre de ruta.
    const publicationId = validatePublicationIdParam(req.params);

    // Obtenim detall complet (autor, cim, imatges, likes, comentaris, etc).
    const publication = await getPublicationDetailById(publicationId);

    return res.status(200).json({
      ok: true,
      message: 'Detall de publicacio recuperat correctament',
      publication
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// PUT /publicacions/:id
// Edita una publicacio existent (nomes propietari).
async function updatePublicacio(req, res) {
  try {
    // Validem id de la publicacio.
    const publicationId = validatePublicationIdParam(req.params);
    // Extreiem usuari autenticat.
    const userId = req.auth && req.auth.userId;
    const isAdmin = req.auth && req.auth.rol === 'admin';
    // Validem cos de canvis (camps editables + canvis d'imatges).
    const payload = validateUpdatePublicationBody(req.body);

    // Apliquem update al service, que te totes les regles de negoci.
    const publication = await updatePublication(publicationId, userId, payload, isAdmin);

    return res.status(200).json({
      ok: true,
      message: 'Publicacio actualitzada correctament',
      publication
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// DELETE /publicacions/:id
// Elimina una publicacio (nomes propietari) i neteja imatges associades.
async function deletePublicacio(req, res) {
  try {
    // Validem id objectiu.
    const publicationId = validatePublicationIdParam(req.params);
    // Usuari que intenta esborrar.
    const userId = req.auth && req.auth.userId;
    const isAdmin = req.auth && req.auth.rol === 'admin';

    // La logica de permisos i esborrat real viu al service.
    await deletePublication(publicationId, userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: 'Publicacio eliminada correctament'
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Exportem controllers per usar-los al router del modul.
module.exports = {
  createPublicacio,
  getPublicacions,
  getPublicacioById,
  updatePublicacio,
  deletePublicacio
};

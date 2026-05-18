const { sendError } = require('../../common/utils/http-error');
const {
  validateAdminListQuery,
  validateAdminUserPatchBody,
  validateIdParam
} = require('./admin.validators');
const {
  getAdminComments,
  getAdminPublicacions,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminPublication,
  deleteAdminUser,
  getAdminSearch
} = require('./admin.service');

async function getAdminCommentsController(req, res) {
  try {
    const filters = validateAdminListQuery(req.query);
    const comments = await getAdminComments(filters);

    return res.status(200).json({
      ok: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAdminPublicacionsController(req, res) {
  try {
    const filters = validateAdminListQuery(req.query);
    const publicacions = await getAdminPublicacions(filters);

    return res.status(200).json({
      ok: true,
      count: publicacions.length,
      publicacions
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAdminUsersController(req, res) {
  try {
    const filters = validateAdminListQuery(req.query);
    const users = await getAdminUsers(filters);

    return res.status(200).json({
      ok: true,
      count: users.length,
      users
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function patchAdminUserRoleController(req, res) {
  try {
    const userId = validateIdParam(req.params, 'id');
    const payload = validateAdminUserPatchBody(req.body);
    const user = await updateAdminUserRole(userId, payload, req.auth.userId);

    return res.status(200).json({
      ok: true,
      message: 'Rol actualitzat correctament',
      user
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteAdminPublicationController(req, res) {
  try {
    const publicationId = validateIdParam(req.params, 'id');
    const deleted = await deleteAdminPublication(publicationId);

    return res.status(200).json({
      ok: true,
      message: 'Publicacio eliminada correctament',
      deleted
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteAdminUserController(req, res) {
  try {
    const userId = validateIdParam(req.params, 'id');
    const deleted = await deleteAdminUser(userId, req.auth.userId);

    return res.status(200).json({
      ok: true,
      message: 'Usuari eliminat correctament',
      deleted
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAdminSearchController(req, res) {
  try {
    const q = req.query && req.query.q ? String(req.query.q) : '';
    const results = await getAdminSearch(q);

    return res.status(200).json({
      ok: true,
      query: q,
      results
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  getAdminCommentsController,
  getAdminPublicacionsController,
  getAdminUsersController,
  patchAdminUserRoleController,
  deleteAdminPublicationController,
  deleteAdminUserController,
  getAdminSearchController
};

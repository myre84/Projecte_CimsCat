const { sendError } = require('../../common/utils/http-error');
const {
  validateRouteIdParam,
  validateRoutesUserIdParam,
  validateCreateRouteBody,
  validateUpdateRouteBody
} = require('./routes.validators');
const {
  createRoute,
  getRouteById,
  getUserRoutes,
  updateRoute,
  deleteRoute
} = require('./routes.service');

async function createRouteController(req, res) {
  try {
    const userId = req.auth && req.auth.userId;
    const payload = validateCreateRouteBody(req.body);
    const route = await createRoute(userId, payload);

    return res.status(201).json({
      ok: true,
      message: 'Ruta planificada creada correctament',
      route
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getRouteByIdController(req, res) {
  try {
    const routeId = validateRouteIdParam(req.params);
    const route = await getRouteById(routeId);

    return res.status(200).json({
      ok: true,
      message: 'Ruta planificada recuperada correctament',
      route
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getUserRoutesController(req, res) {
  try {
    const userId = validateRoutesUserIdParam(req.params);
    const routes = await getUserRoutes(userId);

    return res.status(200).json({
      ok: true,
      message: "Rutes de l'usuari recuperades correctament",
      userId,
      count: routes.length,
      routes
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateRouteController(req, res) {
  try {
    const routeId = validateRouteIdParam(req.params);
    const payload = validateUpdateRouteBody(req.body);
    const userId = req.auth && req.auth.userId;
    const isAdmin = req.auth && req.auth.rol === 'admin';
    const route = await updateRoute(routeId, userId, payload, isAdmin);

    return res.status(200).json({
      ok: true,
      message: 'Ruta planificada actualitzada correctament',
      route
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteRouteController(req, res) {
  try {
    const routeId = validateRouteIdParam(req.params);
    const userId = req.auth && req.auth.userId;
    const isAdmin = req.auth && req.auth.rol === 'admin';
    await deleteRoute(routeId, userId, isAdmin);

    return res.status(200).json({
      ok: true,
      message: 'Ruta planificada eliminada correctament'
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  createRouteController,
  getRouteByIdController,
  getUserRoutesController,
  updateRouteController,
  deleteRouteController
};

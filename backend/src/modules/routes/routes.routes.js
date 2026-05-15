const express = require('express');
const { requireAuth } = require('../../common/middlewares/auth.middleware');
const routesController = require('./routes.controller');

const router = express.Router();

// Public routes
router.get('/:id', routesController.getRouteByIdController);

// Protected routes
router.post('/', requireAuth, routesController.createRouteController);
router.put('/:id', requireAuth, routesController.updateRouteController);
router.delete('/:id', requireAuth, routesController.deleteRouteController);

module.exports = router;

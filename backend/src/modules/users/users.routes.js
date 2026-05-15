// Importo Express per construir un router modular.
// Aquest router agrupa totes les rutes HTTP del modul users.
const express = require('express');

// Importo middleware d'autenticacio existent del projecte.
// El farem servir nomes a les rutes que han de ser protegides.
const { requireAuth } = require('../../common/middlewares/auth.middleware');

// Importo el controller del modul users.
// El controller conte la logica HTTP (validacio + resposta JSON).
const usersController = require('./users.controller');
const routesController = require('../routes/routes.controller');

// Creo el router especific de users.
const router = express.Router();

// GET /users/:id/publications
// Ruta publica: qualsevol client pot consultar les publicacions d'un usuari.
router.get('/:id/publications', usersController.getUserPublications);

// GET /users/:id/routes
// Ruta publica: qualsevol client pot consultar rutes planificades d'un usuari.
router.get('/:id/routes', routesController.getUserRoutesController);

// GET /users/:id/saved
// Ruta protegida: nomes el propietari pot veure els seus cims guardats.
router.get('/:id/saved', requireAuth, usersController.getUserSavedPeaks);

// GET /users/:id/likes
// Ruta protegida: nomes el propietari pot veure likes que ha fet.
router.get('/:id/likes', requireAuth, usersController.getUserLikedPublications);

// GET /users/:id
// Ruta publica: perfil public basic (sense camps sensibles).
router.get('/:id', usersController.getUserProfile);

// PUT /users/:id
// Ruta protegida: actualitzacio del propi perfil (owner only).
router.put('/:id', requireAuth, usersController.updateUserProfile);

// Exporto router per integrar-lo a app.js amb app.use('/users', usersRoutes).
module.exports = router;
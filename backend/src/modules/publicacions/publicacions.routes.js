// Express per crear router modular del modul publicacions.
const express = require('express');
// Middleware auth comu: exigeix token valid a rutes d'escriptura.
const { requireAuth } = require('../../common/middlewares/auth.middleware');
// Controllers HTTP del modul.
const publicacionsController = require('./publicacions.controller');
const likesController = require('../likes/likes.controller');
const commentsController = require('../comments/comments.controller');

const router = express.Router();

// CRUD public de lectura.
// Aquestes rutes no requereixen login.
router.get('/', publicacionsController.getPublicacions);
router.get('/:id', publicacionsController.getPublicacioById);
router.get('/:id/comments', commentsController.getPublicationComments);

// CRUD protegit d escriptura.
// Aquestes rutes SI requereixen usuari autenticat.
// La comprovacio de propietari concret es fa al service.
router.post('/', requireAuth, publicacionsController.createPublicacio);
router.put('/:id', requireAuth, publicacionsController.updatePublicacio);
router.delete('/:id', requireAuth, publicacionsController.deletePublicacio);
router.post('/:id/likes', requireAuth, likesController.createLike);
router.delete('/:id/likes', requireAuth, likesController.deleteLike);
router.post('/:id/comments', requireAuth, commentsController.createComment);

// Exporto router per muntar-lo a app.js sota /publicacions.
module.exports = router;

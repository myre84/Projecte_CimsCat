const express = require('express');
const { requireAuth } = require('../../common/middlewares/auth.middleware');
const commentsController = require('./comments.controller');

const router = express.Router();

// DELETE /comments/:id
// Ruta protegida. El control fi d'autoritzacio es fa al service.
router.delete('/:id', requireAuth, commentsController.deleteComment);

module.exports = router;

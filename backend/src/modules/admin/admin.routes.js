const express = require('express');
const { requireAuth } = require('../../common/middlewares/auth.middleware');
const { requireAdmin } = require('../../common/middlewares/role.middleware');
const {
  getAdminCommentsController,
  getAdminPublicacionsController,
  getAdminUsersController,
  patchAdminUserRoleController,
  deleteAdminPublicationController,
  deleteAdminUserController,
  getAdminSearchController
} = require('./admin.controller');

const router = express.Router();

router.get('/comments', requireAuth, requireAdmin, getAdminCommentsController);
router.get('/publicacions', requireAuth, requireAdmin, getAdminPublicacionsController);
router.get('/users', requireAuth, requireAdmin, getAdminUsersController);
router.get('/search', requireAuth, requireAdmin, getAdminSearchController);

router.patch('/users/:id', requireAuth, requireAdmin, patchAdminUserRoleController);
router.delete('/publicacions/:id', requireAuth, requireAdmin, deleteAdminPublicationController);
router.delete('/users/:id', requireAuth, requireAdmin, deleteAdminUserController);

module.exports = router;

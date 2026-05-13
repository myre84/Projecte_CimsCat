const express = require('express');
const router = express.Router();
const { getUserBadgesController } = require('./badges.controller');

// GET /users/:id/badges
router.get('/:id/badges', getUserBadgesController);

module.exports = router;

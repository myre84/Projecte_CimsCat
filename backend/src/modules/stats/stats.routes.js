const express = require('express');
const router = express.Router();

const { getUserStatsController } = require('./stats.controller');

// GET /users/:id/stats
router.get('/:id/stats', getUserStatsController);

module.exports = router;

const express = require('express');
const router = express.Router();

const { getUserChallengesController, getUserChallengeDetailController } = require('./challenges.controller');

// GET /users/:id/challenges
router.get('/:id/challenges', getUserChallengesController);

// GET /users/:id/challenges/:slug
router.get('/:id/challenges/:slug', getUserChallengeDetailController);

module.exports = router;

const { sendError } = require('../../common/utils/http-error');
const { validateChallengesUserIdParam, validateChallengeSlugParam } = require('./challenges.validators');
const { getUserChallenges, getUserChallengeDetail } = require('./challenges.service');

async function getUserChallengesController(req, res) {
  try {
    const userId = validateChallengesUserIdParam(req.params);
    const challenges = await getUserChallenges(userId);
    return res.status(200).json({ ok: true, message: 'User challenges retrieved successfully', userId, challenges });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getUserChallengeDetailController(req, res) {
  try {
    const userId = validateChallengesUserIdParam(req.params);
    const slug = validateChallengeSlugParam(req.params);
    const challenge = await getUserChallengeDetail(userId, slug);
    return res.status(200).json({ ok: true, message: 'User challenge retrieved successfully', userId, challenge });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = { getUserChallengesController, getUserChallengeDetailController };

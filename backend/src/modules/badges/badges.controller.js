const { sendError } = require('../../common/utils/http-error');
const { validateBadgesUserIdParam } = require('./badges.validators');
const { getUserBadges } = require('./badges.service');

async function getUserBadgesController(req, res) {
  try {
    const userId = validateBadgesUserIdParam(req.params);
    const badges = await getUserBadges(userId);
    return res.status(200).json({ ok: true, message: 'User badges retrieved successfully', userId, badges });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = { getUserBadgesController };

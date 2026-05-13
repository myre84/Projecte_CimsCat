const { sendError } = require('../../common/utils/http-error');
const { validateStatsUserIdParam } = require('./stats.validators');
const { getUserStats } = require('./stats.service');

async function getUserStatsController(req, res) {
  try {
    const userId = validateStatsUserIdParam(req.params);
    const stats = await getUserStats(userId);

    return res.status(200).json({
      ok: true,
      message: 'User stats retrieved successfully',
      userId,
      stats
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = { getUserStatsController };

const { createAppError } = require('../../common/utils/http-error');
const { validateUserIdParam } = require('../users/users.validators');

function validateStatsUserIdParam(params) {
  // Reuse users validator to maintain consistent rules
  try {
    return validateUserIdParam(params);
  } catch (err) {
    // Map to required error code
    throw createAppError(400, 'USER_ID_INVALID', 'Parametre id d usuari invalid');
  }
}

module.exports = {
  validateStatsUserIdParam
};

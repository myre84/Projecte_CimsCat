const { createAppError } = require('../../common/utils/http-error');
const { validateUserIdParam } = require('../users/users.validators');

function validateBadgesUserIdParam(params) {
  try {
    return validateUserIdParam(params);
  } catch (err) {
    throw createAppError(400, 'USER_ID_INVALID', 'Parametre id d usuari invalid');
  }
}

module.exports = { validateBadgesUserIdParam };

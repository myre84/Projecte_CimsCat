const { createAppError } = require('../../common/utils/http-error');
const { validateUserIdParam } = require('../users/users.validators');

function validateChallengeSlugParam(params) {
  const slug = typeof params === 'object' && params && typeof params.slug === 'string' ? params.slug.trim() : '';
  if (!slug) throw createAppError(400, 'CHALLENGE_SLUG_INVALID', 'Parametre slug de repte invalid');
  return slug;
}

function validateChallengesUserIdParam(params) {
  try {
    return validateUserIdParam(params);
  } catch (err) {
    throw createAppError(400, 'USER_ID_INVALID', 'Parametre id d usuari invalid');
  }
}

module.exports = { validateChallengeSlugParam, validateChallengesUserIdParam };

const { createAppError } = require('../../common/utils/http-error');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBooleanQuery(value) {
  if (typeof value === 'undefined') return null;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;

  throw createAppError(400, 'VALIDATION_ERROR', 'Valor boolea invalid al query string');
}

function validateAdminListQuery(query) {
  const q = normalizeString(query && query.q);
  const user = normalizeString(query && query.user);
  const publication = normalizeString(query && query.publication);
  const peak = normalizeString(query && query.peak);
  const containsSensitive = normalizeBooleanQuery(query && query.containsSensitive);

  return {
    q: q || null,
    user: user || null,
    publication: publication || null,
    peak: peak || null,
    containsSensitive
  };
}

function validateAdminUserPatchBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(400, 'VALIDATION_ERROR', 'Body invalid. Cal enviar un objecte JSON');
  }

  const role = normalizeString(body.rol).toLowerCase();
  if (!role) {
    throw createAppError(400, 'VALIDATION_ERROR', "Cal informar el camp 'rol'");
  }

  if (!['admin', 'usuari'].includes(role)) {
    throw createAppError(400, 'VALIDATION_ERROR', "rol invalid. Nomes s'accepta admin o usuari");
  }

  return { rol: role };
}

function validateIdParam(params, fieldName) {
  const id = normalizeString(params && params.id);
  if (!id) {
    throw createAppError(400, 'VALIDATION_ERROR', `Parametre ${fieldName} invalid`);
  }
  return id;
}

module.exports = {
  validateAdminListQuery,
  validateAdminUserPatchBody,
  validateIdParam
};

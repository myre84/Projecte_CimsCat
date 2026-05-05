const { createAppError } = require('../../common/utils/http-error');

const COMMENT_TEXT_MIN_LENGTH = 1;
const COMMENT_TEXT_MAX_LENGTH = 1000;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function ensureObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(400, 'INVALID_BODY', 'Body invalid. Cal enviar un objecte JSON');
  }
}

function validatePublicationIdParam(params) {
  const id = normalizeString(params && params.id);

  if (!id) {
    throw createAppError(400, 'PUBLICATION_ID_INVALID', 'Parametre id de publicacio invalid');
  }

  return id;
}

function validateCommentIdParam(params) {
  const id = normalizeString(params && params.id);

  if (!id) {
    throw createAppError(400, 'COMMENT_ID_INVALID', 'Parametre id de comentari invalid');
  }

  return id;
}

function validateCreateCommentBody(body) {
  ensureObject(body);

  const text = normalizeString(body.text);

  if (!text) {
    throw createAppError(400, 'INVALID_BODY', 'El camp text es obligatori');
  }

  if (text.length < COMMENT_TEXT_MIN_LENGTH || text.length > COMMENT_TEXT_MAX_LENGTH) {
    throw createAppError(
      400,
      'INVALID_BODY',
      `El camp text ha de tenir entre ${COMMENT_TEXT_MIN_LENGTH} i ${COMMENT_TEXT_MAX_LENGTH} caracters`
    );
  }

  return { text };
}

module.exports = {
  validatePublicationIdParam,
  validateCommentIdParam,
  validateCreateCommentBody,
  COMMENT_TEXT_MIN_LENGTH,
  COMMENT_TEXT_MAX_LENGTH
};

// Importo helper comu d'errors per mantenir format i codis consistents.
const { createAppError } = require('../../common/utils/http-error');

// Normalitzo strings d'entrada fent trim.
function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Valida parametre :id de publicacio per rutes nested /publicacions/:id/likes.
function validatePublicationIdParam(params) {
  const id = normalizeString(params && params.id);

  if (!id) {
    throw createAppError(400, 'PUBLICATION_ID_INVALID', 'Parametre id de publicacio invalid');
  }

  return id;
}

module.exports = {
  validatePublicationIdParam
};

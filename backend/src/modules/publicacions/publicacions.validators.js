// Helper comu per construir errors consistents de validacio.
const { createAppError } = require('../../common/utils/http-error');

// Camps string obligatoris al POST /publicacions.
// Si en falta un o ve buit, retornarem INVALID_BODY.
const CREATE_REQUIRED_STRING_FIELDS = [
  'cimId',
  'titol',
  'descripcio',
  'tipusActivitat',
  'dificultat'
];

// Camps numerics obligatoris al POST /publicacions.
const CREATE_REQUIRED_NUMBER_FIELDS = [
  'distanciaKm',
  'desnivellPosM',
  'desnivellNegM',
  'tempsMin',
  'altitudMaxM',
  'altitudMinM'
];

// Llista blanca de camps editables al PUT /publicacions/:id.
// Qualsevol camp fora d'aquesta llista es rebutja.
const UPDATE_ALLOWED_FIELDS = [
  'cimId',
  'rutaPlanificadaId',
  'titol',
  'descripcio',
  'dataActivitat',
  'tipusActivitat',
  'dificultat',
  'distanciaKm',
  'desnivellPosM',
  'desnivellNegM',
  'tempsMin',
  'altitudMaxM',
  'altitudMinM',
  'trackUrl',
  'newImageUrls',
  'deleteImageIds'
];

// Helper de neteja de strings:
// - si es string: trim
// - si no es string: string buit (fara fallar validadors obligatoris)
function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Ens assegura que el body sigui un objecte JSON valid.
// Rebutgem null, arrays i valors primitius.
function ensureObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(400, 'INVALID_BODY', 'Body invalid. Cal enviar un objecte JSON');
  }
}

// Llegeix string obligatori i falla si no hi es o es buit.
function parseRequiredString(body, fieldName) {
  const value = normalizeString(body[fieldName]);
  if (!value) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} es obligatori`);
  }

  return value;
}

// Llegeix string opcional:
// - undefined si no existeix camp
// - null si client envia null explicit
// - string trimat si valid
// - error si ve buit
function parseOptionalString(body, fieldName) {
  if (!Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return undefined;
  }

  if (body[fieldName] === null) {
    return null;
  }

  const value = normalizeString(body[fieldName]);
  if (!value) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} no pot ser buit`);
  }

  return value;
}

// Llegeix numero obligatori i valida que sigui numeric finite.
function parseRequiredNumber(body, fieldName) {
  const parsed = Number(body[fieldName]);
  if (!Number.isFinite(parsed)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser numeric`);
  }

  return parsed;
}

// Llegeix numero opcional amb mateixa validacio.
function parseOptionalNumber(body, fieldName) {
  if (!Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return undefined;
  }

  const parsed = Number(body[fieldName]);
  if (!Number.isFinite(parsed)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser numeric`);
  }

  return parsed;
}

// Data obligatoria (POST): ha de ser parsejable a Date valida.
function parseRequiredDate(body, fieldName) {
  const value = normalizeString(body[fieldName]);
  const parsed = new Date(value);

  if (!value || Number.isNaN(parsed.getTime())) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser una data valida`);
  }

  return parsed;
}

// Data opcional (PUT): mateixa logica de validacio.
function parseOptionalDate(body, fieldName) {
  if (!Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return undefined;
  }

  const value = normalizeString(body[fieldName]);
  const parsed = new Date(value);

  if (!value || Number.isNaN(parsed.getTime())) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser una data valida`);
  }

  return parsed;
}

// Valida arrays de strings (ex: imageUrls, newImageUrls, deleteImageIds).
// Comprovem:
// - que sigui array
// - que cada element sigui string no buit
// - longitud minima opcional
function parseStringArray(value, fieldName, options) {
  if (!Array.isArray(value)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser un array`);
  }

  const normalized = value.map((item) => normalizeString(item)).filter(Boolean);

  if (options && options.minLength && normalized.length < options.minLength) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de tenir almenys ${options.minLength} element(s)`);
  }

  if (normalized.length !== value.length) {
    throw createAppError(400, 'INVALID_BODY', `Tots els elements de ${fieldName} han de ser strings no buits`);
  }

  return normalized;
}

// Valida parametre :id de ruta per endpoints de detall/update/delete.
function validatePublicationIdParam(params) {
  const id = normalizeString(params && params.id);
  if (!id) {
    throw createAppError(400, 'PUBLICATION_ID_INVALID', 'Parametre id de publicacio invalid');
  }

  return id;
}

// Validacio completa de body per POST /publicacions.
// Retorna objecte ja normalitzat i tipat (numbers i Date parsejats).
function validateCreatePublicationBody(body) {
  ensureObject(body);

  const parsed = {};

  CREATE_REQUIRED_STRING_FIELDS.forEach((fieldName) => {
    parsed[fieldName] = parseRequiredString(body, fieldName);
  });

  CREATE_REQUIRED_NUMBER_FIELDS.forEach((fieldName) => {
    parsed[fieldName] = parseRequiredNumber(body, fieldName);
  });

  parsed.dataActivitat = parseRequiredDate(body, 'dataActivitat');

  const rutaPlanificadaId = parseOptionalString(body, 'rutaPlanificadaId');
  if (typeof rutaPlanificadaId !== 'undefined') {
    parsed.rutaPlanificadaId = rutaPlanificadaId;
  }

  const trackUrl = parseOptionalString(body, 'trackUrl');
  if (typeof trackUrl !== 'undefined') {
    parsed.trackUrl = trackUrl;
  }

  parsed.imageUrls = parseStringArray(body.imageUrls, 'imageUrls', { minLength: 1 });

  return parsed;
}

// Validacio de query params de GET /publicacions.
// Es una validacio suau: només fem trim i convertim buits a null.
function validateListPublicacionsQuery(query) {
  return {
    cimId: normalizeString(query.cimId) || null,
    usuariId: normalizeString(query.usuariId) || null,
    tipusActivitat: normalizeString(query.tipusActivitat) || null
  };
}

// Validacio de body per PUT /publicacions/:id.
// Permet update parcial de camps + gestio d'imatges.
function validateUpdatePublicationBody(body) {
  ensureObject(body);

  const keys = Object.keys(body);
  if (!keys.length) {
    throw createAppError(400, 'INVALID_BODY', 'Body buit. Cal enviar almenys un camp editable');
  }

  const invalidKeys = keys.filter((key) => !UPDATE_ALLOWED_FIELDS.includes(key));
  if (invalidKeys.length) {
    // Evitem que el client intenti modificar camps no previstos.
    throw createAppError(400, 'INVALID_BODY', 'Hi ha camps no permesos al body');
  }

  // updateData contindra nomes camps de BD realment editables.
  const updateData = {};

  const cimId = parseOptionalString(body, 'cimId');
  if (typeof cimId !== 'undefined') {
    updateData.cimId = cimId;
  }

  const rutaPlanificadaId = parseOptionalString(body, 'rutaPlanificadaId');
  if (typeof rutaPlanificadaId !== 'undefined') {
    updateData.rutaPlanificadaId = rutaPlanificadaId;
  }

  ['titol', 'descripcio', 'tipusActivitat', 'dificultat', 'trackUrl'].forEach((fieldName) => {
    const value = parseOptionalString(body, fieldName);
    if (typeof value !== 'undefined') {
      updateData[fieldName] = value;
    }
  });

  ['distanciaKm', 'desnivellPosM', 'desnivellNegM', 'tempsMin', 'altitudMaxM', 'altitudMinM'].forEach((fieldName) => {
    const value = parseOptionalNumber(body, fieldName);
    if (typeof value !== 'undefined') {
      updateData[fieldName] = value;
    }
  });

  const dataActivitat = parseOptionalDate(body, 'dataActivitat');
  if (typeof dataActivitat !== 'undefined') {
    updateData.dataActivitat = dataActivitat;
  }

  let newImageUrls = [];
  if (Object.prototype.hasOwnProperty.call(body, 'newImageUrls')) {
    // Imatges noves que s'afegiran al final.
    newImageUrls = parseStringArray(body.newImageUrls, 'newImageUrls');
  }

  let deleteImageIds = [];
  if (Object.prototype.hasOwnProperty.call(body, 'deleteImageIds')) {
    // IDs d'imatges existents que volem eliminar.
    deleteImageIds = parseStringArray(body.deleteImageIds, 'deleteImageIds');
  }

  // Evitem updates buits que no canvien res.
  if (!Object.keys(updateData).length && !newImageUrls.length && !deleteImageIds.length) {
    throw createAppError(400, 'INVALID_BODY', 'No hi ha canvis per aplicar');
  }

  return {
    updateData,
    newImageUrls,
    deleteImageIds
  };
}

// Exporto validators per usar-los al controller.
module.exports = {
  validatePublicationIdParam,
  validateCreatePublicationBody,
  validateListPublicacionsQuery,
  validateUpdatePublicationBody
};

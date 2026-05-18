// Importo helper comu d'errors.
// Ens permet crear errors amb format coherent a tota l'API:
// status HTTP + codi intern + missatge clar.
const { createAppError } = require('../../common/utils/http-error');

// Llista tancada de camps que deixem ordenar des de query params.
// IMPORTANT: ho limitem expressament per evitar valors arbitraris.
const ALLOWED_SORT_BY = ['nom', 'alcada', 'comarca', 'massis', 'createdAt'];

// Llista tancada d'ordres valids.
// Nomes admetem ascendent o descendent.
const ALLOWED_SORT_ORDER = ['asc', 'desc'];
const REQUIRED_PEAK_STRING_FIELDS = ['nom', 'comarca', 'dificultat', 'descripcio', 'imatgeUrl', 'massis'];
const REQUIRED_PEAK_NUMBER_FIELDS = ['alcada', 'lat', 'lon'];

// Helper petit per no repetir literalment el mateix error a cada validacio.
// Sempre que una query sigui invalida, retornarem aquest codi funcional.
function invalidQueryParamsError() {
  return createAppError(400, 'INVALID_QUERY_PARAMS', 'Parametres de consulta invalids');
}

// Normalitzo qualsevol valor de text:
// - Si es string, li faig trim (treu espais als extrems).
// - Si no es string, torno string buit per simplificar validacions posteriors.
function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Parsejo un numero de query que es opcional (ex: minAlcada o maxAlcada).
// Comportament:
// - Si no arriba el parametre -> null (no filtrar per aquest camp)
// - Si arriba buit o no numeric -> error 400 controlat
// - Si es valid -> numero
function parseOptionalQueryNumber(rawValue) {
  // Quan el client no envia el parametre, no es error: simplement no hi ha filtre.
  if (typeof rawValue === 'undefined') {
    return null;
  }

  // Netegem espais per tractar correctament casos com " 2000 ".
  const normalized = normalizeString(rawValue);

  // Si ens arriba "" (buit), ho considerem invalid en lloc d'ignorar-ho.
  if (!normalized) {
    throw invalidQueryParamsError();
  }

  // Converteixo a Number per validar numericament.
  const parsed = Number(normalized);

  // Number('abc') dona NaN; aquest cas l'aturem amb 400.
  if (!Number.isFinite(parsed)) {
    throw invalidQueryParamsError();
  }

  // Retornem el valor numeric ja net.
  return parsed;
}

// Valida i normalitza tots els query params de GET /peaks.
// Aquesta funcio fa dues feines:
// 1) sanejar i posar defaults
// 2) rebutjar valors no permesos amb error funcional 400
function validatePeaksQuery(query) {
  // Defensa extra: si per algun motiu query arriba null/undefined,
  // el convertim a objecte buit per evitar errors en runtime.
  const safeQuery = query && typeof query === 'object' ? query : {};

  // Camps de text opcionals: trim + null si queden buits.
  const search = normalizeString(safeQuery.search) || null;
  const comarca = normalizeString(safeQuery.comarca) || null;
  const massis = normalizeString(safeQuery.massis) || null;
  const dificultat = normalizeString(safeQuery.dificultat) || null;
  const zonaProtegida = normalizeString(safeQuery.zonaProtegida) || null;

  // Parseig numeric dels rangs d'alcada.
  const minAlcada = parseOptionalQueryNumber(safeQuery.minAlcada);
  const maxAlcada = parseOptionalQueryNumber(safeQuery.maxAlcada);

  // Validacio de coherencia del rang numeric: min no pot superar max.
  if (minAlcada !== null && maxAlcada !== null && minAlcada > maxAlcada) {
    throw invalidQueryParamsError();
  }

  // Llegeixo ordenacio enviada pel client.
  // sortOrder el passo a lowercase per acceptar ASC/Desc/etc.
  const sortByInput = normalizeString(safeQuery.sortBy);
  const sortOrderInput = normalizeString(safeQuery.sortOrder).toLowerCase();

  // Defaults demanats: nom + asc.
  const sortBy = sortByInput || 'nom';
  const sortOrder = sortOrderInput || 'asc';

  // Validacio d'enums: nomes valors previstos.
  if (!ALLOWED_SORT_BY.includes(sortBy)) {
    throw invalidQueryParamsError();
  }

  if (!ALLOWED_SORT_ORDER.includes(sortOrder)) {
    throw invalidQueryParamsError();
  }

  return {
    search,
    comarca,
    massis,
    dificultat,
    zonaProtegida,
    minAlcada,
    maxAlcada,
    sortBy,
    sortOrder
  };
}

// Valida parametre d'id de GET /peaks/:id.
// Aqui fem validacio basica: que existeixi i no sigui buit.
function validatePeakIdParam(params) {
  const safeParams = params && typeof params === 'object' ? params : {};

  // Netegem espais per evitar ids "   " o similars.
  const id = normalizeString(safeParams.id);

  // Mateix codi d'error de query params invalids (segons requisit).
  if (!id) {
    throw invalidQueryParamsError();
  }

  // Retornem id sanejat per usar-lo al servei.
  return id;
}

function ensureObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(400, 'INVALID_BODY', 'Body invalid. Cal enviar un objecte JSON');
  }
}

function parseRequiredString(body, fieldName) {
  const value = normalizeString(body[fieldName]);
  if (!value) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} es obligatori`);
  }

  return value;
}

function parseRequiredNumber(body, fieldName) {
  const parsed = Number(body[fieldName]);
  if (!Number.isFinite(parsed)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser numeric`);
  }

  return parsed;
}

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

function validateCreatePeakBody(body) {
  ensureObject(body);

  const data = {};

  REQUIRED_PEAK_STRING_FIELDS.forEach((fieldName) => {
    data[fieldName] = parseRequiredString(body, fieldName);
  });

  REQUIRED_PEAK_NUMBER_FIELDS.forEach((fieldName) => {
    data[fieldName] = parseRequiredNumber(body, fieldName);
  });

  const zonaProtegida = parseOptionalString(body, 'zonaProtegida');
  if (typeof zonaProtegida !== 'undefined') {
    data.zonaProtegida = zonaProtegida;
  }

  return data;
}

function validateUpdatePeakBody(body) {
  ensureObject(body);

  if (!Object.keys(body).length) {
    throw createAppError(400, 'INVALID_BODY', 'Body buit. Cal enviar almenys un camp editable');
  }

  const data = {};

  [...REQUIRED_PEAK_STRING_FIELDS, 'zonaProtegida'].forEach((fieldName) => {
    const value = parseOptionalString(body, fieldName);
    if (typeof value !== 'undefined') {
      data[fieldName] = value;
    }
  });

  REQUIRED_PEAK_NUMBER_FIELDS.forEach((fieldName) => {
    const value = parseOptionalNumber(body, fieldName);
    if (typeof value !== 'undefined') {
      data[fieldName] = value;
    }
  });

  if (!Object.keys(data).length) {
    throw createAppError(400, 'INVALID_BODY', 'No hi ha canvis per aplicar');
  }

  return data;
}

// Exporto validacions per reutilitzar-les al controller.
module.exports = {
  validatePeaksQuery,
  validatePeakIdParam,
  validateCreatePeakBody,
  validateUpdatePeakBody
};

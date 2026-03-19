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
function parseOptionalNumber(rawValue) {
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
  // Camps de text opcionals: trim + null si queden buits.
  const search = normalizeString(query.search) || null;
  const comarca = normalizeString(query.comarca) || null;
  const massis = normalizeString(query.massis) || null;
  const dificultat = normalizeString(query.dificultat) || null;

  // Parseig numeric dels rangs d'alcada.
  const minAlcada = parseOptionalNumber(query.minAlcada);
  const maxAlcada = parseOptionalNumber(query.maxAlcada);

  // Validacio de coherencia del rang numeric: min no pot superar max.
  if (minAlcada !== null && maxAlcada !== null && minAlcada > maxAlcada) {
    throw invalidQueryParamsError();
  }

  // Llegeixo ordenacio enviada pel client.
  // sortOrder el passo a lowercase per acceptar ASC/Desc/etc.
  const sortByInput = normalizeString(query.sortBy);
  const sortOrderInput = normalizeString(query.sortOrder).toLowerCase();

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
    minAlcada,
    maxAlcada,
    sortBy,
    sortOrder
  };
}

// Valida parametre d'id de GET /peaks/:id.
// Aqui fem validacio basica: que existeixi i no sigui buit.
function validatePeakIdParam(params) {
  // Netegem espais per evitar ids "   " o similars.
  const id = normalizeString(params.id);

  // Mateix codi d'error de query params invalids (segons requisit).
  if (!id) {
    throw invalidQueryParamsError();
  }

  // Retornem id sanejat per usar-lo al servei.
  return id;
}

// Exporto validacions per reutilitzar-les al controller.
module.exports = {
  validatePeaksQuery,
  validatePeakIdParam
};

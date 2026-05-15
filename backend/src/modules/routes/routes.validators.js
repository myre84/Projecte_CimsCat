const { createAppError } = require('../../common/utils/http-error');
const { validateUserIdParam } = require('../users/users.validators');

const ROUTE_TYPE_VALUES = ['one-way', 'round-trip', 'circular'];

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
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

function parseRequiredNumber(body, fieldName) {
  const parsed = Number(body[fieldName]);
  if (!Number.isFinite(parsed)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser numeric`);
  }
  return parsed;
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

function ensureNumberMin(value, minValue, fieldName) {
  if (value < minValue) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} ha de ser >= ${minValue}`);
  }
}

function parseTipusRecorregut(body, fieldName) {
  const value = parseRequiredString(body, fieldName);
  if (!ROUTE_TYPE_VALUES.includes(value)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} no es valid`);
  }
  return value;
}

function parseOptionalTipusRecorregut(body, fieldName) {
  if (!Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return undefined;
  }
  if (body[fieldName] === null) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} no pot ser null`);
  }
  const value = normalizeString(body[fieldName]);
  if (!value) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} no pot ser buit`);
  }
  if (!ROUTE_TYPE_VALUES.includes(value)) {
    throw createAppError(400, 'INVALID_BODY', `El camp ${fieldName} no es valid`);
  }
  return value;
}

function normalizeWaypointName(value, index) {
  const trimmed = normalizeString(value);
  if (trimmed) return trimmed;
  if (index < 26) {
    return `Punt ${String.fromCharCode(65 + index)}`;
  }
  return `Punt ${index + 1}`;
}

function parseWaypoints(value) {
  if (!Array.isArray(value)) {
    throw createAppError(400, 'INVALID_BODY', 'El camp waypoints ha de ser un array');
  }

  if (value.length < 2) {
    throw createAppError(400, 'INVALID_BODY', 'Cal informar almenys 2 punts de ruta');
  }

  return value.map((item, index) => {
    const lat = Number(item && item.lat);
    const lonRaw = Object.prototype.hasOwnProperty.call(item || {}, 'lon') ? item.lon : item && item.lng;
    const lon = Number(lonRaw);

    if (!Number.isFinite(lat)) {
      throw createAppError(400, 'INVALID_BODY', 'Cada waypoint ha de tenir lat numeric');
    }

    if (!Number.isFinite(lon)) {
      throw createAppError(400, 'INVALID_BODY', 'Cada waypoint ha de tenir lon o lng numeric');
    }

    if (lat < -90 || lat > 90) {
      throw createAppError(400, 'INVALID_BODY', 'Lat fora de rang');
    }

    if (lon < -180 || lon > 180) {
      throw createAppError(400, 'INVALID_BODY', 'Lon fora de rang');
    }

    const nomPunt = normalizeWaypointName(item && item.nomPunt, index);

    let etiqueta = null;
    if (Object.prototype.hasOwnProperty.call(item || {}, 'etiqueta')) {
      if (item.etiqueta === null) {
        etiqueta = null;
      } else {
        const etiquetaTrimmed = normalizeString(item.etiqueta);
        if (!etiquetaTrimmed) {
          throw createAppError(400, 'INVALID_BODY', 'etiqueta no pot ser buida');
        }
        etiqueta = etiquetaTrimmed;
      }
    }

    return {
      etiqueta,
      nomPunt,
      lat,
      lon,
      ordreIndex: index
    };
  });
}

function validateRouteIdParam(params) {
  const id = normalizeString(params && params.id);
  if (!id) {
    throw createAppError(400, 'ROUTE_ID_INVALID', 'Parametre id de ruta invalid');
  }
  return id;
}

function validateRoutesUserIdParam(params) {
  try {
    return validateUserIdParam(params);
  } catch (error) {
    throw createAppError(400, 'USER_ID_INVALID', 'Parametre id d usuari invalid');
  }
}

function validateCreateRouteBody(body) {
  ensureObject(body);

  const parsed = {
    cimId: parseRequiredString(body, 'cimId'),
    nom: parseRequiredString(body, 'nom'),
    tipusActivitat: parseRequiredString(body, 'tipusActivitat'),
    ritme: parseRequiredString(body, 'ritme'),
    tipusRecorregut: parseTipusRecorregut(body, 'tipusRecorregut'),
    distanciaKm: parseRequiredNumber(body, 'distanciaKm'),
    desnivellPosM: parseRequiredNumber(body, 'desnivellPosM'),
    desnivellNegM: parseRequiredNumber(body, 'desnivellNegM'),
    tempsMin: parseRequiredNumber(body, 'tempsMin'),
    altitudMaxM: parseRequiredNumber(body, 'altitudMaxM'),
    altitudMinM: parseRequiredNumber(body, 'altitudMinM'),
    waypoints: parseWaypoints(body.waypoints)
  };

  ensureNumberMin(parsed.distanciaKm, 0, 'distanciaKm');
  ensureNumberMin(parsed.desnivellPosM, 0, 'desnivellPosM');
  ensureNumberMin(parsed.desnivellNegM, 0, 'desnivellNegM');
  ensureNumberMin(parsed.tempsMin, 1, 'tempsMin');

  if (parsed.altitudMaxM < parsed.altitudMinM) {
    throw createAppError(400, 'INVALID_BODY', 'altitudMaxM no pot ser inferior a altitudMinM');
  }

  const trackUrl = parseOptionalString(body, 'trackUrl');
  if (typeof trackUrl !== 'undefined') {
    parsed.trackUrl = trackUrl;
  }

  const notes = parseOptionalString(body, 'notes');
  if (typeof notes !== 'undefined') {
    parsed.notes = notes;
  }

  return parsed;
}

const UPDATE_ALLOWED_FIELDS = [
  'cimId',
  'nom',
  'tipusActivitat',
  'ritme',
  'tipusRecorregut',
  'distanciaKm',
  'desnivellPosM',
  'desnivellNegM',
  'tempsMin',
  'altitudMaxM',
  'altitudMinM',
  'trackUrl',
  'notes',
  'waypoints'
];

function validateUpdateRouteBody(body) {
  ensureObject(body);

  const keys = Object.keys(body);
  if (!keys.length) {
    throw createAppError(400, 'INVALID_BODY', 'Body buit. Cal enviar almenys un camp editable');
  }

  const invalidKeys = keys.filter((key) => !UPDATE_ALLOWED_FIELDS.includes(key));
  if (invalidKeys.length) {
    throw createAppError(400, 'INVALID_BODY', 'Hi ha camps no permesos al body');
  }

  const updateData = {};

  const cimId = parseOptionalString(body, 'cimId');
  if (typeof cimId !== 'undefined') {
    updateData.cimId = cimId;
  }

  const nom = parseOptionalString(body, 'nom');
  if (typeof nom !== 'undefined') {
    updateData.nom = nom;
  }

  const tipusActivitat = parseOptionalString(body, 'tipusActivitat');
  if (typeof tipusActivitat !== 'undefined') {
    updateData.tipusActivitat = tipusActivitat;
  }

  const ritme = parseOptionalString(body, 'ritme');
  if (typeof ritme !== 'undefined') {
    updateData.ritme = ritme;
  }

  const tipusRecorregut = parseOptionalTipusRecorregut(body, 'tipusRecorregut');
  if (typeof tipusRecorregut !== 'undefined') {
    updateData.tipusRecorregut = tipusRecorregut;
  }

  const distanciaKm = parseOptionalNumber(body, 'distanciaKm');
  if (typeof distanciaKm !== 'undefined') {
    ensureNumberMin(distanciaKm, 0, 'distanciaKm');
    updateData.distanciaKm = distanciaKm;
  }

  const desnivellPosM = parseOptionalNumber(body, 'desnivellPosM');
  if (typeof desnivellPosM !== 'undefined') {
    ensureNumberMin(desnivellPosM, 0, 'desnivellPosM');
    updateData.desnivellPosM = desnivellPosM;
  }

  const desnivellNegM = parseOptionalNumber(body, 'desnivellNegM');
  if (typeof desnivellNegM !== 'undefined') {
    ensureNumberMin(desnivellNegM, 0, 'desnivellNegM');
    updateData.desnivellNegM = desnivellNegM;
  }

  const tempsMin = parseOptionalNumber(body, 'tempsMin');
  if (typeof tempsMin !== 'undefined') {
    ensureNumberMin(tempsMin, 1, 'tempsMin');
    updateData.tempsMin = tempsMin;
  }

  const altitudMaxM = parseOptionalNumber(body, 'altitudMaxM');
  if (typeof altitudMaxM !== 'undefined') {
    updateData.altitudMaxM = altitudMaxM;
  }

  const altitudMinM = parseOptionalNumber(body, 'altitudMinM');
  if (typeof altitudMinM !== 'undefined') {
    updateData.altitudMinM = altitudMinM;
  }

  const trackUrl = parseOptionalString(body, 'trackUrl');
  if (typeof trackUrl !== 'undefined') {
    updateData.trackUrl = trackUrl;
  }

  const notes = parseOptionalString(body, 'notes');
  if (typeof notes !== 'undefined') {
    updateData.notes = notes;
  }

  const waypoints = Object.prototype.hasOwnProperty.call(body, 'waypoints')
    ? parseWaypoints(body.waypoints)
    : null;

  if (typeof updateData.altitudMaxM !== 'undefined' && typeof updateData.altitudMinM !== 'undefined') {
    if (updateData.altitudMaxM < updateData.altitudMinM) {
      throw createAppError(400, 'INVALID_BODY', 'altitudMaxM no pot ser inferior a altitudMinM');
    }
  }

  return { updateData, waypoints };
}

module.exports = {
  validateRouteIdParam,
  validateRoutesUserIdParam,
  validateCreateRouteBody,
  validateUpdateRouteBody
};

// Importo helper per generar errors HTTP consistents.
const { createAppError } = require('../../common/utils/http-error');

// Regex simple per validar format d'email.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex exacta del requisit: 3-30 caracters, minuscules, numeros, punt o _
const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

// Regex exacta del requisit de contrasenya:
// - 8 a 30 caracters
// - almenys 1 majuscula
// - almenys 1 numero
// - nomes lletres i numeros
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,30}$/;

// Valido que body sigui un objecte JSON "normal".
// Evito null, arrays o altres tipus que no ens serveixen.
function ensureObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(
      400,
      'MISSING_REQUIRED_FIELDS',
      'Body invalid. Cal enviar un objecte JSON'
    );
  }
}

// Helper per netejar strings (treure espais als extrems).
// Si no es string, retorno string buit.
function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Validacio i normalitzacio del body de registre.
// Aquesta funcio es "pura": nomes valida i retorna dades netes.
function validateRegisterBody(body) {
  // Primer verifico que el body tingui forma correcta.
  ensureObject(body);

  // Normalitzo camps de text.
  const nom = normalizeString(body.nom);
  const cognom = normalizeString(body.cognom);
  const nomUsuari = normalizeString(body.nomUsuari).toLowerCase();
  const mail = normalizeString(body.mail).toLowerCase();

  // contrasenya no la faig toLowerCase perque ha de mantenir majuscules.
  const contrasenya = typeof body.contrasenya === 'string' ? body.contrasenya : '';

  // Validacio de camps obligatoris.
  if (!nom || !cognom || !nomUsuari || !mail || !contrasenya) {
    throw createAppError(
      400,
      'MISSING_REQUIRED_FIELDS',
      'Falten camps obligatoris: nom, cognom, nomUsuari, mail o contrasenya'
    );
  }

  // Validacio de format email.
  if (!EMAIL_REGEX.test(mail)) {
    throw createAppError(400, 'INVALID_EMAIL', 'Format de mail invalid');
  }

  // Validacio de format nomUsuari segons requisit estricte.
  if (!USERNAME_REGEX.test(nomUsuari)) {
    throw createAppError(
      400,
      'INVALID_USERNAME',
      'nomUsuari invalid. Usa 3-30 caracters amb minuscules, numeros, _ o .'
    );
  }

  // Validacio de fortalesa/forma de contrasenya segons requisit.
  if (!PASSWORD_REGEX.test(contrasenya)) {
    throw createAppError(
      400,
      'INVALID_PASSWORD_FORMAT',
      'Contrasenya invalida. Ha de tenir 8-30 caracters, almenys 1 majuscula i 1 numero, i nomes lletres i numeros'
    );
  }

  // fotoPerfil es opcional i ha de ser string o null.
  let fotoPerfil = null;

  // Si no ve o ve a null, guardarem null a BD.
  if (body.fotoPerfil === null || typeof body.fotoPerfil === 'undefined') {
    fotoPerfil = null;

  // Si es string, el netejo; si queda buit, el converteixo a null.
  } else if (typeof body.fotoPerfil === 'string') {
    const trimmed = body.fotoPerfil.trim();
    fotoPerfil = trimmed ? trimmed : null;

  // Qualsevol altre tipus (objecte, numero, etc.) no es valid.
  } else {
    throw createAppError(400, 'VALIDATION_ERROR', 'fotoPerfil ha de ser string o null');
  }

  // Retorno el payload ja net per al servei.
  return {
    nom,
    cognom,
    nomUsuari,
    mail,
    contrasenya,
    fotoPerfil
  };
}

// Validacio i normalitzacio del body de login.
function validateLoginBody(body) {
  // Reutilitzo validacio d'objecte.
  ensureObject(body);

  // Normalitzo mail segons requisit.
  const mail = normalizeString(body.mail).toLowerCase();

  // Mantenim contrasenya tal com ve (sensible a majuscules).
  const contrasenya = typeof body.contrasenya === 'string' ? body.contrasenya : '';

  // Camps obligatoris de login.
  if (!mail || !contrasenya) {
    throw createAppError(400, 'MISSING_REQUIRED_FIELDS', 'Cal enviar mail i contrasenya');
  }

  // Evitem format de mail invalid ja en capa de validacio.
  if (!EMAIL_REGEX.test(mail)) {
    throw createAppError(400, 'INVALID_EMAIL', 'Format de mail invalid');
  }

  // Retorno dades netes.
  return {
    mail,
    contrasenya
  };
}

// Exporto validacions per usar-les al controller.
module.exports = {
  validateRegisterBody,
  validateLoginBody
};

// Importo el helper d'errors comu del projecte.
// Aquest helper ens deixa crear errors homogenis amb:
// - status HTTP
// - codi funcional intern
// - missatge clar
// Aixi mantenim exactament el mateix estil d'errors que la resta del backend.
const { createAppError } = require('../../common/utils/http-error');

// Reutilitzo el mateix patro de validacio de nomUsuari que ja fem al modul auth.
// Regla:
// - 3 a 30 caracters
// - minuscules, numeros, punt i guio baix
const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

// Whitelist estricta dels unics camps editables al perfil.
// IMPORTANT: qualsevol altre camp al body es considerara error de validacio.
const ALLOWED_UPDATE_FIELDS = ['nom', 'cognom', 'nomUsuari', 'fotoPerfil'];

// Helper per normalitzar text:
// - si es string, fem trim per treure espais extrems
// - si no es string, retornem string buit
// Aixo simplifica les validacions posteriors.
function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Comprovo que el body sigui un objecte JSON "normal".
// No acceptem null, arrays ni tipus primitius.
function ensureObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createAppError(400, 'VALIDATION_ERROR', 'Body invalid. Cal enviar un objecte JSON');
  }
}

// Valido el parametre :id per a totes les rutes /users/:id.
// En aquest projecte, per aquest issue, validacio simple = no buit.
function validateUserIdParam(params) {
  // Faig trim per evitar ids com "   ".
  const id = normalizeString(params && params.id);

  // Si no hi ha id usable, retornem error funcional 400.
  if (!id) {
    throw createAppError(400, 'USER_ID_INVALID', 'Parametre id d usuari invalid');
  }

  // Retorno id net per usar-lo al controller/service.
  return id;
}

// Validacio d'autoritzacio de propietari.
// Aquesta funcio s'utilitza als endpoints protegits que nomes pot fer el mateix usuari.
function validateOwnerAccess(auth, targetUserId) {
  // Si no hi ha payload auth, el token no es usable.
  if (!auth || !auth.userId) {
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }

  // Si l'usuari autenticat no coincideix amb l'id de la ruta, es un 403.
  if (auth.userId !== targetUserId) {
    throw createAppError(403, 'FORBIDDEN_NOT_OWNER', 'No tens permisos per accedir a aquest recurs');
  }
}

// Valido i normalitzo el body de PUT /users/:id.
// Objectiu:
// - acceptar nomes camps permesos
// - validar tipus i format
// - retornar un objecte updateData ja net per passar directament a Prisma
function validateUpdateProfileBody(body) {
  // Primer garantim que arriba un objecte JSON valid.
  ensureObject(body);

  // Llegeixo totes les claus del body per validar whitelist.
  const keys = Object.keys(body);

  // No admetem body buit (cal enviar almenys un camp editable).
  if (!keys.length) {
    throw createAppError(400, 'VALIDATION_ERROR', 'Body buit. Cal enviar almenys un camp editable');
  }

  // Detecto si hi ha claus no permeses (mail, rol, contrasenyaHash, etc.).
  const invalidKeys = keys.filter((key) => !ALLOWED_UPDATE_FIELDS.includes(key));
  if (invalidKeys.length) {
    throw createAppError(400, 'VALIDATION_ERROR', 'Hi ha camps no permesos al body');
  }

  // Aquest objecte acumulara nomes camps validats i normalitzats.
  const updateData = {};

  // Camp "nom": opcional, pero si arriba ha de ser string no buit.
  if (Object.prototype.hasOwnProperty.call(body, 'nom')) {
    // Validem tipus.
    if (typeof body.nom !== 'string') {
      throw createAppError(400, 'VALIDATION_ERROR', 'nom ha de ser un string');
    }

    // Fem trim i comprovem que no quedi buit.
    const nom = normalizeString(body.nom);
    if (!nom) {
      throw createAppError(400, 'VALIDATION_ERROR', 'nom no pot ser buit');
    }

    // Guardem valor net.
    updateData.nom = nom;
  }

  // Camp "cognom": opcional, pero si arriba ha de ser string no buit.
  if (Object.prototype.hasOwnProperty.call(body, 'cognom')) {
    // Validem tipus.
    if (typeof body.cognom !== 'string') {
      throw createAppError(400, 'VALIDATION_ERROR', 'cognom ha de ser un string');
    }

    // Fem trim i comprovem que no quedi buit.
    const cognom = normalizeString(body.cognom);
    if (!cognom) {
      throw createAppError(400, 'VALIDATION_ERROR', 'cognom no pot ser buit');
    }

    // Guardem valor net.
    updateData.cognom = cognom;
  }

  // Camp "nomUsuari": opcional, pero si arriba l'hem de validar fort.
  // Tambe el passem a minuscules per mantenir coherencia amb auth/register.
  if (Object.prototype.hasOwnProperty.call(body, 'nomUsuari')) {
    // Validem tipus.
    if (typeof body.nomUsuari !== 'string') {
      throw createAppError(400, 'VALIDATION_ERROR', 'nomUsuari ha de ser un string');
    }

    // Normalitzacio + lowercase.
    const nomUsuari = normalizeString(body.nomUsuari).toLowerCase();
    if (!nomUsuari) {
      throw createAppError(400, 'VALIDATION_ERROR', 'nomUsuari no pot ser buit');
    }

    // Mateixa regex del modul auth per mantenir regles consistents.
    if (!USERNAME_REGEX.test(nomUsuari)) {
      throw createAppError(
        400,
        'INVALID_USERNAME',
        'nomUsuari invalid. Usa 3-30 caracters amb minuscules, numeros, _ o .'
      );
    }

    // Guardem valor net.
    updateData.nomUsuari = nomUsuari;
  }

  // Camp "fotoPerfil": pot ser string o null, igual que al modul auth.
  // Aixo permet treure la foto (null) o actualitzar-la (string).
  if (Object.prototype.hasOwnProperty.call(body, 'fotoPerfil')) {
    // Si arriba null, ho respectem.
    if (body.fotoPerfil === null) {
      updateData.fotoPerfil = null;

    // Si arriba string, netegem espais.
    } else if (typeof body.fotoPerfil === 'string') {
      const trimmed = body.fotoPerfil.trim();

      // String buit el convertim a null per evitar valors "sense contingut".
      updateData.fotoPerfil = trimmed ? trimmed : null;

    // Qualsevol altre tipus no es valid.
    } else {
      throw createAppError(400, 'VALIDATION_ERROR', 'fotoPerfil ha de ser string o null');
    }
  }

  // Retorno payload final per passar-lo directament a update del servei.
  return updateData;
}

// Exporto validadors del modul users.
module.exports = {
  validateUserIdParam,
  validateOwnerAccess,
  validateUpdateProfileBody
};
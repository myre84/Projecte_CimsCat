// Importo helper comu per generar errors homogenis a tota l'API.
const { createAppError } = require('../../common/utils/http-error');

// Llista tancada dels MIME types d'imatge que acceptem.
// Ho limitem expressament per evitar pujades de fitxers executables o no desitjats.
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const USER_UPLOAD_FIELDS = ['image', 'file', 'fotoPerfil', 'avatar'];

// Validacio simple de MIME type.
// Retorna true si esta dins de la whitelist i false en cas contrari.
function isValidImageMimeType(mimeType) {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
}

// Validacio de la pujada multiple per publicacions.
// Esperem req.files (array) amb almenys 1 imatge.
function validatePublicacionsUploadRequest(files) {
  if (!Array.isArray(files) || !files.length) {
    throw createAppError(400, 'UPLOAD_REQUIRED', 'Cal pujar almenys una imatge de publicacio');
  }
}

// Validacio de pujada simple per peaks.
// Esperem req.file (objecte d'un sol fitxer).
function validatePeaksUploadRequest(file) {
  if (!file) {
    throw createAppError(400, 'UPLOAD_REQUIRED', 'Cal pujar una imatge de peak');
  }
}

// Resol el fitxer d'usuari per suportar diferents noms de camp.
function resolveUserUploadFile(file, files) {
  if (file) return file;

  if (Array.isArray(files) && files.length) {
    return files[0];
  }

  if (files && typeof files === 'object') {
    for (const fieldName of USER_UPLOAD_FIELDS) {
      if (Array.isArray(files[fieldName]) && files[fieldName][0]) {
        return files[fieldName][0];
      }
    }
  }

  return null;
}

// Validacio de pujada simple per usuaris.
function validateUsersUploadRequest(file) {
  if (!file) {
    throw createAppError(400, 'UPLOAD_REQUIRED', 'Cal pujar una imatge de perfil');
  }
}

// Exporto validators i helper de MIME per usar-los a routes/controller.
module.exports = {
  isValidImageMimeType,
  validatePublicacionsUploadRequest,
  validatePeaksUploadRequest,
  resolveUserUploadFile,
  validateUsersUploadRequest
};

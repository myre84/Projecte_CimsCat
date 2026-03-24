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

// Exporto validators i helper de MIME per usar-los a routes/controller.
module.exports = {
  isValidImageMimeType,
  validatePublicacionsUploadRequest,
  validatePeaksUploadRequest
};

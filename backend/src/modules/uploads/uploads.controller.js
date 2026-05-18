// sendError transforma qualsevol error en resposta HTTP controlada.
const { sendError } = require('../../common/utils/http-error');

// Validators especifics del modul uploads.
// Ens asseguren que realment ha arribat el fitxer/array de fitxers.
const {
  validatePublicacionsUploadRequest,
  validatePeaksUploadRequest,
  resolveUserUploadFile,
  validateUsersUploadRequest
} = require('./uploads.validators');

// Mappers per convertir objectes de multer al contracte de resposta API.
const {
  mapUploadedPublicacionsFiles,
  mapUploadedPeakFile,
  mapUploadedUserFile
} = require('./uploads.service');

// Controller de POST /uploads/publicacions.
// Rep fitxers de multer a req.files i retorna URLs publiques relatives.
async function uploadPublicacionsImages(req, res) {
  try {
    // Validacio funcional minima: almenys 1 fitxer.
    validatePublicacionsUploadRequest(req.files);

    // Convertim fitxers interns al format que esperara el frontend/client.
    const files = mapUploadedPublicacionsFiles(req.files);

    // Resposta 200 amb resum de la pujada.
    return res.status(200).json({
      ok: true,
      message: 'Imatges de publicacio pujades correctament',
      count: files.length,
      files
    });
  } catch (error) {
    // Qualsevol error validacio/multer/inesperat passa pel sistema comu.
    return sendError(res, error);
  }
}

// Controller de POST /uploads/peaks.
// Rep un unic fitxer a req.file i retorna la URL publica relativa.
async function uploadPeakImage(req, res) {
  try {
    // Validacio funcional minima: fitxer obligatori.
    validatePeaksUploadRequest(req.file);

    // Mapeig al format de resposta que consumira el client.
    const file = mapUploadedPeakFile(req.file);

    // Resposta 200 amb detall del fitxer pujat.
    return res.status(200).json({
      ok: true,
      message: 'Imatge de peak pujada correctament',
      file
    });
  } catch (error) {
    // Mateixa estrategia d'error homogenia del projecte.
    return sendError(res, error);
  }
}

// Controller de POST /uploads/users.
// Rep un unic fitxer (admet camps image, file, fotoPerfil, avatar).
async function uploadUserImage(req, res) {
  try {
    const file = resolveUserUploadFile(req.file, req.files);
    validateUsersUploadRequest(file);

    const mapped = mapUploadedUserFile(file);

    return res.status(200).json({
      ok: true,
      message: 'Imatge de perfil pujada correctament',
      file: mapped
    });
  } catch (error) {
    return sendError(res, error);
  }
}

// Exporto controllers per connectar-los al router del modul uploads.
module.exports = {
  uploadPublicacionsImages,
  uploadPeakImage,
  uploadUserImage
};

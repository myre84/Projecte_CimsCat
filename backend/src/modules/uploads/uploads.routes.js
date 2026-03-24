// Express per crear router modular.
const express = require('express');
// Multer per gestionar multipart/form-data (pujada de fitxers).
const multer = require('multer');
// Helpers d'error comuns del projecte.
const { createAppError, sendError } = require('../../common/utils/http-error');
// Middleware d'autenticacio JWT.
const { requireAuth } = require('../../common/middlewares/auth.middleware');
// Middleware de permisos admin.
const { requireAdmin } = require('../../common/middlewares/role.middleware');
// Controllers finals que retornen la resposta JSON.
const uploadsController = require('./uploads.controller');

// Validator de MIME per admetre nomes imatges.
const {
  isValidImageMimeType
} = require('./uploads.validators');

// Helpers de rutes/fitxers del modul uploads.
const {
  ensureUploadsDirectories,
  getUploadsPublicacionsDir,
  getUploadsPeaksDir,
  buildUniqueFilename
} = require('./uploads.service');

const router = express.Router();

// Ensurem carpetes abans de gestionar pujades.
// Ho executem una sola vegada quan es carrega aquest modul.
ensureUploadsDirectories();

// Crea middleware multer configurable segons directori desti i mode.
// mode='single'  -> espera camp image (1 fitxer)
// mode='array'   -> espera camp images (fins a 10 fitxers)
function createUploadMiddleware(destinationDir, mode) {
  // Definim on es guarda el fitxer i com es nomena al disc.
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destinationDir),
    filename: (req, file, cb) => cb(null, buildUniqueFilename(file.originalname))
  });

  // Configuracio principal de multer.
  const upload = multer({
    storage,
    limits: {
      // Limit de 10MB per fitxer.
      fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
      // Bloca tipus no permesos abans de desar-los a disc.
      if (!isValidImageMimeType(file.mimetype)) {
        return cb(createAppError(400, 'INVALID_FILE_TYPE', 'Nomes es permeten fitxers d imatge'));
      }

      return cb(null, true);
    }
  });

  if (mode === 'single') {
    // Pujada simple: req.file, camp form-data = image
    return upload.single('image');
  }

  // Pujada multiple: req.files, camp form-data = images (max 10)
  return upload.array('images', 10);
}

// Wrapper per adaptar errors de multer al format d'errors del projecte.
function runUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      // Si no hi ha error, continuem cadena de middlewares.
      if (!error) {
        return next();
      }

      // Errors propis de multer (limit mida, format formulari, etc).
      if (error instanceof multer.MulterError) {
        return sendError(
          res,
          createAppError(400, 'UPLOAD_ERROR', `Error de pujada: ${error.message}`)
        );
      }

      // Altres errors (incloent createAppError del fileFilter).
      return sendError(res, error);
    });
  };
}

// Instancies de middleware segons tipus de recurs.
const uploadPublicacions = createUploadMiddleware(getUploadsPublicacionsDir(), 'array');
const uploadPeaks = createUploadMiddleware(getUploadsPeaksDir(), 'single');

// POST /uploads/publicacions
// Ruta protegida per usuari autenticat.
// L'ordre de middlewares es important:
// 1) auth
// 2) pujada multer
// 3) controller
router.post(
  '/publicacions',
  requireAuth,
  runUpload(uploadPublicacions),
  uploadsController.uploadPublicacionsImages
);

// POST /uploads/peaks
// Ruta protegida i reservada a admin.
// Exemple d'us: pujar imatge i despres fer POST /peaks amb aquesta URL.
router.post(
  '/peaks',
  requireAuth,
  requireAdmin,
  runUpload(uploadPeaks),
  uploadsController.uploadPeakImage
);

// Exporto router per muntar-lo des de app.js sota /uploads.
module.exports = router;

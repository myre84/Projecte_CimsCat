// fs (sync) per crear carpetes d'uploads a l'inici.
const fs = require('fs');
// path per generar rutes compatibles amb qualsevol sistema operatiu.
const path = require('path');
// Importo l'arrel comuna d'uploads definida al helper global.
const { UPLOADS_ROOT } = require('../../common/utils/upload-files');

// Garanteix que existeixin les carpetes necessaries abans de pujar fitxers.
// recursive:true evita errors si la carpeta ja existeix.
function ensureUploadsDirectories() {
  fs.mkdirSync(path.join(UPLOADS_ROOT, 'publicacions'), { recursive: true });
  fs.mkdirSync(path.join(UPLOADS_ROOT, 'peaks'), { recursive: true });
  fs.mkdirSync(path.join(UPLOADS_ROOT, 'users'), { recursive: true });
}

// Retorna ruta absoluta de la carpeta on guardem imatges de publicacions.
function getUploadsPublicacionsDir() {
  return path.join(UPLOADS_ROOT, 'publicacions');
}

// Retorna ruta absoluta de la carpeta on guardem imatges de peaks.
function getUploadsPeaksDir() {
  return path.join(UPLOADS_ROOT, 'peaks');
}

// Retorna ruta absoluta de la carpeta on guardem imatges d'usuaris.
function getUploadsUsersDir() {
  return path.join(UPLOADS_ROOT, 'users');
}

// Crea nom de fitxer unic per minimitzar col.lisions.
// Estrategia:
// - timestamp actual
// - numero aleatori
// - extensio original (si existeix), en minuscules
// - fallback a .jpg si no hi ha extensio valida
function buildUniqueFilename(originalname) {
  const extension = path.extname(originalname || '').toLowerCase();
  const safeExt = extension || '.jpg';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
}

// Mapeja fitxers pujats de publicacions al format de resposta API.
// El client rebra URL publica relativa que despres pot guardar a BD.
function mapUploadedPublicacionsFiles(files) {
  return files.map((file) => ({
    filename: file.filename,
    url: `/uploads/publicacions/${file.filename}`
  }));
}

// Mapeja un fitxer pujat de peak al format de resposta API.
function mapUploadedPeakFile(file) {
  return {
    filename: file.filename,
    url: `/uploads/peaks/${file.filename}`
  };
}

// Mapeja un fitxer pujat d'usuari al format de resposta API.
function mapUploadedUserFile(file) {
  return {
    filename: file.filename,
    url: `/uploads/users/${file.filename}`
  };
}

// Exporto helpers perque uploads.routes.js els pugui reutilitzar.
module.exports = {
  ensureUploadsDirectories,
  getUploadsPublicacionsDir,
  getUploadsPeaksDir,
  getUploadsUsersDir,
  buildUniqueFilename,
  mapUploadedPublicacionsFiles,
  mapUploadedPeakFile,
  mapUploadedUserFile
};

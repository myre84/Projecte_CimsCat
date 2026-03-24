// fs/promises per fer operacions de fitxers amb async/await.
const fs = require('fs/promises');
// path per construir rutes de forma portable i segura.
const path = require('path');

// Arrel real de la carpeta uploads al backend.
// __dirname en aquest fitxer apunta a src/common/utils.
// Amb ../../../uploads pugem fins backend/uploads.
const UPLOADS_ROOT = path.resolve(__dirname, '../../../uploads');

// Converteix una URL publica /uploads/... a path absolut segur al disc.
// Exemple:
// - entrada: /uploads/publicacions/imatge.jpg
// - sortida: C:\...\backend\uploads\publicacions\imatge.jpg
//
// Retorna null si la URL no es valida, per evitar eliminar/arxivar fitxers
// que no pertoquen a la carpeta d'uploads del projecte.
function publicUploadUrlToAbsolutePath(publicUrl) {
  // Validacio minima: ha de ser string i ha de comencar pel prefix public que fem servir.
  if (typeof publicUrl !== 'string' || !publicUrl.startsWith('/uploads/')) {
    return null;
  }

  // Treiem el prefix public per obtenir ruta relativa interna.
  const relativePath = publicUrl.replace('/uploads/', '');
  // Convertim a path absolut sota la carpeta UPLOADS_ROOT.
  const absolutePath = path.resolve(UPLOADS_ROOT, relativePath);

  // Evitem path traversal fora de uploads.
  // Cas atacant: /uploads/../../.env
  // En aquest cas absolutePath quedaria fora de UPLOADS_ROOT i retornem null.
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    return null;
  }

  // Ruta segura preparada per llegir/esborrar al disc.
  return absolutePath;
}

// Esborra un fitxer d'uploads de forma segura.
// Si no existeix, s'ignora sense error.
async function safeDeleteUploadByUrl(publicUrl) {
  // Reutilitzem la funcio de seguretat per evitar tocar fitxers fora d'uploads.
  const absolutePath = publicUploadUrlToAbsolutePath(publicUrl);
  if (!absolutePath) {
    // Si la URL no era valida, no fem res i sortim silenciosament.
    return;
  }

  try {
    // Intent d'esborrat real al sistema de fitxers.
    await fs.unlink(absolutePath);
  } catch (error) {
    // ENOENT = el fitxer no existeix. No ho tractem com error greu.
    if (error && error.code === 'ENOENT') {
      return;
    }

    // No trenquem el flux principal per errors de disc no critiques.
    // Aquest helper s'utilitza durant updates/deletes de publicacions,
    // i preferim no fer caure tota l'operacio per un problema puntual de fitxer.
  }
}

// Exportem constants i helpers perque altres moduls els puguin reutilitzar.
module.exports = {
  UPLOADS_ROOT,
  publicUploadUrlToAbsolutePath,
  safeDeleteUploadByUrl
};

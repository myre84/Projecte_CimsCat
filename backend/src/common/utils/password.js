// Importo bcrypt per hashejar i comparar contrasenyes.
const bcrypt = require('bcrypt');

// Cost del hash (10) equilibrat per desenvolupament i seguretat base.
const SALT_ROUNDS = 10;

// Rep una contrasenya en text pla i retorna el hash.
// Mai guardem contrasenyes en clar a la base de dades.
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

// Compara una contrasenya en clar amb el hash guardat.
// Retorna true si coincideix, false si no.
async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// Exporto les dues utilitats per reutilitzar-les al servei d'auth.
module.exports = {
  hashPassword,
  comparePassword
};

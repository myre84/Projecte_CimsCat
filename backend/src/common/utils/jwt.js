// Importo la llibreria jsonwebtoken per signar i verificar tokens.
const jwt = require('jsonwebtoken');

// Importo el helper d'errors per llançar errors controlats.
const { createAppError } = require('./http-error');

// Funcio interna que garanteix que tenim JWT_SECRET al servidor.
// Sense secret no podem signar ni validar tokens de forma segura.
function getJwtSecret() {
  // Llegeixo la variable d'entorn.
  const secret = process.env.JWT_SECRET;

  // Si falta o esta buida, fallo de configuracio del backend.
  if (!secret || !secret.trim()) {
    throw createAppError(
      500,
      'JWT_SECRET_NOT_CONFIGURED',
      'JWT_SECRET no esta configurat al servidor'
    );
  }

  // Si tot esta correcte, retorno el secret.
  return secret;
}

// Aquesta funcio crea (signa) el token JWT d'acces.
// Rep un usuari i posa al payload nomes dades essencials.
function signAccessToken(user) {
  // Obte el secret de forma segura i centralitzada.
  const secret = getJwtSecret();

  // Defineixo el payload minim recomanat pel projecte.
  const payload = {
    userId: user.id,
    mail: user.mail,
    rol: user.rol,
    nomUsuari: user.nomUsuari
  };

  // Signo el token amb expiracio de 7 dies.
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Aquesta funcio valida el token rebut del client.
// Si es valid retorna el payload decodificat.
function verifyAccessToken(token) {
  // Necessitem el mateix secret que es va usar per signar.
  const secret = getJwtSecret();

  try {
    // Verifica signatura, expiracio i estructura del token.
    return jwt.verify(token, secret);
  } catch (error) {
    // Per seguretat no exposem detalls interns del token.
    // Tornem un 401 generic de token invalid/caducat.
    throw createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat');
  }
}

// Exporto helpers per usar-los a middleware i serveis.
module.exports = {
  signAccessToken,
  verifyAccessToken
};

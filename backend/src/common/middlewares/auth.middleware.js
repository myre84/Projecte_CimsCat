// Importo el verificador de JWT.
const { verifyAccessToken } = require('../utils/jwt');

// Importo helpers d'error per retornar respostes consistents.
const { createAppError, sendError } = require('../utils/http-error');

// Middleware reutilitzable per protegir rutes privades.
// Si el token es valid, injecta req.auth i deixa passar.
// Si no, talla la peticio amb 401.
function requireAuth(req, res, next) {
  // Llegeixo la capcalera Authorization enviada pel client.
  const authorization = req.headers.authorization;

  // Si no existeix capcalera, no hi ha forma d'autenticar-se.
  if (!authorization) {
    return sendError(
      res,
      createAppError(401, 'AUTH_TOKEN_MISSING', 'Falta la capcalera Authorization')
    );
  }

  // Esperem el format exacte: "Bearer <token>"
  const [scheme, token] = authorization.split(' ');

  // Si l'esquema no es Bearer o falta token, format invalid.
  if (scheme !== 'Bearer' || !token) {
    return sendError(
      res,
      createAppError(401, 'AUTH_TOKEN_INVALID', 'Format de token invalid. Usa Bearer <token>')
    );
  }

  try {
    // Verifiquem token i n'obtenim payload.
    const payload = verifyAccessToken(token);

    // Guardem les dades autenticades al req per usar-les despres.
    req.auth = payload;

    // Continuem al seguent middleware/controller.
    return next();
  } catch (error) {
    // Si falla la verificacio, retornem error controlat.
    return sendError(res, error);
  }
}

// Exporto middleware per usar-lo a rutes com /auth/me.
module.exports = {
  requireAuth
};

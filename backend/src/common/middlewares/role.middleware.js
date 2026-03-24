// Importo helpers d'error comuns del projecte.
// - createAppError: construeix un objecte d'error amb status, codi i missatge.
// - sendError: converteix aquest error en resposta HTTP consistent.
// Ho fem aixi perque totes les API responses d'error tinguin el mateix format.
const { createAppError, sendError } = require('../utils/http-error');

// Middleware per exigir rol admin abans d'entrar a un endpoint sensible.
// Aquest middleware NO valida el token des de zero; nomes comprova la part de permisos.
// Per tant, la ruta l'ha de cridar despres de requireAuth.
// Exemple d'ordre correcte: requireAuth -> requireAdmin -> controller.
function requireAdmin(req, res, next) {
  // Primera barrera: assegurem que existeix context autenticat.
  // Si req.auth no existeix, vol dir que no ha passat per requireAuth
  // o que el token era invalid/caducat.
  if (!req.auth || !req.auth.userId) {
    // Retornem 401 per indicar problema d'autenticacio.
    return sendError(res, createAppError(401, 'AUTH_TOKEN_INVALID', 'Token invalid o caducat'));
  }

  // Segona barrera: comprovem el rol real de l'usuari autenticat.
  // Si no es admin, retornem 403 (prohibit), no 401.
  // 401 = no autenticat, 403 = autenticat pero sense permisos.
  if (req.auth.rol !== 'admin') {
    return sendError(res, createAppError(403, 'ADMIN_REQUIRED', 'Cal rol admin per aquest recurs'));
  }

  // Si arriba aqui, l'usuari es autenticat i admin, per tant deixem passar.
  return next();
}

// Exporto el middleware per poder-lo reutilitzar a qualsevol modul de rutes.
module.exports = {
  requireAdmin
};

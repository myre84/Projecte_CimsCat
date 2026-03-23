// Importo helper centralitzat per respondre errors amb format uniforme.
const { sendError } = require('../../common/utils/http-error');

// Importo validacions pures del body.
const { validateRegisterBody, validateLoginBody } = require('./auth.validators');

// Importo casos d'us (logica de negoci) del servei.
const { registerUser, loginUser, logoutUser, getCurrentUser } = require('./auth.service');

// Controller de registre.
// Responsabilitat: validar entrada, cridar servei i respondre HTTP.
async function register(req, res) {
  try {
    // Valido i normalitzo el body de registre.
    const payload = validateRegisterBody(req.body);

    // Faig el cas d'us de registre (crear usuari + token).
    const result = await registerUser(payload);

    // Resposta d'exit amb 201 (resource creat).
    return res.status(201).json({
      ok: true,
      message: 'Usuari registrat correctament',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Qualsevol error controlat (o inesperat) passa pel formatejador comu.
    return sendError(res, error);
  }
}

// Controller de login.
async function login(req, res) {
  try {
    // Valido i normalitzo credencials.
    const payload = validateLoginBody(req.body);

    // Comprovo credencials i genero token.
    const result = await loginUser(payload);

    // Resposta 200 amb token i usuari net.
    return res.status(200).json({
      ok: true,
      message: 'Login correcte',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    // Error consistent per al client.
    return sendError(res, error);
  }
}

// Controller per obtenir dades de l'usuari autenticat.
async function me(req, res) {
  try {
    // req.auth el posa requireAuth quan el token es valid.
    const user = await getCurrentUser(req.auth);

    // Retorno perfil net sense camps sensibles.
    return res.status(200).json({
      ok: true,
      message: 'Usuari autenticat recuperat correctament',
      user
    });
  } catch (error) {
    // Mateixa estrategia d'errors a tot arreu.
    return sendError(res, error);
  }
}

// Controller de logout.
// En JWT stateless no invalidem token al servidor.
async function logout(req, res) {
  try {
    // Validacio minima de context autenticat.
    await logoutUser(req.auth);

    // El client esborra token i dades locals.
    return res.status(200).json({
      ok: true,
      message: 'Logout correcte'
    });
  } catch (error) {
    // Mateix format d'errors que la resta del modul.
    return sendError(res, error);
  }
}

// Exporto controladors per associar-los a rutes.
module.exports = {
  register,
  login,
  logout,
  me
};

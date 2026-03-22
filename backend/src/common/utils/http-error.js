// Aquesta funcio em crea un objecte Error personalitzat per tota l'app.
// La idea es no fer "throw new Error" generic i prou, sino afegir:
// - status HTTP (400, 401, 409...)
// - code intern de l'API (per frontend i debugging)
// - message clar per l'usuari/client.
function createAppError(status, code, message) {
  // Creo un Error estandard de JavaScript amb el missatge.
  const error = new Error(message);

  // Hi afegeixo el codi d'estat HTTP.
  error.status = status;

  // Hi afegeixo un codi intern estable de l'aplicacio.
  error.code = code;

  // Retorno l'error ja "enriquit".
  return error;
}

// Aquesta funcio centralitza com enviem errors en format JSON consistent.
// Aixo evita que cada controller faci una resposta diferent.
function sendError(res, error) {
  // Si l'error te status valid, el faig servir. Si no, 500 per defecte.
  const status = error && Number.isInteger(error.status) ? error.status : 500;

  // Si no hi ha codi propi, envio INTERNAL_ERROR.
  const code = error && error.code ? error.code : 'INTERNAL_ERROR';

  // Si no hi ha missatge concret, envio un missatge generic de servidor.
  const message =
    error && error.message ? error.message : 'S\'ha produit un error intern del servidor';

  // Retorno la resposta HTTP amb el format acordat:
  // { ok: false, error: { status, code, message } }
  return res.status(status).json({
    ok: false,
    error: {
      status,
      code,
      message
    }
  });
}

// Exporto les dues utilitats per reutilitzar-les a serveis i controllers.
module.exports = {
  createAppError,
  sendError
};

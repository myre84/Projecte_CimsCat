// Importo Express per construir un router modular.
const express = require('express');

// Importo el controller que te la logica HTTP dels endpoints d'auth.
const authController = require('./auth.controller');

// Importo middleware que exigeix token valid per rutes privades.
const { requireAuth } = require('../../common/middlewares/auth.middleware');

// Creo el router del modul autenticacio.
const router = express.Router();

// Registre de nou usuari + auto-login.
router.post('/register', authController.register);

// Login amb mail + contrasenya.
router.post('/login', authController.login);

// Retorna l'usuari autenticat actual (ruta protegida).
router.get('/me', requireAuth, authController.me);

// Exporto router per muntar-lo a app.js amb /auth.
module.exports = router;

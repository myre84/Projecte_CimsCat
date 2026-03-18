// Importo Express per crear un router modular.
const express = require('express');

// Creo un router independent per agrupar endpoints relacionats.
const router = express.Router();

// Endpoint de comprovacio de vida del backend.
// Si respon correctament, sabem que el servidor esta funcionant.
router.get('/health', (req, res) => {
  // Retorno una resposta JSON senzilla i facil de comprovar.
  res.json({
    ok: true,
    message: 'CimsCat backend running'
  });
});

// Exporto el router per muntar-lo a l'app principal.
module.exports = router;

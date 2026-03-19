// Importo Express per construir un router modular.
// Aquest router despres es muntara a app.js sota /peaks.
const express = require('express');

// Importo el controller del modul peaks.
// El controller te la logica HTTP de cada endpoint.
const peaksController = require('./peaks.controller');

// Creo router independent per separar responsabilitats per modul.
const router = express.Router();

// GET /peaks
// Endpoint public de cataleg simple de cims.
router.get('/', peaksController.getPeaks);

// GET /peaks/:id
// Endpoint public de detall ric d'un cim concret per id.
router.get('/:id', peaksController.getPeakById);

// Exporto router perque app.js el pugui integrar.
module.exports = router;

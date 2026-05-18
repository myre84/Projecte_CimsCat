// Importo Express per construir un router modular.
// Aquest router despres es muntara a app.js sota /peaks.
const express = require('express');
const { requireAuth } = require('../../common/middlewares/auth.middleware');
const { requireAdmin } = require('../../common/middlewares/role.middleware');

// Importo el controller del modul peaks.
// El controller te la logica HTTP de cada endpoint.
const peaksController = require('./peaks.controller');

// Creo router independent per separar responsabilitats per modul.
const router = express.Router();

// GET /peaks
// Endpoint public de cataleg simple de cims.
router.get('/', peaksController.getPeaks);

// POST /peaks
// Endpoint protegit admin only per crear cims.
router.post('/', requireAuth, requireAdmin, peaksController.createPeak);

// GET /peaks/:id
// Endpoint public de detall ric d'un cim concret per id.
router.get('/:id', peaksController.getPeakById);

// POST /peaks/:id/saved
// Endpoint protegit: l'usuari guarda el cim.
router.post('/:id/saved', requireAuth, peaksController.savePeak);

// DELETE /peaks/:id/saved
// Endpoint protegit: l'usuari elimina el cim guardat.
router.delete('/:id/saved', requireAuth, peaksController.unsavePeak);

// GET /peaks/:id/saved
// Endpoint protegit: comprova si l'usuari ha guardat el cim.
router.get('/:id/saved', requireAuth, peaksController.getSavedPeak);

// PUT /peaks/:id
// Endpoint protegit admin only per actualitzar cims.
router.put('/:id', requireAuth, requireAdmin, peaksController.updatePeak);

// Exporto router perque app.js el pugui integrar.
module.exports = router;

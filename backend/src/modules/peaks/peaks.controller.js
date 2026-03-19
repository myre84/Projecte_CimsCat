// Importo helper comu per retornar errors en format homogeni.
// Aixi tots els endpoints comparteixen la mateixa estructura d'error JSON.
const { sendError } = require('../../common/utils/http-error');

// Importo validators del modul peaks.
// Aqui fem sanejament d'entrada abans de tocar la base de dades.
const { validatePeaksQuery, validatePeakIdParam } = require('./peaks.validators');

// Importo serveis amb la logica de negoci real i les consultes Prisma.
// El controller nomes orquestra HTTP (entrada/sortida).
const { getPeaksList, getPeakDetailById } = require('./peaks.service');

// Controller de GET /peaks.
// Flux:
// 1) validar query params
// 2) obtenir dades del servei
// 3) retornar resposta d'exit amb contracte estable
async function getPeaks(req, res) {
  try {
    // Valido i normalitzo query params (filtres + ordenacio + defaults).
    const filters = validatePeaksQuery(req.query);

    // Recupero el llistat de cims ja formatat pel servei.
    const peaks = await getPeaksList(filters);

    // Resposta publica estandard de l'endpoint /peaks.
    return res.status(200).json({
      ok: true,
      message: 'Llista de cims recuperada correctament',
      filters,
      count: peaks.length,
      peaks
    });
  } catch (error) {
    // Qualsevol error validat o inesperat passa pel gestor centralitzat.
    return sendError(res, error);
  }
}

// Controller de GET /peaks/:id.
// Flux:
// 1) validar id
// 2) carregar detall ric del cim
// 3) retornar payload amb clau "peak"
async function getPeakById(req, res) {
  try {
    // Netegem i validem id de params.
    const id = validatePeakIdParam(req.params);

    // Demanem al servei tota la fitxa resumida del cim.
    const peak = await getPeakDetailById(id);

    // Resposta d'exit coherent amb el contracte acordat.
    return res.status(200).json({
      ok: true,
      message: 'Detall del cim recuperat correctament',
      peak
    });
  } catch (error) {
    // Error 404/400/500 amb format homogenitzat del projecte.
    return sendError(res, error);
  }
}

// Exporto controllers per connectar-los a peaks.routes.js
module.exports = {
  getPeaks,
  getPeakById
};

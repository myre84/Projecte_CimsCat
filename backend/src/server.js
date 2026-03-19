// Carrego les variables d'entorn des del fitxer .env.
require('dotenv').config();

// Importo l'aplicacio Express ja configurada.
const app = require('./app');

// Importo Prisma per poder desconnectar netament al tancament.
const prisma = require('./lib/prisma');

// Llegeixo el port des de variables d'entorn.
// Si no existeix, faig servir 3000 per defecte.
const PORT = Number(process.env.PORT) || 3000;

// Arrenco el servidor HTTP.
const server = app.listen(PORT, () => {
  // Missatge informatiu per confirmar que l'API esta activa.
  console.log(`CimsCat backend listening on port ${PORT}`);
});

// Funcio per tancar l'aplicacio de forma controlada.
const shutdown = async (signal) => {
  // Log per saber quin senyal ha iniciat el tancament.
  console.log(`Received ${signal}. Closing server...`);

  // Primer deixem d'acceptar noves connexions HTTP.
  server.close(async () => {
    // Despres tanquem connexions de Prisma amb la BD.
    await prisma.$disconnect();

    // Confirmacio de tancament complet.
    console.log('HTTP server closed. Prisma disconnected.');

    // Sortim del proces amb codi 0 (finalitzacio correcta).
    process.exit(0);
  });
};

// Si premem Ctrl + C al terminal, executem shutdown.
process.on('SIGINT', () => shutdown('SIGINT'));

// Si el sistema demana parada (contenidor, process manager...), tambe tanquem be.
process.on('SIGTERM', () => shutdown('SIGTERM'));

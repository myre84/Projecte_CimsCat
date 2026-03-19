// Importo la classe PrismaClient generada per Prisma.
const { PrismaClient } = require('@prisma/client');

// Faig referencia a l'objecte global de Node.
// Ens ajuda a reutilitzar una sola instancia en desenvolupament.
const globalForPrisma = global;

// Si ja existeix una instancia guardada al global, la reutilitzo.
// Si no existeix, en creo una de nova.
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Configuro logs segons l'entorn.
    // En development vull veure warnings i errors.
    // En altres entorns em quedo nomes amb errors.
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

// En desenvolupament guardo la instancia al global per evitar duplicats
// quan nodemon reinicia o recarrega moduls.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Exporto la instancia per utilitzar-la a la resta del backend.
module.exports = prisma;

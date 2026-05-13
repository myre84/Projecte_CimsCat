const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');

function roundKm(value) {
  return Math.round((value || 0) * 10) / 10;
}

async function ensureUserExists(userId) {
  const u = await prisma.usuari.findUnique({ where: { id: userId }, select: { id: true } });
  if (!u) throw createAppError(404, 'USER_NOT_FOUND', "No s'ha trobat cap usuari amb aquest id");
}

async function getUserStats(userId) {
  await ensureUserExists(userId);

  const pubs = await prisma.publicacio.findMany({
    where: { usuariId: userId },
    select: {
      id: true,
      cimId: true,
      distanciaKm: true,
      desnivellPosM: true,
      tempsMin: true,
      dataActivitat: true,
      tipusActivitat: true,
      cim: { select: { id: true, nom: true, alcada: true, comarca: true } }
    }
  });

  // Totals
  const totals = {
    activitiesCount: pubs.length,
    totalKm: roundKm(pubs.reduce((s, p) => s + (Number(p.distanciaKm) || 0), 0)),
    totalElevationGainM: pubs.reduce((s, p) => s + (Number(p.desnivellPosM) || 0), 0),
    totalTimeMin: pubs.reduce((s, p) => s + (Number(p.tempsMin) || 0), 0),
    uniquePeaksCount: new Set(pubs.map((p) => p.cimId).filter(Boolean)).size
  };

  // byYear
  const byYearMap = new Map();
  pubs.forEach((p) => {
    const d = new Date(p.dataActivitat);
    if (Number.isNaN(d.getTime())) return;
    const year = d.getUTCFullYear();
    const key = year;
    if (!byYearMap.has(key)) byYearMap.set(key, { year, activitiesCount: 0, totalKm: 0, totalElevationGainM: 0, totalTimeMin: 0, uniquePeaks: new Set() });
    const entry = byYearMap.get(key);
    entry.activitiesCount += 1;
    entry.totalKm += Number(p.distanciaKm) || 0;
    entry.totalElevationGainM += Number(p.desnivellPosM) || 0;
    entry.totalTimeMin += Number(p.tempsMin) || 0;
    if (p.cimId) entry.uniquePeaks.add(p.cimId);
  });

  const byYear = Array.from(byYearMap.values()).map((e) => ({
    year: e.year,
    activitiesCount: e.activitiesCount,
    totalKm: roundKm(e.totalKm),
    totalElevationGainM: e.totalElevationGainM,
    totalTimeMin: e.totalTimeMin,
    uniquePeaksCount: e.uniquePeaks.size
  })).sort((a, b) => a.year - b.year);

  // byMonth (year + month)
  const byMonthMap = new Map();
  pubs.forEach((p) => {
    const d = new Date(p.dataActivitat);
    if (Number.isNaN(d.getTime())) return;
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const key = `${year}-${month}`;
    if (!byMonthMap.has(key)) byMonthMap.set(key, { year, month, activitiesCount: 0, totalKm: 0, totalElevationGainM: 0, totalTimeMin: 0, uniquePeaks: new Set() });
    const entry = byMonthMap.get(key);
    entry.activitiesCount += 1;
    entry.totalKm += Number(p.distanciaKm) || 0;
    entry.totalElevationGainM += Number(p.desnivellPosM) || 0;
    entry.totalTimeMin += Number(p.tempsMin) || 0;
    if (p.cimId) entry.uniquePeaks.add(p.cimId);
  });

  const byMonth = Array.from(byMonthMap.values()).map((e) => ({
    year: e.year,
    month: e.month,
    activitiesCount: e.activitiesCount,
    totalKm: roundKm(e.totalKm),
    totalElevationGainM: e.totalElevationGainM,
    totalTimeMin: e.totalTimeMin,
    uniquePeaksCount: e.uniquePeaks.size
  })).sort((a, b) => (a.year - b.year) || (a.month - b.month));

  // byActivityType
  const byTypeMap = new Map();
  pubs.forEach((p) => {
    const type = p.tipusActivitat || 'unknown';
    if (!byTypeMap.has(type)) byTypeMap.set(type, { type, activitiesCount: 0, totalKm: 0, totalElevationGainM: 0, totalTimeMin: 0 });
    const entry = byTypeMap.get(type);
    entry.activitiesCount += 1;
    entry.totalKm += Number(p.distanciaKm) || 0;
    entry.totalElevationGainM += Number(p.desnivellPosM) || 0;
    entry.totalTimeMin += Number(p.tempsMin) || 0;
  });

  const byActivityType = Array.from(byTypeMap.values()).map((e) => ({
    type: e.type,
    activitiesCount: e.activitiesCount,
    totalKm: roundKm(e.totalKm),
    totalElevationGainM: e.totalElevationGainM,
    totalTimeMin: e.totalTimeMin
  })).sort((a, b) => a.type.localeCompare(b.type));

  return {
    totals,
    byYear,
    byMonth,
    byActivityType
  };
}

module.exports = { getUserStats };

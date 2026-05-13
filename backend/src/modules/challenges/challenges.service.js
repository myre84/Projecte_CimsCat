const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');

async function ensureUserExists(userId) {
  const u = await prisma.usuari.findUnique({ where: { id: userId }, select: { id: true } });
  if (!u) throw createAppError(404, 'USER_NOT_FOUND', "No s'ha trobat cap usuari amb aquest id");
}

// Helper: get user's unique completed peaks with earliest completion date
async function getUserCompletedPeaks(userId) {
  const pubs = await prisma.publicacio.findMany({
    where: { usuariId: userId },
    select: { cimId: true, dataActivitat: true, cim: { select: { id: true, nom: true, alcada: true, comarca: true, massis: true } } }
  });

  const map = new Map();
  pubs.forEach((p) => {
    if (!p.cimId) return;
    const existing = map.get(p.cimId);
    if (!existing || new Date(p.dataActivitat) < new Date(existing.completedAt)) {
      map.set(p.cimId, { ...p.cim, completedAt: new Date(p.dataActivitat).toISOString() });
    }
  });

  return Array.from(map.values());
}

async function getAllActiveChallenges() {
  return prisma.challenge.findMany({ where: { active: true }, orderBy: { slug: 'asc' } });
}

async function getChallengeBySlug(slug) {
  const ch = await prisma.challenge.findFirst({ where: { slug, active: true } });
  if (!ch) throw createAppError(404, 'CHALLENGE_NOT_FOUND', 'Challenge not found');
  return ch;
}

async function buildChallengeProgressForUser(userId, challenge) {
  // completed peaks of user
  const userCompleted = await getUserCompletedPeaks(userId);
  const userCompletedIds = new Set(userCompleted.map((p) => p.id));

  let challengePeakIds = [];
  let challengePeaksData = [];

  if (challenge.type === 'STATIC_PEAK_LIST') {
    // fetch ChallengePeak rows
    const cps = await prisma.challengePeak.findMany({ where: { challengeId: challenge.id }, select: { cimId: true, cim: { select: { id: true, nom: true, alcada: true, comarca: true, massis: true } } } });
    challengePeakIds = cps.map((c) => c.cimId);
    challengePeaksData = cps.map((c) => c.cim);
  } else if (challenge.type === 'RULE' && challenge.ruleKey === 'MIN_ALTITUDE') {
    const minAlt = Number(challenge.ruleValue || 0);
    const cps = await prisma.cim.findMany({ where: { alcada: { gte: minAlt } }, select: { id: true, nom: true, alcada: true, comarca: true, massis: true } });
    challengePeakIds = cps.map((c) => c.id);
    challengePeaksData = cps;
  }

  const completedForChallenge = userCompleted.filter((p) => challengePeakIds.includes(p.id));
  const current = new Set(completedForChallenge.map((p) => p.id)).size;

  let target = challenge.targetValue;
  if (!target) target = challengePeakIds.length;

  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const completed = target > 0 && current >= target;

  // completedPeaks: include completedForChallenge entries with completedAt
  const completedPeaks = completedForChallenge.map((p) => ({ id: p.id, nom: p.nom, alcada: p.alcada, comarca: p.comarca, massis: p.massis, completedAt: p.completedAt }));

  // remainingPeaksPreview: first 10 challenge peaks not in userCompleted
  const remaining = challengePeaksData.filter((c) => !userCompletedIds.has(c.id)).slice(0, 10).map((c) => ({ id: c.id, nom: c.nom, alcada: c.alcada, comarca: c.comarca, massis: c.massis }));

  return {
    id: challenge.id,
    slug: challenge.slug,
    name: challenge.name,
    description: challenge.description,
    type: challenge.type,
    current,
    target,
    percent,
    completed,
    completedPeaks,
    remainingPeaksPreview: remaining
  };
}

async function getUserChallenges(userId) {
  await ensureUserExists(userId);
  const challenges = await getAllActiveChallenges();
  const results = [];
  for (const ch of challenges) {
    const item = await buildChallengeProgressForUser(userId, ch);
    results.push(item);
  }
  return results;
}

async function getUserChallengeDetail(userId, slug) {
  await ensureUserExists(userId);
  const challenge = await getChallengeBySlug(slug);
  return buildChallengeProgressForUser(userId, challenge);
}

module.exports = { getUserChallenges, getUserChallengeDetail };

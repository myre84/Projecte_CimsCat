const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');
const { getUserStats } = require('../stats/stats.service');
const { getUserChallenges } = require('../challenges/challenges.service');

async function ensureUserExists(userId) {
  const u = await prisma.usuari.findUnique({ where: { id: userId }, select: { id: true } });
  if (!u) throw createAppError(404, 'USER_NOT_FOUND', "No s'ha trobat cap usuari amb aquest id");
}

async function getUserBadges(userId) {
  await ensureUserExists(userId);
  const badges = await prisma.badge.findMany({ where: { active: true }, orderBy: { code: 'asc' } });
  const userBadges = await prisma.userBadge.findMany({ where: { usuariId: userId } });
  const unlockedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

  const result = badges.map((b) => {
    const ub = userBadges.find((x) => x.badgeId === b.id);
    return {
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      category: b.category,
      iconUrl: b.iconUrl || null,
      unlocked: Boolean(ub),
      unlockedAt: ub ? ub.unlockedAt : null
    };
  });

  return result;
}

// Evaluate conditions and assign missing badges. Idempotent.
async function evaluateAndAssignBadges(userId) {
  await ensureUserExists(userId);

  const stats = await getUserStats(userId);
  const challenges = await getUserChallenges(userId);

  // Map challenges by slug for easy lookup
  const challengeMap = new Map(challenges.map((c) => [c.slug, c]));

  // Load all active badges
  const badges = await prisma.badge.findMany({ where: { active: true } });

  // Load existing user badges
  const existing = await prisma.userBadge.findMany({ where: { usuariId: userId } });
  const existingSet = new Set(existing.map((e) => e.badgeId));

  const toCreate = [];

  for (const b of badges) {
    if (existingSet.has(b.id)) continue; // already unlocked

    let shouldUnlock = false;

    switch (b.code) {
      case 'first_publication':
        shouldUnlock = (stats.totals.activitiesCount || 0) >= 1;
        break;
      case 'first_peak':
        shouldUnlock = (stats.totals.uniquePeaksCount || 0) >= 1;
        break;
      case 'ten_peaks':
        shouldUnlock = (stats.totals.uniquePeaksCount || 0) >= 10;
        break;
      case 'hundred_feec':
        shouldUnlock = (challengeMap.get('100-cims-feec') || {}).current >= 100;
        break;
      case 'first_3000':
        shouldUnlock = (challengeMap.get('3000s-pirineus') || {}).current >= 1;
        break;
      case 'three_3000':
        shouldUnlock = (challengeMap.get('3000s-pirineus') || {}).current >= 3;
        break;
      case 'hundred_km':
        shouldUnlock = (stats.totals.totalKm || 0) >= 100;
        break;
      case 'thousand_elevation':
        shouldUnlock = (stats.totals.totalElevationGainM || 0) >= 1000;
        break;
      case 'five_comarques':
        // compute distinct comarques via publications
        // get publications with cim.comarca
        const pubs = await prisma.publicacio.findMany({ where: { usuariId: userId }, select: { cim: { select: { comarca: true } } } });
        const comarques = new Set(pubs.map((p) => p.cim && p.cim.comarca).filter(Boolean));
        shouldUnlock = comarques.size >= 5;
        break;
      default:
        shouldUnlock = false;
    }

    if (shouldUnlock) {
      toCreate.push({ usuariId: userId, badgeId: b.id, unlockedAt: new Date(), source: 'automatic' });
    }
  }

  if (!toCreate.length) return { created: 0 };

  // Create candidates in transaction but ignore duplicates if any race
  await prisma.$transaction(
    toCreate.map((data) => prisma.userBadge.create({ data }).catch(() => null))
  );

  return { created: toCreate.length };
}

module.exports = { getUserBadges, evaluateAndAssignBadges };

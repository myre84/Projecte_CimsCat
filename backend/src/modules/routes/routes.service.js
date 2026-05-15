const prisma = require('../../lib/prisma');
const { createAppError } = require('../../common/utils/http-error');

const USER_NOT_FOUND_MESSAGE = "No s'ha trobat cap usuari amb aquest id";

async function ensureUserExists(userId) {
  const user = await prisma.usuari.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw createAppError(404, 'USER_NOT_FOUND', USER_NOT_FOUND_MESSAGE);
  }
}

async function ensurePeakExists(cimId) {
  const peak = await prisma.cim.findUnique({ where: { id: cimId }, select: { id: true } });
  if (!peak) {
    throw createAppError(404, 'PEAK_NOT_FOUND', 'No s ha trobat cap cim amb aquest id');
  }
}

function mapAuthorSummary(user) {
  return {
    id: user.id,
    nomUsuari: user.nomUsuari,
    nom: user.nom,
    cognom: user.cognom,
    fotoPerfil: user.fotoPerfil
  };
}

function mapPeakSummary(peak) {
  return {
    id: peak.id,
    nom: peak.nom,
    alcada: peak.alcada,
    comarca: peak.comarca,
    massis: peak.massis,
    lat: peak.lat,
    lon: peak.lon
  };
}

function mapWaypoint(point) {
  return {
    id: point.id,
    etiqueta: point.etiqueta,
    nomPunt: point.nomPunt,
    lat: point.lat,
    lon: point.lon,
    ordreIndex: point.ordreIndex,
    createdAt: point.createdAt
  };
}

function mapRouteDetail(route) {
  return {
    id: route.id,
    usuariId: route.usuariId,
    cimId: route.cimId,
    nom: route.nom,
    tipusActivitat: route.tipusActivitat,
    ritme: route.ritme,
    tipusRecorregut: route.tipusRecorregut,
    distanciaKm: route.distanciaKm,
    desnivellPosM: route.desnivellPosM,
    desnivellNegM: route.desnivellNegM,
    tempsMin: route.tempsMin,
    altitudMaxM: route.altitudMaxM,
    altitudMinM: route.altitudMinM,
    trackUrl: route.trackUrl,
    notes: route.notes,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
    author: mapAuthorSummary(route.usuari),
    peak: mapPeakSummary(route.cim),
    waypoints: route.puntsRuta.map(mapWaypoint)
  };
}

async function getRouteByIdOrThrow(routeId) {
  const route = await prisma.rutaPlanificada.findUnique({
    where: { id: routeId },
    select: {
      id: true,
      usuariId: true,
      cimId: true,
      nom: true,
      tipusActivitat: true,
      ritme: true,
      tipusRecorregut: true,
      distanciaKm: true,
      desnivellPosM: true,
      desnivellNegM: true,
      tempsMin: true,
      altitudMaxM: true,
      altitudMinM: true,
      trackUrl: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      usuari: {
        select: {
          id: true,
          nomUsuari: true,
          nom: true,
          cognom: true,
          fotoPerfil: true
        }
      },
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true,
          lat: true,
          lon: true
        }
      },
      puntsRuta: {
        orderBy: { ordreIndex: 'asc' },
        select: {
          id: true,
          etiqueta: true,
          nomPunt: true,
          lat: true,
          lon: true,
          ordreIndex: true,
          createdAt: true
        }
      }
    }
  });

  if (!route) {
    throw createAppError(404, 'ROUTE_NOT_FOUND', 'No s ha trobat cap ruta planificada amb aquest id');
  }

  return route;
}

async function createRoute(userId, payload) {
  await ensurePeakExists(payload.cimId);

  const created = await prisma.$transaction(async (tx) => {
    const route = await tx.rutaPlanificada.create({
      data: {
        usuariId: userId,
        cimId: payload.cimId,
        nom: payload.nom,
        tipusActivitat: payload.tipusActivitat,
        ritme: payload.ritme,
        tipusRecorregut: payload.tipusRecorregut,
        distanciaKm: payload.distanciaKm,
        desnivellPosM: payload.desnivellPosM,
        desnivellNegM: payload.desnivellNegM,
        tempsMin: payload.tempsMin,
        altitudMaxM: payload.altitudMaxM,
        altitudMinM: payload.altitudMinM,
        trackUrl: typeof payload.trackUrl === 'undefined' ? null : payload.trackUrl,
        notes: typeof payload.notes === 'undefined' ? null : payload.notes
      },
      select: { id: true }
    });

    await tx.puntRuta.createMany({
      data: payload.waypoints.map((point) => ({
        rutaId: route.id,
        etiqueta: point.etiqueta,
        nomPunt: point.nomPunt,
        lat: point.lat,
        lon: point.lon,
        ordreIndex: point.ordreIndex
      }))
    });

    return route;
  });

  const detail = await getRouteByIdOrThrow(created.id);
  return mapRouteDetail(detail);
}

async function getRouteById(routeId) {
  const route = await getRouteByIdOrThrow(routeId);
  return mapRouteDetail(route);
}

async function getUserRoutes(userId) {
  await ensureUserExists(userId);

  const routes = await prisma.rutaPlanificada.findMany({
    where: { usuariId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nom: true,
      tipusActivitat: true,
      ritme: true,
      tipusRecorregut: true,
      distanciaKm: true,
      desnivellPosM: true,
      desnivellNegM: true,
      tempsMin: true,
      altitudMaxM: true,
      altitudMinM: true,
      trackUrl: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      cim: {
        select: {
          id: true,
          nom: true,
          alcada: true,
          comarca: true,
          massis: true
        }
      },
      _count: {
        select: {
          puntsRuta: true
        }
      }
    }
  });

  return routes.map((route) => ({
    id: route.id,
    nom: route.nom,
    tipusActivitat: route.tipusActivitat,
    ritme: route.ritme,
    tipusRecorregut: route.tipusRecorregut,
    distanciaKm: route.distanciaKm,
    desnivellPosM: route.desnivellPosM,
    desnivellNegM: route.desnivellNegM,
    tempsMin: route.tempsMin,
    altitudMaxM: route.altitudMaxM,
    altitudMinM: route.altitudMinM,
    trackUrl: route.trackUrl,
    notes: route.notes,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt,
    peak: {
      id: route.cim.id,
      nom: route.cim.nom,
      alcada: route.cim.alcada,
      comarca: route.cim.comarca,
      massis: route.cim.massis
    },
    waypointsCount: route._count.puntsRuta
  }));
}

async function ensureRouteOwnership(route, userId, isAdmin) {
  if (route.usuariId !== userId && !isAdmin) {
    throw createAppError(403, 'FORBIDDEN_NOT_OWNER', 'No tens permisos per aquesta ruta');
  }
}

async function updateRoute(routeId, userId, payload, isAdmin) {
  const existingRoute = await prisma.rutaPlanificada.findUnique({
    where: { id: routeId },
    select: {
      id: true,
      usuariId: true,
      altitudMaxM: true,
      altitudMinM: true
    }
  });

  if (!existingRoute) {
    throw createAppError(404, 'ROUTE_NOT_FOUND', 'No s ha trobat cap ruta planificada amb aquest id');
  }

  await ensureRouteOwnership(existingRoute, userId, isAdmin);

  if (Object.prototype.hasOwnProperty.call(payload.updateData, 'cimId')) {
    await ensurePeakExists(payload.updateData.cimId);
  }

  if (
    Object.prototype.hasOwnProperty.call(payload.updateData, 'altitudMaxM') ||
    Object.prototype.hasOwnProperty.call(payload.updateData, 'altitudMinM')
  ) {
    const nextMax = Object.prototype.hasOwnProperty.call(payload.updateData, 'altitudMaxM')
      ? payload.updateData.altitudMaxM
      : existingRoute.altitudMaxM;
    const nextMin = Object.prototype.hasOwnProperty.call(payload.updateData, 'altitudMinM')
      ? payload.updateData.altitudMinM
      : existingRoute.altitudMinM;

    if (nextMax < nextMin) {
      throw createAppError(400, 'INVALID_BODY', 'altitudMaxM no pot ser inferior a altitudMinM');
    }
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(payload.updateData).length) {
      await tx.rutaPlanificada.update({
        where: { id: routeId },
        data: payload.updateData
      });
    }

    if (payload.waypoints) {
      await tx.puntRuta.deleteMany({ where: { rutaId: routeId } });
      await tx.puntRuta.createMany({
        data: payload.waypoints.map((point) => ({
          rutaId: routeId,
          etiqueta: point.etiqueta,
          nomPunt: point.nomPunt,
          lat: point.lat,
          lon: point.lon,
          ordreIndex: point.ordreIndex
        }))
      });
    }
  });

  const detail = await getRouteByIdOrThrow(routeId);
  return mapRouteDetail(detail);
}

async function deleteRoute(routeId, userId, isAdmin) {
  const existingRoute = await prisma.rutaPlanificada.findUnique({
    where: { id: routeId },
    select: {
      id: true,
      usuariId: true
    }
  });

  if (!existingRoute) {
    throw createAppError(404, 'ROUTE_NOT_FOUND', 'No s ha trobat cap ruta planificada amb aquest id');
  }

  await ensureRouteOwnership(existingRoute, userId, isAdmin);

  await prisma.rutaPlanificada.delete({
    where: { id: routeId }
  });
}

module.exports = {
  createRoute,
  getRouteById,
  getUserRoutes,
  updateRoute,
  deleteRoute
};

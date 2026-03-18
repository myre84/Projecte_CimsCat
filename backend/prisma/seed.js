// Importo PrismaClient per poder escriure i llegir dades de la BD.
const { PrismaClient } = require('@prisma/client');

// Importo bcrypt per hashejar contrasenyes de prova.
const bcrypt = require('bcrypt');

// Creo una instancia de Prisma per utilitzar-la durant el seed.
const prisma = new PrismaClient();

// Funcio principal que fara tota la carrega de dades.
async function main() {
  // Hash de la contrasenya comuna de prova (mai guardem contrasenya en clar).
  const passwordHash = await bcrypt.hash('123456', 10);

  // ------------------------------------------------------------
  // 1) NETEJA INICIAL
  // ------------------------------------------------------------
  // Esborro primer taules filles i despres taules pare per respectar FK.
  // Aquest ordre evita errors de "foreign key constraint".
  await prisma.likePublicacio.deleteMany();
  await prisma.publicacioGuardada.deleteMany();
  await prisma.favoritCim.deleteMany();
  await prisma.comentari.deleteMany();
  await prisma.imatgePublicacio.deleteMany();
  await prisma.puntRuta.deleteMany();
  await prisma.publicacio.deleteMany();
  await prisma.rutaPlanificada.deleteMany();
  await prisma.cim.deleteMany();
  await prisma.usuari.deleteMany();

  // ------------------------------------------------------------
  // 2) DADES BASE: USUARIS
  // ------------------------------------------------------------
  // Aquests son els comptes de prova que faran publicacions i interaccions.
  const usuaris = [
    {
      id: 'usr_daliajordan',
      nomUsuari: 'daliajordan',
      nom: 'Dalia',
      cognom: 'Jordan',
      mail: 'dalia@cimscat.cat',
      contrasenyaHash: passwordHash,
      rol: 'admin',
      fotoPerfil: '/uploads/usuaris/dalia.jpg'
    },
    {
      id: 'usr_mireiagibert',
      nomUsuari: 'mireiagibert',
      nom: 'Mireia',
      cognom: 'Gibert',
      mail: 'mireia@cimscat.cat',
      contrasenyaHash: passwordHash,
      rol: 'usuari',
      fotoPerfil: '/uploads/usuaris/mireia.jpg'
    },
    {
      id: 'usr_danimoore',
      nomUsuari: 'danimoore',
      nom: 'Dani',
      cognom: 'Moore',
      mail: 'dani@cimscat.cat',
      contrasenyaHash: passwordHash,
      rol: 'guia',
      fotoPerfil: '/uploads/usuaris/dani.jpg'
    }
  ];

  // ------------------------------------------------------------
  // 3) DADES BASE: CIMS
  // ------------------------------------------------------------
  // Cataleg inicial de cims reals amb metadades geografiques i descriptives.
  const cims = [
    {
      id: 'cim_la_mola',
      nom: 'La Mola',
      alcada: 1104,
      comarca: 'Valles Occidental',
      lat: 41.6405,
      lon: 2.0178,
      dificultat: 'moderada',
      descripcio: 'Cim emblematic de Sant Llorenc del Munt amb monestir historic al capdamunt.',
      imatgeUrl: '/uploads/cims/la-mola.jpg',
      massis: 'Sant Llorenc del Munt i l Obac',
      zonaProtegida: 'Parc Natural de Sant Llorenc del Munt i l Obac'
    },
    {
      id: 'cim_pedraforca',
      nom: 'Pedraforca',
      alcada: 2506,
      comarca: 'Bergueda',
      lat: 42.2447,
      lon: 1.7031,
      dificultat: 'alta',
      descripcio: 'Muntanya iconica amb perfil inconfusible i trams exigents a la tartera.',
      imatgeUrl: '/uploads/cims/pedraforca.jpg',
      massis: 'Serra del Cadi',
      zonaProtegida: 'Parc Natural del Cadi Moixero'
    },
    {
      id: 'cim_puigmal',
      nom: 'Puigmal',
      alcada: 2910,
      comarca: 'Ripolles',
      lat: 42.3732,
      lon: 2.1217,
      dificultat: 'alta',
      descripcio: 'Sostre del Ripolles amb vistes obertes cap a la Cerdanya i el Pirineu oriental.',
      imatgeUrl: '/uploads/cims/puigmal.jpg',
      massis: 'Pirineu Oriental',
      zonaProtegida: 'Parc Natural de les Capcaleres del Ter i del Freser'
    },
    {
      id: 'cim_matagalls',
      nom: 'Matagalls',
      alcada: 1697,
      comarca: 'Osona',
      lat: 41.8087,
      lon: 2.3815,
      dificultat: 'moderada',
      descripcio: 'Un dels grans classics del Montseny, ideal per travesses en mitja muntanya.',
      imatgeUrl: '/uploads/cims/matagalls.jpg',
      massis: 'Montseny',
      zonaProtegida: 'Parc Natural del Montseny'
    },
    {
      id: 'cim_canigo',
      nom: 'Canigo',
      alcada: 2784,
      comarca: 'Conflent',
      lat: 42.5183,
      lon: 2.4566,
      dificultat: 'alta',
      descripcio: 'Cim mitic del Pirineu catala nord, amb llarga aproximacio i ambient d alta muntanya.',
      imatgeUrl: '/uploads/cims/canigo.jpg',
      massis: 'Massis del Canigo',
      zonaProtegida: 'Reserva Natural de Prats de Mollo'
    },
    {
      id: 'cim_turo_home',
      nom: 'Turo de l Home',
      alcada: 1706,
      comarca: 'Valles Oriental',
      lat: 41.7736,
      lon: 2.4558,
      dificultat: 'moderada',
      descripcio: 'Cim principal del Montseny amb ascensio variada i opcions de ruta circular.',
      imatgeUrl: '/uploads/cims/turo-home.jpg',
      massis: 'Montseny',
      zonaProtegida: 'Parc Natural del Montseny'
    },
    {
      id: 'cim_bastiments',
      nom: 'Bastiments',
      alcada: 2881,
      comarca: 'Ripolles',
      lat: 42.4323,
      lon: 2.2144,
      dificultat: 'alta',
      descripcio: 'Gran balcon sobre la vall de Nuria i el circ d Ulldeter, molt apreciat a l hivern.',
      imatgeUrl: '/uploads/cims/bastiments.jpg',
      massis: 'Pirineu Oriental',
      zonaProtegida: 'Parc Natural de les Capcaleres del Ter i del Freser'
    },
    {
      id: 'cim_puigpedros',
      nom: 'Puigpedros',
      alcada: 2914,
      comarca: 'Cerdanya',
      lat: 42.4418,
      lon: 1.7866,
      dificultat: 'alta',
      descripcio: 'Cim fronterer molt panoramic amb recorregut llarg i pedregos.',
      imatgeUrl: '/uploads/cims/puigpedros.jpg',
      massis: 'Pirineu Axial',
      zonaProtegida: 'Espai d Interes Natural de la Tossa Plana'
    },
    {
      id: 'cim_comabona',
      nom: 'Comabona',
      alcada: 2554,
      comarca: 'Bergueda',
      lat: 42.2828,
      lon: 1.7019,
      dificultat: 'alta',
      descripcio: 'Cim destacat de la Serra del Cadi amb cresta amplia i vistes cap al Pedraforca.',
      imatgeUrl: '/uploads/cims/comabona.jpg',
      massis: 'Serra del Cadi',
      zonaProtegida: 'Parc Natural del Cadi Moixero'
    },
    {
      id: 'cim_carlit',
      nom: 'Carlit',
      alcada: 2921,
      comarca: 'Alta Cerdanya',
      lat: 42.5862,
      lon: 1.9398,
      dificultat: 'alta',
      descripcio: 'Sostre de la Cerdanya amb paisatge lacustre i tram final de blocs granitics.',
      imatgeUrl: '/uploads/cims/carlit.jpg',
      massis: 'Massis del Carlit',
      zonaProtegida: 'Parc Natural Regional dels Pirineus Catalans'
    }
  ];

  // ------------------------------------------------------------
  // 4) RUTES PLANIFICADES
  // ------------------------------------------------------------
  // Rutes preparades per poder vincular-les despres a publicacions.
  const rutesPlanificades = [
    {
      id: 'rta_la_mola_can_robert',
      usuariId: 'usr_daliajordan',
      cimId: 'cim_la_mola',
      nom: 'Circular a La Mola des de Can Robert',
      tipusActivitat: 'senderisme',
      ritme: 'moderat',
      distanciaKm: 11.8,
      desnivellPosM: 640,
      desnivellNegM: 640,
      tempsMin: 255,
      altitudMaxM: 1104,
      altitudMinM: 760,
      trackUrl: 'https://tracks.cimscat.local/rutes/la-mola-can-robert.gpx',
      notes: 'Sortida ideal per mati, evitar hores centrals a l estiu.'
    },
    {
      id: 'rta_puigmal_fontalba',
      usuariId: 'usr_mireiagibert',
      cimId: 'cim_puigmal',
      nom: 'Ascensio al Puigmal des de Fontalba',
      tipusActivitat: 'senderisme',
      ritme: 'constant',
      distanciaKm: 12.4,
      desnivellPosM: 940,
      desnivellNegM: 940,
      tempsMin: 360,
      altitudMaxM: 2910,
      altitudMinM: 2070,
      trackUrl: 'https://tracks.cimscat.local/rutes/puigmal-fontalba.gpx',
      notes: 'Ruta directa i molt exposada al vent als ultims 300 metres.'
    },
    {
      id: 'rta_pedraforca_verdet',
      usuariId: 'usr_danimoore',
      cimId: 'cim_pedraforca',
      nom: 'Pedraforca pel Verdet i baixada per l Enforcadura',
      tipusActivitat: 'alpinisme estival',
      ritme: 'exigent',
      distanciaKm: 9.7,
      desnivellPosM: 1120,
      desnivellNegM: 1120,
      tempsMin: 420,
      altitudMaxM: 2506,
      altitudMinM: 1620,
      trackUrl: 'https://tracks.cimscat.local/rutes/pedraforca-verdet-enforcadura.gpx',
      notes: 'Tram de grimpada al Verdet, recomanat casc i experiencia en terreny dret.'
    }
  ];

  // ------------------------------------------------------------
  // 5) PUNTS DE RUTA
  // ------------------------------------------------------------
  // Coordenades ordenades dins de cada ruta planificada.
  const puntsRuta = [
    {
      id: 'prt_lamola_01',
      rutaId: 'rta_la_mola_can_robert',
      etiqueta: 'sortida',
      nomPunt: 'Can Robert',
      lat: 41.6429,
      lon: 2.0255,
      ordreIndex: 1
    },
    {
      id: 'prt_lamola_02',
      rutaId: 'rta_la_mola_can_robert',
      etiqueta: 'pas',
      nomPunt: 'Can Pobla',
      lat: 41.6339,
      lon: 2.0248,
      ordreIndex: 2
    },
    {
      id: 'prt_lamola_03',
      rutaId: 'rta_la_mola_can_robert',
      etiqueta: 'cim',
      nomPunt: 'Monestir de Sant Llorenc del Munt',
      lat: 41.6405,
      lon: 2.0178,
      ordreIndex: 3
    },
    {
      id: 'prt_puigmal_01',
      rutaId: 'rta_puigmal_fontalba',
      etiqueta: 'sortida',
      nomPunt: 'Aparcament de Fontalba',
      lat: 42.3537,
      lon: 2.1458,
      ordreIndex: 1
    },
    {
      id: 'prt_puigmal_02',
      rutaId: 'rta_puigmal_fontalba',
      etiqueta: 'pas',
      nomPunt: 'Coll de Fontalba',
      lat: 42.3658,
      lon: 2.1376,
      ordreIndex: 2
    },
    {
      id: 'prt_puigmal_03',
      rutaId: 'rta_puigmal_fontalba',
      etiqueta: 'cim',
      nomPunt: 'Puigmal',
      lat: 42.3732,
      lon: 2.1217,
      ordreIndex: 3
    },
    {
      id: 'prt_pedraforca_01',
      rutaId: 'rta_pedraforca_verdet',
      etiqueta: 'sortida',
      nomPunt: 'Refugi Lluis Estasen',
      lat: 42.2503,
      lon: 1.6962,
      ordreIndex: 1
    },
    {
      id: 'prt_pedraforca_02',
      rutaId: 'rta_pedraforca_verdet',
      etiqueta: 'pas',
      nomPunt: 'Coll del Verdet',
      lat: 42.2466,
      lon: 1.7036,
      ordreIndex: 2
    },
    {
      id: 'prt_pedraforca_03',
      rutaId: 'rta_pedraforca_verdet',
      etiqueta: 'cim',
      nomPunt: 'Pollego Superior',
      lat: 42.2447,
      lon: 1.7031,
      ordreIndex: 3
    },
    {
      id: 'prt_pedraforca_04',
      rutaId: 'rta_pedraforca_verdet',
      etiqueta: 'baixada',
      nomPunt: 'Enforcadura',
      lat: 42.2477,
      lon: 1.7059,
      ordreIndex: 4
    }
  ];

  // ------------------------------------------------------------
  // 6) PUBLICACIONS
  // ------------------------------------------------------------
  // Activitats publicades pels usuaris. Algunes enllacen a rutaPlanificada.
  const publicacions = [
    {
      id: 'pub_lamola_sunrise',
      usuariId: 'usr_daliajordan',
      cimId: 'cim_la_mola',
      rutaPlanificadaId: 'rta_la_mola_can_robert',
      titol: 'Sortida a La Mola amb primera llum',
      descripcio: 'Ruta circular molt agradable. Ambient fred al cim i bones vistes del Valles.',
      dataActivitat: new Date('2026-02-08T07:30:00.000Z'),
      dificultat: 'moderada',
      distanciaKm: 11.6,
      desnivellPosM: 635,
      desnivellNegM: 635,
      tempsMin: 245,
      altitudMaxM: 1104,
      altitudMinM: 760,
      trackUrl: 'https://tracks.cimscat.local/publicacions/pub-lamola-sunrise.gpx',
      portadaUrl: '/uploads/publicacions/lamola-portada.jpg'
    },
    {
      id: 'pub_puigmal_vent',
      usuariId: 'usr_mireiagibert',
      cimId: 'cim_puigmal',
      rutaPlanificadaId: 'rta_puigmal_fontalba',
      titol: 'Puigmal amb vent fort a la carena',
      descripcio: 'Ascensio directa des de Fontalba. A la part final vam haver de reduir ritme.',
      dataActivitat: new Date('2026-01-25T09:10:00.000Z'),
      dificultat: 'alta',
      distanciaKm: 12.5,
      desnivellPosM: 955,
      desnivellNegM: 955,
      tempsMin: 372,
      altitudMaxM: 2910,
      altitudMinM: 2070,
      trackUrl: 'https://tracks.cimscat.local/publicacions/pub-puigmal-vent.gpx',
      portadaUrl: '/uploads/publicacions/puigmal-portada.jpg'
    },
    {
      id: 'pub_pedraforca_verdet',
      usuariId: 'usr_danimoore',
      cimId: 'cim_pedraforca',
      rutaPlanificadaId: 'rta_pedraforca_verdet',
      titol: 'Pedraforca pel Verdet en bones condicions',
      descripcio: 'Terreny sec i bona adherencia. Grimpada fluida i baixada controlada per la tartera.',
      dataActivitat: new Date('2026-02-14T06:45:00.000Z'),
      dificultat: 'alta',
      distanciaKm: 9.8,
      desnivellPosM: 1130,
      desnivellNegM: 1130,
      tempsMin: 430,
      altitudMaxM: 2506,
      altitudMinM: 1620,
      trackUrl: 'https://tracks.cimscat.local/publicacions/pub-pedraforca-verdet.gpx',
      portadaUrl: '/uploads/publicacions/pedraforca-portada.jpg'
    },
    {
      id: 'pub_matagalls_capvespre',
      usuariId: 'usr_mireiagibert',
      cimId: 'cim_matagalls',
      rutaPlanificadaId: null,
      titol: 'Capvespre al Matagalls',
      descripcio: 'Sortida rapida de tarda amb boira baixa i molt bona llum de retorn.',
      dataActivitat: new Date('2026-02-20T15:20:00.000Z'),
      dificultat: 'moderada',
      distanciaKm: 10.1,
      desnivellPosM: 720,
      desnivellNegM: 720,
      tempsMin: 260,
      altitudMaxM: 1697,
      altitudMinM: 1020,
      trackUrl: null,
      portadaUrl: '/uploads/publicacions/matagalls-portada.jpg'
    },
    {
      id: 'pub_bastiments_hivern',
      usuariId: 'usr_danimoore',
      cimId: 'cim_bastiments',
      rutaPlanificadaId: null,
      titol: 'Bastiments en ambient d hivern',
      descripcio: 'Neu dura a primera hora, grampons imprescindibles a les obagues.',
      dataActivitat: new Date('2026-02-02T08:00:00.000Z'),
      dificultat: 'alta',
      distanciaKm: 13.3,
      desnivellPosM: 980,
      desnivellNegM: 980,
      tempsMin: 395,
      altitudMaxM: 2881,
      altitudMinM: 1900,
      trackUrl: 'https://tracks.cimscat.local/publicacions/pub-bastiments-hivern.gpx',
      portadaUrl: '/uploads/publicacions/bastiments-portada.jpg'
    },
    {
      id: 'pub_turo_home_matinal',
      usuariId: 'usr_daliajordan',
      cimId: 'cim_turo_home',
      rutaPlanificadaId: null,
      titol: 'Entrenament matinal al Turo de l Home',
      descripcio: 'Sessio curta per sumar desnivell, sense parades llargues.',
      dataActivitat: new Date('2026-02-27T06:55:00.000Z'),
      dificultat: 'moderada',
      distanciaKm: 8.9,
      desnivellPosM: 640,
      desnivellNegM: 640,
      tempsMin: 190,
      altitudMaxM: 1706,
      altitudMinM: 1180,
      trackUrl: 'https://tracks.cimscat.local/publicacions/pub-turo-home-matinal.gpx',
      portadaUrl: '/uploads/publicacions/turo-home-portada.jpg'
    }
  ];

  // ------------------------------------------------------------
  // 7) IMATGES DE PUBLICACIO
  // ------------------------------------------------------------
  // Imatges extra per cada publicacio. Guardem nomes ruta local /uploads/...
  const imatgesPublicacio = [
    { id: 'img_pub_001', publicacioId: 'pub_lamola_sunrise', imageUrl: '/uploads/publicacions/lamola-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_002', publicacioId: 'pub_lamola_sunrise', imageUrl: '/uploads/publicacions/lamola-2.jpg', ordreIndex: 2 },
    { id: 'img_pub_003', publicacioId: 'pub_puigmal_vent', imageUrl: '/uploads/publicacions/puigmal-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_004', publicacioId: 'pub_puigmal_vent', imageUrl: '/uploads/publicacions/puigmal-2.jpg', ordreIndex: 2 },
    { id: 'img_pub_005', publicacioId: 'pub_pedraforca_verdet', imageUrl: '/uploads/publicacions/pedraforca-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_006', publicacioId: 'pub_pedraforca_verdet', imageUrl: '/uploads/publicacions/pedraforca-2.jpg', ordreIndex: 2 },
    { id: 'img_pub_007', publicacioId: 'pub_matagalls_capvespre', imageUrl: '/uploads/publicacions/matagalls-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_008', publicacioId: 'pub_matagalls_capvespre', imageUrl: '/uploads/publicacions/matagalls-2.jpg', ordreIndex: 2 },
    { id: 'img_pub_009', publicacioId: 'pub_bastiments_hivern', imageUrl: '/uploads/publicacions/bastiments-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_010', publicacioId: 'pub_bastiments_hivern', imageUrl: '/uploads/publicacions/bastiments-2.jpg', ordreIndex: 2 },
    { id: 'img_pub_011', publicacioId: 'pub_turo_home_matinal', imageUrl: '/uploads/publicacions/turo-home-1.jpg', ordreIndex: 1 },
    { id: 'img_pub_012', publicacioId: 'pub_turo_home_matinal', imageUrl: '/uploads/publicacions/turo-home-2.jpg', ordreIndex: 2 }
  ];

  // ------------------------------------------------------------
  // 8) COMENTARIS
  // ------------------------------------------------------------
  // Comentaris entre usuaris sobre publicacions.
  const comentaris = [
    { id: 'cmt_001', publicacioId: 'pub_lamola_sunrise', usuariId: 'usr_mireiagibert', text: 'Molt bona llum a la primera foto, quina hora vau sortir?' },
    { id: 'cmt_002', publicacioId: 'pub_lamola_sunrise', usuariId: 'usr_danimoore', text: 'Ruta molt recomanable entre setmana, menys transit.' },
    { id: 'cmt_003', publicacioId: 'pub_puigmal_vent', usuariId: 'usr_daliajordan', text: 'Bon ritme! El vent al cim sempre posa a prova.' },
    { id: 'cmt_004', publicacioId: 'pub_puigmal_vent', usuariId: 'usr_danimoore', text: 'La carena final estava amb ratxes constants?' },
    { id: 'cmt_005', publicacioId: 'pub_pedraforca_verdet', usuariId: 'usr_mireiagibert', text: 'Grimpada molt elegant. Quina via vau triar al tram clau?' },
    { id: 'cmt_006', publicacioId: 'pub_pedraforca_verdet', usuariId: 'usr_daliajordan', text: 'Tartera en bon estat o molt trencada?' },
    { id: 'cmt_007', publicacioId: 'pub_matagalls_capvespre', usuariId: 'usr_daliajordan', text: 'M encanta aquesta hora al Matagalls, colors molt nets.' },
    { id: 'cmt_008', publicacioId: 'pub_bastiments_hivern', usuariId: 'usr_mireiagibert', text: 'Bon apunt sobre grampons, aquesta setmana esta dur.' },
    { id: 'cmt_009', publicacioId: 'pub_turo_home_matinal', usuariId: 'usr_danimoore', text: 'Entrenament perfecte per dies laborables.' },
    { id: 'cmt_010', publicacioId: 'pub_turo_home_matinal', usuariId: 'usr_mireiagibert', text: 'Temps molt bo per aquesta distancia i desnivell.' }
  ];

  // ------------------------------------------------------------
  // 9) LIKES
  // ------------------------------------------------------------
  // Relacions usuari-publicacio (sense duplicats per clau composta).
  const likes = [
    { usuariId: 'usr_daliajordan', publicacioId: 'pub_puigmal_vent' },
    { usuariId: 'usr_daliajordan', publicacioId: 'pub_pedraforca_verdet' },
    { usuariId: 'usr_daliajordan', publicacioId: 'pub_bastiments_hivern' },
    { usuariId: 'usr_mireiagibert', publicacioId: 'pub_lamola_sunrise' },
    { usuariId: 'usr_mireiagibert', publicacioId: 'pub_pedraforca_verdet' },
    { usuariId: 'usr_mireiagibert', publicacioId: 'pub_turo_home_matinal' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_lamola_sunrise' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_puigmal_vent' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_matagalls_capvespre' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_turo_home_matinal' }
  ];

  // ------------------------------------------------------------
  // 10) FAVORITS DE CIMS
  // ------------------------------------------------------------
  // Relacions usuari-cim per provar funcionalitat de favorits.
  const favorits = [
    { usuariId: 'usr_daliajordan', cimId: 'cim_pedraforca' },
    { usuariId: 'usr_daliajordan', cimId: 'cim_puigmal' },
    { usuariId: 'usr_daliajordan', cimId: 'cim_bastiments' },
    { usuariId: 'usr_mireiagibert', cimId: 'cim_la_mola' },
    { usuariId: 'usr_mireiagibert', cimId: 'cim_matagalls' },
    { usuariId: 'usr_mireiagibert', cimId: 'cim_carlit' },
    { usuariId: 'usr_danimoore', cimId: 'cim_pedraforca' },
    { usuariId: 'usr_danimoore', cimId: 'cim_comabona' },
    { usuariId: 'usr_danimoore', cimId: 'cim_puigpedros' }
  ];

  // ------------------------------------------------------------
  // 11) PUBLICACIONS GUARDADES
  // ------------------------------------------------------------
  // Relacions usuari-publicacio per provar "saved posts".
  const guardades = [
    { usuariId: 'usr_daliajordan', publicacioId: 'pub_pedraforca_verdet' },
    { usuariId: 'usr_daliajordan', publicacioId: 'pub_bastiments_hivern' },
    { usuariId: 'usr_mireiagibert', publicacioId: 'pub_lamola_sunrise' },
    { usuariId: 'usr_mireiagibert', publicacioId: 'pub_turo_home_matinal' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_puigmal_vent' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_matagalls_capvespre' },
    { usuariId: 'usr_danimoore', publicacioId: 'pub_lamola_sunrise' }
  ];

  // ------------------------------------------------------------
  // 12) INSERCIO A LA BASE DE DADES
  // ------------------------------------------------------------
  // Inserim en ordre logic. skipDuplicates protegeix davant reexecucions.
  await prisma.usuari.createMany({ data: usuaris, skipDuplicates: true });
  await prisma.cim.createMany({ data: cims, skipDuplicates: true });
  await prisma.rutaPlanificada.createMany({ data: rutesPlanificades, skipDuplicates: true });
  await prisma.puntRuta.createMany({ data: puntsRuta, skipDuplicates: true });
  await prisma.publicacio.createMany({ data: publicacions, skipDuplicates: true });
  await prisma.imatgePublicacio.createMany({ data: imatgesPublicacio, skipDuplicates: true });
  await prisma.comentari.createMany({ data: comentaris, skipDuplicates: true });
  await prisma.likePublicacio.createMany({ data: likes, skipDuplicates: true });
  await prisma.favoritCim.createMany({ data: favorits, skipDuplicates: true });
  await prisma.publicacioGuardada.createMany({ data: guardades, skipDuplicates: true });

  // ------------------------------------------------------------
  // 13) RESUM FINAL
  // ------------------------------------------------------------
  // Mostro per consola el recompte de dades creades, per validar rapidament.
  console.log('Seed completat amb exit:');
  console.log(`- Cims: ${cims.length}`);
  console.log(`- Usuaris: ${usuaris.length}`);
  console.log(`- Rutes planificades: ${rutesPlanificades.length}`);
  console.log(`- Punts de ruta: ${puntsRuta.length}`);
  console.log(`- Publicacions: ${publicacions.length}`);
  console.log(`- Imatges de publicacio: ${imatgesPublicacio.length}`);
  console.log(`- Comentaris: ${comentaris.length}`);
  console.log(`- Likes: ${likes.length}`);
  console.log(`- Favorits: ${favorits.length}`);
  console.log(`- Publicacions guardades: ${guardades.length}`);
}

// Execucio del seed:
// - Si falla alguna cosa, mostrem error i sortim amb codi 1.
// - Sempre tanquem Prisma al final (hagi anat be o malament).
main()
  .catch((error) => {
    console.error('Error executant el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


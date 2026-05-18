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
  const adminPasswordHash = await bcrypt.hash('Admin12345', 10);

  // ------------------------------------------------------------
  // 1) NETEJA INICIAL
  // ------------------------------------------------------------
  // Esborro primer taules filles i despres taules pare per respectar FK.
  // Aquest ordre evita errors de "foreign key constraint".
  await prisma.likePublicacio.deleteMany();
  await prisma.savedPeak.deleteMany();
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
      rol: 'usuari',
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
      rol: 'usuari',
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
    ,
    // Afegim alguns cims de 3000m dels Pirineus per provar el repte 3000s
    {
      id: 'cim_aneto',
      nom: 'Aneto',
      alcada: 3404,
      comarca: 'Benasque',
      lat: 42.6460,
      lon: 0.6590,
      dificultat: 'alta',
      descripcio: 'Sostre dels Pirineus; glaci i aproximacio llarga.',
      imatgeUrl: '/uploads/cims/aneto.jpg',
      massis: 'Posets-Aneto',
      zonaProtegida: 'Parc Natural Posets-Maladeta'
    },
    {
      id: 'cim_posets',
      nom: 'Posets',
      alcada: 3375,
      comarca: 'Benasque',
      lat: 42.6450,
      lon: 0.4590,
      dificultat: 'alta',
      descripcio: 'Segon mes alt dels Pirineus, amb circ glacial i vistes.',
      imatgeUrl: '/uploads/cims/posets.jpg',
      massis: 'Posets-Aneto',
      zonaProtegida: 'Parc Natural Posets-Maladeta'
    },
    {
      id: 'cim_monte_perdido',
      nom: 'Monte Perdido',
      alcada: 3355,
      comarca: 'Sobrarbe',
      lat: 42.6833,
      lon: -0.0450,
      dificultat: 'alta',
      descripcio: 'Cims del Parc Nacional d Ordesa amb corriols espectaculars.',
      imatgeUrl: '/uploads/cims/monte-perdido.jpg',
      massis: 'Monte Perdido',
      zonaProtegida: 'Parc Nacional d Ordesa i Monte Perdido'
    },
    {
      id: 'cim_vignemale',
      nom: 'Vignemale',
      alcada: 3298,
      comarca: 'Ossau',
      lat: 42.7319,
      lon: -0.1206,
      dificultat: 'alta',
      descripcio: 'Cim fronterer amb glaci i caracters alpins.',
      imatgeUrl: '/uploads/cims/vignemale.jpg',
      massis: 'Vignemale',
      zonaProtegida: 'Parc National des Pyrenees'
    },
    {
      id: 'cim_pica_d_estats',
      nom: 'Pica d Estats',
      alcada: 3143,
      comarca: 'Alta Ribagorca',
      lat: 42.6592,
      lon: 1.3975,
      dificultat: 'alta',
      descripcio: 'Pic mes alt de Catalunya amb itinerari rocós i panorames.',
      imatgeUrl: '/uploads/cims/pica-d-estats.jpg',
      massis: 'Montcalm-Pica d Estats',
      zonaProtegida: 'Parc Natural de l Alt Pirineu'
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
      tipusRecorregut: 'circular',
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
      tipusRecorregut: 'round-trip',
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
      tipusRecorregut: 'circular',
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
      tipusActivitat: 'senderisme',
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
      tipusActivitat: 'senderisme',
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
      tipusActivitat: 'alpinisme',
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
      tipusActivitat: 'senderisme',
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
      tipusActivitat: 'alpinisme',
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
      tipusActivitat: 'trail',
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
  // 10) CIMS GUARDATS
  // ------------------------------------------------------------
  // Relacions usuari-cim per provar funcionalitat de cims guardats.
  const savedPeaks = [
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
  // 11) INSERCIO A LA BASE DE DADES
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
  await prisma.savedPeak.createMany({ data: savedPeaks, skipDuplicates: true });

  // ------------------------------------------------------------
  // 13) CHALLENGES I BADGES (UPsert)
  // ------------------------------------------------------------
  // Afegim reptes i badges definits a la especificacio.
  // Fem upsert per ser idempotents en reexecucions del seed.

  // Challenges
  const challenges = [
    {
      slug: '100-cims-feec',
      name: '100 Cims FEEC',
      description: 'Completa els 100 cims del repte FEEC.',
      type: 'STATIC_PEAK_LIST',
      targetValue: 100,
      ruleKey: null,
      ruleValue: null,
      active: true
    },
    {
      slug: '3000s-pirineus',
      name: '3000s Pirineus',
      description: 'Completa cims dels Pirineus de 3000 metres o mes.',
      type: 'RULE',
      targetValue: null,
      ruleKey: 'MIN_ALTITUDE',
      ruleValue: 3000,
      active: true
    }
  ];

  for (const ch of challenges) {
    await prisma.challenge.upsert({
      where: { slug: ch.slug },
      update: {
        name: ch.name,
        description: ch.description,
        type: ch.type,
        targetValue: ch.targetValue,
        ruleKey: ch.ruleKey,
        ruleValue: ch.ruleValue,
        active: ch.active
      },
      create: ch
    });
  }

  // Badges
  const badges = [
    { code: 'first_publication', name: 'Primera publicacio', description: 'Has publicat la teva primera activitat.', category: 'publications' },
    { code: 'first_peak', name: 'Primer cim completat', description: 'Has registrat la teva primera ascensio.', category: 'peaks' },
    { code: 'ten_peaks', name: '10 cims completats', description: 'Has completat 10 cims diferents.', category: 'peaks' },
    { code: 'hundred_feec', name: '100 Cims FEEC', description: 'Has completat el repte dels 100 Cims FEEC.', category: 'challenges' },
    { code: 'first_3000', name: 'Primer 3000', description: 'Has completat el teu primer cim de 3000 metres o mes.', category: 'challenges' },
    { code: 'three_3000', name: 'Tres 3000s', description: 'Has completat tres cims de 3000 metres o mes.', category: 'challenges' },
    { code: 'hundred_km', name: '100 km acumulats', description: 'Has acumulat 100 km en activitats publicades.', category: 'stats' },
    { code: 'thousand_elevation', name: '1000 m de desnivell', description: 'Has acumulat 1000 metres de desnivell positiu.', category: 'stats' },
    { code: 'five_comarques', name: 'Explorador de comarques', description: 'Has completat cims en 5 comarques diferents.', category: 'peaks' }
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, category: b.category, active: true },
      create: { ...b, active: true }
    });
  }

  // ChallengePeak rows for 100-cims-feec: use a safe list of existing cims.
  const feecChallenge = await prisma.challenge.findUnique({ where: { slug: '100-cims-feec' } });
  if (feecChallenge) {
    const feecCimIds = [
      'cim_la_mola',
      'cim_pedraforca',
      'cim_puigmal',
      'cim_matagalls',
      'cim_turo_home',
      'cim_bastiments',
      'cim_puigpedros',
      'cim_comabona',
      'cim_carlit'
    ];

    for (const cimId of feecCimIds) {
      // comprovar existeix cim
      const cim = await prisma.cim.findUnique({ where: { id: cimId }, select: { id: true } });
      if (!cim) continue;

      // upsert ChallengePeak via create if not exists
      try {
        await prisma.challengePeak.create({ data: { challengeId: feecChallenge.id, cimId } });
      } catch (err) {
        // si ja existeix o falla per FK, ignorem per ser idempotents
      }
    }
  }

  // Garantim admin estable per provar endpoints admin.
  await prisma.usuari.upsert({
    where: { mail: 'admin@cimscat.local' },
    update: {
      nom: 'Admin',
      cognom: 'CimsCat',
      nomUsuari: 'admin',
      contrasenyaHash: adminPasswordHash,
      rol: 'admin',
      fotoPerfil: '/uploads/usuaris/admin.jpg'
    },
    create: {
      id: 'usr_admin_cimscat',
      nom: 'Admin',
      cognom: 'CimsCat',
      nomUsuari: 'admin',
      mail: 'admin@cimscat.local',
      contrasenyaHash: adminPasswordHash,
      rol: 'admin',
      fotoPerfil: '/uploads/usuaris/admin.jpg'
    }
  });

  // ------------------------------------------------------------
  // 12) RESUM FINAL
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
  console.log(`- Cims guardats: ${savedPeaks.length}`);
  console.log('- Admin de proves: admin@cimscat.local / Admin12345');
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


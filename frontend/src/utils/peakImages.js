import bastimentsImg from '../assets/peaks/bastiments.jpg'
import canigoImg from '../assets/peaks/canigo.jpeg'
import carlitImg from '../assets/peaks/carlit.jpeg'
import comabonaImg from '../assets/peaks/comabona.jpg'
import matagallsImg from '../assets/peaks/Matagalls.jpeg'
import molaImg from '../assets/peaks/Mola.jpeg'
import pedraforcaImg from '../assets/peaks/pedraforca-unsplash (1).jpg'
import picEstatsImg from '../assets/peaks/pic_estats.jpeg'
import puigmalImg from '../assets/peaks/puigmal.jpeg'
import puigpedrosImg from '../assets/peaks/puigpedros.jpeg'
import turoHomeImg from '../assets/peaks/turo_home.jpeg'

function normalizePeakKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const localPeakImages = {
  [normalizePeakKey('Bastiments')]: bastimentsImg,
  [normalizePeakKey('Canigo')]: canigoImg,
  [normalizePeakKey('Canigó')]: canigoImg,
  [normalizePeakKey('Carlit')]: carlitImg,
  [normalizePeakKey('Comabona')]: comabonaImg,
  [normalizePeakKey('Matagalls')]: matagallsImg,
  [normalizePeakKey('La Mola')]: molaImg,
  [normalizePeakKey('Mola')]: molaImg,
  [normalizePeakKey('Pedraforca')]: pedraforcaImg,
  [normalizePeakKey("Pica d'Estats")]: picEstatsImg,
  [normalizePeakKey('Pica d’Estats')]: picEstatsImg,
  [normalizePeakKey('Pic Estats')]: picEstatsImg,
  [normalizePeakKey('Puigmal')]: puigmalImg,
  [normalizePeakKey('Puigpedros')]: puigpedrosImg,
  [normalizePeakKey('Puigpedrós')]: puigpedrosImg,
  [normalizePeakKey("Turo de l Home")]: turoHomeImg,
  [normalizePeakKey("Turó de l'Home")]: turoHomeImg,
  [normalizePeakKey('Turo Home')]: turoHomeImg,
}

const localPeakImagesById = {
  cim_bastiments: bastimentsImg,
  cim_canigo: canigoImg,
  cim_carlit: carlitImg,
  cim_comabona: comabonaImg,
  cim_matagalls: matagallsImg,
  cim_la_mola: molaImg,
  cim_pedraforca: pedraforcaImg,
  cim_pica_estats: picEstatsImg,
  cim_puigmal: puigmalImg,
  cim_puigpedros: puigpedrosImg,
  cim_turo_home: turoHomeImg,
}

export function getLocalPeakImage(peakOrName) {
  if (!peakOrName) return ''

  if (typeof peakOrName === 'string') {
    return localPeakImages[normalizePeakKey(peakOrName)] || ''
  }

  return (
    localPeakImagesById[peakOrName.id] ||
    localPeakImages[normalizePeakKey(peakOrName.nom)] ||
    ''
  )
}

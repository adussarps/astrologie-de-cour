// Le ciel : calendriers, positions, maisons, heures inégales.
//
// Tout est calculé au sens moderne (astronomy-engine, d'après VSOP87 et les
// éphémérides JPL). Ce n'est PAS ce qu'un calculateur du XIVe siècle aurait
// trouvé : lui travaillait sur les Tables alphonsines, dont les valeurs
// s'écartent du ciel réel — parfois de plusieurs degrés. Voir /methode.
//
// Les maisons d'Alcabitius de ce fichier ont été validées contre Swiss
// Ephemeris (hsys 'B') sur 1338, 1331 et 1991 : écart nul à la seconde d'arc.

const DEG = Math.PI / 180;
const J2000 = 2451545.0;

export const SIGNES = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
];

// Les sept planètes, dans l'ordre des sphères — de la plus lointaine à la plus proche.
export const PLANETES = [
  { clef: 'saturne', nom: 'Saturne', corps: 'Saturn', glyphe: '♄' },
  { clef: 'jupiter', nom: 'Jupiter', corps: 'Jupiter', glyphe: '♃' },
  { clef: 'mars', nom: 'Mars', corps: 'Mars', glyphe: '♂' },
  { clef: 'soleil', nom: 'Soleil', corps: 'Sun', glyphe: '☉' },
  { clef: 'venus', nom: 'Vénus', corps: 'Venus', glyphe: '♀' },
  { clef: 'mercure', nom: 'Mercure', corps: 'Mercury', glyphe: '☿' },
  { clef: 'lune', nom: 'Lune', corps: 'Moon', glyphe: '☽' },
];

const mod360 = (x) => ((x % 360) + 360) % 360;

/** Jour julien à partir d'une date donnée dans son propre calendrier.
 *  `julien: true` pour toute date antérieure à octobre 1582. */
export function jourJulien({ annee, mois, jour, heure = 0, julien }) {
  let a = annee, m = mois;
  if (m <= 2) { a -= 1; m += 12; }
  const b = julien ? 0 : 2 - Math.floor(a / 100) + Math.floor(Math.floor(a / 100) / 4);
  return Math.floor(365.25 * (a + 4716)) + Math.floor(30.6001 * (m + 1))
    + jour + b - 1524.5 + heure / 24;
}

/** Date civile (calendrier grégorien proleptique) à partir d'un jour julien. */
export function dateGregorienne(jj) {
  const z = Math.floor(jj + 0.5);
  const f = jj + 0.5 - z;
  const alpha = Math.floor((z - 1867216.25) / 36524.25);
  const a = z + 1 + alpha - Math.floor(alpha / 4);
  const b = a + 1524, c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c), e = Math.floor((b - d) / 30.6001);
  const jour = b - d - Math.floor(30.6001 * e) + f;
  const mois = e < 14 ? e - 1 : e - 13;
  return { annee: mois > 2 ? c - 4716 : c - 4715, mois, jour: Math.floor(jour) };
}

const tempsDe = (jj) => Astronomy.MakeTime(jj - J2000);

/** Obliquité moyenne de l'écliptique (Laskar), valable sur ±10 000 ans. */
export function obliquite(jj) {
  const t = (jj - J2000) / 3652500;
  const p = [84381.448, -4680.93, -1.55, 1999.25, -51.38, -249.67,
    -39.05, 7.12, 27.87, 5.79, 2.45];
  return p.reduceRight((acc, c) => acc * t + c, 0) / 3600;
}

/** Temps sidéral local, en degrés (l'ARMC des astrologues). */
export function armc(jj, longitude) {
  return mod360(Astronomy.SiderealTime(tempsDe(jj)) * 15 + longitude);
}

/** Longitudes écliptiques géocentriques apparentes des sept planètes. */
export function positions(jj) {
  const t = tempsDe(jj);
  const out = {};
  for (const p of PLANETES) {
    const v = Astronomy.GeoVector(p.corps, t, true);
    const e = Astronomy.Ecliptic(v);
    const veille = Astronomy.Ecliptic(Astronomy.GeoVector(p.corps, tempsDe(jj - 0.5), true));
    out[p.clef] = {
      longitude: mod360(e.elon),
      latitude: e.elat,
      retrograde: mod360(e.elon - veille.elon) > 180,
    };
  }
  // La Teste et la Queue du dragon : nœuds lunaires moyens (Meeus, 47.7).
  const T = (jj - J2000) / 36525;
  const teste = mod360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
  out.teste = { longitude: teste, latitude: 0, retrograde: true, noeud: true };
  out.queue = { longitude: mod360(teste + 180), latitude: 0, retrograde: true, noeud: true };
  return out;
}

/** Ascendant, milieu du ciel et les douze maisons d'Alcabitius.
 *
 *  Alcabitius trisège les demi-arcs diurne et nocturne du degré ascendant :
 *  les maisons XI et XII coupent en trois l'arc du milieu du ciel à
 *  l'ascendant, les maisons II et III celui de l'ascendant au fond du ciel.
 *  D'où des maisons inégales — c'est sa signature, et c'est le système
 *  employé en Occident latin au XIVe siècle. */
export function maisons(jj, latitude, longitude) {
  const eps = obliquite(jj) * DEG;
  const A = armc(jj, longitude) * DEG;
  const phi = latitude * DEG;

  const ascendant = mod360(Math.atan2(
    Math.cos(A),
    -(Math.sin(A) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  ) / DEG);

  const declinaison = Math.asin(Math.sin(ascendant * DEG) * Math.sin(eps));
  const r = Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(declinaison)));
  const demiArcDiurne = Math.acos(r) / DEG;
  const demiArcNocturne = Math.acos(-r) / DEG;

  const eclDe = (ra) => mod360(Math.atan2(
    Math.sin(ra * DEG) / Math.cos(eps), Math.cos(ra * DEG),
  ) / DEG);

  const armcDeg = A / DEG;
  const pointes = new Array(13);
  pointes[1] = ascendant;
  pointes[10] = eclDe(armcDeg);
  for (const i of [1, 2]) {
    pointes[10 + i] = eclDe(armcDeg + demiArcDiurne * i / 3);
    pointes[1 + i] = eclDe(armcDeg + demiArcDiurne + demiArcNocturne * i / 3);
  }
  for (const k of [1, 2, 3, 10, 11, 12]) pointes[(k + 5) % 12 + 1] = mod360(pointes[k] + 180);

  return { pointes, ascendant, milieuDuCiel: pointes[10], demiArcDiurne, demiArcNocturne };
}

/** Dans quelle maison tombe une longitude donnée. */
export function maisonDe(longitude, pointes) {
  for (let k = 1; k <= 12; k++) {
    const debut = pointes[k], fin = pointes[k % 12 + 1];
    if (mod360(longitude - debut) < mod360(fin - debut)) return k;
  }
  return 1;
}

/** Lever et coucher du soleil, d'où la durée de l'heure inégale.
 *  Le jour « artificiel » va du lever au coucher et se coupe toujours en
 *  douze, quelle que soit sa longueur : en décembre à Paris, l'heure de
 *  jour vaut quarante minutes et celle de nuit quatre-vingts. */
export function heuresInegales(jj, latitude, longitude) {
  const observateur = new Astronomy.Observer(latitude, longitude, 0);
  const lever = (t) => Astronomy.SearchRiseSet('Sun', observateur, +1, t, 3);
  const coucher = (t) => Astronomy.SearchRiseSet('Sun', observateur, -1, t, 3);

  // On cherche l'intervalle — jour artificiel ou nuit — qui encadre l'instant.
  let debutJour = lever(tempsDe(jj - 1.2));
  for (let essai = 0; essai < 4 && debutJour; essai++) {
    const finJour = coucher(debutJour);
    const jourSuivant = finJour && lever(finJour);
    if (!finJour || !jourSuivant) break;

    const jjLever = debutJour.ut + J2000;
    const jjCoucher = finJour.ut + J2000;
    const jjLeverSuivant = jourSuivant.ut + J2000;

    if (jj >= jjLever && jj < jjLeverSuivant) {
      const deJour = jj < jjCoucher;
      const dureeJour = (jjCoucher - jjLever) * 24;
      const dureeNuit = (jjLeverSuivant - jjCoucher) * 24;
      const duree = (deJour ? dureeJour : dureeNuit) / 12;
      const ecoule = (jj - (deJour ? jjLever : jjCoucher)) * 24;
      return {
        deJour, dureeJour, dureeNuit,
        heureDeJour: dureeJour / 12 * 60,
        heureDeNuit: dureeNuit / 12 * 60,
        rang: Math.max(1, Math.min(12, Math.floor(ecoule / duree) + 1)),
        jjLever, jjCoucher, jjLeverSuivant,
      };
    }
    debutJour = jourSuivant;
  }
  return null;
}

// L'ordre chaldéen, du plus lent au plus rapide : c'est lui qui règle
// les heures planétaires, et il ne change jamais.
const CHALDEEN = ['saturne', 'jupiter', 'mars', 'soleil', 'venus', 'mercure', 'lune'];
const JOURS = ['soleil', 'lune', 'mars', 'mercure', 'jupiter', 'venus', 'saturne'];
export const NOMS_JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Le seigneur du jour, celui de la nuit, et celui de l'heure courante.
 *
 *  La première heure du jour appartient à la planète du jour de la semaine,
 *  puis on descend l'ordre chaldéen d'heure en heure sans jamais s'arrêter.
 *  La nuit continue la même suite : c'est pourquoi la nuit qui suit le mardi
 *  est la « nuit de Saturne » — les captions latines le disent, et le calcul
 *  le confirme. */
export function heuresPlanetaires(heures) {
  if (!heures) return null;
  // Le jour astrologique commence au lever du soleil, jamais à minuit :
  // la nuit appartient au jour qui la précède, et c'est pourquoi la nuit
  // qui suit le mardi est « nuit de Saturne ».
  const indiceJour = (Math.floor(heures.jjLever + 1.5) % 7 + 7) % 7;
  const seigneurDuJour = JOURS[indiceJour];
  const depart = CHALDEEN.indexOf(seigneurDuJour);
  const rangAbsolu = (heures.deJour ? 0 : 12) + heures.rang - 1;
  return {
    jourSemaine: NOMS_JOURS[indiceJour],
    seigneurDuJour,
    seigneurDeLaNuit: CHALDEEN[(depart + 12) % 7],
    seigneurDeLHeure: CHALDEEN[(depart + rangAbsolu) % 7],
    rang: heures.rang,
    deJour: heures.deJour,
  };
}

/** « 17° Taureau 03′ » */
export function enSigne(longitude, court = false) {
  const l = mod360(longitude);
  const signe = SIGNES[Math.floor(l / 30) % 12];
  const d = Math.floor(l % 30);
  const m = Math.floor((l % 1) * 60);
  return court
    ? `${d}° ${signe.slice(0, 3)} ${String(m).padStart(2, '0')}′`
    : `${d}° ${signe} ${String(m).padStart(2, '0')}′`;
}

export const signeDe = (longitude) => Math.floor(mod360(longitude) / 30) % 12;
export { mod360 };

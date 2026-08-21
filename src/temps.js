// Le temps — trois choses distinctes, qu'on confond volontiers.
//
//   1. Interpréter l'instant saisi. Une heure écrite sur un registre n'a pas
//      de sens hors de la convention qui la produit. « 12 h 33 » le 19 février
//      1991 à Paris a été lu sur une pendule réglée sur l'heure légale, donc
//      UTC+1 : l'instant physique est 11 h 33 TU. La même écriture en 1338
//      n'est pas cela : les fuseaux n'existent pas, et l'heure est celle du
//      lieu — le cadran solaire, ou les tables.
//
//   2. Le calcul astronomique. Il se fait en temps universel et n'a aucune
//      convention : le ciel ne sait pas quelle heure il est.
//
//   3. L'affichage. Il se fait toujours en temps solaire vrai et en heures
//      inégales, parce que c'est le cadre de 1380.
//
// Ces trois-là ne doivent jamais être mélangées, et chacune est ici une
// fonction pure et séparée.

import { jourJulien } from './ciel.js';

const J2000 = 2451545.0;

// La France n'a pas d'heure légale nationale avant la loi du 14 mars 1891, et
// le reste de l'Europe s'aligne dans les mêmes décennies. Avant, l'heure d'un
// lieu est l'heure de son soleil.
export const PREMIERE_HEURE_LEGALE = 1891;

export const CONVENTIONS = {
  legale: {
    clef: 'legale',
    nom: 'heure légale',
    detail: 'celle de la pendule et de l’état civil, fuseau et heure d’été compris',
  },
  vraie: {
    clef: 'vraie',
    nom: 'heure vraie du lieu',
    detail: 'celle du cadran solaire et des cloches — le midi vrai est le passage du Soleil',
  },
  moyenne: {
    clef: 'moyenne',
    nom: 'heure moyenne du lieu',
    detail: 'une horloge parfaite réglée sur le lieu — c’est la base des Tables alphonsines',
  },
};

const dateDe = (jj) => Astronomy.MakeTime(jj - J2000).date;

/** Le temps solaire vrai : l'angle horaire du Soleil, plus douze heures.
 *  C'est ce que marque un cadran solaire. */
export function tempsVrai(jj, longitude) {
  const observateur = new Astronomy.Observer(0, longitude, 0);
  return (Astronomy.HourAngle('Sun', dateDe(jj), observateur) + 12) % 24;
}

/** Le temps solaire moyen : une horloge parfaite, calée sur la longitude. */
export const tempsMoyen = (jj, longitude) =>
  ((((jj + 0.5) % 1) * 24) + longitude / 15 + 24) % 24;

/** L'équation du temps, en minutes : ce dont le cadran solaire avance ou
 *  retarde sur l'horloge. Elle va de −14 minutes vers le 11 février à
 *  +16 minutes vers le 3 novembre, et s'annule quatre fois l'an. */
export function equationDuTemps(jj, longitude) {
  let d = tempsVrai(jj, longitude) - tempsMoyen(jj, longitude);
  if (d > 12) d -= 24;
  if (d < -12) d += 24;
  return d * 60;
}

/** Le fuseau horaire d'un point, d'après tz-lookup — sans réseau. */
export function fuseauDe(latitude, longitude) {
  try {
    return globalThis.tzlookup?.(latitude, longitude) ?? null;
  } catch {
    return null;
  }
}

/** Le décalage légal d'un fuseau à un instant donné, en heures.
 *  On interroge la base tz du système plutôt que d'écrire nous-mêmes le droit
 *  du temps : la loi de 1891, le passage à Greenwich en 1911, les heures de
 *  guerre et l'heure d'été en sortent seules. */
export function decalageLegal(zone, dateUtc) {
  try {
    const parties = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(dateUtc);
    const texte = parties.find((p) => p.type === 'timeZoneName')?.value ?? '';
    // Les fuseaux d'avant l'unification portent des secondes : Berne valait
    // UTC+0:29:46 jusqu'en 1894, Paris UTC+0:09:21 jusqu'en 1911.
    const m = /GMT([+-])(\d{2}):(\d{2})(?::(\d{2}))?/.exec(texte);
    if (!m) return 0;
    return (m[1] === '-' ? -1 : 1)
      * (Number(m[2]) + Number(m[3]) / 60 + Number(m[4] ?? 0) / 3600);
  } catch {
    return null;
  }
}

/** Une date UTC utilisable par Intl, années à un ou deux chiffres comprises. */
function dateUtc(annee, mois, jour, heure) {
  const d = new Date(Date.UTC(2000, mois - 1, jour, 0, 0, 0));
  d.setUTCFullYear(annee);
  d.setUTCMilliseconds(Math.round(heure * 3600000));
  return d;
}

/** La convention à retenir par défaut : l'heure légale n'existe pas avant 1891. */
export const conventionParDefaut = (annee) =>
  (annee >= PREMIERE_HEURE_LEGALE ? 'legale' : 'vraie');

/** Interpréter l'instant saisi, et le rendre en jour julien (temps universel).
 *
 *  Le décalage légal comme l'équation du temps dépendent eux-mêmes de
 *  l'instant cherché : on itère deux fois, ce qui suffit très largement —
 *  l'équation du temps ne bouge que d'une vingtaine de secondes par jour. */
export function versTempsUniversel(saisie) {
  const { annee, mois, jour, heure, minute, latitude, longitude, julien } = saisie;
  const convention = CONVENTIONS[saisie.convention] ? saisie.convention : conventionParDefaut(annee);
  const locale = heure + minute / 60;
  const enJJ = (decalage) => jourJulien({ annee, mois, jour, heure: locale - decalage, julien });

  if (convention === 'moyenne') {
    const decalage = longitude / 15;
    return { jj: enJJ(decalage), convention, decalage, equation: 0, zone: null };
  }

  if (convention === 'legale') {
    const zone = fuseauDe(latitude, longitude);
    let decalage = zone ? decalageLegal(zone, dateUtc(annee, mois, jour, locale)) : null;
    if (decalage === null) {
      // Sans base de fuseaux utilisable, on retombe sur l'heure du lieu.
      return versTempsUniversel({ ...saisie, convention: 'moyenne' });
    }
    decalage = decalageLegal(zone, dateUtc(annee, mois, jour, locale - decalage)) ?? decalage;
    return { jj: enJJ(decalage), convention, decalage, equation: 0, zone };
  }

  // Heure vraie : on retire la longitude, puis l'équation du temps.
  let decalage = longitude / 15;
  let equation = 0;
  for (let i = 0; i < 2; i++) {
    equation = equationDuTemps(enJJ(decalage), longitude);
    decalage = longitude / 15 + equation / 60;
  }
  return { jj: enJJ(decalage), convention, decalage, equation, zone: null };
}

/** Ce qu'il faut montrer au lecteur : les trois lectures du même instant. */
export function lectureDuTemps(jj, longitude, zone) {
  const universel = (((jj + 0.5) % 1) * 24 + 24) % 24;
  return {
    universel,
    moyen: tempsMoyen(jj, longitude),
    vrai: tempsVrai(jj, longitude),
    equation: equationDuTemps(jj, longitude),
    zone,
  };
}

/** « 5 h 36 », et non « 5.6 ». */
export function enHeures(h) {
  const t = ((h % 24) + 24) % 24;
  const m = Math.round((t % 1) * 60);
  const heure = (Math.floor(t) + (m === 60 ? 1 : 0)) % 24;
  return `${heure} h ${String(m === 60 ? 0 : m).padStart(2, '0')}`;
}

/** « UTC+1 », « UTC+0:09:21 ». */
export function enDecalage(h) {
  const signe = h < 0 ? '−' : '+';
  const total = Math.round(Math.abs(h) * 3600);
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (!mm && !ss) return `UTC${signe}${hh}`;
  return `UTC${signe}${hh}:${String(mm).padStart(2, '0')}`
    + (ss ? `:${String(ss).padStart(2, '0')}` : '');
}

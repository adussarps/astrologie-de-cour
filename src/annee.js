// L'année — ce qu'un prince demandait vraiment.
//
// On ne relit pas une nativité tous les ans. On dresse une autre figure.
// Deux techniques vont ensemble, et elles sont l'ordinaire du métier :
//
//   La révolution de l'année (revolutio anni nati). On recalcule le ciel à
//   l'instant exact où le Soleil revient au degré qu'il occupait à la
//   naissance. Cette figure-là gouverne les douze mois qui suivent. C'est le
//   genre du carré annoté de Louis d'Orléans : son trente-cinquième
//   anniversaire, dans la marge duquel un astrologue a écrit son meurtre.
//
//   La profection (intihā', profectio). On avance d'un signe par année de vie
//   depuis l'ascendant natal. Le lieu où l'on tombe est la matière de
//   l'année, et son seigneur devient le maître de l'année — dominus anni.
//   Une planète unique, désignée par une arithmétique d'une ligne, à quoi
//   pend tout le jugement annuel.
//
// Rien ici n'est inventé : les deux règles sont mécaniques, et la seconde
// tient en une division euclidienne.

import { positions, maisons, mod360, signeDe } from './ciel.js';
import { juger, seigneurDuSigne, nomDe } from './jugement.js';
import { MAISONS } from './doctrine.js';

export const SOURCES = {
  revolution: 'Alcabitius, dist. V ; Abū Maʿshar, De revolutionibus nativitatum ; '
    + 'Bonatti, Liber astronomiae, tr. VIII',
  profection: 'Alcabitius, dist. IV (l’intihā’) ; Bonatti, Liber astronomiae, tr. VIII, '
    + 'sur le seigneur de l’année',
};

const J2000 = 2451545.0;
const jjDe = (temps) => temps.ut + J2000;

/** L'instant du retour solaire pour un âge donné.
 *
 *  On cherche le moment où le Soleil retrouve exactement sa longitude de
 *  naissance, au voisinage de l'anniversaire. C'est rarement l'heure de la
 *  naissance : le retour dérive de quelques heures d'une année sur l'autre,
 *  et c'est pourquoi la figure de l'année n'est jamais celle de la nativité. */
export function revolutionSolaire(jjNatal, age) {
  const longitudeNatale = positions(jjNatal).soleil.longitude;
  // On part six jours avant l'anniversaire tropique et on laisse chercher.
  const depart = Astronomy.MakeTime(jjNatal - J2000 + age * 365.2422 - 6);
  const trouve = Astronomy.SearchSunLongitude(longitudeNatale, depart, 20);
  if (!trouve) return null;
  return { jj: jjDe(trouve), longitudeNatale };
}

/** La profection : un signe par année de vie, depuis l'ascendant.
 *
 *  L'année de la naissance est la première maison ; on tourne, et l'on
 *  revient au point de départ tous les douze ans. */
export function profection(age) {
  const rang = ((age % 12) + 12) % 12 + 1;
  return { rang, ...MAISONS.table[rang - 1] };
}

/** Le maître de l'année : le seigneur du signe où tombe la profection. */
export function maitreDeLAnnee(figureNatale, age) {
  const p = profection(age);
  const signeProfecte = mod360(figureNatale.ascendant + (p.rang - 1) * 30);
  const clef = seigneurDuSigne(signeProfecte);
  return {
    profection: p,
    signeProfecte,
    clef,
    nom: nomDe(clef),
    natal: figureNatale.astres.find((a) => a.clef === clef),
  };
}

/** La profection mensuelle : le calendrier de l'année.
 *
 *  La même arithmétique que l'annuelle, d'un cran plus fin. On part du signe
 *  profecté de l'année et l'on avance d'un signe par mois révolu, ce qui
 *  boucle exactement en douze. Chaque mois reçoit ainsi une matière et un
 *  seigneur, et c'est de là que sort le seul calendrier que la technique
 *  produise honnêtement : non pas la date d'un événement, mais le mois où
 *  telle matière est en jeu.
 *
 *  Source : Alcabitius, dist. IV ; Abū Maʿshar, De revolutionibus nativitatum,
 *  sur la division de l'année révolue. */
export function moisDeLAnnee(figureNatale, age, jjDebut, jjFin) {
  const depart = maitreDeLAnnee(figureNatale, age);
  const duree = (jjFin ?? jjDebut + 365.2422) - jjDebut;
  return Array.from({ length: 12 }, (_, i) => {
    const signe = mod360(depart.signeProfecte + i * 30);
    const clef = seigneurDuSigne(signe);
    const rang = ((depart.profection.rang - 1 + i) % 12) + 1;
    return {
      rang: i + 1,
      debut: jjDebut + (duree * i) / 12,
      fin: jjDebut + (duree * (i + 1)) / 12,
      signe,
      maison: { rang, ...MAISONS.table[rang - 1] },
      clef,
      nom: nomDe(clef),
      seigneur: figureNatale.astres.find((a) => a.clef === clef),
    };
  });
}

/** Le maître de l'année, jugé deux fois.
 *
 *  C'est la règle propre au genre, et elle n'a pas d'équivalent dans la
 *  nativité : la même planète se lit d'abord au natal, qui dit ce qu'elle
 *  peut promettre, puis à la révolution, qui dit ce qu'elle en fera cette
 *  année-ci. Les quatre cas ne se confondent pas, et c'est de leur écart que
 *  vient tout le jugement annuel. */
export function lEcartDuMaitre(natal, annuel) {
  const fort = (a) => a && (a.force === 'angle' || (a.etat?.tenues.length ?? 0) > 0)
    && !(a.solaire?.clef === 'combuste');
  const fN = fort(natal);
  const fA = fort(annuel);
  if (fN && fA) {
    return { clef: 'tenu', texte: 'Le maître de l’année est fort à la nativité et fort à la '
      + 'révolution : ce que la figure promet en cette matière, l’année le donne. C’est le seul '
      + 'des quatre cas où l’on peut parler net.' };
  }
  if (fN && !fA) {
    return { clef: 'promis', texte: 'Le maître de l’année est fort à la nativité mais faible à '
      + 'la révolution : la promesse tient, l’année la sert mal. La matière est différée, non '
      + 'perdue — on la reprendra quand la profection y reviendra.' };
  }
  if (!fN && fA) {
    return { clef: 'agite', texte: 'Le maître de l’année est faible à la nativité mais fort à '
      + 'la révolution : beaucoup de mouvement cette année sur une matière que la nativité ne '
      + 'promet pas. On s’y dépensera sans que le fond change.' };
  }
  return { clef: 'sourd', texte: 'Le maître de l’année est faible à la nativité et faible à la '
    + 'révolution : l’année est sourde en cette matière. Rien ne s’y décide, et l’on perd son '
    + 'temps à y pousser.' };
}

/** La figure de l'année, entière : la révolution, la profection, le maître. */
export function figureDeLAnnee({ jjNatal, age, latitude, longitude }) {
  const retour = revolutionSolaire(jjNatal, age);
  if (!retour) return null;

  const natale = juger({
    positions: positions(jjNatal),
    maisons: maisons(jjNatal, latitude, longitude),
  });
  const annuelle = juger({
    positions: positions(retour.jj),
    maisons: maisons(retour.jj, latitude, longitude),
  });
  const maitre = maitreDeLAnnee(natale, age);

  // Où le maître de l'année se tient-il dans la figure de l'année ?
  const maitreAnnuel = annuelle.astres.find((a) => a.clef === maitre.clef);
  const finit = revolutionSolaire(jjNatal, age + 1)?.jj ?? null;

  return {
    age,
    jj: retour.jj,
    natale,
    annuelle,
    maitre: {
      ...maitre,
      annuel: maitreAnnuel,
      ecart: lEcartDuMaitre(maitre.natal, maitreAnnuel),
    },
    signeProfecte: maitre.signeProfecte,
    mois: moisDeLAnnee(natale, age, retour.jj, finit),
    finit,
  };
}

/** Une date tombe-t-elle dans l'année révolue ? */
export const dansLAnnee = (figure, jj) =>
  figure && jj >= figure.jj && (figure.finit === null || jj < figure.finit);

void signeDe;

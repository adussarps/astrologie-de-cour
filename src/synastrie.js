// La synastrie — deux nativités mises face à face.
//
// La tradition n'ignore pas la comparaison de deux figures : Ptolémée, dans le
// Tetrabiblos IV, 5, juge le mariage sur « les luminaires des deux génitures »
// et non sur une seule. C'est le seul endroit du livre où deux ciels sont
// confrontés, et c'est le socle de ce module :
//
//   « Les mariages durent le plus souvent lorsque, dans les deux génitures,
//     les luminaires se trouvent en aspect harmonieux, c'est-à-dire en trine ou
//     en sextile l'un avec l'autre, et surtout quand cela se fait par échange ;
//     et plus encore lorsque la Lune du mari est en cet aspect avec le Soleil
//     de la femme. Les divorces, sur des prétextes légers et avec des
//     aliénations complètes, surviennent lorsque ces positions sont en signes
//     disjoints, ou en opposition, ou en quartile. » (trad. Robbins)
//
// Puis : les bénéfiques qui regardent ces luminaires rendent le mariage
// agréable et profitable, les maléfiques le rendent querelleur ; et faute de
// tout cela, « on juge par Vénus, Mars et Saturne ».
//
// Deux choses que ce module ne fait pas, et qu'il faut dire.
//
//   1. Le sens de l'aspect. Entre deux ciels figés à des dates différentes,
//      « s'appliquer » et « se séparer » n'ont pas de sens : la Lune de l'un ne
//      marche vers rien dans l'autre. On rend l'aspect et son écart, jamais le
//      mouvement. Le moteur ordinaire (jugement.js) rend le sens parce qu'il
//      compare deux corps d'une même figure, pris au même instant.
//
//   2. Les superpositions de maisons — les planètes de l'un dans les maisons
//      de l'autre. Ptolémée ne les connaît pas : c'est un usage moderne. S'il
//      faut les ajouter un jour, il faudra l'écrire comme on l'a fait pour les
//      traits d'aspect : un ajout assumé, non une règle des livres.

import { PLANETES, ecartAngulaire, signeDe } from './ciel.js';
import { avecArticle } from './jugement.js';
import { ASPECTS, ASPECTS_DURS, ORBES, DOMICILES, EXALTATIONS } from './doctrine.js';

export const SOURCES = {
  concorde: 'Ptolémée, Tetrabiblos, IV, 7 (trad. Robbins) — les quatre lieux chefs des deux nativités',
  mariage: 'Ptolémée, Tetrabiblos, IV, 5 (trad. Robbins) — les luminaires des deux génitures',
  aspects: 'Alcabitius, dist. III (les aspects) ; orbes d’al-Bīrūnī, Tafhīm §436 et §490',
  reception: 'Alcabitius, dist. III (la réception)',
};

const LUMINAIRES = ['soleil', 'lune'];
const BENEFIQUES = new Set(['jupiter', 'venus']);
const MALEFIQUES = new Set(['saturne', 'mars']);

// Les figures entières du zodiaque, telles que Ptolémée les lit : la distance
// se compte en signes, non en degrés. Un et cinq signes ne donnent aucun
// aspect — c'est l'aversion.
const ASPECT_PAR_SIGNE = { 0: 'conjonction', 2: 'sextil', 3: 'quartil', 4: 'trin', 6: 'opposition' };

/** Le rapport de signe entre deux longitudes, ou null s'il n'y en a pas. */
export function rapportDeSigne(longA, longB) {
  const distance = ((signeDe(longB) - signeDe(longA)) % 12 + 12) % 12;
  const nom = ASPECT_PAR_SIGNE[distance];
  return nom ? ASPECTS.table.find((a) => a.nom === nom) : null;
}

/** L'aspect entre deux longitudes, sans direction.
 *
 *  On prend l'orbe du couple — la moyenne des deux orbes, soit la somme de
 *  leurs moitiés (al-Bīrūnī §436 et §490). Aucun mouvement n'est rendu : voir
 *  l'en-tête. */
export function aspectSansSens(clefA, longA, clefB, longB) {
  const ecartAbsolu = ecartAngulaire(longA, longB);
  const orbe = ((ORBES.table[clefA] ?? 6) + (ORBES.table[clefB] ?? 6)) / 2;
  for (const aspect of ASPECTS.table) {
    const ecart = Math.abs(ecartAbsolu - aspect.angle);
    if (ecart <= orbe) return { ...aspect, ecart, orbe };
  }
  return null;
}

/** L'aspect ramené à sa seule nature : harmonieux, dur, conjonction, ou rien. */
const natureDe = (aspect) => {
  if (!aspect) return 'aversion';
  if (aspect.nom === 'conjonction') return 'conjonction';
  return ASPECTS_DURS.has(aspect.nom) ? 'inharmonieuse' : 'harmonieuse';
};

/** Tous les aspects croisés entre les sept planètes des deux figures.
 *  Rendus du plus serré au plus lâche, sans jamais dire s'ils s'appliquent. */
export function aspectsCroises(a, b) {
  const trouves = [];
  for (const pa of PLANETES) {
    const xa = a.astres.find((x) => x.clef === pa.clef);
    if (!xa) continue;
    for (const pb of PLANETES) {
      const xb = b.astres.find((x) => x.clef === pb.clef);
      if (!xb) continue;
      const aspect = aspectSansSens(pa.clef, xa.longitude, pb.clef, xb.longitude);
      if (!aspect) continue;
      trouves.push({
        de: pa.clef, a: pb.clef,
        nom: aspect.nom, glyphe: aspect.glyphe, angle: aspect.angle,
        ecart: aspect.ecart, orbe: aspect.orbe,
        partil: aspect.ecart < 1,
        nature: natureDe(aspect),
      });
    }
  }
  return trouves.sort((x, y) => x.ecart - y.ecart);
}

/** Les quatre croisements des luminaires, par degré et par signe. */
export function luminairesCroises(a, b) {
  const paires = [];
  for (const ca of LUMINAIRES) {
    const xa = a.astres.find((x) => x.clef === ca);
    for (const cb of LUMINAIRES) {
      const xb = b.astres.find((x) => x.clef === cb);
      const aspect = aspectSansSens(ca, xa.longitude, cb, xb.longitude);
      const signe = rapportDeSigne(xa.longitude, xb.longitude);
      paires.push({
        de: ca, a: cb,
        nom: aspect?.nom ?? null,
        glyphe: aspect?.glyphe ?? null,
        ecart: aspect?.ecart ?? null,
        partil: aspect ? aspect.ecart < 1 : false,
        signe: signe?.nom ?? null,
        nature: natureDe(aspect),
      });
    }
  }
  return paires;
}

/** La lecture des luminaires croisés, suivant Ptolémée IV, 5.
 *
 *  Le texte parle des luminaires « en aspect harmonieux » (trine ou sextile),
 *  et de « signes disjoints, opposition ou quartile » pour les ruptures. Il y a
 *  quatre croisements ; la conjonction n'est ni l'un ni l'autre dans sa lettre,
 *  et on la compte à part. Le verdict est la lecture du site — un partage quand
 *  les deux camps s'équilibrent — et le croisement privilégié par le texte est
 *  rendu à part, quand les sexes sont connus. */
export function lectureDesLuminaires(a, b) {
  const paires = luminairesCroises(a, b);
  const compte = { harmonieuses: 0, conjonctions: 0, inharmonieuses: 0, aversions: 0 };
  for (const p of paires) {
    if (p.nature === 'harmonieuse') compte.harmonieuses++;
    else if (p.nature === 'conjonction') compte.conjonctions++;
    else if (p.nature === 'inharmonieuse') compte.inharmonieuses++;
    else compte.aversions++;
  }

  // « plus encore lorsque la Lune du mari est en cet aspect avec le Soleil de
  // la femme » : le croisement n'a de sens que si l'on sait qui est qui.
  const mari = a.sexe === 'homme' ? a : b.sexe === 'homme' ? b : null;
  const femme = a.sexe === 'femme' ? a : b.sexe === 'femme' ? b : null;
  let privilegie = null;
  if (mari && femme) {
    const lune = mari.astres.find((x) => x.clef === 'lune');
    const soleil = femme.astres.find((x) => x.clef === 'soleil');
    const aspect = aspectSansSens('lune', lune.longitude, 'soleil', soleil.longitude);
    privilegie = {
      nom: aspect?.nom ?? null,
      glyphe: aspect?.glyphe ?? null,
      ecart: aspect?.ecart ?? null,
      nature: natureDe(aspect),
    };
  }

  const durs = compte.inharmonieuses + compte.aversions;
  const verdict = compte.harmonieuses > durs ? 'durable'
    : durs > compte.harmonieuses ? 'rupture' : 'partage';

  return { paires, compte, privilegie, verdict };
}

/** Ce que les bénéfiques et les maléfiques de l'une regardent dans les
 *  luminaires de l'autre. Ptolémée : ils gardent le mariage agréable, ou le
 *  rendent querelleur. Le même registre, pris d'une figure à l'autre. */
export function temoignagesCroises(a, b) {
  const relevé = (source, cible, familles, liste, coteSource, coteCible) => {
    for (const p of PLANETES) {
      if (!familles.has(p.clef)) continue;
      const xs = source.astres.find((x) => x.clef === p.clef);
      for (const clef of LUMINAIRES) {
        const xc = cible.astres.find((x) => x.clef === clef);
        const aspect = aspectSansSens(p.clef, xs.longitude, clef, xc.longitude);
        if (!aspect) continue;
        liste.push({
          de: p.clef, nom: avecArticle(p.clef), figure: coteSource,
          sur: clef, surFigure: coteCible,
          aspect: aspect.nom, glyphe: aspect.glyphe,
          ecart: aspect.ecart, nature: natureDe(aspect),
        });
      }
    }
  };
  const benefiques = [];
  const malefiques = [];
  relevé(a, b, BENEFIQUES, benefiques, 'I', 'II');
  relevé(b, a, BENEFIQUES, benefiques, 'II', 'I');
  relevé(a, b, MALEFIQUES, malefiques, 'I', 'II');
  relevé(b, a, MALEFIQUES, malefiques, 'II', 'I');
  return { benefiques, malefiques };
}

/** Une figure héberge-t-elle les planètes de l'autre : réception par domicile
 *  ou par exaltation, et l'échange mutuel quand chacune loge l'autre. */
function hotesDe(hote, recue) {
  const trouves = [];
  for (const r of recue.astres.filter((x) => !x.noeud)) {
    const signe = signeDe(r.longitude);
    for (const h of hote.astres.filter((x) => !x.noeud)) {
      const parDomicile = DOMICILES.table[signe] === h.clef;
      const ex = EXALTATIONS.table[h.clef];
      const parExaltation = !!ex && ex.signe === signe;
      if (parDomicile || parExaltation) {
        trouves.push({
          hote: h.clef, recue: r.clef,
          par: parDomicile ? 'domicile' : 'exaltation',
        });
      }
    }
  }
  return trouves;
}

export function echangesEntreFigures(a, b) {
  const aRecuParB = hotesDe(b, a);
  const bRecuParA = hotesDe(a, b);
  const mutuels = [];
  for (const x of aRecuParB) {
    if (x.par !== 'domicile') continue;
    const retour = bRecuParA.find((y) =>
      y.par === 'domicile' && y.hote === x.recue && y.recue === x.hote);
    if (retour && !mutuels.some((m) => m.a === x.recue && m.b === x.hote)) {
      mutuels.push({ a: x.recue, b: x.hote });
    }
  }
  return { aRecuParB, bRecuParA, mutuels };
}

// ─── La concorde et l'inimitié (Tetrabiblos IV, 7) ──────────────────────────
//
// Ptolémée ne compare pas les luminaires ici : il compare « les lieux des deux
// nativités qui ont la plus grande autorité » — le Soleil, la Lune,
// l'ascendant et la part de Fortune. Et la règle vaut pour toute relation, non
// pour le seul mariage :
//
//   « Si ces lieux tombent dans les mêmes signes du zodiaque, ou s'ils
//     échangent leurs places, tous ou la plupart, et surtout si les régions
//     horoscopiques sont à environ 17° l'une de l'autre, ils produisent une
//     sympathie assurée et indissoluble. Mais s'ils sont en signes disjoints ou
//     opposés, ils produisent les inimitiés les plus profondes. S'ils ne sont
//     ni l'un ni l'autre, mais seulement en signes qui se regardent, le trine
//     et le sextile rendent les sympathies moindres, et le quartile les
//     antipathies moindres. »
//
// Puis il distingue trois genres : par les luminaires l'amitié est *de choix*
// — la meilleure et la plus sûre —, par les parts de Fortune elle est *de
// besoin*, et par les ascendants *de plaisir ou de peine*.
//
// Ce que le module ne fait pas encore, et qui est dans le texte : l'« élévation
// de la configuration », qui donne à l'une des deux nativités l'autorité sur
// l'autre, et les prorogations d'une figure qui atteignent les lieux de
// l'autre — une technique de temps, qui demanderait les directions.

const LIEUX_CHEFS = ['soleil', 'lune', 'ascendant', 'fortune'];
const NOM_LIEU = {
  soleil: 'le Soleil', lune: 'la Lune',
  ascendant: 'l’ascendant', fortune: 'la part de Fortune',
};

function lieuChef(figure, clef) {
  if (clef === 'ascendant') return figure.ascendant;
  if (clef === 'fortune') {
    return figure.parts.find((p) => p.clef === 'fortune')?.longitude ?? null;
  }
  return figure.astres.find((a) => a.clef === clef)?.longitude ?? null;
}

// La distance se compte en signes : 1, 5, 7 et 11 ne donnent aucun aspect.
const RAPPORT_PAR_DISTANCE = {
  0: 'meme-signe', 1: 'disjoints', 2: 'sympathie', 3: 'antipathie',
  4: 'sympathie', 5: 'disjoints', 6: 'opposition',
};

/** Le rapport de signe entre deux lieux, tel que Ptolémée le lit. */
export function rapportEntreLieux(longA, longB) {
  const d = ((signeDe(longB) - signeDe(longA)) % 12 + 12) % 12;
  return RAPPORT_PAR_DISTANCE[Math.min(d, 12 - d)];
}

/** L'« échange de places » : deux lieux croisés, chacun dans le signe de
 *  l'autre. Le texte l'énumère avec le même signe, et il est plus fort. */
export function echangesDeLieux(a, b) {
  const trouves = [];
  for (let i = 0; i < LIEUX_CHEFS.length; i++) {
    for (let j = i + 1; j < LIEUX_CHEFS.length; j++) {
      const ci = LIEUX_CHEFS[i]; const cj = LIEUX_CHEFS[j];
      const ai = lieuChef(a, ci); const aj = lieuChef(a, cj);
      const bi = lieuChef(b, ci); const bj = lieuChef(b, cj);
      if (ai == null || aj == null || bi == null || bj == null) continue;
      if (signeDe(ai) === signeDe(bj) && signeDe(aj) === signeDe(bi)) {
        trouves.push({ a: ci, b: cj });
      }
    }
  }
  return trouves;
}

/** La concorde ou l'inimitié de deux figures, suivant Ptolémée IV, 7.
 *
 *  Le verdict est la lecture du site : le texte parle de « tous ou la
 *  plupart » pour la sympathie assurée, de « disjoints ou opposés » pour les
 *  inimitiés, et des aspects pour les degrés moindres. On compte donc les
 *  quatre lieux, et l'on nomme au passage les genres d'amitié que le texte
 *  distingue. */
export function concorde(a, b) {
  const lieux = LIEUX_CHEFS.map((clef) => {
    const la = lieuChef(a, clef);
    const lb = lieuChef(b, clef);
    const complet = la != null && lb != null;
    return {
      clef, nom: NOM_LIEU[clef],
      rapport: complet ? rapportEntreLieux(la, lb) : null,
      ecart: complet ? ecartAngulaire(la, lb) : null,
    };
  });

  const compte = { 'meme-signe': 0, disjoints: 0, opposition: 0, sympathie: 0, antipathie: 0 };
  for (const l of lieux) if (l.rapport) compte[l.rapport]++;
  const echanges = echangesDeLieux(a, b);
  const forts = compte['meme-signe'] + echanges.length;
  const durs = compte.disjoints + compte.opposition;

  const verdict = forts >= 3 ? 'sympathie-assuree'
    : durs >= 3 ? 'inimities'
      : compte.sympathie > compte.antipathie ? 'sympathie-moindre'
        : compte.antipathie > compte.sympathie ? 'antipathie-moindre'
          : 'partagee';

  // Les trois genres d'amitié, selon les lieux qui se répondent.
  const famille = (clefs) => clefs.every((c) => {
    const l = lieux.find((x) => x.clef === c);
    return l && (l.rapport === 'meme-signe' || l.rapport === 'sympathie');
  });
  const genres = [];
  if (famille(['soleil', 'lune'])) genres.push('de choix');
  if (famille(['fortune'])) genres.push('de besoin');
  if (famille(['ascendant'])) genres.push('de plaisir ou de peine');

  const ecartDesAscendants = ecartAngulaire(a.ascendant, b.ascendant);
  return {
    lieux, compte, echanges, verdict, genres,
    ecartDesAscendants,
    ascendantsSerres: ecartDesAscendants <= 17,
  };
}

/** Les deux figures, comparées. */
export function synastrie(a, b) {
  return {
    sources: SOURCES,
    concorde: concorde(a, b),
    luminaires: lectureDesLuminaires(a, b),
    aspects: aspectsCroises(a, b),
    temoignages: temoignagesCroises(a, b),
    echanges: echangesEntreFigures(a, b),
  };
}

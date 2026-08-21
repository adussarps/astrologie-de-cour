// L'interrogation — le genre qui répond à « de quoi dois-je me méfier ».
//
// On ne relit pas la nativité : on dresse le ciel à l'instant même où la
// question est posée. Le consultant est l'ascendant et son seigneur ; la
// chose demandée est la maison qui la gouverne, et son seigneur. La question
// « aboutit » — perficitur — si les deux seigneurs s'appliquent l'un à l'autre,
// ou si une planète plus rapide qu'eux porte la lumière du premier au second.
// Qu'ils se regardent ne suffit pas : un aspect qui se sépare dit que la chose
// est déjà faite, ou manquée. C'est la distinction que ce module tient partout.
//
// Le traité de référence, le De interrogationibus de Sahl ibn Bishr, est
// organisé maison par maison : un chapitre par espèce de question. Bonatti
// fait de même au sixième traité du Liber astronomiae, et fait précéder tout
// jugement de ses « considérations », qui disent quand il faut se taire.
//
// C'est ici que l'astrologie cesse d'être tolérée. Juger une nativité passe
// pour naturel ; poser une question au ciel revient à tenir la réponse pour
// déjà écrite, donc à nier le libre arbitre. Nicole Oresme — le traducteur de
// Charles V, dont le traité de la sphère ouvre le manuscrit même où sont
// reliées les cinq nativités royales — a écrit contre cela son Livre de
// divinacions.

import { mod360, enSigne, signeDe, ecartAngulaire, GENRES } from './ciel.js';
import { nomDe, rangHtml, peregrinDe, avecArticle } from './jugement.js';
import {
  MAISONS, ASPECTS, ASPECTS_DURS, ORBES, CONDITIONS, NATURES_SIGNES, ETATS_SOLAIRES,
  FORCE_DES_LIEUX,
} from './doctrine.js';

export const SOURCES = {
  interrogation: 'Sahl ibn Bishr, De interrogationibus (trad. Jean de Séville) ; '
    + 'Bonatti, Liber astronomiae, tr. VI',
  considerations: 'Bonatti, Liber astronomiae, tr. V — les considérations avant jugement',
};

/** Les douze espèces de questions, dans l'ordre des maisons. */
export const QUESTIONS = MAISONS.table.map((m, i) => ({
  rang: i + 1, ...m,
}));

// Quelques questions nommées, pour ne pas obliger le lecteur à connaître le
// découpage par maisons. Ce sont celles qu'on posait.
export const DEMANDES = [
  { texte: 'De quoi dois-je me méfier cette année ?', maison: 12 },
  { texte: 'Aurai-je des enfants ?', maison: 5 },
  { texte: 'Ce mariage se fera-t-il ?', maison: 7 },
  { texte: 'Guérirai-je de cette maladie ?', maison: 6 },
  { texte: 'Cette charge me sera-t-elle donnée ?', maison: 10 },
  { texte: 'Ce voyage est-il sûr ?', maison: 9 },
  { texte: 'Recouvrerai-je ce que j’ai perdu ?', maison: 2 },
  { texte: 'Mon adversaire l’emportera-t-il ?', maison: 7 },
  { texte: 'Cet héritage me viendra-t-il ?', maison: 8 },
  { texte: 'Ai-je un ennemi dans ma maison ?', maison: 12 },
];

/** Les considérations de Bonatti : les cas où l'astrologien doit se taire.
 *  Elles ne répondent pas à la question — elles disent si l'on peut juger. */
export function considerations(figure) {
  const avis = [];
  const degre = mod360(figure.ascendant) % 30;
  const lune = figure.astres.find((a) => a.clef === 'lune');
  const seigneurAsc = figure.seigneurAscendantPlace;
  const soleil = figure.astres.find((a) => a.clef === 'soleil');
  const saturne = figure.astres.find((a) => a.clef === 'saturne');

  if (degre < 3) {
    avis.push({
      grave: true,
      texte: `L’ascendant est au ${enSigne(figure.ascendant)}, dans les trois premiers degrés `
        + `du signe : <b>la chose n’est pas mûre</b>. Bonatti veut qu’on renvoie le consultant, `
        + `parce que la matière n’a pas encore pris forme.`,
    });
  }
  if (degre > 27) {
    avis.push({
      grave: true,
      texte: `L’ascendant est au ${enSigne(figure.ascendant)}, dans les trois derniers degrés `
        + `du signe : <b>la chose est déjà faite ou déjà perdue</b>, et il est trop tard pour `
        + `en juger.`,
    });
  }
  if (saturne && saturne.maison === 7) {
    avis.push({
      grave: true,
      texte: `Saturne se tient en septième maison, qui est le lieu de l’astrologien lui-même : `
        + `<b>c’est le juge qui se trompera</b>, non la figure. Bonatti est formel là-dessus, `
        + `et il est le seul à mettre ainsi en cause celui qui tient le calcul.`,
    });
  }
  const ecartSoleil = ecartAngulaire(seigneurAsc.longitude, soleil.longitude);
  if (ecartSoleil <= ETATS_SOLAIRES.combustion) {
    avis.push({
      grave: false,
      texte: `Le seigneur de l’ascendant est brûlé par le Soleil, à ${ecartSoleil.toFixed(1)} `
        + `degrés de lui : <b>le consultant ne voit pas clair dans sa propre affaire</b>, ou `
        + `l’on cherche à l’abuser.`,
    });
  }
  if (lune) {
    const finDuSigne = 30 - (mod360(lune.longitude) % 30);
    if (finDuSigne < 3) {
      avis.push({
        grave: false,
        texte: `La Lune achève son signe : elle est près d’être <i>vacua cursu</i>, vide de `
          + `course. <b>Rien ne viendra de la chose</b> — ni bien ni mal.`,
      });
    }
  }
  return avis;
}

const separation = ecartAngulaire;

/** Le regard entre deux astres, s'il y en a un dans les orbes — et, ce qui
 *  importe davantage, s'il se fait ou s'il se défait.
 *
 *  C'est la distinction qui commande tout le genre. Un aspect qui s'applique
 *  annonce une chose à venir ; le même aspect en séparation dit qu'elle est
 *  déjà faite, ou déjà manquée. Les juger pareillement est l'erreur que Sahl
 *  reproche aux ignorants, et elle renverse la réponse du tout au tout. */
function regardEntre(a, b) {
  const distance = separation(a.longitude, b.longitude);
  for (const asp of ASPECTS.table) {
    const orbe = (ORBES.table[a.clef] ?? 6) / 2 + (ORBES.table[b.clef] ?? 6) / 2;
    const exact = Math.abs(distance - asp.angle);
    if (exact > orbe) continue;

    // Un jour plus tard : l'écart à l'aspect exact se resserre-t-il ?
    const apres = Math.abs(
      separation(a.longitude + (a.vitesse ?? 0), b.longitude + (b.vitesse ?? 0)) - asp.angle,
    );
    const applique = apres < exact;
    // La vitesse relative donne le nombre de jours jusqu'à l'exactitude.
    const relative = Math.abs((a.vitesse ?? 0) - (b.vitesse ?? 0));
    return {
      ...asp,
      exact,
      applique,
      mouvement: applique ? 'application' : 'séparation',
      jours: relative > 1e-6 ? exact / relative : null,
      glose: applique ? CONDITIONS.application : CONDITIONS.separation,
    };
  }
  return null;
}

/** La plus rapide de deux planètes — celle qui porte le mouvement. */
const plusRapide = (a, b) => Math.abs(a.vitesse ?? 0) > Math.abs(b.vitesse ?? 0);

/** La translation de lumière : une planète se sépare de l'un des seigneurs et
 *  s'applique à l'autre, portant de celui-ci à celui-là ce qu'il faut pour
 *  joindre. La chose se fait alors par un tiers — un messager, une entremise,
 *  quelqu'un qui n'est pas partie dans l'affaire. */
function translationDeLumiere(astres, a, b) {
  for (const t of astres) {
    if (t.noeud || t.clef === a.clef || t.clef === b.clef) continue;
    if (!plusRapide(t, a) || !plusRapide(t, b)) continue;
    const versA = regardEntre(t, a);
    const versB = regardEntre(t, b);
    if (!versA || !versB) continue;
    if (!versA.applique && versB.applique) {
      return { porteur: t, quitte: a, joint: b, de: versA, vers: versB };
    }
    if (!versB.applique && versA.applique) {
      return { porteur: t, quitte: b, joint: a, de: versB, vers: versA };
    }
  }
  return null;
}

/** La collection de lumière : une planète plus lente reçoit l'application des
 *  deux seigneurs à la fois. Elle recueille leurs lumières et les assemble.
 *  La chose se fait, mais par un plus grand que les deux parties — un juge,
 *  un prélat, un seigneur devant qui l'on porte l'affaire. */
function collectionDeLumiere(astres, a, b) {
  for (const c of astres) {
    if (c.noeud || c.clef === a.clef || c.clef === b.clef) continue;
    if (plusRapide(c, a) || plusRapide(c, b)) continue;
    const deA = regardEntre(a, c);
    const deB = regardEntre(b, c);
    if (deA?.applique && deB?.applique) {
      return { collecteur: c, deA, deB };
    }
  }
  return null;
}

/** La prohibition : avant que les deux seigneurs ne joignent, un tiers vient
 *  se mettre entre eux et joint le premier. Quelqu'un empêche — et la figure
 *  dit qui, par la nature de la planète qui s'interpose. */
function prohibition(astres, a, b, jonction) {
  if (!jonction?.applique || jonction.jours === null) return null;
  for (const t of astres) {
    if (t.noeud || t.clef === a.clef || t.clef === b.clef) continue;
    for (const cible of [a, b]) {
      const r = regardEntre(t, cible);
      if (r?.applique && r.jours !== null && r.jours < jonction.jours) {
        return { empecheur: t, cible, regard: r, avance: jonction.jours - r.jours };
      }
    }
  }
  return null;
}

/** La réfrénation : le seigneur qui s'applique tourne rétrograde avant
 *  d'achever. La partie se retire au dernier moment, et l'affaire retombe. */
function refranation(jonction, a, b) {
  if (!jonction?.applique) return null;
  const retrograde = [a, b].find((p) => p.retrograde);
  return retrograde ? { planete: retrograde } : null;
}

/** Quand — la mesure du temps.
 *
 *  Le nombre de degrés qui reste jusqu'à l'aspect exact donne le nombre
 *  d'unités ; le lieu et le mode du signe donnent l'unité. Les auteurs ne
 *  s'accordent pas sur la table, et il faut le dire : Sahl, Bonatti et
 *  Māshāʾallāh proposent des échelles voisines mais distinctes. Celle-ci suit
 *  Bonatti. C'est la seule mesure de temps que le genre produise, et elle
 *  vaut ce que vaut la règle — pas davantage. */
const JOUR = { pluriel: 'jours', article: 'le jour' };
const SEMAINE = { pluriel: 'semaines', article: 'la semaine' };
const MOIS = { pluriel: 'mois', article: 'le mois' };
const AN = { pluriel: 'années', article: 'l’année' };

const UNITES = {
  angle: { mobile: JOUR, commun: SEMAINE, fixe: MOIS },
  succédente: { mobile: SEMAINE, commun: MOIS, fixe: AN },
  cadente: { mobile: MOIS, commun: MOIS, fixe: AN },
};

function quand(jonction, seigneurChose) {
  if (!jonction?.applique) return null;
  const mode = NATURES_SIGNES.modes.find((m) => m.signes.includes(signeDe(seigneurChose.longitude)));
  const unite = UNITES[seigneurChose.force]?.[mode.nom] ?? MOIS;
  const nombre = Math.max(1, Math.round(jonction.exact));
  return {
    nombre, unite: unite.pluriel, mode: mode.nom, lieu: seigneurChose.force,
    degres: jonction.exact,
    texte: `Il reste ${jonction.exact.toFixed(1)}° jusqu’à l’aspect exact, et l’on compte une `
      + `unité de temps par degré. Le seigneur de la chose est en signe ${mode.nom} et en `
      + `maison ${seigneurChose.force} : l’unité est ${unite.article}. La règle donne donc `
      + `<b>environ ${nombre} ${unite.pluriel}</b> — c’est ce que dit la table, non ce que je `
      + `sais du monde.`,
    source: 'Bonatti, Liber astronomiae, tr. VI ; les auteurs diffèrent sur l’échelle',
  };
}

/** Les deux luminaires prennent l'article, les cinq planètes n'en prennent
 *  pas : on dit « la Lune se sépare de Mercure ». */

/** Les dignités d'un astre, en un membre de phrase. */
function dignites(a) {
  if (a.etat?.tenues.length) return a.etat.tenues.join(' et ');
  if (a.etat?.perdues.length) return a.etat.perdues.join(' et ');
  return `${peregrinDe(a.clef)}, sans dignité au lieu où ${GENRES[a.clef] === 'f' ? 'elle' : 'il'} `
    + 'se tient';
}

/** La Lune est-elle vide de course ? Elle n'achève plus aucun aspect avant de
 *  sortir de son signe : c'est le seul témoignage qui tranche à lui seul, et
 *  il tranche par la négative. */
function videDeCourse(astres, lune) {
  const reste = 30 - (mod360(lune.longitude) % 30);
  const aVenir = astres.some((a) => {
    if (a.noeud || a.clef === 'lune') return false;
    const r = regardEntre(lune, a);
    return r?.applique && r.exact < reste;
  });
  return aVenir ? null : { reste };
}

/** Juger une interrogation.
 *
 *  L'ordre compte, et il est celui de Sahl : on regarde d'abord si l'on a le
 *  droit de juger, puis si la Lune porte encore quelque chose, puis les modes
 *  d'aboutissement, du plus direct au plus détourné. Le premier qui se
 *  présente emporte la réponse ; on ne cumule pas.
 *
 *  Une interrogation se conclut par oui ou par non. Sahl y insiste : un
 *  jugement qui finit en nuances n'a pas été rendu. */
export function jugerInterrogation(figure, rangMaison) {
  const matiere = figure.maisonsHabitees[rangMaison - 1];
  const consultant = figure.seigneurAscendantPlace;
  const seigneurChose = figure.astres.find((a) => a.clef === matiere.seigneur);
  const lune = figure.astres.find((a) => a.clef === 'lune');
  const astres = figure.astres.filter((a) => !a.noeud);

  const memePlanete = consultant.clef === seigneurChose.clef;
  const jonction = memePlanete ? null : regardEntre(consultant, seigneurChose);
  const vide = videDeCourse(astres, lune);
  const translation = memePlanete ? null : translationDeLumiere(astres, consultant, seigneurChose);
  const collection = memePlanete ? null : collectionDeLumiere(astres, consultant, seigneurChose);
  const empechement = prohibition(astres, consultant, seigneurChose, jonction);
  const retenue = refranation(jonction, consultant, seigneurChose);

  const nomC = nomDe(consultant.clef);
  const nomS = nomDe(seigneurChose.clef);
  let verdict;
  let echeance = null;

  if (memePlanete) {
    verdict = {
      clef: 'meme', reponse: 'oui',
      titre: 'Le consultant et la chose ont le même seigneur',
      texte: `<b>${nomC}</b> gouverne à la fois l’ascendant et la ${rangHtml(rangMaison)} `
        + `maison. La chose et celui qui la demande ne font qu’un : l’affaire ne dépend de `
        + `personne d’autre, et elle se fera ou non selon l’état seul de cette planète — `
        + `${dignites(consultant)}, ${FORCE_DES_LIEUX.enPlace[consultant.force]}.`,
    };
  } else if (jonction?.applique) {
    const dur = ASPECTS_DURS.has(jonction.nom);
    echeance = quand(jonction, seigneurChose);
    verdict = {
      clef: dur ? 'dur' : 'doux', reponse: 'oui',
      titre: `La chose se fait — les deux seigneurs s’appliquent par ${jonction.nom}`,
      texte: `<b>${nomC}</b>, seigneur du consultant, marche vers <b>${nomS}</b>, seigneur de `
        + `la chose, et les joint par <b>${jonction.nom}</b> (${jonction.angle}°, à `
        + `${jonction.exact.toFixed(1)}° de l’exactitude). L’aspect s’applique : la chose est `
        + `à venir, et elle se fera d’elle-même, sans entremise. `
        + (dur
          ? jonction.nom === 'opposition'
            ? 'Mais par opposition : elle se fait au prix d’un conflit ouvert, et l’on n’en '
              + 'sortira pas content des deux côtés.'
            : 'Mais par quartil : elle se fait avec peine, contrariété et retard.'
          : 'Et par un regard favorable : elle se fait sans grande peine.'),
    };
  } else if (jonction && !jonction.applique) {
    verdict = {
      clef: 'passe', reponse: 'non',
      titre: 'L’aspect se défait — la chose est déjà passée',
      texte: `<b>${nomC}</b> et <b>${nomS}</b> se regardent bien par ${jonction.nom}, mais `
        + `l’aspect <b>se sépare</b> : il ne se fait pas, il s’achève. Selon la règle, cela ne `
        + `dit pas que la chose viendra — cela dit qu’elle est <b>déjà faite, ou déjà manquée</b>, `
        + `et que le consultant interroge sur une affaire dont le moment est derrière lui. `
        + `C’est la distinction que Sahl reproche aux ignorants de ne pas faire : le même angle, `
        + `pris à l’envers, renverse la réponse.`,
    };
  } else if (translation) {
    echeance = quand(translation.vers, seigneurChose);
    verdict = {
      clef: 'translation', reponse: 'oui',
      titre: 'La chose se fait — par translation de lumière',
      texte: `Les deux seigneurs ne se joignent pas d’eux-mêmes. Mais `
        + `<b>${avecArticle(translation.porteur.clef)}</b>, plus rapide que l’un et l’autre, se `
        + `sépare de <b>${avecArticle(translation.quitte.clef)}</b> et s’applique à `
        + `<b>${avecArticle(translation.joint.clef)}</b> : elle porte de celui-ci à celui-là ce `
        + `qu’il faut pour joindre. <b>La chose se fera par un tiers</b> — un messager, une `
        + `entremise, quelqu’un qui n’est pas partie dans l’affaire. Sa nature est celle de `
        + `${avecArticle(translation.porteur.clef)} : c’est de ce côté-là qu’il faut chercher `
        + `l’intermédiaire, et non attendre que les deux parties s’entendent seules.`,
    };
  } else if (collection) {
    echeance = quand(collection.deB, seigneurChose);
    verdict = {
      clef: 'collection', reponse: 'oui',
      titre: 'La chose se fait — par collection de lumière',
      texte: `Les deux seigneurs ne se voient pas entre eux, mais tous deux s’appliquent à `
        + `<b>${avecArticle(collection.collecteur.clef)}</b>, plus lente qu’eux, qui recueille leurs lumières `
        + `et les assemble. <b>La chose se fera par un plus grand que les deux parties</b> — un `
        + `juge, un prélat, un seigneur devant qui l’on porte l’affaire. Elle ne se fera pas `
        + `autrement : il faut la porter devant quelqu’un.`,
    };
  } else if (vide) {
    verdict = {
      clef: 'vide', reponse: 'non',
      titre: 'La Lune est vide de course',
      texte: `Aucune voie ne joint les deux seigneurs, et la Lune elle-même n’achève plus aucun `
        + `aspect avant de sortir de son signe : il lui reste ${vide.reste.toFixed(1)}° à `
        + `parcourir sans rencontrer personne. <b>Rien ne viendra de la chose</b>, ni bien ni `
        + `mal. L’affaire est sans suite — ce qui n’est pas la même réponse qu’un refus.`,
    };
  } else {
    verdict = {
      clef: 'rien', reponse: 'non',
      titre: 'La chose ne se fait pas',
      texte: `<b>${nomC}</b> et <b>${nomS}</b> ne se joignent par aucune voie : ni par aspect `
        + `qui s’applique, ni par translation, ni par collection. Selon la règle, <b>la chose `
        + `ne se fera pas</b> — non qu’elle soit défendue, mais rien dans la figure ne la porte. `
        + `Il n’y a pas de milieu : on répond non.`,
    };
  }

  // L'empêchement et la réfrénation ne changent pas la voie, ils la coupent.
  const obstacles = [];
  if (vide && verdict.reponse === 'oui') {
    obstacles.push({
      clef: 'vide',
      texte: `<b>La Lune est vide de course</b> — il lui reste ${vide.reste.toFixed(1)}° à `
        + `parcourir sans joindre personne. Les deux témoignages se contredisent, et il faut `
        + `le dire plutôt que de choisir : les seigneurs portent la chose, la Lune ne la porte `
        + `pas. Les auteurs tranchent en sens inverse — Sahl tient la Lune vide pour décisive, `
        + `d’autres la tiennent pour un retard. Concluez que la chose se fait, mais lentement `
        + `et sans que personne l’aide.`,
    });
  }
  if (empechement && verdict.reponse === 'oui') {
    obstacles.push({
      clef: 'prohibition',
      texte: `<b>Prohibition.</b> Avant que les deux seigneurs n’achèvent, `
        + `<b>${avecArticle(empechement.empecheur.clef)}</b> vient joindre `
        + `<b>${avecArticle(empechement.cible.clef)}</b> — et y arrive le premier, avec `
        + `${empechement.avance.toFixed(0)} jours d’avance. Quelqu’un se met entre les deux et `
        + `empêche. Sa nature dit qui : cherchez du côté de ce que signifie `
        + `${avecArticle(empechement.empecheur.clef)}.`,
    });
  }
  if (retenue && verdict.reponse === 'oui') {
    obstacles.push({
      clef: 'refranation',
      texte: `<b>Réfrénation.</b> <b>${avecArticle(retenue.planete.clef)}</b> est rétrograde : elle revient `
        + `sur elle-même avant d’achever l’aspect. La partie se retire au dernier moment, et `
        + `l’affaire, tenue pour conclue, retombe.`,
    });
  }

  return {
    matiere,
    consultant,
    seigneurChose,
    jonction,
    translation,
    collection,
    vide,
    empechement,
    retenue,
    obstacles,
    echeance,
    verdict,
    considerations: considerations(figure),
  };
}


// L'interrogation — le genre qui répond à « de quoi dois-je me méfier ».
//
// On ne relit pas la nativité : on dresse le ciel à l'instant même où la
// question est posée. Le consultant est l'ascendant et son seigneur ; la
// chose demandée est la maison qui la gouverne, et son seigneur. La question
// « aboutit » — perficitur — si les deux seigneurs se regardent, ou si la Lune
// porte la lumière de l'un à l'autre.
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

import { mod360, enSigne } from './ciel.js';
import { seigneurDuSigne, nomDe } from './jugement.js';
import { MAISONS, ASPECTS, ORBES } from './doctrine.js';

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
  const ecartSoleil = Math.abs(((seigneurAsc.longitude - soleil.longitude + 540) % 360) - 180);
  if (ecartSoleil > 172) {
    avis.push({
      grave: false,
      texte: `Le seigneur de l’ascendant est brûlé par le Soleil, à moins de huit degrés : `
        + `<b>le consultant ne voit pas clair dans sa propre affaire</b>, ou l’on cherche à `
        + `l’abuser.`,
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

/** Le regard entre deux astres, s'il y en a un dans les orbes. */
function regardEntre(a, b) {
  const ecart = Math.abs(((a.longitude - b.longitude + 540) % 360) - 180);
  const distance = 180 - ecart;
  for (const asp of ASPECTS.table) {
    const orbe = (ORBES.table[a.clef] ?? 6) / 2 + (ORBES.table[b.clef] ?? 6) / 2;
    if (Math.abs(distance - asp.angle) <= orbe) {
      return { ...asp, exact: Math.abs(distance - asp.angle) };
    }
  }
  return null;
}

/** Juger une interrogation : le consultant, la chose, et si elles se joignent. */
export function jugerInterrogation(figure, rangMaison) {
  const matiere = figure.maisonsHabitees[rangMaison - 1];
  const consultant = figure.seigneurAscendantPlace;
  const seigneurChose = figure.astres.find((a) => a.clef === matiere.seigneur);
  const lune = figure.astres.find((a) => a.clef === 'lune');

  const jonction = regardEntre(consultant, seigneurChose);
  const parLaLune = !jonction && regardEntre(lune, consultant) && regardEntre(lune, seigneurChose)
    ? { via: 'la Lune porte la lumière de l’un à l’autre' }
    : null;

  const memePlanete = consultant.clef === seigneurChose.clef;

  let verdict;
  if (memePlanete) {
    verdict = {
      clef: 'meme',
      titre: 'Le consultant et la chose ont le même seigneur',
      texte: `<b>${nomDe(consultant.clef)}</b> gouverne à la fois l’ascendant et la `
        + `${rangMaison}<sup>e</sup> maison. La chose et celui qui la demande ne font qu’un : `
        + `l’affaire dépend de lui seul, et de l’état où se trouve cette planète.`,
    };
  } else if (jonction) {
    verdict = {
      clef: jonction.nom === 'opposition' || jonction.nom === 'quadrature' ? 'dur' : 'doux',
      titre: `La question aboutit — par ${jonction.nom}`,
      texte: `<b>${nomDe(consultant.clef)}</b>, seigneur du consultant, et `
        + `<b>${nomDe(seigneurChose.clef)}</b>, seigneur de la chose, se regardent par `
        + `<b>${jonction.nom}</b> (${jonction.angle}°, à ${jonction.exact.toFixed(1)}° près). `
        + `La chose se fait. ${jonction.nom === 'opposition' ? 'Mais par opposition : elle se fait mal, tard, ou au prix d’un conflit.'
          : jonction.nom === 'quadrature' ? 'Mais par quadrature : elle se fait avec peine et contrariété.'
            : 'Et par un regard favorable : elle se fait sans grande peine.'}`,
    };
  } else if (parLaLune) {
    verdict = {
      clef: 'lune',
      titre: 'La question aboutit — par translation de lumière',
      texte: `Les deux seigneurs ne se voient pas, mais <b>la Lune</b> regarde l’un et l’autre : `
        + `elle porte la lumière du premier au second. La chose se fera <b>par un tiers</b> — `
        + `un messager, une entremise, quelqu’un qui n’est pas dans l’affaire.`,
    };
  } else {
    verdict = {
      clef: 'rien',
      titre: 'La question n’aboutit pas',
      texte: `<b>${nomDe(consultant.clef)}</b> et <b>${nomDe(seigneurChose.clef)}</b> ne se `
        + `regardent d’aucun aspect, et la Lune ne joint pas l’un à l’autre. Selon la règle, `
        + `<b>la chose ne se fera pas</b> — non qu’elle soit interdite, mais rien dans la `
        + `figure ne la porte.`,
    };
  }

  return {
    matiere,
    consultant,
    seigneurChose,
    jonction,
    parLaLune,
    verdict,
    considerations: considerations(figure),
  };
}

void seigneurDuSigne;

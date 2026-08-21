// La durée de vie : le hyleg, l'alcocoden, et le désaccord des auteurs.
//
// Ce module ne rend aucun nombre d'années, et ce n'est pas une prudence : c'est
// le résultat. On y calcule, sur la même figure, la marche de Ptolémée et celle
// d'al-Qabīṣī — les deux autorités qu'on lisait ensemble dans les universités
// latines du XIVe siècle. Quand elles tombent sur des points différents, elles
// tombent aussi sur des planètes différentes pour donner les années, et le
// prince à qui l'on aurait rendu un chiffre n'aurait jamais su lequel des deux
// livres il payait.
//
// Ce que le site montre est donc l'écart, pas la durée. C'est le même geste
// qu'avec la conjonction de 1345 : la divergence vaut mieux que chacune des
// deux valeurs prise seule, parce qu'elle est, elle, un fait.
//
// Les deux règles sont appliquées telles qu'elles sont écrites, et les endroits
// où le texte est muet ou ambigu sont marqués dans le résultat plutôt que
// tranchés en silence.

import {
  HYLEG, ALCOCODEN, GENRES_SIGNES, ASPECTS, ORBES, ETATS_SOLAIRES, FORCE_DES_LIEUX,
} from './doctrine.js';
import { dignitesDe, rangTexte, avecArticle } from './jugement.js';
import { maisonDe, ecartAngulaire, enSigne, signeDe, PLANETES, GENRES } from './ciel.js';

/** Un regard entre une planète et un degré fixe.
 *
 *  Le moteur d'aspects ordinaire compare deux corps et sait dire lequel marche
 *  vers l'autre. Ici l'un des deux points ne bouge pas — c'est un degré, une
 *  part, un ascendant — et la seule question est : y a-t-il regard, oui ou non.
 *  On prend l'orbe de la planète seule, puisqu'un degré n'en a pas. */
export function regardeLeDegre(astre, degre) {
  const ecart = ecartAngulaire(astre.longitude, degre);
  const orbe = ORBES.table[astre.clef] ?? 6;
  for (const aspect of ASPECTS.table) {
    if (Math.abs(ecart - aspect.angle) <= orbe) {
      return { ...aspect, ecart: Math.abs(ecart - aspect.angle) };
    }
  }
  return null;
}

/** Les cinq seigneurs d'un degré, rangés selon un ordre de commandement.
 *  L'ordre est la seconde fourche : al-Qabīṣī met le domicile en tête,
 *  Dorothée le terme, et ils ne désignent alors pas le même donneur d'années. */
function seigneursRanges(degre, deJour, rang) {
  const trouvees = dignitesDe(degre, deJour)
    .filter((d) => d.planete !== 'teste' && d.planete !== 'queue');
  return rang
    .map((dignite) => trouvees.find((d) => d.dignite === dignite))
    .filter(Boolean)
    .map((d) => ({ planete: d.planete, dignite: d.dignite }));
}

/** Un seigneur atteint-il le degré qu'il gouverne ?
 *
 *  Deux façons, et il faut les distinguer. Ou bien il le regarde d'ailleurs,
 *  et c'est le cas ordinaire. Ou bien il l'occupe — une planète dans son propre
 *  domicile est le seigneur du lieu où elle se tient. Compter cela comme une
 *  conjonction avec soi-même serait un artefact de calcul : l'écart vaut zéro,
 *  donc l'aspect « existe », mais aucun auteur n'a jamais écrit qu'une planète
 *  se regarde. La tradition l'admet pourtant, et à plus forte raison : être
 *  dans le lieu vaut mieux que le contempler. On le retient donc, sous son
 *  vrai nom. */
function atteintLeDegre(astre, degre, clefDuPoint) {
  if (!astre) return null;
  const il = GENRES[astre.clef] === 'f' ? 'elle' : 'il';
  if (astre.clef === clefDuPoint) {
    return { chezSoi: true, glose: `${il} est ce point même, et en son propre lieu` };
  }
  const regard = regardeLeDegre(astre, degre);
  return regard ? { regard, glose: `${il} le regarde par ${regard.nom}` } : null;
}

/** L'alcocoden : le premier des seigneurs du degré, dans l'ordre de
 *  commandement, qui atteigne le hyleg. Si aucun ne l'atteint, le hyleg est
 *  déclaré incomplet — et c'est une réponse, pas une panne.
 *
 *  Noter que l'alcocoden n'est pas de Ptolémée : il n'en parle nulle part. On
 *  l'applique quand même à son hyleg, parce que c'est exactement ce que
 *  faisaient les maîtres latins, qui lisaient Ptolémée à travers les Arabes. */
export function alcocodenDe(figure, hyleg, ordre) {
  const candidats = seigneursRanges(hyleg.longitude, figure.deJour, ordre.rang).map((s) => {
    const astre = figure.astres.find((a) => a.clef === s.planete);
    const atteinte = atteintLeDegre(astre, hyleg.longitude, hyleg.clef);
    return { ...s, astre, atteinte, nom: avecArticle(s.planete) };
  });

  const elu = candidats.find((c) => c.atteinte);
  return {
    auteur: ordre.auteur,
    note: ordre.note ?? null,
    rang: ordre.rang,
    candidats,
    elu: elu ?? null,
    incomplet: !elu,
  };
}

// ─── Ptolémée ────────────────────────────────────────────────────────────────

/** Un point est-il dans un lieu prorogatif au sens de Ptolémée ?
 *
 *  Les cinq lieux sont la dixième, la première, la onzième, la septième et la
 *  neuvième — dans cet ordre d'autorité. La première a une définition
 *  particulière : elle court de cinq degrés au-dessus de l'horizon jusqu'à
 *  vingt-cinq degrés au-dessous, ce qui déborde l'ascendant par le haut et
 *  s'arrête avant le bas du signe. Ptolémée y insiste, et c'est la seule
 *  mesure en degrés de toute sa liste. */
function lieuProrogatif(longitude, figure) {
  const { lieux, marge } = HYLEG.ptolemee;
  const depuisAscendant = ((longitude - figure.ascendant + 540) % 360) - 180;
  if (depuisAscendant >= -marge && depuisAscendant <= 25) {
    return { rang: 1, autorite: lieux.indexOf(1), glose: 'dans les trente degrés de l’horoscope, '
      + `à ${depuisAscendant.toFixed(1)}° de l’ascendant` };
  }
  const maison = maisonDe(longitude, figure.pointes);
  if (lieux.includes(maison) && maison !== 1) {
    return { rang: maison, autorite: lieux.indexOf(maison), glose: `en la ${rangTexte(maison)} maison` };
  }
  return null;
}

/** Le compte des dominations de Ptolémée sur un lieu. Cinq modes : triplicité,
 *  domicile, exaltation, terme, et regard. La face n'en est pas — Ptolémée ne
 *  la compte jamais — et le regard en est, ce que les Arabes ne font pas. */
function dominationsSur(clef, degre, figure) {
  const astre = figure.astres.find((a) => a.clef === clef);
  if (!astre) return 0;
  const tenues = dignitesDe(degre, figure.deJour)
    .filter((d) => d.planete === clef && d.dignite !== 'face');
  const regard = regardeLeDegre(astre, degre) ? 1 : 0;
  return tenues.length + regard;
}

export function hylegSelonPtolemee(figure, syzygie) {
  const marches = [];
  const point = (clef) => figure.astres.find((a) => a.clef === clef);

  const examiner = (nom, clef, longitude) => {
    const lieu = lieuProrogatif(longitude, figure);
    marches.push({
      nom, clef, longitude, retenu: !!lieu,
      pourquoi: lieu ? lieu.glose : 'hors des cinq lieux prorogatifs',
      autorite: lieu?.autorite ?? null,
    });
    return lieu;
  };

  const soleil = point('soleil');
  const lune = point('lune');
  const fortune = figure.parts.find((p) => p.clef === 'fortune');

  const lieuSoleil = examiner('le Soleil', 'soleil', soleil.longitude);
  const lieuLune = examiner('la Lune', 'lune', lune.longitude);

  // « Si les deux luminaires sont dans les lieux prorogatifs, on prend celui
  // qui est dans le lieu de plus grande autorité. » La secte ne décide donc
  // qu'à défaut, et non d'abord — c'est une clause qu'on saute facilement.
  if (lieuSoleil && lieuLune) {
    const parAutorite = lieuSoleil.autorite <= lieuLune.autorite ? 'soleil' : 'lune';
    const parSecte = figure.deJour ? 'soleil' : 'lune';
    return rendre(parAutorite, parAutorite === 'soleil' ? soleil.longitude : lune.longitude, {
      raison: 'les deux luminaires sont en lieu prorogatif ; on prend celui qui est au lieu '
        + 'de plus grande autorité',
      ecartInterne: parAutorite !== parSecte
        ? `la secte aurait donné ${avecArticle(parSecte)}, et l’autorité du lieu donne ${avecArticle(parAutorite)}`
        : null,
    });
  }

  const premier = figure.deJour ? 'soleil' : 'lune';
  const second = figure.deJour ? 'lune' : 'soleil';
  const lieuPremier = premier === 'soleil' ? lieuSoleil : lieuLune;
  const lieuSecond = second === 'soleil' ? lieuSoleil : lieuLune;

  if (lieuPremier) {
    return rendre(premier, point(premier).longitude,
      { raison: `luminaire de la secte, en lieu prorogatif` });
  }
  if (lieuSecond) {
    return rendre(second, point(second).longitude,
      { raison: `l’autre luminaire, en lieu prorogatif` });
  }

  // « la planète qui a le plus de rapports de domination au Soleil, à la
  // conjonction précédente et à l'horoscope » — de jour ; de nuit, à la Lune,
  // à la pleine lune précédente et à la part de Fortune.
  const lieux = figure.deJour
    ? [['le Soleil', soleil.longitude], ['la syzygie', syzygie?.longitude],
      ['l’ascendant', figure.ascendant]]
    : [['la Lune', lune.longitude], ['la syzygie', syzygie?.longitude],
      ['la part de Fortune', fortune?.longitude]];

  const comptes = PLANETES.map((p) => ({
    clef: p.clef,
    nom: p.nom,
    compte: lieux.reduce((n, [, deg]) =>
      n + (Number.isFinite(deg) ? dominationsSur(p.clef, deg, figure) : 0), 0),
  })).sort((a, b) => b.compte - a.compte);

  marches.push({
    nom: 'le dominateur des lieux',
    detail: `sur ${lieux.map(([n]) => n).join(', ')} — ${comptes.slice(0, 3)
      .map((c) => `${c.nom} ${c.compte}`).join(', ')}`,
    retenu: comptes[0].compte >= HYLEG.ptolemee.seuil,
    pourquoi: comptes[0].compte >= HYLEG.ptolemee.seuil
      ? `${comptes[0].nom} a ${comptes[0].compte} rapports de domination, et il en faut trois`
      : `le mieux pourvu n’a que ${comptes[0].compte} rapports, et il en faut trois`,
  });

  if (comptes[0].compte >= HYLEG.ptolemee.seuil) {
    return rendre(comptes[0].clef, point(comptes[0].clef).longitude,
      { raison: `la planète la plus dominante sur ${lieux.map(([n]) => n).join(', ')}` });
  }

  // Le dernier recours dépend de la syzygie : ascendant si elle fut une
  // nouvelle lune, part de Fortune si elle fut une pleine.
  if (figure.deJour || syzygie?.conjonction) {
    return rendre('ascendant', figure.ascendant,
      { raison: 'aucun autre candidat ne convient ; reste le degré de l’ascendant' });
  }
  return rendre('fortune', fortune?.longitude,
    { raison: 'nativité de nuit après une pleine lune ; reste la part de Fortune' });

  function rendre(clef, longitude, { raison, ecartInterne = null }) {
    // Chez Ptolémée les deux luminaires peuvent être l'un et l'autre en lieu
    // prorogatif : être éligible n'est donc pas être élu, et confondre les deux
    // ferait lire deux hylegs là où il n'y en a qu'un.
    for (const e of marches) e.elu = e.clef === clef;
    return {
      ...HYLEG.ptolemee,
      clef,
      nom: clef === 'ascendant' ? 'le degré de l’ascendant'
        : clef === 'fortune' ? 'la part de Fortune' : avecArticle(clef),
      longitude,
      position: Number.isFinite(longitude) ? enSigne(longitude) : null,
      raison,
      ecartInterne,
      marches,
    };
  }
}

// ─── Al-Qabīṣī ───────────────────────────────────────────────────────────────

/** Al-Qabīṣī n'a pas les cinq lieux de Ptolémée. Il donne à chaque luminaire
 *  sa propre liste de maisons, et le genre du signe y entre : le Soleil de jour
 *  peut donner la vie depuis la huitième — que Ptolémée exclut absolument — à
 *  condition que le signe soit masculin. C'est la première fourche, et elle
 *  suffit à séparer les deux marches sur beaucoup de figures. */
function convientSelonAlcabitius(longitude, figure, regles, genreVoulu) {
  const maison = maisonDe(longitude, figure.pointes);
  const genre = GENRES_SIGNES.genre(signeDe(longitude));
  const { marge } = HYLEG.alcabitius;

  const avant = (pointe) => {
    const d = ((pointe - longitude + 540) % 360) - 180;
    return d >= 0 && d <= marge;
  };

  if (regles.partout.maisons.includes(maison)) {
    return { oui: true, glose: `en la ${rangTexte(maison)} maison` };
  }
  if (regles.partout.avantAscendant && avant(figure.ascendant)) {
    return { oui: true, glose: 'à moins de cinq degrés avant l’ascendant' };
  }
  if (regles.partout.avantDescendant && avant(figure.pointes[7])) {
    return { oui: true, glose: 'à moins de cinq degrés avant le descendant' };
  }

  const conditionnel = regles.siMasculin ?? regles.siFeminin;
  if (conditionnel) {
    const dansLeLieu = conditionnel.maisons.includes(maison)
      || (conditionnel.avantAscendant && avant(figure.ascendant));
    if (dansLeLieu) {
      return genre === genreVoulu
        ? { oui: true, glose: `en la ${rangTexte(maison)} maison, et le signe est ${genre}` }
        : { oui: false, glose: `en la ${rangTexte(maison)} maison, mais le signe est ${genre} `
          + `et il faudrait qu’il fût ${genreVoulu}` };
    }
  }
  return { oui: false, glose: `en la ${rangTexte(maison)} maison, qui n’est pas de celles qu’il nomme` };
}

/** La condition qui manque tout à fait chez Ptolémée : un candidat ne vaut que
 *  si l'un de ses cinq seigneurs le regarde. Faute de quoi la figure peut
 *  n'avoir aucun hyleg — ce qui est, en soi, un jugement. */
function unSeigneurLeRegarde(degre, figure, clefDuPoint) {
  const seigneurs = seigneursRanges(degre, figure.deJour, ALCOCODEN.ordres[0].rang);
  for (const s of seigneurs) {
    const astre = figure.astres.find((a) => a.clef === s.planete);
    const atteinte = atteintLeDegre(astre, degre, clefDuPoint);
    if (atteinte) {
      return { oui: true, par: avecArticle(s.planete), dignite: s.dignite, glose: atteinte.glose };
    }
  }
  return { oui: false, par: null };
}

export function hylegSelonAlcabitius(figure, syzygie) {
  const marches = [];
  const point = (clef) => figure.astres.find((a) => a.clef === clef);
  const soleil = point('soleil');
  const lune = point('lune');
  const fortune = figure.parts.find((p) => p.clef === 'fortune');

  const essayer = (nom, clef, longitude, verdict, empeche = null) => {
    const regard = verdict.oui ? unSeigneurLeRegarde(longitude, figure, clef) : { oui: false };
    const retenu = verdict.oui && !empeche && regard.oui;
    marches.push({
      nom, clef, longitude, retenu,
      pourquoi: empeche ?? (!verdict.oui ? verdict.glose
        : !regard.oui ? `${verdict.glose}, mais aucun de ses cinq seigneurs ne l’atteint`
          : `${verdict.glose} ; son seigneur par ${regard.dignite} est ${regard.par}, `
            + `et ${regard.glose}`),
      regard: regard.oui ? regard : null,
    });
    return retenu;
  };

  const reglesSoleil = figure.deJour
    ? HYLEG.alcabitius.soleilDeJour : HYLEG.alcabitius.soleilDeNuit;

  // « Quand la Lune est en ces lieux mais sous les rayons, elle ne convient pas. »
  const luneBrulee = ecartAngulaire(lune.longitude, soleil.longitude) <= ETATS_SOLAIRES.rayons
    ? 'elle est sous les rayons du Soleil, et n’y convient donc pas'
    : null;

  const ordre = figure.deJour
    ? [['le Soleil', 'soleil', soleil.longitude, reglesSoleil, 'masculin', null],
      ['la Lune', 'lune', lune.longitude, HYLEG.alcabitius.lune, 'féminin', luneBrulee]]
    : [['la Lune', 'lune', lune.longitude, HYLEG.alcabitius.lune, 'féminin', luneBrulee],
      ['le Soleil', 'soleil', soleil.longitude, reglesSoleil, 'masculin', null]];

  for (const [nom, clef, longitude, regles, genre, empeche] of ordre) {
    const verdict = convientSelonAlcabitius(longitude, figure, regles, genre);
    if (essayer(nom, clef, longitude, verdict, empeche)) {
      return rendre(clef, longitude, 'luminaire, en lieu convenable et atteint par l’un de ses cinq seigneurs');
    }
  }

  // Puis la syzygie, puis la part de Fortune — angle ou succédente, pas cadente.
  const nonCadent = (longitude) => {
    const maison = maisonDe(longitude, figure.pointes);
    const place = FORCE_DES_LIEUX.table[maison];
    return { oui: place !== 'cadente', maison, place };
  };

  if (Number.isFinite(syzygie?.longitude)) {
    const v = nonCadent(syzygie.longitude);
    const verdict = { oui: v.oui, glose: `en la ${rangTexte(v.maison)} maison, ${v.place}` };
    if (essayer(`le degré de ${syzygie.nom}`, 'syzygie', syzygie.longitude, verdict)) {
      return rendre('syzygie', syzygie.longitude,
        `le degré de ${syzygie.nom} qui a précédé la naissance, en lieu non cadent`);
    }
  }

  if (Number.isFinite(fortune?.longitude)) {
    const v = nonCadent(fortune.longitude);
    const verdict = { oui: v.oui, glose: `en la ${rangTexte(v.maison)} maison, ${v.place}` };
    if (essayer('la part de Fortune', 'fortune', fortune.longitude, verdict)) {
      return rendre('fortune', fortune.longitude, 'la part de Fortune, en lieu non cadent');
    }
  }

  marches.push({
    nom: 'le degré de l’ascendant', clef: 'ascendant', longitude: figure.ascendant,
    retenu: true, pourquoi: 'dernier recours : « le hyleg lui revient »',
  });
  return rendre('ascendant', figure.ascendant,
    'aucun autre ne convient ; le hyleg revient au degré de l’ascendant');

  function rendre(clef, longitude, raison) {
    for (const e of marches) e.elu = e.clef === clef;
    return {
      ...HYLEG.alcabitius,
      clef,
      nom: clef === 'ascendant' ? 'le degré de l’ascendant'
        : clef === 'fortune' ? 'la part de Fortune'
          : clef === 'syzygie' ? `le degré de ${syzygie.nom}` : avecArticle(clef),
      longitude,
      position: enSigne(longitude),
      raison,
      marches,
    };
  }
}

// ─── Les deux marches, et ce qui les sépare ──────────────────────────────────

/** Le tableau complet : deux hylegs, leurs alcocodens selon deux ordres de
 *  commandement, et le compte de ce sur quoi les auteurs s'accordent.
 *
 *  Aucune durée n'en sort. La sortie utile est `accord` : quand il est faux,
 *  la figure elle-même démontre que le nombre qu'on aurait pu rendre dépendait
 *  du livre et non du ciel. */
export function laDureeDeVie(figure, syzygie) {
  const marches = [
    { ...hylegSelonPtolemee(figure, syzygie), auteur: HYLEG.ptolemee.auteur },
    { ...hylegSelonAlcabitius(figure, syzygie), auteur: HYLEG.alcabitius.auteur },
  ].map((h) => ({
    ...h,
    alcocodens: Number.isFinite(h.longitude)
      ? ALCOCODEN.ordres.map((o) => alcocodenDe(figure, h, o))
      : [],
  }));

  const points = marches.map((h) => h.clef);
  const memePoint = points.every((p) => p === points[0]);

  const donneurs = marches.flatMap((h) => h.alcocodens.map((a) => a.elu?.planete ?? null));
  const memeDonneur = donneurs.every((d) => d !== null && d === donneurs[0]);

  return {
    syzygie,
    marches,
    accord: { memePoint, memeDonneur },
    donneurs: [...new Set(donneurs.filter(Boolean))],
    // Un hyleg peut n'avoir aucun donneur d'années : la règle arabe veut alors
    // qu'on aille en chercher un autre. Le signaler à part évite de lire « ils
    // s'accordent sur Saturne » quand l'un des deux n'a nommé personne.
    sansDonneur: donneurs.some((d) => d === null),
    // Le refus de chiffrer est ici, et il est motivé par ce qui précède plutôt
    // que posé d'avance.
    pasDeNombre: ALCOCODEN.pasDeNombre,
  };
}

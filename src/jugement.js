// Le jugement : appliquer la doctrine à une figure.
//
// Tout ce qui suit est mécanique et incontesté — les dignités, l'almuten, les
// parts, les regards. Ce qui ne l'est pas n'est pas calculé ici : le caractère
// pas du tout, la durée de vie autrement — vie.js en calcule le désaccord des
// auteurs, mais aucun nombre. Voir RESERVES dans doctrine.js.

import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS, NATURES_SIGNES, FORCE_DES_LIEUX,
  ETATS_SOLAIRES, LUMIERE, MATIERES, MELOTHESIE, SIGNIFICATIONS, laGrandeDignite, CONDITIONS,
} from './doctrine.js';
import {
  PLANETES, SIGNES, GENRES, maisonDe, signeDe, mod360, enSigne, ecartAngulaire,
} from './ciel.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));
NOMS.teste = 'Teste du dragon';
NOMS.queue = 'Queue du dragon';
export const nomDe = (clef) => NOMS[clef] ?? clef;

/** Le seigneur du domicile d'un degré. */
export const seigneurDuSigne = (longitude) => DOMICILES.table[signeDe(longitude)];

/** Le seigneur du terme — cinq tranches inégales par signe. */
export function seigneurDuTerme(longitude) {
  const degre = mod360(longitude) % 30;
  return TERMES.table[signeDe(longitude)].find(([, fin]) => degre < fin)[0];
}

/** Le seigneur de la face — un décan de dix degrés. */
export function seigneurDeLaFace(longitude) {
  const rang = Math.floor(mod360(longitude) / 10) % 36;
  return FACES.ordre[rang % 7];
}

/** Le seigneur de la triplicité, qui dépend du jour et de la nuit. */
export function seigneurDeLaTriplicite(longitude, deJour) {
  const t = TRIPLICITES.table.find((x) => x.signes.includes(signeDe(longitude)));
  return deJour ? t.jour : t.nuit;
}

/** Les cinq dignités essentielles tenues sur un degré donné, avec leur poids.
 *  C'est la seule opération de tout le site qui produise un classement. */
export function dignitesDe(longitude, deJour) {
  const signe = signeDe(longitude);
  const trouvees = [];

  trouvees.push({ planete: DOMICILES.table[signe], dignite: 'domicile', poids: POIDS.domicile });

  for (const [planete, e] of Object.entries(EXALTATIONS.table)) {
    if (e.signe === signe) trouvees.push({ planete, dignite: 'exaltation', poids: POIDS.exaltation });
  }

  const t = TRIPLICITES.table.find((x) => x.signes.includes(signe));
  trouvees.push({
    planete: deJour ? t.jour : t.nuit, dignite: 'triplicité', poids: POIDS.triplicite,
  });

  trouvees.push({ planete: seigneurDuTerme(longitude), dignite: 'terme', poids: POIDS.terme });
  trouvees.push({ planete: seigneurDeLaFace(longitude), dignite: 'face', poids: POIDS.face });

  return trouvees;
}

/** L'almuten d'un degré : la planète qui y cumule le plus de dignités.
 *  Le mot est arabe (al-mubtazz, « celui qui l'emporte ») et le calcul est
 *  la seule chose qu'un astrologien fasse deux fois de la même manière. */
export function almutenDe(longitude, deJour) {
  const scores = {};
  const detail = {};
  for (const d of dignitesDe(longitude, deJour)) {
    if (d.planete === 'teste' || d.planete === 'queue') continue;
    scores[d.planete] = (scores[d.planete] ?? 0) + d.poids;
    (detail[d.planete] ??= []).push(d.dignite);
  }
  const classement = Object.entries(scores)
    .map(([planete, score]) => ({ planete, score, dignites: detail[planete] }))
    .sort((a, b) => b.score - a.score);
  return { vainqueur: classement[0], classement };
}

/** L'état d'une planète : où elle est, ce qu'elle y tient, ce qu'elle y perd. */
export function etatDe(clef, longitude, deJour) {
  const signe = signeDe(longitude);
  const tenues = [];
  if (DOMICILES.table[signe] === clef) tenues.push('en son domicile');
  const ex = EXALTATIONS.table[clef];
  if (ex && ex.signe === signe) tenues.push('en son exaltation');
  if (seigneurDeLaTriplicite(longitude, deJour) === clef) tenues.push('en sa triplicité');
  if (seigneurDuTerme(longitude) === clef) tenues.push('en son terme');
  if (seigneurDeLaFace(longitude) === clef) tenues.push('en sa face');

  const perdues = [];
  if (DOMICILES.table[(signe + 6) % 12] === clef) perdues.push('en son exil');
  if (ex && (ex.signe + 6) % 12 === signe) perdues.push('en sa chute');

  return { tenues, perdues, pérégrine: tenues.length === 0 && perdues.length === 0 };
}

/** L'écart angulaire absolu entre deux longitudes, de 0 à 180. */
const ecartDe = ecartAngulaire;

/** Le regard entre deux astres, s'il y en a un dans les orbes — et, ce qui
 *  importe davantage, s'il se fait ou s'il se défait.
 *
 *  Un regard ne dit rien tant qu'on ignore son sens. Si la plus rapide des
 *  deux marche vers l'aspect, il s'applique et la chose est à venir ; si elle
 *  s'en éloigne, il se sépare et la chose est déjà faite. Alcabitius traite
 *  l'application et la séparation à la dist. III, et c'est la distinction qui
 *  sépare un pronostic d'un constat. Dans une interrogation elle décide de la
 *  réponse même : appliquer c'est oui, se séparer c'est non.
 *
 *  Le sens se lit sur un pas de temps court, et il faut qu'il le soit. La Lune
 *  parcourt treize degrés en un jour : mesurée à un jour d'intervalle, une Lune
 *  à deux degrés de l'aspect exact et marchant vers lui se retrouve onze degrés
 *  au-delà, et l'on conclut qu'elle s'en sépare. C'est le contraire de la
 *  vérité, et cela renverse la réponse. Le pas est donc d'une heure environ,
 *  soit la dérivée à ce que le calcul peut lire. */
const PAS = 0.04;

export function regardEntre(a, b) {
  const ecartMaintenant = ecartDe(a.longitude, b.longitude);
  const orbe = ((ORBES.table[a.clef] ?? 6) + (ORBES.table[b.clef] ?? 6)) / 2;
  for (const aspect of ASPECTS.table) {
    const ecart = Math.abs(ecartMaintenant - aspect.angle);
    if (ecart > orbe) continue;

    const apres = Math.abs(ecartDe(
      a.longitude + (a.vitesse ?? 0) * PAS,
      b.longitude + (b.vitesse ?? 0) * PAS,
    ) - aspect.angle);
    const applique = apres < ecart;
    const relative = Math.abs((a.vitesse ?? 0) - (b.vitesse ?? 0));

    return {
      aspect,
      ...aspect, // nom, angle, glyphe, nature — dépliés pour la lecture
      ecart,
      partil: ecart < 1,
      applique,
      mouvement: applique ? 'application' : 'séparation',
      jours: relative > 1e-6 ? ecart / relative : null,
      glose: applique ? CONDITIONS.application : CONDITIONS.separation,
    };
  }
  return null;
}

/** Tous les regards d'une figure, du plus serré au plus lâche. */
export function regards(positions) {
  const clefs = PLANETES.map((p) => p.clef);
  const trouves = [];
  for (let i = 0; i < clefs.length; i++) {
    for (let j = i + 1; j < clefs.length; j++) {
      const a = clefs[i], b = clefs[j];
      const vu = regardEntre({ ...positions[a], clef: a }, { ...positions[b], clef: b });
      if (vu) trouves.push({ de: a, a: b, ...vu });
    }
  }
  return trouves.sort((x, y) => x.ecart - y.ecart);
}

/** L'état d'une planète au regard du Soleil : brûlée, sous les rayons, ou
 *  libre — et de quel côté du Soleil elle se tient. Une planète brûlée agit
 *  sous le nom d'un autre ; c'est le plus lourd des accidents, et il ne se
 *  voit sur aucune table de dignités. */
export function etatSolaire(clef, longitude, soleil) {
  if (clef === 'soleil') return null;
  const ecart = ecartDe(longitude, soleil);
  const classe = ecart <= ETATS_SOLAIRES.cazimi ? 'cazimi'
    : ecart <= ETATS_SOLAIRES.combustion ? 'combuste'
      : ecart <= ETATS_SOLAIRES.rayons ? 'rayons' : 'libre';
  return {
    classe,
    ecart,
    // Le Soleil devance-t-il la planète dans l'ordre des signes ? Alors la
    // planète se lève avant lui, et elle est orientale.
    orientale: mod360(soleil - longitude) < 180,
    glose: ETATS_SOLAIRES.gloses[classe],
  };
}

/** La lumière de la Lune : son écart au Soleil, et si elle croît ou décroît. */
export function lumiereDeLaLune(lune, soleil) {
  const elongation = mod360(lune - soleil);
  const croissante = elongation < 180;
  return {
    elongation,
    croissante,
    // L'âge en jours, au mouvement synodique moyen : c'est l'ordre de
    // grandeur, pas une éphéméride.
    age: elongation / 360 * 29.53,
    glose: croissante ? LUMIERE.croissante : LUMIERE.decroissante,
  };
}

/** Les réceptions : quelles planètes logent quelles autres, et si elles se
 *  voient. Une planète pérégrine mais reçue n'est pas sans appui — elle
 *  emprunte. Et deux planètes qui ont échangé leurs domiciles sans se
 *  regarder tiennent le lien le plus fort et le plus inutile de la doctrine. */
export function receptions(astres, lesRegards) {
  const planetes = astres.filter((a) => !a.noeud);
  const voit = (x, y) => lesRegards.find((r) =>
    (r.de === x && r.a === y) || (r.de === y && r.a === x));
  const trouvees = [];

  for (const hote of planetes) {
    for (const recue of planetes) {
      if (hote.clef === recue.clef) continue;
      const signe = signeDe(recue.longitude);
      const parDomicile = DOMICILES.table[signe] === hote.clef;
      const ex = EXALTATIONS.table[hote.clef];
      const parExaltation = ex && ex.signe === signe;
      if (!parDomicile && !parExaltation) continue;
      trouvees.push({
        hote: hote.clef, recue: recue.clef,
        par: parDomicile ? 'domicile' : 'exaltation',
        regard: voit(hote.clef, recue.clef) ?? null,
      });
    }
  }

  // La réception mutuelle : chacune chez l'autre. On ne la retient que par
  // domicile, qui est la seule forme sur laquelle toute la tradition s'accorde.
  const mutuelles = [];
  for (const r of trouvees) {
    if (r.par !== 'domicile') continue;
    const retour = trouvees.find((x) =>
      x.par === 'domicile' && x.hote === r.recue && x.recue === r.hote);
    if (retour && !mutuelles.some((m) => m.a === r.recue && m.b === r.hote)) {
      mutuelles.push({ a: r.hote, b: r.recue, regard: r.regard });
    }
  }
  return { simples: trouvees, mutuelles };
}

/** Le significateur du métier, selon la règle de Ptolémée.
 *
 *  Deux endroits, et deux seulement : la planète qui se lève immédiatement
 *  avant le Soleil, et le seigneur du milieu du ciel. Ne peuvent être retenues
 *  que Mercure, Vénus et Mars — les trois planètes de l'action. Si aucune ne
 *  témoigne, Ptolémée dit que le métier est sans distinction, et il faut
 *  l'écrire ainsi plutôt que de forcer la règle. */
export function significateurDuMetier(figure) {
  const ACTION = ['mercure', 'venus', 'mars'];
  const soleil = figure.astres.find((a) => a.clef === 'soleil');

  // Celle qui se lève juste avant le Soleil : parmi les orientales, la plus proche.
  const orientales = figure.astres
    .filter((a) => !a.noeud && a.clef !== 'soleil' && mod360(soleil.longitude - a.longitude) < 180)
    .map((a) => ({ astre: a, distance: mod360(soleil.longitude - a.longitude) }))
    .sort((x, y) => x.distance - y.distance);
  const precede = orientales[0]?.astre ?? null;

  const seigneurMC = figure.astres.find((a) => a.clef === seigneurDuSigne(figure.milieuDuCiel));

  const retenus = [...new Set([precede, seigneurMC]
    .filter((a) => a && ACTION.includes(a.clef)).map((a) => a.clef))];
  const clef = ACTION.filter((p) => retenus.includes(p)).join('+');

  // Ptolémée veut la planète qui fait son lever héliaque, c'est-à-dire qui
  // vient de sortir des rayons. Loin du Soleil, elle « précède » encore, mais
  // le témoignage s'affaiblit : il faut le dire plutôt que de le taire.
  const distance = orientales[0]?.distance ?? null;
  return {
    precede,
    distanceAuSoleil: distance,
    leverFaible: distance !== null && distance > 30,
    seigneurMC,
    retenus,
    combinaison: clef ? (MATIERES.metier.combinaisons[clef] ?? null) : null,
    sansDistinction: retenus.length === 0,
  };
}

/** Les parts. Une part est une distance reportée depuis l'ascendant, et
 *  la plupart se renversent entre le jour et la nuit.
 *
 *  Le mariage fait exception : il se renverse sur le sexe du natif, qui n'est
 *  pas dans le ciel. Faute de le savoir, on ne tranche pas — on rend les deux
 *  points, et la part n'est pas placée sur la figure. C'est le seul endroit du
 *  site où une donnée manque sans qu'on puisse la calculer. */
export function parts(positions, ascendant, deJour, sexe = null) {
  const reporter = (de, a) => ({
    longitude: mod360(ascendant + positions[de].longitude - positions[a].longitude),
    formule: `ascendant + ${nomDe(de)} − ${nomDe(a)}`,
  });

  return PARTS.table.map((p) => {
    if (!p.selonLeSexe) {
      const [de, a] = deJour ? p.dejour : p.denuit;
      return { ...p, ...reporter(de, a) };
    }
    const paire = p.selonLeSexe[sexe];
    if (paire) return { ...p, ...reporter(...paire), sexe };
    return {
      ...p,
      longitude: null,
      formule: null,
      indecise: 'le sexe du natif n’a pas été donné',
      variantes: ['homme', 'femme'].map((s) => ({
        sexe: s, ...reporter(...p.selonLeSexe[s]),
      })),
    };
  });
}

/** La figure complète : positions, maisons, dignités, parts, regards. */
export function juger({ positions: pos, maisons: mai, sexe = null }) {
  const soleilEnMaison = maisonDe(pos.soleil.longitude, mai.pointes);
  const deJour = soleilEnMaison >= 7;

  const astres = [...PLANETES.map((p) => p.clef), 'teste', 'queue'].map((clef) => {
    const longitude = pos[clef].longitude;
    const maison = maisonDe(longitude, mai.pointes);
    return {
      clef,
      nom: nomDe(clef),
      longitude,
      vitesse: pos[clef].vitesse ?? 0,
      retrograde: pos[clef].retrograde,
      noeud: !!pos[clef].noeud,
      maison,
      force: FORCE_DES_LIEUX.table[maison],
      seigneur: seigneurDuSigne(longitude),
      etat: pos[clef].noeud ? null : etatDe(clef, longitude, deJour),
      solaire: pos[clef].noeud ? null : etatSolaire(clef, longitude, pos.soleil.longitude),
      perfection: pos[clef].noeud ? null : proximiteExaltation(clef, longitude),
    };
  });

  const seigneurAscendant = seigneurDuSigne(mai.ascendant);
  const almuten = almutenDe(mai.ascendant, deJour);
  const lesRegards = regards(pos);

  const figure = {
    deJour,
    soleilEnMaison,
    astres,
    ascendant: mai.ascendant,
    milieuDuCiel: mai.milieuDuCiel,
    pointes: mai.pointes,
    seigneurAscendant,
    seigneurAscendantPlace: astres.find((a) => a.clef === seigneurAscendant),
    almuten,
    sexe,
    parts: parts(pos, mai.ascendant, deJour, sexe),
    regards: lesRegards,
    lumiere: lumiereDeLaLune(pos.lune.longitude, pos.soleil.longitude),
    receptions: receptions(astres, lesRegards),
    maisonsHabitees: MAISONS.table.map((m, i) => ({
      rang: i + 1,
      ...m,
      pointe: mai.pointes[i + 1],
      seigneur: seigneurDuSigne(mai.pointes[i + 1]),
      hotes: astres.filter((a) => a.maison === i + 1),
    })),
  };

  // Le métier et le corps se prennent sur la figure entière : il leur faut le
  // milieu du ciel et les astres déjà placés, donc ils viennent après.
  figure.metier = significateurDuMetier(figure);
  figure.corps = leCorps(figure);
  figure.perfections = pointsDePerfection(astres);
  return figure;
}

/** Le corps, par l'homme zodiacal.
 *
 *  C'est la pièce qui rattache l'astrologie à la médecine, et la seule dont
 *  l'usage fût réellement quotidien : on ne saigne pas un membre quand la
 *  Lune parcourt le signe qui le gouverne. Trois lieux la commandent — le
 *  signe qui monte, qui donne la complexion du corps entier ; le signe de la
 *  Lune, qui dit le membre chargé au moment même ; et la sixième maison, qui
 *  est celle de la maladie et de tout ce à quoi l'on est assujetti. */
export function leCorps(figure) {
  const lune = figure.astres.find((a) => a.clef === 'lune');
  const sixieme = figure.maisonsHabitees[5];
  const seigneurSixieme = figure.astres.find((a) => a.clef === sixieme.seigneur);
  const seigneurAsc = figure.seigneurAscendantPlace;

  const membreDe = (longitude) => MELOTHESIE.table[signeDe(longitude)];

  return {
    source: MELOTHESIE.source,
    regle: MELOTHESIE.regle,
    complexion: {
      signe: SIGNES[signeDe(figure.ascendant)],
      membre: membreDe(figure.ascendant),
      element: elementDu(figure.ascendant),
      seigneur: seigneurAsc,
      // Le seigneur de l'ascendant porte la complexion : sa qualité est celle
      // du corps, et son état dit si ce corps tient.
      qualite: SIGNIFICATIONS.table[seigneurAsc.clef]?.qualite ?? null,
      humeur: SIGNIFICATIONS.table[seigneurAsc.clef]?.humeur ?? null,
    },
    lune: {
      signe: SIGNES[signeDe(lune.longitude)],
      membre: membreDe(lune.longitude),
      lumiere: figure.lumiere,
      // La règle de saignée, appliquée : c'est un interdit, pas un conseil.
      interdit: `On ne saigne ni ne taille ${membreDe(lune.longitude)} tant que la Lune `
        + `tient ${SIGNES[signeDe(lune.longitude)]}.`,
    },
    maladie: {
      maison: sixieme,
      membre: membreDe(sixieme.pointe),
      seigneur: seigneurSixieme,
      corps: SIGNIFICATIONS.table[seigneurSixieme.clef]?.corps ?? null,
      hotes: sixieme.hotes.filter((a) => !a.noeud).map((a) => ({
        clef: a.clef, nom: a.nom,
        corps: SIGNIFICATIONS.table[a.clef]?.corps ?? null,
      })),
    },
  };
}

/** Où tombe une part, et quel est le seigneur de son signe — c'est ainsi
 *  qu'on juge l'avoir : par le lieu de la part de Fortune et par son maître. */
export function lieuDeLaPart(figure, clef) {
  const part = figure.parts.find((p) => p.clef === clef);
  if (!part) return null;
  const maison = maisonDe(part.longitude, figure.pointes);
  const seigneur = figure.astres.find((a) => a.clef === seigneurDuSigne(part.longitude));
  return { part, maison, lieu: figure.maisonsHabitees[maison - 1], seigneur };
}

// ─── Ce qui manquait au jugement, et qui porte le plus ───────────────────────

/** L'écart d'une planète à son propre degré d'exaltation, ou de chute.
 *
 *  La table des exaltations donne un signe et un degré précis — Vénus au
 *  vingt-septième des Poissons, la Lune au troisième du Taureau. Toute la
 *  tradition retient ce degré, et non le seul signe : une planète qui s'en
 *  approche à quelques minutes est à son point de perfection, ce qui ne se
 *  lit sur aucune table de dignités et vaut beaucoup mieux qu'un chiffre de
 *  pondération. C'est le genre d'écart qu'un jugement doit nommer, et qu'il
 *  ne faut surtout pas laisser calculer de tête.
 *
 *  Le degré opposé est celui de la chute, et la même mesure y vaut. */
export function proximiteExaltation(clef, longitude) {
  const e = EXALTATIONS.table[clef];
  if (!e) return null;
  const degreExalt = e.signe * 30 + e.degre;
  // La distance angulaire à un degré, la plus courte des deux, dans [0, 180].
  const ecartA = (cible) => ecartAngulaire(longitude, cible);
  const exaltation = ecartA(degreExalt);
  const chute = ecartA(degreExalt + 180);
  const pres = Math.min(exaltation, chute);
  return {
    degreExalt,
    signeExalt: e.signe,
    degreDansLeSigne: e.degre,
    exaltation,
    chute,
    // Trois degrés est l'orbe que la tradition accorde à une conjonction
    // exacte ; au-delà, la proximité ne se remarque plus.
    notable: pres < 3,
    versLaChute: chute < exaltation,
    ecart: pres,
  };
}

/** L'écart en degrés et minutes d'arc, écrit — pour que rien ne s'arrondisse
 *  en chemin et que le lecteur n'ait aucun calcul à refaire. */
export function enDegresMinutes(ecart) {
  const d = Math.floor(ecart);
  const m = Math.round((ecart - d) * 60);
  return m === 60 ? `${d + 1}° 00′` : `${d}° ${String(m).padStart(2, '0')}′`;
}

/** Le corps le plus proche de son point de perfection, et celui le plus
 *  proche de sa chute. Un jugement doit les nommer tous les deux. */
export function pointsDePerfection(astres) {
  const mesures = astres
    .filter((a) => !a.noeud && a.perfection)
    .map((a) => ({ clef: a.clef, nom: a.nom, ...a.perfection }));
  const versExaltation = mesures
    .filter((m) => !m.versLaChute).sort((a, b) => a.exaltation - b.exaltation)[0] ?? null;
  const versChute = mesures
    .filter((m) => m.versLaChute).sort((a, b) => a.chute - b.chute)[0] ?? null;
  return { versExaltation, versChute };
}

/** La première maison est « la 1re », les autres « la ne ». */
export const rangHtml = (k) => (k === 1 ? '1<sup>re</sup>' : `${k}<sup>e</sup>`);
/** Le même rang en texte nu, pour le dossier et les modules qui n'écrivent pas
 *  de HTML. Le premier prend « re » et non « e » : on écrit 1re, pas 1e. */
export const rangTexte = (k) => (k === 1 ? '1re' : `${k}e`);
const rang = rangHtml;

const modeDu = (longitude) =>
  NATURES_SIGNES.modes.find((m) => m.signes.includes(signeDe(longitude)));
const elementDu = (longitude) =>
  TRIPLICITES.table.find((t) => t.signes.includes(signeDe(longitude))).element;

/** « pérégrin » ou « pérégrine », selon l'astre. Une seule définition pour tout
 *  le site : le genre des planètes est dans ciel.js, et nulle part ailleurs. */
export const peregrinDe = (clef) => (GENRES[clef] === 'f' ? 'pérégrine' : 'pérégrin');

/** Les deux luminaires prennent l'article, les cinq planètes ne le prennent
 *  pas : on écrit « la Lune » et « le Soleil », mais « Mars » et « Vénus ». */
export const avecArticle = (clef) => (clef === 'lune' ? 'la Lune'
  : clef === 'soleil' ? 'le Soleil' : nomDe(clef));

/** L'accord en genre — la Lune est pérégrine, Saturne est pérégrin. */
const accord = (clef) => {
  const f = GENRES[clef] === 'f';
  return {
    il: f ? 'Elle' : 'Il', le: f ? 'la' : 'le',
    chezSoi: f ? 'chez elle' : 'chez lui',
    fort: f ? 'forte' : 'fort',
    loge: f ? 'logée' : 'logé',
    peregrin: f ? 'pérégrine' : 'pérégrin',
  };
};

/** « de feu », « de terre », mais « d'air » et « d'eau ». */
const deLElement = (element) => (/^[aeiouy]/.test(element) ? `d’${element}` : `de ${element}`);

/** L'état d'une planète dit en français, et non en jargon.
 *
 *  On distingue ici ce que le reste du site distingue : tenir son domicile
 *  n'est pas tenir sa face. Écrire « chez lui, et fort » d'une planète qui n'a
 *  qu'une face contredirait le compte de force affiché quelques lignes plus
 *  bas, et c'est le lecteur qui aurait raison de ne plus nous croire. */
function etatEnMots(astre) {
  if (!astre.etat) return '';
  const a = accord(astre.clef);
  const grandes = laGrandeDignite(astre.etat.tenues);
  if (grandes.length) {
    return `${astre.etat.tenues.join(' et ')} — ${a.il.toLowerCase()} y est ${a.chezSoi}, et ${a.fort}`;
  }
  if (astre.etat.tenues.length) {
    return `${astre.etat.tenues.join(' et ')} — un appui, mais petit : `
      + `${a.il.toLowerCase()} y tient debout sans y commander`;
  }
  if (astre.etat.perdues.length) {
    return `${astre.etat.perdues.join(' et ')} — ${a.il.toLowerCase()} y est mal ${a.loge}`;
  }
  return `${a.peregrin} — ${a.il.toLowerCase()} n’a aucune dignité en ce lieu, `
    + `et n’y trouve pas d’appui`;
}

/** Le même état, mais en une incise — pour les phrases qui portent déjà un verbe. */
function etatBref(astre) {
  if (!astre.etat) return 'sans dignité — un nœud n’est pas une planète';
  const a = accord(astre.clef);
  if (laGrandeDignite(astre.etat.tenues).length) {
    return `${astre.etat.tenues.join(' et ')}, et donc ${a.fort}`;
  }
  if (astre.etat.tenues.length) {
    return `${astre.etat.tenues.join(' et ')} seulement — un petit appui, qui ne commande pas`;
  }
  if (astre.etat.perdues.length) return `${astre.etat.perdues.join(' et ')}, et donc mal ${a.loge}`;
  return `${a.peregrin} — sans aucune dignité en ce lieu, et donc sans appui`;
}

/** Le jugement maison par maison.
 *
 *  La technique est celle du seigneur : on ne juge pas une matière par le
 *  signe où elle tombe, mais par l'état de la planète qui gouverne ce signe et
 *  par le lieu où cette planète se trouve. C'est le cœur de la pratique
 *  médiévale, et c'est entièrement mécanique — rien n'est inventé ici. */
export function lectureDesMaisons(figure) {
  return figure.maisonsHabitees.map((m) => {
    const seigneur = figure.astres.find((a) => a.clef === m.seigneur);
    const lieuSeigneur = figure.maisonsHabitees[seigneur.maison - 1];
    const force = FORCE_DES_LIEUX.table[seigneur.maison];
    const a = accord(m.seigneur);

    const phrases = [];
    phrases.push(`Le seigneur en est <b>${nomDe(m.seigneur)}</b>, `
      + `qui se tient à ${enSigne(seigneur.longitude)}, en la ${rang(seigneur.maison)} maison, `
      + `${etatEnMots(seigneur)}.`);

    phrases.push(seigneur.maison === m.rang
      ? `${a.il} est dans la matière même qu’${a.il.toLowerCase()} gouverne : la chose se tient `
        + `d’elle-même, sans rien devoir à un autre lieu.`
      : `La matière — ${m.detail} — se joue donc dans le lieu `
        + `<b>${lieuSeigneur.genitif}</b> : ${lieuSeigneur.detail}.`);

    phrases.push(`${a.il} est ${FORCE_DES_LIEUX.gloses[force]}.`);
    if (seigneur.retrograde) {
      phrases.push(`${a.il} est <b>rétrograde</b> : la chose revient sur elle-même, se reprend, `
        + `se défait et se refait.`);
    }

    if (m.hotes.length) {
      const liste = m.hotes.map((h) => `<b>${h.nom}</b> à ${enSigne(h.longitude)}`
        + (h.etat?.tenues.length ? ` (${h.etat.tenues.join(', ')})` : '')).join(', ');
      phrases.push(`S’y ${m.hotes.length > 1 ? 'tiennent' : 'tient'} en outre ${liste} — et une `
        + `planète présente dans une maison pèse plus lourd que son seigneur absent.`);
    }

    return {
      rang: m.rang,
      titre: m.titre,
      latin: m.latin,
      question: m.detail,
      pointe: m.pointe,
      mode: modeDu(m.pointe),
      element: elementDu(m.pointe),
      seigneur: m.seigneur,
      angulaire: force === 'angle',
      phrases,
    };
  });
}

/** Trois ou quatre phrases pour qui n'a pas le temps de tout lire. */
export function sommaire(figure) {
  const soleil = figure.astres.find((a) => a.clef === 'soleil');
  const lune = figure.astres.find((a) => a.clef === 'lune');
  const seigneur = figure.seigneurAscendantPlace;
  const mode = modeDu(figure.ascendant);
  const maisonSeigneur = figure.maisonsHabitees[seigneur.maison - 1];
  const accordSeigneur = accord(figure.seigneurAscendant);

  return [
    {
      clef: 'soleil',
      etiquette: 'Votre Soleil',
      valeur: `${SIGNES[signeDe(soleil.longitude)]}`,
      detail: `à ${enSigne(soleil.longitude)}, en la ${rang(soleil.maison)} maison — celle `
        + `${figure.maisonsHabitees[soleil.maison - 1].genitif}. `
        + `C’est la ligne que tout le monde connaît aujourd’hui ; en 1380 c’en était une parmi trente, `
        + `et pas la première.`,
    },
    {
      clef: 'lune',
      etiquette: 'Votre Lune',
      valeur: `${SIGNES[signeDe(lune.longitude)]}`,
      detail: `à ${enSigne(lune.longitude)}, en la ${rang(lune.maison)} maison. `
        + `La Lune est l’astre du corps et des humeurs : c’est elle que le médecin regarde d’abord, `
        + `avant une saignée comme avant une purge.`,
    },
    {
      clef: 'ascendant',
      etiquette: 'Votre ascendant',
      valeur: `${SIGNES[signeDe(figure.ascendant)]}`,
      detail: `${enSigne(figure.ascendant)} montait à l’horizon. Signe ${mode.nom} `
        + `<i>(${mode.latin})</i> et ${deLElement(elementDu(figure.ascendant))} : ${mode.glose}. `
        + `<b>C’est la pièce maîtresse</b> — elle change de degré toutes les quatre minutes, `
        + `et c’est elle qui distribue les douze maisons.`,
    },
    {
      clef: 'seigneur',
      etiquette: 'Le seigneur de votre ascendant',
      valeur: nomDe(figure.seigneurAscendant),
      detail: `${accordSeigneur.il} gouverne votre première maison, celle de la vie et du corps, `
        + `et ${accordSeigneur.il.toLowerCase()} se tient à ${enSigne(seigneur.longitude)}, `
        + `en la ${rang(seigneur.maison)} maison — celle ${maisonSeigneur.genitif}. `
        + `${accordSeigneur.il} y est ${etatBref(seigneur)}. `
        + `Un astrologien de cour aurait commencé par là.`,
    },
    {
      clef: 'almuten',
      etiquette: 'L’almuten',
      valeur: nomDe(figure.almuten.vainqueur.planete),
      detail: `Sur le degré ascendant, cette planète cumule ${figure.almuten.vainqueur.score} forces `
        + `(${figure.almuten.vainqueur.dignites.join(', ')}) et l’emporte sur toutes les autres. `
        + `De l’arabe <i>al-mubtazz</i>, « celui qui l’emporte ». C’est elle qui gouverne la figure `
        + `entière — pas le signe.`,
    },
    {
      clef: 'secte',
      etiquette: 'La secte',
      valeur: figure.deJour ? 'de jour' : 'de nuit',
      detail: figure.deJour
        ? `Le Soleil était au-dessus de la terre. Les seigneurs de triplicité diurnes gouvernent, `
          + `et le Soleil l’emporte sur la Lune comme témoin de la vie.`
        : `Le Soleil était sous la terre. Les seigneurs de triplicité nocturnes gouvernent, `
          + `et la Lune l’emporte sur le Soleil comme témoin de la vie.`,
    },
  ];
}

/** Le jugement en toutes lettres — chaque phrase renvoyant à sa règle. */
export function enPhrases(figure) {
  const p = [];
  const nom = avecArticle;
  const seigneur = figure.seigneurAscendantPlace;

  p.push({
    titre: 'La secte',
    texte: figure.deJour
      ? `Nativité de jour : le Soleil est en la ${rangHtml(figure.soleilEnMaison)} maison, au-dessus de la terre. Les seigneurs de triplicité diurnes gouvernent, et le Soleil l’emporte sur la Lune.`
      : `Nativité de nuit : le Soleil est en la ${rangHtml(figure.soleilEnMaison)} maison, sous la terre. Les seigneurs de triplicité nocturnes gouvernent, et la Lune l’emporte sur le Soleil.`,
    source: 'Alcabitius, dist. III — la secte du jour et de la nuit',
  });

  p.push({
    titre: 'L’ascendant',
    texte: `L’horoscopus — le degré qui monte — est à ${enSigne(figure.ascendant)}. `
      + `Son seigneur est ${nom(figure.seigneurAscendant)}, qui se trouve à ${enSigne(seigneur.longitude)}, `
      + `en la ${rangHtml(seigneur.maison)} maison`
      + (seigneur.etat.tenues.length ? `, ${seigneur.etat.tenues.join(' et ')}.`
        : seigneur.etat.perdues.length ? `, ${seigneur.etat.perdues.join(' et ')}.`
          : `, ${peregrinDe(figure.seigneurAscendant)} — sans dignité aucune en ce lieu.`),
    source: 'Alcabitius, dist. I — les domiciles ; dist. IV — l’état des planètes',
  });

  const a = figure.almuten;
  p.push({
    titre: 'L’almuten de l’ascendant',
    texte: `Sur ce degré, ${nom(a.vainqueur.planete)} l’emporte avec ${a.vainqueur.score} forces `
      + `(${a.vainqueur.dignites.join(', ')}). `
      + `Viennent ensuite ${a.classement.slice(1, 3).map((x) => `${nom(x.planete)} (${x.score})`).join(' et ')}. `
      + `C’est cette planète, non le signe, qui gouverne la figure.`,
    source: 'Dignités : Alcabitius, dist. I. Pondération : tradition latine (Bonatti)',
  });

  const dixieme = figure.maisonsHabitees[9];
  p.push({
    titre: 'La dignité — dixième maison',
    texte: `La pointe de la dixième maison, dite regnum, est à ${enSigne(dixieme.pointe)}, `
      + `dont le seigneur est ${nom(dixieme.seigneur)}. `
      + (dixieme.hotes.length
        ? `S’y tiennent : ${dixieme.hotes.map((h) => `${h.nom} à ${enSigne(h.longitude)}`).join(', ')}.`
        : `Aucune planète ne s’y tient : on juge alors par son seigneur seul.`),
    source: 'Alcabitius, dist. I — les maisons et leurs significations',
  });

  const fortune = figure.parts[0];
  p.push({
    titre: 'La part de Fortune',
    texte: `${enSigne(fortune.longitude)} — calculée ${fortune.formule}, `
      + `comme il convient ${figure.deJour ? 'de jour' : 'de nuit'} : la formule se renverse avec la secte. `
      + `Elle regarde le corps et l’avoir, non le bonheur.`,
    source: 'Alcabitius, dist. V — les parts universelles',
  });

  const serres = figure.regards.filter((r) => r.ecart < 3).slice(0, 4);
  if (serres.length) {
    p.push({
      titre: 'Les regards serrés',
      texte: serres.map((r) => `${nom(r.de)} ${r.aspect.glyphe} ${nom(r.a)} `
        + `(${r.aspect.nom}, ${r.ecart.toFixed(1)}°${r.partil ? ', par degré partil' : ''})`).join(' ; ') + '.',
      source: 'Alcabitius, dist. III — les aspects ; orbes d’après al-Bīrūnī',
    });
  }

  return p;
}

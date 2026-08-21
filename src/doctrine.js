// La doctrine : ce que disent les livres, et où c'est écrit.
//
// Règle de ce fichier : aucune donnée sans sa source. Chaque table porte un
// champ `source` qui renvoie à l'ouvrage, à la distinction et, quand elle
// existe, à l'édition en ligne. Si vous ne pouvez pas citer, n'ajoutez pas.
//
// Ouvrage de base : al-Qabīṣī (Alcabitius), Introductorius ad magisterium
// iudiciorum astrorum, traduit de l'arabe par Jean de Séville vers 1130.
// Édition critique : Ch. Burnett, K. Yamamoto, M. Yano, Al-Qabisi (Alcabitius),
// The Introduction to Astrology, Londres, The Warburg Institute, 2004.
// C'est le manuel universitaire du XIVe siècle : plus de deux cents
// manuscrits, commenté à Paris et à Bologne dans les années 1320-1330.

export const OUVRAGES = {
  alcabitius: {
    titre: 'Alcabitius, Introductorius ad magisterium iudiciorum astrorum',
    detail: 'éd. Burnett, Yamamoto & Yano, Warburg Institute, 2004 — l’imprimé de Venise, 1503, avec le commentaire de Jean de Saxe, est en ligne',
    lien: 'https://ptolemaeus.badw.de/works',
  },
  tetrabiblos: {
    titre: 'Ptolémée, Tetrabiblos (Quadripartitum)',
    detail: 'la référence théorique de toute la tradition ; catalogue des manuscrits latins chez Ptolemaeus Arabus et Latinus',
    lien: 'https://ptolemaeus.badw.de/works',
  },
  latine: {
    titre: 'Tradition latine (Guido Bonatti, Abraham ibn Ezra)',
    detail: 'la pondération chiffrée des dignités n’est pas dans Alcabitius : elle est l’usage des praticiens latins',
    lien: 'https://ptolemaeus.badw.de/astrobibl/start',
  },
};

// ─── Les seigneurs des signes ────────────────────────────────────────────────
// Alcabitius, dist. I : « De domibus planetarum ». Chaque planète tient deux
// signes, sauf les deux luminaires qui n'en tiennent qu'un.
export const DOMICILES = {
  source: 'Alcabitius, dist. I (les domiciles) ; Tetrabiblos, I, 17',
  table: ['mars', 'venus', 'mercure', 'lune', 'soleil', 'mercure',
    'venus', 'mars', 'jupiter', 'saturne', 'saturne', 'jupiter'],
};

// Alcabitius, dist. I : « De exaltationibus planetarum » (p. 5 de l'imprimé de 1503).
export const EXALTATIONS = {
  source: 'Alcabitius, dist. I (les exaltations)',
  table: {
    soleil: { signe: 0, degre: 19 }, lune: { signe: 1, degre: 3 },
    mercure: { signe: 5, degre: 15 }, venus: { signe: 11, degre: 27 },
    mars: { signe: 9, degre: 28 }, jupiter: { signe: 3, degre: 15 },
    saturne: { signe: 6, degre: 21 },
    teste: { signe: 2, degre: 3 }, queue: { signe: 8, degre: 3 },
  },
};

// Alcabitius, dist. I : « De triplicitatibus » (p. 5). Doctrine de Dorothéos :
// chaque triplicité a un seigneur de jour, un de nuit, et un participant.
export const TRIPLICITES = {
  source: 'Alcabitius, dist. I (les triplicités), d’après Dorothéos de Sidon',
  table: [
    { signes: [0, 4, 8], jour: 'soleil', nuit: 'jupiter', participant: 'saturne', element: 'feu' },
    { signes: [1, 5, 9], jour: 'venus', nuit: 'lune', participant: 'mars', element: 'terre' },
    { signes: [2, 6, 10], jour: 'saturne', nuit: 'mercure', participant: 'jupiter', element: 'air' },
    { signes: [3, 7, 11], jour: 'venus', nuit: 'mars', participant: 'lune', element: 'eau' },
  ],
};

// Les termes dits « égyptiens », les seuls que Ptolémée retienne et
// qu'Alcabitius transmette. Chaque entrée : [planète, degré de fin].
// Une notice de manuscrit du PAL en signale une copie sous le titre
// « Termini Tholomei » (Berlin, Hamilton 557, f. 14v).
export const TERMES = {
  source: 'Alcabitius, dist. I (les termes) ; Tetrabiblos, I, 20 — termes égyptiens',
  table: [
    [['jupiter', 6], ['venus', 12], ['mercure', 20], ['mars', 25], ['saturne', 30]],
    [['venus', 8], ['mercure', 14], ['jupiter', 22], ['saturne', 27], ['mars', 30]],
    [['mercure', 6], ['jupiter', 12], ['venus', 17], ['mars', 24], ['saturne', 30]],
    [['mars', 7], ['venus', 13], ['mercure', 19], ['jupiter', 26], ['saturne', 30]],
    [['jupiter', 6], ['venus', 11], ['saturne', 18], ['mercure', 24], ['mars', 30]],
    [['mercure', 7], ['venus', 17], ['jupiter', 21], ['mars', 28], ['saturne', 30]],
    [['saturne', 6], ['mercure', 14], ['jupiter', 21], ['venus', 28], ['mars', 30]],
    [['mars', 7], ['venus', 11], ['mercure', 19], ['jupiter', 24], ['saturne', 30]],
    [['jupiter', 12], ['venus', 17], ['mercure', 21], ['saturne', 26], ['mars', 30]],
    [['mercure', 7], ['jupiter', 14], ['venus', 22], ['saturne', 26], ['mars', 30]],
    [['mercure', 7], ['venus', 13], ['jupiter', 20], ['mars', 25], ['saturne', 30]],
    [['venus', 12], ['jupiter', 16], ['mercure', 19], ['mars', 28], ['saturne', 30]],
  ],
};

// Les faces : trente-six décans de dix degrés, parcourus dans l'ordre
// chaldéen à partir de Mars au premier degré du Bélier.
// Alcabitius, dist. I : « De faciebus signorum » (p. 37 de l'imprimé de 1503).
export const FACES = {
  source: 'Alcabitius, dist. I (les faces des signes)',
  ordre: ['mars', 'soleil', 'venus', 'mercure', 'lune', 'saturne', 'jupiter'],
};

// La pondération. ⚠️ Elle n'est pas dans Alcabitius, qui décrit les dignités
// sans les chiffrer : c'est l'usage des praticiens latins, et c'est ainsi
// qu'on désigne l'almuten — le « vainqueur » d'un degré.
export const POIDS = {
  source: 'Tradition latine (Bonatti, Ibn Ezra) — Alcabitius ne chiffre pas',
  domicile: 5, exaltation: 4, triplicite: 3, terme: 2, face: 1,
};

/** La coupure entre les grandes et les petites dignités.
 *
 *  Trois donnent le pouvoir de faire — le domicile, l'exaltation, la
 *  triplicité. Les deux dernières ne donnent qu'un appui : la tradition dit
 *  qu'un homme dans son terme est comme un homme chez un hôte, et un homme
 *  dans sa face comme un homme dans la rue de sa maison. Il y tient debout, il
 *  n'y commande rien. Compter la face pour une force est l'erreur ordinaire,
 *  et elle change tous les jugements de force. */
export const GRANDES_DIGNITES = ['en son domicile', 'en son exaltation', 'en sa triplicité'];
export const laGrandeDignite = (tenues = []) => tenues.filter((t) => GRANDES_DIGNITES.includes(t));

// ─── Les douze maisons ───────────────────────────────────────────────────────
// Alcabitius, dist. I : « De domibus et earum significationibus » (p. 9).
// Ce sont les douze questions qu'un prince achète. Ce ne sont pas douze
// types de caractère : la notion n'existe pas.
export const MAISONS = {
  source: 'Alcabitius, dist. I (les maisons et leurs significations)',
  table: [
    { latin: 'vita', titre: 'La vie', genitif: 'de la vie', detail: 'le corps, le commencement, la complexion' },
    { latin: 'substantia', titre: 'L’avoir', genitif: 'de l’avoir', detail: 'les biens meubles, ce qu’on gagne de sa main' },
    { latin: 'fratres', titre: 'Les frères', genitif: 'des frères', detail: 'la parenté, les courts voyages, les lettres' },
    { latin: 'pater', titre: 'Le père', genitif: 'du père', detail: 'la terre, l’héritage, les villes, la fin des choses' },
    { latin: 'filii', titre: 'Les enfants', genitif: 'des enfants', detail: 'les messagers, les dons, la joie' },
    { latin: 'infirmitas', titre: 'La maladie', genitif: 'de la maladie', detail: 'les serfs, les bêtes menues, le travail subi' },
    { latin: 'uxor', titre: 'Le mariage', genitif: 'du mariage', detail: 'les procès, les adversaires déclarés, les associés' },
    { latin: 'mors', titre: 'La mort', genitif: 'de la mort', detail: 'la peur, l’héritage du mort, ce qui est en souffrance' },
    { latin: 'itinera', titre: 'Les longs voyages', genitif: 'des longs voyages', detail: 'la religion, les songes, la science' },
    { latin: 'regnum', titre: 'La dignité', genitif: 'de la dignité', detail: 'le règne, le métier, la mère, ce que le monde voit' },
    { latin: 'boni daemonis', titre: 'Les amis', genitif: 'des amis', detail: 'l’espérance, la fortune, ce qu’on obtient du prince' },
    { latin: 'inimici', titre: 'Les ennemis cachés', genitif: 'des ennemis cachés', detail: 'la prison, la trahison, les grandes bêtes' },
  ],
};

// ─── La nature des signes ────────────────────────────────────────────────────
// Alcabitius, dist. I : « De qualitatibus signorum ». Un signe n'est pas un
// caractère d'homme : c'est une qualité de la matière qui s'y traite. Mobile,
// la chose commence vite et ne dure pas ; fixe, elle est lente à venir et
// lente à partir ; commune, elle est double et change en chemin.
export const NATURES_SIGNES = {
  source: 'Alcabitius, dist. I (les qualités des signes)',
  modes: [
    { nom: 'mobile', latin: 'tropicum', signes: [0, 3, 6, 9],
      glose: 'ce qui s’y traite commence vite et ne dure guère' },
    { nom: 'fixe', latin: 'fixum', signes: [1, 4, 7, 10],
      glose: 'ce qui s’y traite est lent à venir et lent à partir' },
    { nom: 'commun', latin: 'bicorporeum', signes: [2, 5, 8, 11],
      glose: 'ce qui s’y traite est double, et change en chemin' },
  ],
};

// Alcabitius, dist. IV : la force d'une planète tient d'abord au lieu qu'elle
// occupe. Angle, succédente, cadente — dans cet ordre décroissant.
export const FORCE_DES_LIEUX = {
  source: 'Alcabitius, dist. IV (la force des planètes selon les maisons)',
  table: {
    1: 'angle', 4: 'angle', 7: 'angle', 10: 'angle',
    2: 'succédente', 5: 'succédente', 8: 'succédente', 11: 'succédente',
    3: 'cadente', 6: 'cadente', 9: 'cadente', 12: 'cadente',
  },
  // « en un angle », mais « en une maison succédente » : l'article n'est pas le
  // même, et interpoler la clef brute donne « en maison angle ».
  enPlace: {
    angle: 'en un angle',
    succédente: 'en une maison succédente',
    cadente: 'en une maison cadente',
  },
  gloses: {
    angle: 'en un angle : la chose est manifeste, et elle vient promptement',
    succédente: 'en une maison succédente : la chose vient, mais après un temps',
    cadente: 'en une maison cadente : la chose est faible, différée, ou se fait mal voir',
  },
};

// ─── Les joies ───────────────────────────────────────────────────────────────
// Gaudia planetarum. Chaque planète a une maison où elle se plaît, et la
// tradition emploie pour le dire le mot de joie, sans métaphore : elle y fait
// ce qu'elle sait faire, et la matière du lieu est de sa propre nature.
//
// Ce n'est pas une dignité : la joie ne compte pour rien dans l'almuten, et
// une planète en sa joie peut être pérégrine, brûlée, mal logée. Elle dit
// seulement que l'astre est chez lui dans la matière — ce qui, pour un
// maléfique, ne veut pas dire qu'il ne nuit pas, mais que sa nuisance est à
// sa place et se contient. Saturne en douzième est un geôlier dans une
// prison : il y est utile, et personne ne l'invite à souper.
export const JOIES = {
  source: 'Firmicus Maternus, Mathesis, II, 19 ; Bonatti, Liber astronomiae, tr. III',
  regle: 'La joie n’ajoute aucune dignité et n’entre dans aucun compte. Elle dit que la '
    + 'planète est chez elle dans la matière de ce lieu, et qu’elle y agit selon sa nature '
    + 'sans y être contrariée.',
  table: { 1: 'mercure', 3: 'lune', 5: 'venus', 6: 'mars', 9: 'soleil', 11: 'jupiter', 12: 'saturne' },
  gloses: {
    mercure: 'Mercure se réjouit en la première maison, qui est celle du commencement et de '
      + 'l’esprit : c’est le lieu où la langue, le compte et l’écriture sont l’homme même',
    lune: 'la Lune se réjouit en la troisième, que les Anciens nommaient dea : le lieu des '
      + 'courts chemins, de la parenté et des lettres, et la Lune est de tous les astres le '
      + 'plus prompt à aller et venir',
    venus: 'Vénus se réjouit en la cinquième, bona fortuna : les enfants, les dons, les fêtes '
      + '— la matière du lieu est sa matière propre',
    mars: 'Mars se réjouit en la sixième, mala fortuna : le travail subi, la maladie, ce qu’on '
      + 'tranche. Un maléfique en un lieu maléfique est à son emploi, et il y nuit moins qu’ailleurs',
    soleil: 'le Soleil se réjouit en la neuvième, deus : la religion, la science, les songes — '
      + 'le lieu d’où l’on voit loin, et le Soleil est ce qui fait voir',
    jupiter: 'Jupiter se réjouit en la onzième, bonus daemon : les amis, l’espérance, ce qu’on '
      + 'obtient du prince. C’est la maison de la faveur, et Jupiter est la planète qui l’accorde',
    saturne: 'Saturne se réjouit en la douzième, malus daemon : la prison, la retraite, les '
      + 'ennemis qu’on ne voit pas. Il y est chez lui comme le geôlier dans sa geôle — sa '
      + 'nuisance y est à sa place, et donc bornée',
  },
};

/** Vrai si l'astre occupe la maison de sa joie. */
export const enSaJoie = (clef, maison) => JOIES.table[maison] === clef;

// ─── L'homme zodiacal ────────────────────────────────────────────────────────
// La mélothésie : chaque signe gouverne une partie du corps, de la tête aux
// pieds dans l'ordre du zodiaque. Ce n'est pas un ornement de calendrier :
// c'est la règle opératoire de la médecine. Aucun médecin formé ne saigne un
// membre quand la Lune parcourt le signe qui le gouverne.
export const MELOTHESIE = {
  source: 'Tetrabiblos, III, 12 ; usage universel des almanachs et des livres de saignée',
  regle: 'On ne taille ni ne saigne le membre dont la Lune occupe le signe. La règle est '
    + 'dans tous les calendriers, et c’est par elle que l’astrologie tient à la médecine.',
  table: [
    'la tête et le visage', 'le cou et la gorge', 'les épaules, les bras et les mains',
    'la poitrine, l’estomac et les poumons', 'le cœur et le dos', 'le ventre et les entrailles',
    'les reins et les lombes', 'les parties honteuses et la vessie', 'les hanches et les cuisses',
    'les genoux', 'les jambes et les chevilles', 'les pieds',
  ],
};

// ─── Les aspects ─────────────────────────────────────────────────────────────
// Alcabitius, dist. III : les regards que les planètes se portent. Il n'y a
// que cinq figures, et deux d'entre elles sont mauvaises par nature.
export const ASPECTS = {
  source: 'Alcabitius, dist. III (les aspects) ; Tetrabiblos, I, 13',
  table: [
    { nom: 'conjonction', angle: 0, glyphe: '☌', nature: 'selon les planètes' },
    { nom: 'sextil', angle: 60, glyphe: '⚹', nature: 'de demi-amitié' },
    { nom: 'quartil', angle: 90, glyphe: '□', nature: 'de demi-inimitié' },
    { nom: 'trin', angle: 120, glyphe: '△', nature: 'd’amitié parfaite' },
    { nom: 'opposition', angle: 180, glyphe: '☍', nature: 'd’inimitié parfaite' },
  ],
};

/** Les deux figures d'inimitié — le quartil et l'opposition — tirées de la
 *  table elle-même. On ne les nomme pas ailleurs : un jugement qui écrirait
 *  « quadrature » désignerait un aspect qui n'existe dans aucune table, et se
 *  tromperait en silence. */
export const ASPECTS_DURS = new Set(
  ASPECTS.table.filter((a) => a.nature.includes('inimitié')).map((a) => a.nom),
);

// L'orbe est propre à chaque planète : c'est la « moitié de son rayon de
// lumière », et deux planètes se voient quand leurs moitiés se touchent.
export const ORBES = {
  source: 'Al-Bīrūnī, Tafhīm ; usage repris par la tradition latine',
  table: {
    soleil: 15, lune: 12, mercure: 7, venus: 7, mars: 8, jupiter: 9, saturne: 9,
  },
};

// ─── Les parts ───────────────────────────────────────────────────────────────
// Alcabitius, dist. V : « in commemoratione partium universalium ».
// Une part n'est pas un astre : c'est une distance reportée depuis
// l'ascendant. Elle se renverse entre le jour et la nuit — et cette
// inversion est le seul endroit où la doctrine médiévale est unanime.
export const PARTS = {
  source: 'Alcabitius, dist. V (les parts universelles)',
  table: [
    {
      clef: 'fortune', nom: 'Part de Fortune', latin: 'pars fortune',
      detail: 'le corps, l’avoir, ce qui échoit',
      dejour: ['lune', 'soleil'], denuit: ['soleil', 'lune'],
    },
    {
      clef: 'esprit', nom: 'Part d’Esprit', latin: 'pars futurorum',
      detail: 'l’âme, le conseil, ce qu’on entreprend',
      dejour: ['soleil', 'lune'], denuit: ['lune', 'soleil'],
    },
    {
      clef: 'regne', nom: 'Part du Règne', latin: 'pars regni',
      detail: 'la dignité et ce qu’on tient du prince',
      dejour: ['mars', 'lune'], denuit: ['mars', 'lune'],
    },
    {
      clef: 'mariage', nom: 'Part du Mariage', latin: 'pars conjugii',
      detail: 'pour un homme, la femme ; pour une femme, le mari',
      // Pas de dejour / denuit ici, et c'est voulu : les porter identiques
      // laisserait croire que la part ne se renverse pas, alors qu'elle se
      // renverse sur autre chose que la secte. Le champ absent oblige tout
      // lecteur du code — et la table de la notice — à traiter le cas.
      //
      // La seule part de la table qui ne se renverse pas sur la secte, mais
      // sur le sexe du natif : de Saturne à Vénus pour un homme, de Vénus à
      // Saturne pour une femme. Les trois autres s'inversent entre le jour et
      // la nuit, celle-ci non — et c'est pourquoi la connaître demande une
      // donnée que le ciel ne fournit pas. La calculer sans la savoir
      // reviendrait à traiter tout le monde en homme, en silence.
      selonLeSexe: {
        source: 'Al-Bīrūnī, Tafhīm (les parts du mariage) ; Alcabitius, dist. V',
        homme: ['venus', 'saturne'],
        femme: ['saturne', 'venus'],
      },
    },
  ],
};

// ─── Ce que les planètes signifient dans le monde ────────────────────────────
// Alcabitius, dist. II : « De naturis planetarum et eorum significationibus ».
//
// C'est la table sans laquelle un jugement reste du jargon. Dire qu'une
// planète est pérégrine en dixième maison n'apprend rien à personne ; c'est
// ici qu'on apprend de quoi elle est le signe — quels hommes, quel métier,
// quels biens, quelle partie du corps, quels lieux. Un astrologien ne
// « lisait » pas une figure : il traduisait chaque position dans ces termes-là,
// et c'est pour cette traduction que le prince payait.
//
// ⚠️ Ces listes sont sublunaires et datées : elles disent le monde de 1380,
// avec ses états et ses métiers. C'est précisément ce qu'on leur demande.
export const SIGNIFICATIONS = {
  source: 'Alcabitius, dist. II (les natures des planètes et leurs significations) ; '
    + 'Tetrabiblos, III, 13 et IV, 4',
  table: {
    saturne: {
      qualite: 'froid et sec', humeur: 'la mélancolie, la bile noire',
      hommes: 'les vieillards, les pères, les morts, les serfs, les moines, les hommes de peine',
      metiers: 'le labour, la mine, la pierre, le cuir, tout ce qui se fait dans la terre '
        + 'et tout métier vil, dur et durable',
      biens: 'les terres, les bâtiments, les choses anciennes, ce qui se garde et ne se dépense pas',
      corps: 'les os, la rate, la dent, l’oreille droite ; les maux longs, froids et qui retiennent',
      lieux: 'les lieux obscurs, les puits, les caves, les prisons, les ruines, les cimetières',
    },
    jupiter: {
      qualite: 'chaud et humide', humeur: 'le sang',
      hommes: 'les juges, les prélats, les hommes de loi, les riches, les gens d’honneur',
      metiers: 'la loi, l’Église, la judicature, l’office honorable, le prêt et le change de haut vol',
      biens: 'les héritages, les bénéfices, les dons des grands, ce qui vient par la faveur et par le droit',
      corps: 'le foie, le sang, la semence, les côtés',
      lieux: 'les églises, les palais, les cours de justice, les lieux d’assemblée',
    },
    mars: {
      qualite: 'chaud et sec', humeur: 'la bile jaune, la colère',
      hommes: 'les hommes d’armes, les bouchers, les barbiers-chirurgiens, les forgerons, '
        + 'les larrons de grand chemin',
      metiers: 'tout ce qui se fait par le fer et par le feu — l’arme, la forge, la coupe, '
        + 'la chirurgie, la guerre',
      biens: 'le butin, la rançon, ce qui se prend et ne se donne pas',
      corps: 'la bile, les reins, les parties génitales ; les blessures, les fièvres aiguës, le sang répandu',
      lieux: 'les forges, les fours, les camps, les tueries, les lieux brûlés',
    },
    soleil: {
      qualite: 'chaud et sec', humeur: 'la vertu vitale',
      hommes: 'les rois, les princes, le père, les hommes en charge, ceux que l’on voit',
      metiers: 'l’office et la charge publique, le service auprès du prince, l’or et les choses claires',
      biens: 'ce qui vient de la charge et du nom, l’or, ce qui se tient de plus haut que soi',
      corps: 'le cœur, l’œil droit de l’homme, la chaleur naturelle',
      lieux: 'les cours, les palais, les places, les lieux découverts',
    },
    venus: {
      qualite: 'froide et humide', humeur: 'le flegme mêlé de sang',
      hommes: 'les femmes, les épouses, les jeunes gens, les gens de plaisance',
      metiers: 'l’ornement et la mesure — l’étoffe, la teinture, la broderie, la musique, '
        + 'la peinture, le parfum, le vin, tout ce qui se fait pour plaire et demande la justesse',
      biens: 'la dot, les dons, ce qui vient par les femmes, par l’alliance et par l’agrément',
      corps: 'les reins, la matrice, la gorge, la semence',
      lieux: 'les chambres, les jardins, les lieux de fête et de musique',
    },
    mercure: {
      qualite: 'convertible — il prend la nature de la planète qui le joint',
      humeur: 'variable, selon ce qui le reçoit',
      hommes: 'les clercs, les marchands, les notaires, les changeurs, les messagers, '
        + 'les écrivains, les maîtres d’école, et les larrons subtils',
      metiers: 'la plume, le compte, le négoce, la parole, la médecine, l’arithmétique, '
        + 'l’astrologie même — tout ce qui se fait par signes plutôt que par la main',
      biens: 'ce qui se gagne par l’esprit, par le change et par l’écrit',
      corps: 'la langue, les mains, la mémoire, l’entendement',
      lieux: 'les écoles, les boutiques, les marchés, les chancelleries',
    },
    lune: {
      qualite: 'froide et humide', humeur: 'le flegme',
      hommes: 'la mère, les femmes, le commun peuple, les nourrices, les mariniers, les voyageurs',
      metiers: 'ce qui va et vient — le port, l’eau, le grain, le charroi, le service du commun',
      biens: 'ce qui change de main souvent et ne demeure pas',
      corps: 'l’estomac, le cerveau, la poitrine, les humeurs, l’œil gauche de l’homme',
      lieux: 'les rivières, les ports, les moulins, la voie publique',
    },
  },
};

// ─── Les accidents d'une planète au regard du Soleil ─────────────────────────
// Alcabitius, dist. III : parmi la trentaine de « conditions » qu'il énumère
// — application, séparation, réception, translation de lumière, vacuité de
// course —, celles-ci tiennent au Soleil seul, et ce sont les plus lourdes.
// Une planète brûlée est réputée hors d'état d'agir pour son compte.
export const ETATS_SOLAIRES = {
  source: 'Alcabitius, dist. III (les conditions des planètes) ; al-Bīrūnī, Tafhīm §476',
  cazimi: 17 / 60, combustion: 8.5, rayons: 15,
  gloses: {
    cazimi: 'au cœur du Soleil (in corde solis), à moins de dix-sept minutes : '
      + 'loin d’être brûlée, la planète y est comme un homme assis auprès du roi — c’est le seul '
      + 'endroit où la proximité renforce',
    combuste: 'brûlée par le Soleil, à moins de huit degrés et demi : elle est réputée hors d’état '
      + 'd’agir pour son propre compte. Ce qu’elle signifie se fait, mais sous le nom d’un autre, '
      + 'et sans qu’on la voie',
    rayons: 'sous les rayons du Soleil, à moins de quinze degrés : affaiblie et peu visible, '
      + 'sans être détruite',
    libre: 'hors des rayons du Soleil, et libre d’agir pour son compte',
  },
  orientale: 'orientale — elle se lève avant le Soleil, et paraît au matin : '
    + 'ce qu’elle signifie vient tôt, et se montre',
  occidentale: 'occidentale — elle se couche après le Soleil, et paraît au soir : '
    + 'ce qu’elle signifie vient tard, et se tient en retrait',
};

// ─── L'application, la séparation, la réception, l'aversion ──────────────────
// Alcabitius, dist. III, encore. Ce sont les quatre conditions qui décident
// si un regard porte, et dans quel sens.
export const CONDITIONS = {
  source: 'Alcabitius, dist. III ; Sahl ibn Bishr, De interrogationibus ; '
    + 'Bonatti, Liber astronomiae, tr. III',
  application: 'la planète la plus rapide marche vers l’aspect : la chose est à venir, '
    + 'et elle se fera',
  separation: 'la planète la plus rapide s’éloigne de l’aspect : la chose est déjà faite, '
    + 'ou déjà passée',
  reception: 'la planète reçue se trouve dans le domicile ou l’exaltation de celle qui la '
    + 'regarde : celle-ci la loge, et lui prête sa force. Une planète pérégrine mais reçue '
    + 'n’est pas sans appui — elle emprunte',
  receptionMutuelle: 'les deux planètes se tiennent chacune dans le domicile de l’autre : '
    + 'elles ont échangé leurs maisons. C’est le lien le plus fort de toute la doctrine — '
    + 'mais s’il n’y a entre elles aucun aspect, l’échange est en règle et ne se voit jamais : '
    + 'le titre existe, il n’arrive pas',
  aversion: 'deux signes distants d’un, de cinq ou de sept signes ne se regardent d’aucun '
    + 'aspect : les planètes qui s’y tiennent sont dites en aversion — elles ne se voient pas, '
    + 'et ne peuvent rien l’une pour l’autre',
  vacua: 'la Lune ne joint plus aucune planète avant de sortir de son signe : elle est '
    + 'vacua cursu, vide de course, et rien ne viendra de la chose',
};

// ─── La lumière de la Lune ───────────────────────────────────────────────────
// Alcabitius, dist. III : une Lune qui croît en lumière augmente ce qu'elle
// touche ; une Lune qui décroît le diminue. C'est un des rares jugements que
// toute la tradition, grecque, arabe et latine, donne dans les mêmes termes.
export const LUMIERE = {
  source: 'Alcabitius, dist. III (la Lune croissante et décroissante)',
  croissante: 'croissante en lumière — elle augmente et fait croître ce qu’elle touche ; '
    + 'la tradition le compte parmi les meilleurs témoignages, et pour le corps il signifie '
    + 'ce qui se nourrit et se répare',
  decroissante: 'décroissante en lumière — elle diminue et fait décroître ce qu’elle touche ; '
    + 'pour le corps, ce qui s’use et se vide',
};

// ─── Le métier, l'avoir, la dignité ──────────────────────────────────────────
// Ptolémée, Tetrabiblos, livre IV. C'est le livre qui manquait à ce site :
// les trois premiers livres établissent la doctrine, le quatrième dit ce
// qu'on en fait — chapitre par chapitre, matière par matière. C'est le plan
// d'un judicium, et c'est aussi ce qui le rend utilisable.
export const MATIERES = {
  source: 'Ptolémée, Tetrabiblos, IV, 2 (l’avoir), IV, 3 (la dignité), IV, 4 (le métier)',
  avoir: {
    titre: 'L’avoir — d’où vient le bien, et s’il demeure',
    regle: 'On juge par la <b>part de Fortune</b> et par le seigneur du signe où elle tombe. '
      + 'Le lieu de la part dit par quelle voie le bien arrive ; l’état de son seigneur dit '
      + 's’il demeure. Seigneur dignifié et en angle : la fortune est grande et tenue. '
      + 'Seigneur pérégrin, cadent ou brûlé : le bien passe par les mains sans s’arrêter. '
      + 'On regarde en second le seigneur de la deuxième maison.',
    source: 'Tetrabiblos, IV, 2 ; Alcabitius, dist. V pour la part',
  },
  dignite: {
    titre: 'La dignité — ce que le monde voit, et ce qu’on tient du prince',
    regle: 'On juge par les deux luminaires et par leur escorte. Luminaires en angle et '
      + 'accompagnés de planètes dignifiées : la charge est publique et grande. Luminaires '
      + 'hors des angles et sans escorte : la vie demeure obscure, quelque bien qu’on ait. '
      + 'On regarde ensuite la dixième maison, son seigneur, et la part du Règne.',
    source: 'Tetrabiblos, IV, 3',
  },
  metier: {
    titre: 'Le métier — de quelle main on vit',
    regle: 'Le significateur du métier se prend de deux endroits : <b>la planète qui se lève '
      + 'immédiatement avant le Soleil</b> (orientale, faisant son lever héliaque) et <b>le '
      + 'seigneur du milieu du ciel</b>. On ne retient que Mercure, Vénus ou Mars — ce sont les '
      + 'trois planètes de l’action ; si aucune ne témoigne, le métier est sans distinction. '
      + 'Quand deux témoignent, on joint leurs natures.',
    combinaisons: {
      mercure: 'les clercs, les scribes, les notaires, les marchands, les changeurs, '
        + 'les maîtres d’école, les médecins, les astrologiens — ceux qui vivent de la plume, '
        + 'du compte et de la parole',
      venus: 'ceux qui vivent de l’ornement et de l’agrément — l’étoffe, la teinture, la '
        + 'broderie, la musique, la peinture, le parfum, le vin',
      mars: 'ceux qui vivent du fer et du feu — les armes, la forge, la boucherie, la '
        + 'chirurgie, le métier des armes',
      'mercure+venus': 'ceux qui joignent la parole et la mesure : Ptolémée les nomme '
        + 'musiciens, faiseurs d’instruments, poètes, teinturiers — ce qui demande à la fois '
        + 'la règle et l’oreille',
      'venus+mars': 'les teinturiers, les apothicaires, les orfèvres, ceux qui travaillent '
        + 'par le feu une matière précieuse',
      'mercure+mars': 'les chirurgiens, les sculpteurs, les armuriers, les notaires de procès, '
        + 'et aussi les faussaires — la main jointe au calcul',
      'mercure+venus+mars': 'les métiers où l’art, le calcul et le feu se rejoignent, '
        + 'et les hommes qui en changent',
    },
    modificateurs: 'Signe fixe : un seul métier, tenu toute la vie. Signe commun : plusieurs '
      + 'métiers, ou un métier double. Significateur en angle et dignifié : le métier est grand, '
      + 'public, et porte un nom. Significateur pérégrin, cadent ou brûlé : le métier s’exerce '
      + 'pour le compte d’un autre, sous le nom d’un autre, ou sans le profit qu’il vaut.',
    source: 'Tetrabiblos, IV, 4 — « de qualitate actionis »',
  },
};

// ─── Le genre des signes ─────────────────────────────────────────────────────
// Masculins et féminins alternent depuis le Bélier. La table ne sert presque
// à rien dans ce site — sauf au hyleg d'al-Qabīṣī, où elle décide si le Soleil
// couché en septième maison peut donner la vie ou non.
export const GENRES_SIGNES = {
  source: 'Alcabitius, dist. I ; Tetrabiblos, I, 12',
  regle: 'Le Bélier est masculin, le Taureau féminin, et ainsi de suite en alternant.',
  genre: (signe) => (signe % 2 === 0 ? 'masculin' : 'féminin'),
};

// ─── La durée de vie : les lieux d'où l'on peut la lancer ────────────────────
//
// Ce bloc ne sert pas à prédire une durée. Il sert à montrer que deux auteurs
// qu'on enseignait ensemble ne désignent pas le même point de départ, et donc
// pas la même planète pour donner les années. C'est le seul endroit du site où
// la doctrine est mise en contradiction avec elle-même, sur pièces.
export const HYLEG = {
  nom: 'Le hyleg',
  glose: 'De l’arabo-persan haylāj, « ce qui lâche » — le point d’où l’on fait '
    + 'partir la vie. Les Latins disent prorogator, celui qui proroge.',

  ptolemee: {
    auteur: 'Ptolémée',
    source: 'Tetrabiblos, III, 10 et 11 (trad. Robbins)',
    // « la douzième partie du zodiaque entourant l'horoscope, de 5° au-dessus
    // de l'horizon jusqu'aux 25° qui restent ; le sextil dextre à ces trente
    // degrés, dit maison du Bon Démon ; le quartil, le milieu du ciel ; le
    // trigone, dit maison du Dieu ; et l'opposé, l'Occident. »
    lieux: [10, 1, 11, 7, 9],
    preference: 'Le milieu du ciel d’abord, puis l’orient, puis la onzième, '
      + 'puis l’occident, puis la neuvième.',
    marge: 5,
    horsLieux: 'Rien sous la terre, hormis ce qui monte dans le signe ascendant '
      + 'même ; et rien en douzième, qui est cadente et dont les rayons se troublent '
      + 'dans les vapeurs de la terre.',
    // Les cinq modes de domination de Ptolémée ne sont PAS les cinq dignités
    // arabes : la face n'y figure pas, et le regard y figure. C'est une
    // divergence de fond, et elle change qui l'emporte.
    dominations: ['triplicité', 'domicile', 'exaltation', 'terme', 'regard'],
    seuil: 3,
  },

  alcabitius: {
    auteur: 'Al-Qabīṣī (Alcabitius)',
    source: 'Introduction à l’astrologie, IV, 4 (trad. Burnett, Yamamoto et Yano)',
    // Al-Qabīṣī n'a pas les cinq lieux de Ptolémée : il a des lieux propres à
    // chaque luminaire, et le genre du signe y entre. Le Soleil peut donner la
    // vie depuis la huitième maison, que Ptolémée exclut absolument.
    soleilDeJour: {
      partout: { maisons: [10, 11], avantAscendant: true },
      siMasculin: { maisons: [7, 8, 9] },
    },
    soleilDeNuit: {
      partout: { maisons: [4, 5], avantDescendant: true },
      siMasculin: { maisons: [1, 2] },
    },
    lune: {
      partout: { maisons: [1, 2, 3, 7, 8] },
      siFeminin: { maisons: [10, 11, 4, 5], avantAscendant: true },
    },
    marge: 5,
    souslesRayons: 'Quand la Lune est en ces lieux mais sous les rayons, elle ne '
      + 'convient pas au hyleg.',
    // La condition qui manque tout à fait chez Ptolémée, et qui peut faire
    // qu'une figure n'ait aucun hyleg du tout.
    regardExige: 'Chacun de ces lieux ne convient au hyleg que si l’un des seigneurs '
      + 'des cinq parts le regarde — seigneur du domicile, de l’exaltation, du terme, '
      + 'de la triplicité ou de la face. Si aucun ne le regarde, le lieu ne convient pas.',
    apresLesLuminaires: 'Quand les deux luminaires ne conviennent pas, on regarde le '
      + 'degré de la syzygie qui a précédé : s’il est en un angle ou en une succédente, '
      + 'il convient. S’il est cadent, on regarde la part de Fortune, à la même condition. '
      + 'Si elle est cadente aussi, on prend le degré de l’ascendant, et le hyleg lui revient.',
  },
};

export const ALCOCODEN = {
  nom: 'L’alcocoden',
  glose: 'De l’arabe al-kadhkhudāh, « le maître de maison » — le donneur d’années. '
    + 'Les auteurs le disent le mari, dont le hyleg est la femme : elle porte la vie, '
    + 'il en fixe la mesure.',
  source: 'Al-Qabīṣī, IV, 5 (74-78) ; Dorothée de Sidon, Carmen, III',
  regle: 'On prend les seigneurs des cinq parts au degré du hyleg, et celui qui y a le '
    + 'plus de commandement et qui regarde le hyleg est l’alcocoden. S’il ne le regarde '
    + 'pas, on descend d’un rang, jusqu’au dernier. Si aucun ne le regarde, le hyleg est '
    + 'incomplet, et il faut en chercher un autre.',
  // Deux ordres, et c'est la deuxième fourche : le rang décide qui l'emporte.
  ordres: [
    {
      auteur: 'Al-Qabīṣī (« certains astrologues »)',
      rang: ['domicile', 'exaltation', 'terme', 'triplicité', 'face'],
    },
    {
      auteur: 'Dorothée de Sidon',
      rang: ['terme', 'domicile', 'exaltation', 'triplicité', 'face'],
      note: 'Al-Qabīṣī le dit lui-même : « Dorothée a mis le seigneur du terme '
        + 'avant le seigneur du domicile. »',
    },
  ],
  // On s'arrête là, et le refus est doctrinal, non technique.
  pasDeNombre: 'Les années majeures, moyennes et mineures de chaque planète sont dans '
    + 'les livres, et l’on saurait les additionner. On ne le fait pas : le choix entre '
    + 'majeures, moyennes et mineures dépend de l’état de l’alcocoden, puis l’on ajoute '
    + 'et l’on retranche selon les regards des bénéfiques et des maléfiques — et c’est '
    + 'là que la règle cesse d’être une règle pour devenir la main de l’astrologien. '
    + 'Le désaccord sur le hyleg suffit à faire voir ce qu’il faut voir.',
};

// ─── Ce que ce site ne calcule pas, et pourquoi ──────────────────────────────
export const RESERVES = [
  {
    titre: 'La durée de vie (hyleg et alcocoden)',
    texte: 'C’est la pièce la plus chère d’une nativité princière, et le site en calcule tout — sauf le nombre. Ptolémée et al-Qabīṣī ne désignent pas le hyleg de la même façon : leurs deux marches sont conduites côte à côte sur votre figure, et l’on voit où elles se séparent. Elles nomment souvent deux planètes différentes pour donner les années. Le chiffre, lui, dépendrait encore de l’état de cette planète, puis des regards qui ajoutent et retranchent — et c’est là que la règle cesse d’être une règle. Le désaccord est rendu ; le nombre ne l’est pas, parce qu’il aurait dit quel livre était ouvert et non l’âge du natif.',
  },
  {
    titre: 'Le jugement de caractère',
    texte: 'Il n’existe pas. Personne, en 1380, n’est « un Bélier ». L’astrologie savante travaille sur l’ascendant, les maisons et les seigneurs planétaires — jamais sur douze types d’hommes. Le signe solaire comme caractère est une invention du XXe siècle.',
  },
  {
    titre: 'Le ciel des tables',
    texte: 'Ce site calcule le ciel réel. Un astrologien de 1380 calculait avec les Tables alphonsines, dont les valeurs s’en écartent — la conjonction qui a expliqué la Peste à l’Europe entière est datée de quatre jours trop tôt. La seconde colonne, celle des tables, reste à écrire : c’est le vrai travail, et les données sont dans DISHAS.',
  },
];

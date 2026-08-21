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
  gloses: {
    angle: 'en un angle : la chose est manifeste, et elle vient promptement',
    succédente: 'en une maison succédente : la chose vient, mais après un temps',
    cadente: 'en une maison cadente : la chose est faible, différée, ou se fait mal voir',
  },
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
      dejour: ['venus', 'saturne'], denuit: ['venus', 'saturne'],
    },
  ],
};

// ─── Ce que ce site ne calcule pas, et pourquoi ──────────────────────────────
export const RESERVES = [
  {
    titre: 'La durée de vie (hyleg et alcocoden)',
    texte: 'C’est la pièce la plus chère d’une nativité princière, et la doctrine n’est pas fixée : Ptolémée, Alcabitius et Bonatti ne désignent pas le hyleg de la même façon, et l’alcocoden se compte en années majeures, moyennes ou mineures selon l’état de la planète. Un chiffre unique serait un faux. La règle est donnée dans la Méthode ; le nombre ne l’est pas.',
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

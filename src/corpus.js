// Le corpus : des nativités réelles, tirées de manuscrits réels.
//
// Les cinq premières viennent d'un seul cahier de trois feuillets, ajouté à
// un manuscrit qui appartint à Charles V et qui se trouve aujourd'hui à
// Oxford, St John's College, MS 164. Le roi y avait fait relier le traité de
// la sphère d'Oresme, deux traités de Pèlerin de Prusse écrits pour lui quand
// il était dauphin, et l'Introductorius d'Alcabitius en français. Puis on y a
// joint les carrés de sa naissance et de celles de ses quatre enfants.
//
// Emmanuel Poulle, qui les a étudiés, y voit « une sorte de livret familial,
// constitué par un père de famille soucieux de conserver, facilement
// accessibles, les données astronomiques qui permettront au médecin, en cas
// de maladie, de pronostiquer son évolution, d'apprécier les risques d'une
// issue fatale ou simplement de décider de l'opportunité d'une médication ».
//
// Ce n'est donc pas un recueil de bonne aventure. C'est un carnet de santé.
//
// Chaque légende latine est reproduite telle que Poulle la publie (1969,
// p. 63-77 et notes), d'après L. Delisle, Recherches sur la librairie de
// Charles V, t. I, Paris, 1907, p. 268-269, et R. Delachenal.

const PARIS = { lieu: 'Paris', latitude: 48.8566, longitude: 2.3522 };
const ORTHEZ = { lieu: 'Orthez, château de Moncade', latitude: 43.4906, longitude: -0.7728 };

const SOURCE_OXFORD = {
  cote: 'Oxford, St John’s College, MS 164, fol. 158v°-160v°',
  note: 'Le catalogue d’Oxford folie ces carrés 151v°-153v° ; Poulle donne 158v°-160v°.',
  edition: 'E. Poulle, « Horoscopes princiers des XIVe et XVe siècles », Bulletin de la Société nationale des Antiquaires de France, 1969 (paru 1971), p. 63-77',
  lien: 'https://www.persee.fr/doc/bsnaf_0081-1181_1971_num_1969_1_2163',
  catalogue: 'https://marco.ox.ac.uk/ark:29072/a8mg74qj792w',
};

export const NATIVITES = [
  {
    clef: 'charles-v',
    nom: 'Charles V, roi de France',
    sousTitre: 'le roy astrologien',
    ...PARIS,
    annee: 1338, mois: 1, jour: 21, heure: 5, minute: 36, julien: true,
    latin: 'Figura nativitatis serenissimi regis Francorum Karoli, anno Domini 1338, '
      + 'post meridiem 20e diei januarii, hora 17. minuta 36., diebus equatis, in nocte '
      + 'sequente diem martis, que fuit nox saturni, hora 10a artificiali noctis que fuit hora martis.',
    traduction: 'Figure de la nativité du très sérénissime roi des Francs Charles, l’an du '
      + 'Seigneur 1338, dix-sept heures trente-six minutes après le midi du 20 janvier, jours '
      + 'équés, dans la nuit qui suit le mardi, qui fut nuit de Saturne, à la dixième heure '
      + 'inégale de nuit, qui fut heure de Mars.',
    verifier: { nuit: 'saturne', rang: 10, deJour: false, heure: 'mars' },
    ecart: {
      titre: 'Le seul carré de la famille qui ne se recoupe pas',
      texte: 'Les quatre enfants sont exacts au contrôle : nuit planétaire, rang de l’heure '
        + 'inégale et seigneur de l’heure tombent juste. Le roi, non. Cette nuit-là à Paris, le '
        + 'soleil s’est couché à 16 h 52 et se lèvera à 7 h 36 : la nuit dure 14 h 44, l’heure '
        + 'inégale de nuit vaut 73 minutes, et la dixième heure court de 3 h 55 à 5 h 09. '
        + 'L’heure annoncée, 5 h 36, tombe dans la onzième — de vingt-sept minutes si on la lit '
        + 'en temps moyen, et de quarante-deux si on la lit en temps vrai, car l’équation du '
        + 'temps vaut −14,6 minutes ce jour-là et joue contre. Le cadran solaire n’excuse donc '
        + 'rien : il aggrave. Emmanuel Poulle bute sur la même chose sans la nommer : il situe '
        + 'la dixième heure « environ, à la fin de janvier, entre 4 heures et 5 heures du '
        + 'matin ».',
      hypothese: 'Une explication tient à la règle de l’animodar. La précision à la minute '
        + 'n’est jamais celle d’une horloge : l’astrologien part de l’heure approximative que '
        + 'donnent les témoins, puis la rectifie par le calcul jusqu’à ce que la figure tienne. '
        + 'Les carrés des enfants ont été dressés sur des relevés frais. Celui du roi a été '
        + 'calculé trente-cinq ans après sa naissance, sur un souvenir. C’est le seul des cinq '
        + 'qui n’avait pas de témoin sous la main — et c’est le seul qui dérive.',
    },
    source: SOURCE_OXFORD,
    apres: 'Régent à dix-huit ans pendant la captivité de son père, roi en 1364. Il fait venir '
      + 'de Bologne l’astrologue Thomas de Pizan, fonde en 1371 au collège de maître Gervais '
      + 'deux bourses de mathématiciens, et fait traduire en français les traités d’astrologie '
      + 'pour les lire lui-même. Christine de Pizan l’appellera « roy astrologien ». Il meurt le '
      + '16 septembre 1380.',
  },
  {
    clef: 'charles-vi',
    nom: 'Charles VI',
    sousTitre: 'le dauphin — le roi fol',
    ...PARIS,
    annee: 1368, mois: 12, jour: 3, heure: 3, minute: 48, julien: true,
    latin: 'Figura nativitatis serenissimi principis Karoli Delfini Vienne, filii '
      + 'illustrissimi regis Francorum Karoli, anno Domini 1368., post meridiem 2e diei '
      + 'decembris, hora 15. minuta 48., in nocte sequente diem sabbati, que fuit nox '
      + 'mercurii, hora 9. noctis, hora lune.',
    traduction: 'Figure de la nativité du très sérénissime prince Charles, dauphin de '
      + 'Viennois, fils du très illustre roi des Francs Charles, l’an du Seigneur 1368, '
      + 'quinze heures quarante-huit minutes après le midi du 2 décembre, dans la nuit qui '
      + 'suit le samedi, qui fut nuit de Mercure, à la neuvième heure de nuit, heure de la Lune.',
    verifier: { nuit: 'mercure', rang: 9, deJour: false, heure: 'lune' },
    source: SOURCE_OXFORD,
    apres: 'Roi à onze ans. En août 1392, en forêt du Mans, il tue quatre hommes de sa suite '
      + 'et sombre dans une folie qui durera trente ans, par accès. En janvier 1393, au bal '
      + 'des Ardents, quatre danseurs déguisés en sauvages brûlent vifs autour de lui ; il est '
      + 'sauvé par la duchesse de Berry, qui le cache sous sa robe. Il meurt en 1422, ayant '
      + 'déshérité son fils.',
  },
  {
    clef: 'louis-orleans',
    nom: 'Louis, duc d’Orléans',
    sousTitre: 'assassiné, et la mort écrite sur son propre carré',
    ...PARIS,
    annee: 1372, mois: 3, jour: 12, heure: 1, minute: 8, julien: true,
    latin: 'Figura nativitatis serenissimi principis Ludovici comitis de Valoys, anno Domini '
      + '1372., 12. martii que fuit dies veneris, post meridiem 11. diei horis 13 minutis 8, '
      + 'que fuit dies jovis, in nocte sequente, que fuit nox lune, hora 8. noctis artificiali, '
      + 'que fuit hora lune, secundi filii illustrissimi regis Francorum Karoli.',
    traduction: 'Figure de la nativité du très sérénissime prince Louis, comte de Valois, '
      + 'l’an du Seigneur 1372, le 12 mars qui fut un vendredi, treize heures huit minutes '
      + 'après le midi du 11, qui fut un jeudi, dans la nuit suivante, qui fut nuit de la Lune, '
      + 'à la huitième heure inégale de nuit, qui fut heure de la Lune, second fils du très '
      + 'illustre roi des Francs Charles.',
    verifier: { nuit: 'lune', rang: 8, deJour: false, heure: 'lune' },
    source: SOURCE_OXFORD,
    apres: 'Frère de Charles VI et maître du royaume pendant la folie du roi. Le 23 novembre '
      + '1407, rue Vieille-du-Temple, il est assassiné par les hommes de Jean sans Peur. '
      + 'Trente-cinq ans plus tôt, son père avait fait dresser le carré de sa naissance ; '
      + 'un autre astrologue, en 1407-1408, dresse celui de son trente-cinquième anniversaire '
      + 'et écrit dans la marge ce qui suit.',
    annotation: {
      latin: 'Dominus iste, anno isto, post meridiem 23. diei novembris, ignominose '
        + 'interfectus est, absciso brachio, capite diviso et expanso cerebro, circa horam '
        + '8am, juxta portam Barbete, redeundo de domo regine.',
      traduction: 'Ce seigneur, cette année-là, après le midi du 23 novembre, fut '
        + 'ignominieusement tué, le bras tranché, la tête fendue et la cervelle répandue, '
        + 'vers la huitième heure, près de la porte Barbette, comme il revenait de l’hôtel '
        + 'de la reine.',
      cote: 'Paris, BnF, lat. 7443, fol. 61 — recueil de Simon de Boesmare',
      commentaire: 'L’astrologue n’avait rien prédit. Il a écrit le meurtre sur le carré '
        + 'de l’anniversaire, après coup, avec une indignation qu’on entend encore.',
    },
  },
  {
    clef: 'marie',
    nom: 'Marie de France',
    sousTitre: 'morte à six ans',
    ...PARIS,
    annee: 1371, mois: 2, jour: 27, heure: 2, minute: 51, julien: true,
    latin: 'Figura nativitatis serenissime domine Marie de Francia, filie illustrissimi regis '
      + 'Francorum Karoli, post mediam noctem precedentem horis 2 minutis 51, et hoc fuit post '
      + 'meridiem 26. diei februarii, hora 14. minuta 51., in nocte precedente diem jovis 27., '
      + 'que fuit nox solis, hora 9. noctis artificiali, que fuit hora veneris, anno Domini 1371.',
    traduction: 'Figure de la nativité de la très sérénissime dame Marie de France, fille du '
      + 'très illustre roi des Francs Charles, deux heures cinquante et une minutes après le '
      + 'milieu de la nuit précédente, et ce fut quatorze heures cinquante et une minutes après '
      + 'le midi du 26 février, dans la nuit précédant le jeudi 27, qui fut nuit du Soleil, à la '
      + 'neuvième heure inégale de nuit, qui fut heure de Vénus, l’an du Seigneur 1371.',
    verifier: { nuit: 'soleil', rang: 9, deJour: false, heure: 'venus' },
    source: SOURCE_OXFORD,
    apres: 'Elle meurt en juin 1377, à six ans. C’est sa mort qui permet de dater le cahier : '
      + 'on n’aurait pas fait calculer l’horoscope d’un enfant déjà mort, et le sien y est.',
  },
  {
    clef: 'isabelle',
    nom: 'Isabelle de France',
    sousTitre: 'morte à quatre ans',
    ...PARIS,
    annee: 1373, mois: 7, jour: 23, heure: 15, minute: 30, julien: true,
    latin: 'Figura nativitatis serenissime domine Ysabelle, filie illustrissimi regis Francorum '
      + 'Karoli, anno Domini 1373., die 23a jullii, die sabbati, post meridiem horis 3 minutis '
      + '30, hora 9a artificiali, que fuit hora jovis.',
    traduction: 'Figure de la nativité de la très sérénissime dame Isabelle, fille du très '
      + 'illustre roi des Francs Charles, l’an du Seigneur 1373, le 23 juillet, un samedi, '
      + 'trois heures trente minutes après midi, à la neuvième heure inégale, qui fut heure '
      + 'de Jupiter.',
    verifier: { nuit: null, rang: 9, deJour: true, heure: 'jupiter' },
    source: SOURCE_OXFORD,
    apres: 'Elle meurt au début de 1378, à quatre ans. Des quatre enfants du cahier, deux '
      + 'sont morts en bas âge dans les cinq ans, un a été assassiné, un est devenu fou.',
  },
  {
    clef: 'febus',
    nom: 'Gaston Fébus, comte de Foix',
    sousTitre: 'la nativité impossible',
    ...ORTHEZ,
    annee: 1331, mois: 4, jour: 30, heure: null, minute: null, julien: true,
    heureInconnue: true,
    latin: null,
    apres: 'La date est sûre : le 30 avril 1331, probablement au château de Moncade. '
      + 'L’heure n’est donnée par aucune source. Or c’est l’heure qui fait la figure : ce '
      + 'jour-là, à Orthez, l’ascendant parcourt les douze signes en vingt-quatre heures. Il '
      + 'n’y a pas une nativité de Fébus, il y en a douze. Le prince qui s’est tout donné — '
      + 'un nom, un dieu, une monnaie, une loi, une œuvre — est le seul de cette page dont on '
      + 'ne puisse rien tirer, faute d’un chiffre que personne n’a noté.',
    source: {
      cote: 'aucune',
      edition: 'Sur la date : P. Tucoo-Chala, Gaston Fébus et la vicomté de Béarn, 1959',
    },
  },
];

/** Un événement, non une naissance : le carré du malheur collectif. */
export const CONJONCTION_1345 = {
  clef: 'conjonction-1345',
  nom: 'La conjonction de 1345',
  sousTitre: 'la cause première de la Peste — fausse de quatre jours',
  ...PARIS,
  annee: 1345, mois: 3, jour: 20, heure: 13, minute: 0, julien: true,
  latin: 'Dicimus quod causa remota et prima huius pestilentie fuit et est aliqua constellatio '
    + 'celestis…',
  citation: {
    texte: 'Nous disons que la cause lointaine et première de cette pestilence fut et est la '
      + 'configuration du ciel. En 1345, une heure après midi le 20 mars, il y eut une grande '
      + 'conjonction de trois planètes en Verseau. Cette conjonction, avec d’autres conjonctions '
      + 'et éclipses antérieures, en causant une corruption mortelle de l’air autour de nous, '
      + 'signifie mortalité et famine.',
    origine: 'Faculté de médecine de Paris, Compendium de epidemia, rapport à Philippe VI, '
      + 'octobre 1348',
    traduction: 'traduit de l’anglais de R. Horrox, The Black Death, Manchester University '
      + 'Press, 1994 — le latin est chez L. A. J. Michon, Documents inédits sur la Grande Peste '
      + 'de 1348, Paris, 1860',
  },
  verification: {
    reelle: { annee: 1345, mois: 3, jour: 24, julien: true },
    texte: 'Le 20 mars 1345 à treize heures, les trois planètes sont bien en Verseau, et '
      + 'Jupiter n’est qu’à vingt-quatre minutes d’arc de Saturne. Mais la conjonction exacte '
      + 'tombe quatre jours plus tard, le 24 mars. Les maîtres de Paris n’ont pas regardé le '
      + 'ciel : ils ont lu les Tables alphonsines. L’Europe savante a expliqué la mort du tiers '
      + 'de sa population par une date qui n’a jamais eu lieu — non par ignorance, par méthode. '
      + 'Une conjonction ne s’observe pas, elle se calcule.',
  },
};

/** Ce qu'on ne peut pas dresser ici, mais qu'il faut connaître. */
export const AUTRES_PIECES = [
  {
    titre: 'Le carré d’Iskandar Sultan, petit-fils de Tamerlan',
    texte: 'Né le 25 avril 1384, sa nativité fut calculée et enluminée en 1411 à Chiraz par '
      + 'l’astronome de cour Maḥmūd ibn Yaḥyā ibn al-Ḥasan al-Kāshī. C’est le plus bel '
      + 'horoscope conservé au monde : le ciel y est peint à l’or, avec des oiseaux dans les '
      + 'marges. Les astres lui promettaient une vie longue et prospère, et Mars ses victoires. '
      + 'Il régna cinq ans, se révolta contre son suzerain et mourut en 1415.',
    cote: 'Londres, Wellcome Collection, MS Persian 474',
    lien: 'https://wellcomecollection.org/works/ua87equq',
  },
  {
    titre: 'La nativité d’Henri VI, et ce qu’elle a coûté',
    texte: 'En 1441, deux savants — Roger Bolingbroke, clerc d’Oxford, et Thomas Southwell, '
      + 'médecin — dressent pour Éléonore Cobham, duchesse de Gloucester, la figure du roi '
      + 'Henri VI, et concluent qu’il souffrira d’une maladie mortelle en juillet ou août. Le '
      + 'Conseil consulte d’autres astrologues, qui ne trouvent rien, puis remonte à la source. '
      + 'Southwell meurt à la Tour, Bolingbroke est pendu, éventré et écartelé à Tyburn le '
      + '18 novembre 1441, Marjory Jourdemayne est brûlée, et la duchesse fait pénitence '
      + 'publique avant la prison à vie. Le roi, lui, perdit la raison — en 1453.',
    cote: 'Paris, BnF, lat. 7443 conserve un carré d’Henri VI ; sur le procès, voir '
      + 'S. Page, « Stars, demons and the body in fifteenth-century England », 2010',
    lien: 'https://pubmed.ncbi.nlm.nih.gov/20513622/',
  },
  {
    titre: 'La prédiction de Jeanne d’Arc, qui n’en était pas une',
    texte: 'Simon de Phares laisse entendre qu’un astrologue, Roland l’Escripvain, aurait '
      + 'donné « l’élection » qui amena la Pucelle. Emmanuel Poulle a montré que les positions '
      + 'citées — ascendant au 16e degré de la Balance, l’étoile Épi à l’ascendant, Vénus, '
      + 'Mercure et le Soleil au milieu du ciel — sont exactement celles du sacre de Charles VII, '
      + 'le 17 juillet 1429. Le calcul est postérieur à l’événement. C’est le cas d’école : '
      + 'presque toutes les prédictions vérifiées du Moyen Âge ont été écrites après.',
    cote: 'Poulle, art. cité, p. 74 ; Simon de Phares, Recueil, éd. Wickersheimer, p. 251-252',
    lien: 'https://www.persee.fr/doc/bsnaf_0081-1181_1971_num_1969_1_2163',
  },
];

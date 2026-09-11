// Le dossier — tout ce qu'il faut donner à un modèle de langue pour qu'il
// rédige une lecture sans rien inventer.
//
// Le danger, en branchant un LLM sur de l'astrologie, est qu'il produise de
// l'horoscope de magazine : il connaît mille fois mieux le Bélier caractériel
// du XXe siècle qu'Alcabitius. On le tient donc court. La figure est calculée
// ici, les règles lui sont fournies ici avec leur source, et ce qu'il n'a pas
// le droit de dire lui est dit ici. Il n'apporte que la prose.

import { SIGNES, PLANETES, GENRES, enSigne, signeDe, mod360, dateCivile } from './ciel.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS, RESERVES, NATURES_SIGNES, FORCE_DES_LIEUX,
  SIGNIFICATIONS, ETATS_SOLAIRES, CONDITIONS, LUMIERE, MATIERES, MELOTHESIE, JOIES,
} from './doctrine.js';
import { nomDe, seigneurDuSigne, enDegresMinutes, peregrinDe, rangTexte } from './jugement.js';
import { CONVENTIONS, enHeures, enDecalage } from './temps.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));

// ─── Le ton et la consigne ───────────────────────────────────────────────────

const SOCLE_HAUT = `Tu écris pour quelqu'un qui lit aujourd'hui : français simple et direct, sans
costume d'époque. Tu n'es pas un astrologue de 1380 — tu traduis un calcul médiéval, et tu le
fais avec plaisir : c'est une belle pièce, et cela doit s'entendre.

Tout ce que tu dis se lit dans le dossier ci-dessous. Tu n'ajoutes aucun nombre, aucune règle,
aucune donnée qui ne s'y trouve. Chaque phrase nomme un astre du dossier et dit ce qu'il
gouverne dans le monde réel — un métier, un revenu, un corps, une relation, une démarche. Une
phrase sans astre ne dit rien : supprime-la.

LE TON — le caractère des planètes, et la joie de le dire

Tu ne récites pas une fiche : tu racontes ce que les astres font. Dis le caractère de chaque
planète et ce qu'elle produit dans une vie, et que le plaisir se voie. Voici le ton, sur un
ciel qui n'est pas le tien — c'est la nativité d'une ville, non d'un homme : garde le ton, pas
le sujet.

« Mars est dans sa propre maison, le Scorpion : la ville est à celui qui fait la guerre, et
c'est de lui qu'elle tient son nom. Mais Saturne l'y rejoint, et Saturne est froid et lent :
il retient l'élan de Mars, et de ce mélange naît un peuple qui se bat sans se hâter. Vénus y
ajoute la douceur, Mercure la raison. Et Jupiter, dans sa propre maison, les regarde de son
trine : la force est tenue, et elle est approuvée. »

Rien là que le dossier ne donne, et pourtant tout y est du monde : un caractère, une manière de
faire. Ne l'explique pas, ne le commente pas — fais-le.

CINQ RÈGLES

1. Chaque phrase croise deux données, jamais une seule : « dignifié mais cadent » ; « reçu par
   la planète qui le brûle » ; « le maître de la maison et son hôte sont la même main ».
2. Chaque matière se raconte en trois temps : ce qui est promis, ce qui se retourne, l'image.
3. Le mouvement vient du temps — l'âge, la révolution, la profection.
4. Dis plusieurs fils à la fois : on gagne d'un côté ce qu'on perd de l'autre.
5. Prends plaisir à ce que tu trouves. Une joie, une dignité, une réception sont de bonnes
   nouvelles : dis-les comme telles.

Pas de flatterie, pas de généralités : si une phrase pouvait s'écrire pour n'importe qui, elle
ne sert à rien non plus. Si tu titres, mets les titres en Markdown (## ), courts.

LA TABLE EST UN MAGASIN, PAS UNE PAGE

La table des significations te dit de quoi chaque planète est le signe : les hommes, les
métiers, les biens, le corps, les lieux. Tu n'en récites jamais la liste. Pour chaque astre, tu
prends une chose — celle qui compte dans cette figure — et tu laisses le reste. Un astre dont
tu n'as rien à dire ne se mentionne pas.

Aucun mot de métier sans sa traduction immédiate. Le dossier écrit « partil », « cadente »,
« orientale », « combustion » : ce sont des étiquettes pour toi, pas pour ton lecteur. Écris ce
qu'elles veulent dire — « à trente-deux minutes du carré exact », « faible et différée », « elle
se lève avant le Soleil » — ou n'écris rien.

§PLAN§`;

// ─── Le plan propre à chaque genre ───────────────────────────────────────────
//
// Les trois genres ne se jugent pas de la même façon, et les confondre est
// l'erreur que les traités reprochent le plus. La nativité dit ce qu'un homme
// est et de quoi il vit : elle se juge une fois, et le métier s'y décide pour
// toute la vie. La révolution ne rejuge rien — elle dit ce qui, cette
// année-ci, est en jeu de ce que la nativité avait promis. L'interrogation
// ignore la nativité : elle répond par oui ou par non à une seule question,
// sur la figure de l'instant où on l'a posée.

const PLAN_NATIVITE = `C'est la PREMIÈRE réponse : 400 à 600 mots. Tu n'écris pas encore les
axes — tu ouvres la lecture, et tu proposes.

1. L'OUVERTURE — CE QUE CE CIEL A DE BEAU, ET CE QU'IL RACONTE
Développe **deux ou trois** choses, pas davantage : celles qui sortent de l'ordinaire, que le
dossier te donne **en tête**, sous « CE QUI SORT DE L'ORDINAIRE ». Dis ce que c'est, ce que cela
fait, ce que cela vaut — avec le ton donné plus haut, et le plaisir de le dire. Si ce bloc dit
qu'il n'y a rien, écris que la figure est bien tempérée, et passe.

Puis, en quelques phrases, ce qui tient la figure : l'almuten, le seigneur de l'ascendant, ce
qui est en angle.

Deux interdits, et ils sont fermes :

- **Pas le tour des planètes.** Tu ne passes pas sept astres en revue ; tu prends ce qui compte.
- **Pas de matière ouverte.** Le corps, le métier, l'avoir, les contrats sont les axes : ils
  attendent que le lecteur choisisse. Si ce qui sort de l'ordinaire les touche, dis-le en une
  phrase — le détail viendra, et à la demande.

2. LES AXES — TA QUESTION
Le dossier te donne, en tête, les matières que cette figure charge. Reprends leurs titres tels
quels, un par ligne, sans les développer, et demande au lecteur laquelle il veut ouvrir. Tu
n'ajoutes aucun autre format de lecture — ni « maison par maison », ni « le détail technique »,
ni rien que le bloc ne donne. Tu t'arrêtes là.

Quand il répond, tu ouvres la matière choisie — le socle ci-dessous vaut toujours.`;

const PLAN_REVOLUTION = `Ceci est une RÉVOLUTION D'ANNÉE. C'est la PREMIÈRE réponse : 400 à 600
mots. Ne rédige pas un second jugement de nativité — une année ne donne que ce que la nativité
promet, elle en avance ou en retarde l'effet. Tu ne juges pas ici le métier, la complexion, le
naturel, ni la durée de la vie. Tu n'écris pas encore les axes : tu ouvres, et tu proposes.

1. L'OUVERTURE — CE QUE CETTE ANNÉE A DE NOTABLE
Développe **deux ou trois** choses, pas davantage : le fait le plus net — un maître qui change
d'état, une entrée ou une sortie de combustion, une matière remise en jeu après douze ans —,
puis la matière que la profection impose et lequel des quatre cas s'applique. Suis le ton donné
plus haut : le caractère des astres, et la joie de le dire.

Pas le tour des planètes ; pas de matière ouverte — le détail attend l'axe choisi.

2. LES AXES — TA QUESTION
Reprends les titres des axes tels que le dossier les donne, un par ligne, sans les développer,
et demande au lecteur laquelle il veut suivre. Tu n'ajoutes aucun autre format de lecture. Tu
t'arrêtes là.

Quand il répond, tu ouvres la matière choisie — le socle ci-dessous vaut toujours.`;

const PLAN_INTERROGATION = `Ceci est une INTERROGATION. On te pose une question ; tu réponds.
La figure est celle de l'instant — la nativité n'y entre pour rien, n'en parle pas. Le
consultant est l'ascendant et son seigneur ; la chose est la maison qui la gouverne et son
seigneur.

Le oui ou le non doit figurer dans ta première phrase comme dans ta dernière, et dans le
titre de la réponse. Un jugement qui finit en nuances n'a pas été rendu. Tu peux dire à
quelles conditions, par quelle voie, avec quel retard — la réponse elle-même est l'un des
deux mots. Les règles de ton valent ici comme ailleurs, mais le récit ne remplace jamais la
réponse : le oui ou le non vient d'abord, et le reste s'y plie.

400 à 700 mots. Pas d'ouverture sur ce que la figure a de singulier. Quatre sections :

1. PEUX-TU JUGER ? Les considérations de Bonatti, déjà calculées. Elles ne répondent pas :
   elles disent si l'on a le droit de s'y fier. Une considération grave (ascendant aux
   premiers ou derniers degrés, Saturne en 7e) se dit avant toute autre chose. La réponse
   calculée s'expose toujours : récuser n'est pas taire. Forme honnête : « la figure répond
   oui, et voici pourquoi il ne faut pas s'y fier ». La 7e est le lieu de celui qui calcule.

2. LA RÉPONSE, ET PAR QUELLE VOIE. La voie t'est donnée : explique-la, ne la redécouvre pas.
   Application : attendre suffit. Séparation : déjà fait ou déjà manqué, c'est un non.
   Translation : un tiers, dont la nature désigne qui aller chercher. Collection : porter
   l'affaire devant un plus grand. Prohibition, réfrénation, Lune vide de course : comme le
   dossier les nomme.

3. QUAND. Si une échéance est calculée, donne les degrés, l'unité et la source, et dis que
   les auteurs ne s'accordent pas sur l'échelle. Sinon n'en invente aucune.

4. LA CONDUITE, ET LA PORTE RESTE OUVERTE. Une phrase nette : ce qu'il faut faire demain
   matin. Puis, en une phrase, dis au consultant ce qu'il peut demander ensuite — ce qui
   reste à préciser dans cette figure, ou le fait qu'une interrogation se repose quand les
   circonstances changent. N'ouvre sur aucune matière absente du dossier, et n'annonce aucun
   événement.`;

const PLAN_SYNASTRIE = `Ceci est une comparaison de DEUX nativités. La doctrine n'est pas celle
d'une figure seule, et il faut la suivre : deux chapitres différents du Tetrabiblos s'en
occupent, et ils ne répondent pas à la même question.

1. LA CONCORDE — Ptolémée, IV, 7. Elle vaut pour toute relation : un mariage, une amitié, un
frère, un associé, un adversaire. Elle compare les quatre lieux chefs des deux figures — le
Soleil, la Lune, l'ascendant, la part de Fortune. Mêmes signes ou échange de places :
sympathie assurée. Signes disjoints ou opposés : inimitié profonde. Trine et sextile :
sympathie moindre. Quartile : antipathie moindre. Le dossier te donne le rapport de chacun et
le verdict. Ouvre là-dessus : dis la sympathie ou l'inimitié, et par quels lieux elle tient.
Si les lieux se répondent par les luminaires, l'amitié est de choix ; par les parts de
Fortune, de besoin ; par les ascendants, de plaisir ou de peine.

2. CE QUI LA PORTE. Les aspects croisés entre les deux figures — jamais un mouvement, les
deux ciels sont figés — et les réceptions : une planète reçue dans le signe d'une planète de
l'autre. Nomme ce qui pèse vraiment, pas l'inventaire.

3. LE MARIAGE, SI C'EN EST UN. Si les sexes sont donnés, le dossier te donne aussi le
croisement des luminaires de Ptolémée, IV, 5 — la Lune de l'un au Soleil de l'autre — et le
témoignage des bénéfiques et des maléfiques. Dis-le. Si les sexes ne sont pas donnés, ne
prononce aucun jugement de mariage : la règle ne peut pas être conduite.

400 à 600 mots. Termine par une question au lecteur sur ce qu'il veut qu'on creuse.`;

const SOCLE_BAS = `CE QUE TU NE FAIS PAS
- Tu ne parles jamais de ton travail, du dossier, de la méthode, ni de ce que tu vas faire. Tu
  ne décris pas la lecture : tu la fais. Aucune phrase ne commence par « Ce que le dossier… »,
  « Je ne… », « Il s'agit de… », « Ce thème… » — ni ne résume ce que le dossier contient.
- Tu n'écris jamais ton hésitation. Rien de « non, plutôt », rien qu'on reprenne : ce que tu
  corriges ne paraît pas. Ce que tu écris est ce que tu penses.
- Aucun portrait par signe solaire. Personne n'est « un Bélier ». Le Soleil est une planète
  parmi sept ; sa place se juge par maison, dignité et regard.
- « Vous êtes quelqu'un de… » est interdit. Tu décris des dispositions de vie, jamais un
  type d'homme.
- Aucun de ces mots : chance, personnalité, caractère, tempérament moral, épanouissement,
  potentiel, énergie, vibration, intuition, karma, destinée intérieure, « être soi-même ».
- Aucun nombre calculé, arrondi ou déduit par soustraction. Tous sont ci-dessous. Si un
  écart n'y figure pas, tu ne l'as pas.
- Aucun âge, aucune durée de vie, même déguisée (« longue vie »). Le site ne la calcule
  pas et ne t'en fournit aucun élément : n'en invente aucun, sous aucune forme.
- Aucun événement daté de ton autorité. Un calendrier ou une échéance déjà calculés se
  rapportent comme le produit d'une règle, avec sa source.
- N'invente aucune règle, aucune table, aucun degré. Deux témoignages qui se contredisent :
  dis-le et tranche en donnant ta raison.

On juge une maison par l'état de la planète qui gouverne son signe, et par le lieu où cette
planète se trouve — pas par le signe de la pointe. En angle elle agit visiblement ; cadente,
faiblement. Pérégrine mais reçue n'est pas sans appui. Nomme, pour ce que tu affirmes, la
règle et le livre qui l'autorisent. Les sources sont ci-dessous ; n'en invente aucune.`;

/** La consigne, assemblée pour un genre. Le socle ne change pas ; seul le plan
 *  change, parce que les trois genres ne répondent pas à la même question. */
const consigne = (plan) => SOCLE_HAUT.replace('§PLAN§', plan) + '\n\n' + SOCLE_BAS;

// ─── Les tables de doctrine, telles qu'il les recevra ────────────────────────

function tablesDeDoctrine() {
  const dom = DOMICILES.table.map((p, i) => `${SIGNES[i]} : ${NOMS[p]}`).join(' | ');
  const exa = Object.entries(EXALTATIONS.table)
    .map(([p, e]) => `${nomDe(p)} en ${SIGNES[e.signe]} ${e.degre}°`).join(' | ');
  const tri = TRIPLICITES.table.map((t) =>
    `${t.element} (${t.signes.map((s) => SIGNES[s]).join(', ')}) : jour ${NOMS[t.jour]}, `
    + `nuit ${NOMS[t.nuit]}`).join('\n  ');
  const ter = TERMES.table.map((t, i) =>
    `${SIGNES[i]} : ${t.map(([p, fin]) => `${NOMS[p]} jusqu'à ${fin}°`).join(', ')}`).join('\n  ');
  const poids = Object.entries(POIDS).map(([d, n]) => `${d} ${n}`).join(', ');
  const mai = MAISONS.table.map((m, i) =>
    `${i + 1}. ${m.titre} (${m.latin}) — ${m.detail}`).join('\n  ');
  const asp = ASPECTS.table.map((a) => `${a.nom} ${a.angle}°`).join(', ');
  const orb = Object.entries(ORBES.table).map(([p, o]) => `${NOMS[p] ?? p} ${o}°`).join(', ');
  const nat = NATURES_SIGNES.modes.map((m) =>
    `${m.nom} (${m.latin}) : ${m.signes.map((s) => SIGNES[s]).join(', ')} — ${m.glose}`).join('\n  ');
  const forces = Object.entries(FORCE_DES_LIEUX.gloses).map(([k, g]) => `${k} : ${g}`).join('\n  ');
  const joies = Object.entries(JOIES.table)
    .map(([m, p]) => `maison ${m} — ${JOIES.gloses[p]}`).join('\n  ');

  return `LES TABLES DE DOCTRINE — n'en emploie pas d'autres

Domiciles (${DOMICILES.source})
  ${dom}

Exaltations (${EXALTATIONS.source})
  ${exa}

Triplicités (${TRIPLICITES.source})
  ${tri}

Termes égyptiens (${TERMES.source})
  ${ter}

Faces (${FACES.source})
  décans de 10°, dans l'ordre chaldéen : ${FACES.ordre.map((p) => NOMS[p]).join(', ')}

Poids des dignités essentielles (pour l'almuten)
  ${poids}

Les douze maisons et leurs significations (${MAISONS.source})
  ${mai}

Nature des signes (${NATURES_SIGNES.source})
  ${nat}

Force des planètes selon le lieu (${FORCE_DES_LIEUX.source})
  ${forces}

Les joies (${JOIES.source})
  ${JOIES.regle}
  ${joies}

Aspects (${ASPECTS.source}) : ${asp}
Orbes (${ORBES.source}) : ${orb}

Les parts (${PARTS.source})
  ${PARTS.table.map((p) => `${p.nom} (${p.latin}) — ${p.detail}`).join('\n  ')}

L'homme zodiacal, pour le corps (${MELOTHESIE.source})
  ${MELOTHESIE.regle}
  ${MELOTHESIE.table.map((m, i) => `${SIGNES[i]} : ${m}`).join('\n  ')}

${significations()}

${conditions()}

${matieres()}`;
}

/** La table sans laquelle tout jugement reste du jargon : de quoi chaque
 *  planète est le signe dans le monde. */
function significations() {
  const lignes = Object.entries(SIGNIFICATIONS.table).map(([clef, s]) =>
    `  ${NOMS[clef]} — ${s.qualite} ; ${s.humeur}\n`
    + `    les hommes : ${s.hommes}\n`
    + `    les métiers : ${s.metiers}\n`
    + `    les biens   : ${s.biens}\n`
    + `    le corps    : ${s.corps}\n`
    + `    les lieux   : ${s.lieux}`).join('\n\n');
  return `CE QUE LES PLANÈTES SIGNIFIENT DANS LE MONDE (${SIGNIFICATIONS.source})\n`
    + `C'est ta table de traduction. Aucune position ne doit rester non traduite.\n\n${lignes}`;
}

/** Les accidents : ce qui ne se lit sur aucune table de dignités. */
function conditions() {
  const sol = Object.entries(ETATS_SOLAIRES.gloses)
    .map(([k, g]) => `  ${k} : ${g}`).join('\n');
  const cond = Object.entries(CONDITIONS).filter(([k]) => k !== 'source')
    .map(([k, g]) => `  ${k} : ${g}`).join('\n');
  return `LES ACCIDENTS DES PLANÈTES (${ETATS_SOLAIRES.source} ; ${CONDITIONS.source})\n`
    + `Ils ne figurent sur aucune table de dignités et ce sont eux qui portent les jugements\n`
    + `les plus vifs. Ils te sont donnés calculés dans la figure.\n\n`
    + `Au regard du Soleil (cazimi ${ETATS_SOLAIRES.cazimi * 60}′, combustion `
    + `${ETATS_SOLAIRES.combustion}°, rayons ${ETATS_SOLAIRES.rayons}°)\n${sol}\n`
    + `  orientale : ${ETATS_SOLAIRES.orientale}\n`
    + `  occidentale : ${ETATS_SOLAIRES.occidentale}\n\n`
    + `Les conditions du regard\n${cond}\n\n`
    + `La lumière de la Lune (${LUMIERE.source})\n`
    + `  croissante : ${LUMIERE.croissante}\n`
    + `  décroissante : ${LUMIERE.decroissante}`;
}

/** Le plan du judicium : les matières du quatrième livre du Tetrabiblos. */
function matieres() {
  const m = MATIERES.metier;
  const comb = Object.entries(m.combinaisons)
    .map(([k, v]) => `    ${k.replace(/\+/g, ' + ')} : ${v}`).join('\n');
  const nu = (s) => String(s).replace(/<[^>]+>/g, '');
  return `LES MATIÈRES DU JUGEMENT (${MATIERES.source})\n\n`
    + `  ${MATIERES.avoir.titre}\n    ${nu(MATIERES.avoir.regle)}\n`
    + `    Source : ${MATIERES.avoir.source}\n\n`
    + `  ${MATIERES.dignite.titre}\n    ${nu(MATIERES.dignite.regle)}\n`
    + `    Source : ${MATIERES.dignite.source}\n\n`
    + `  ${m.titre}\n    ${nu(m.regle)}\n`
    + `    Les combinaisons :\n${comb}\n`
    + `    Les modificateurs : ${m.modificateurs}\n`
    + `    Source : ${m.source}`;
}

function reserves() {
  return `CE QUE CE CALCUL NE DONNE PAS, ET QUE TU NE DOIS DONC PAS PRODUIRE

${RESERVES.map((r) => `— ${r.titre} : ${r.texte}`).join('\n\n')}`;
}

// ─── La figure ───────────────────────────────────────────────────────────────

function etatEnClair(a) {
  if (!a.etat) return 'nœud lunaire, sans dignité';
  if (a.etat.tenues.length) return a.etat.tenues.join(' et ');
  if (a.etat.perdues.length) return a.etat.perdues.join(' et ');
  return GENRES[a.clef] === 'f' ? 'pérégrine' : 'pérégrin';
}

/** L'accident solaire, dit en toutes lettres — c'est la donnée qui manquait
 *  le plus, et celle qui change le plus de choses. */
function solaireEnClair(a) {
  if (!a.solaire || a.solaire.classe === 'libre') return '';
  const mots = {
    cazimi: 'AU CŒUR DU SOLEIL',
    combuste: GENRES[a.clef] === 'f' ? 'BRÛLÉE' : 'BRÛLÉ',
    rayons: 'sous les rayons',
  };
  return `, ${mots[a.solaire.classe]} (${a.solaire.ecart.toFixed(1)}° du Soleil)`;
}

/** L'écart au degré d'exaltation, écrit en degrés et minutes.
 *
 *  Ce nombre-là ne doit jamais être laissé à calculer : la table donne un
 *  degré, la planète en est à quelque distance, et cette soustraction d'une
 *  ligne est précisément celle qu'on rate. On la fait donc ici, une fois. */
function perfectionEnClair(a) {
  const p = a.perfection;
  if (!p || !p.notable) return '';
  const cible = `${p.degreDansLeSigne}° ${SIGNES[p.signeExalt]}`;
  return p.versLaChute
    ? `   ← à ${enDegresMinutes(p.chute)} de son DEGRÉ DE CHUTE (opposé de ${cible})`
    : `   ← à ${enDegresMinutes(p.exaltation)} de son DEGRÉ D’EXALTATION (${cible})`;
}

/** Ce qui, dans cette figure, sort de l'ordinaire — calculé ici, jamais laissé
 *  à l'appréciation du modèle. C'est la matière de la première rubrique : la
 *  tradition tient ces accidents pour remarquables, et l'ouverture doit s'y
 *  appuyer. Quand la liste est vide, la figure est bien tempérée, et cela se dit
 *  en une phrase — sans inventer de rareté. */
function ceQuiSortDeLOrdinaire(figure) {
  const trouves = [];
  const astres = figure.astres.filter((a) => !a.noeud);

  for (const a of astres) {
    if (a.joie) trouves.push(`${a.nom} est EN SA JOIE, en la ${a.maison}e maison.`);
    if (a.solaire?.classe === 'cazimi') {
      trouves.push(`${a.nom} est AU CŒUR DU SOLEIL, à ${enDegresMinutes(a.solaire.ecart)} `
        + `du centre : la seule proximité qui renforce.`);
    }
  }

  for (const r of figure.regards ?? []) {
    if (r.partil) {
      trouves.push(`Aspect PARTIL : ${nomDe(r.de)} ${r.aspect.nom} ${nomDe(r.a)}, `
        + `à ${enDegresMinutes(r.ecart)} de l’exactitude.`);
    }
  }

  for (const m of figure.receptions?.mutuelles ?? []) {
    trouves.push(`RÉCEPTION MUTUELLE entre ${nomDe(m.a)} et ${nomDe(m.b)}`
      + (m.regard
        ? `, qui se regardent par ${m.regard.aspect.nom}.`
        : `, SANS AUCUN REGARD entre eux : le lien le plus fort de la doctrine, `
          + `et il ne se voit jamais.`));
  }

  for (const r of figure.receptions?.simples ?? []) {
    if (!r.regard) continue;
    const recue = figure.astres.find((a) => a.clef === r.recue);
    if (['mars', 'saturne'].includes(r.recue) && recue?.etat?.tenues.length) {
      trouves.push(`${nomDe(r.recue)} est reçu par ${nomDe(r.hote)} (${r.par}) tout en tenant `
        + `${recue.etat.tenues.join(' et ')} : un maléfique logé et tenu.`);
    }
  }

  const a = figure.almuten;
  if (a?.vainqueur?.planete === figure.seigneurAscendant) {
    trouves.push(`L’ALMUTEN de la figure est aussi le seigneur de l’ascendant `
      + `(${nomDe(a.vainqueur.planete)}) : tout se rassemble en une seule main.`);
  }

  const pf = figure.perfections ?? {};
  for (const c of [pf.versExaltation, pf.versChute]) {
    if (c?.notable) {
      trouves.push(`${c.nom} est à ${enDegresMinutes(c.ecart)} de son degré `
        + `${c.versLaChute ? 'de chute' : 'd’exaltation'}.`);
    }
  }

  return trouves;
}

// ─── Les axes que la figure charge vraiment ──────────────────────────────────
//
// C'est le seul endroit où la lecture choisit : le dossier doit donc choisir à
// sa place. Une matière est « chargée » quand son significateur sort de
// l'ordinaire — force (angle, grande dignité, joie, cœur du Soleil), malheur
// (combustion, rétrogradation, exil, chute), ou marque extérieure (almuten,
// aspect partil, hôtes dans la maison). Le banal ne se propose pas.

const POIDS_AXE = {
  angle: 2, dignite: 3, perte: 3, combuste: 2, cazimi: 4,
  retro: 2, joie: 2, almuten: 3, partil: 1,
};

function marquesDAxe(figure, a) {
  if (!a) return [];
  const m = [];
  if (a.force === 'angle') m.push(['angle', 'en angle']);
  const grandes = (a.etat?.tenues ?? [])
    .filter((t) => /domicile|exaltation|triplicité/.test(t));
  if (grandes.length) m.push(['dignite', grandes.join(' et ')]);
  if ((a.etat?.perdues ?? []).length) m.push(['perte', a.etat.perdues.join(' et ')]);
  if (a.solaire?.classe === 'combuste') {
    m.push(['combuste', GENRES[a.clef] === 'f' ? 'brûlée par le Soleil' : 'brûlé par le Soleil']);
  }
  if (a.solaire?.classe === 'cazimi') m.push(['cazimi', 'au cœur du Soleil']);
  if (a.retrograde && !a.noeud) m.push(['retro', 'rétrograde']);
  if (a.joie) m.push(['joie', 'en sa joie']);
  if (figure.almuten?.vainqueur?.planete === a.clef) m.push(['almuten', 'almuten de la figure']);
  const partil = (figure.regards ?? [])
    .find((r) => r.partil && (r.de === a.clef || r.a === a.clef));
  if (partil) {
    m.push(['partil', `aspect partil avec ${nomDe(partil.de === a.clef ? partil.a : partil.de)}`]);
  }
  return m;
}

/** Les cinq matières candidates, évaluées et classées. Les mieux marquées —
 *  quatre au plus — sont proposées au lecteur ; les autres sont laissées. */
export function lesAxesCharges(figure) {
  const astre = (clef) => figure.astres.find((a) => a.clef === clef);
  const maison = (n) => figure.maisonsHabitees[n - 1];
  const seigneur = (n) => astre(maison(n).seigneur);
  const fortune = figure.parts.find((p) => p.clef === 'fortune');
  const seigneurFortune = fortune && Number.isFinite(fortune.longitude)
    ? astre(seigneurDuSigne(fortune.longitude)) : null;

  const candidats = [
    { clef: 'metier', titre: 'Le métier', source: 'Tetrabiblos, IV, 4',
      sigs: [figure.metier?.seigneurMC, astre(figure.metier?.retenus?.[0])] },
    { clef: 'avoir', titre: 'L’avoir', source: 'Tetrabiblos, IV, 2',
      sigs: [seigneur(2), seigneurFortune] },
    { clef: 'corps', titre: 'Le corps', source: 'Tetrabiblos, III, 12',
      sigs: [figure.seigneurAscendantPlace, astre('lune'), seigneur(6)] },
    { clef: 'contrats', titre: 'Les contrats et les adversaires', source: 'Alcabitius, dist. I',
      sigs: [seigneur(7)] },
    { clef: 'dignite', titre: 'La dignité', source: 'Tetrabiblos, IV, 3',
      sigs: [astre('soleil'), astre('lune')] },
  ];

  const evalues = candidats.map((c) => {
    let score = 0;
    const raisons = [];
    const vus = new Set();
    for (const a of c.sigs) {
      if (!a || vus.has(a.clef)) continue;
      vus.add(a.clef);
      const m = marquesDAxe(figure, a);
      if (!m.length) continue;
      score += m.reduce((s, [clef]) => s + (POIDS_AXE[clef] ?? 1), 0);
      raisons.push(`${a.nom} ${m.map(([, dit]) => dit).join(', ')}`);
    }
    const hotes = c.clef === 'contrats' ? maison(7).hotes.length : 0;
    if (hotes) {
      score += Math.min(2, hotes);
      raisons.push(`${hotes} hôte${hotes > 1 ? 's' : ''} en septième`);
    }
    return { clef: c.clef, titre: c.titre, source: c.source, score, raisons };
  }).sort((a, b) => b.score - a.score);

  const retenus = new Set(evalues.filter((e) => e.score > 0).slice(0, 4).map((e) => e.clef));
  return evalues.map((e) => ({ ...e, charge: retenus.has(e.clef) }));
}

function lesAxesEnClair(figure) {
  const axes = lesAxesCharges(figure);
  const charges = axes.filter((a) => a.charge);
  if (!charges.length) {
    return `\nLES AXES QUE CETTE FIGURE CHARGE — aucun\n  (cette figure est bien tempérée en `
      + `toutes ses matières : dis-le, et propose au lecteur les quatre portes habituelles — `
      + `le métier, l’avoir, le corps, les contrats.)\n`;
  }
  const banals = axes.filter((a) => !a.charge).map((a) => a.titre);
  return `\nLES AXES QUE CETTE FIGURE CHARGE — propose-les, ne les développe pas\n`
    + charges.map((a) => `  — ${a.titre} (${a.source}) : ${a.raisons.join(' ; ')}`).join('\n')
    + (banals.length ? `\n  (banal, ne le propose pas : ${banals.join(', ')}.)` : '')
    + '\n';
}

/** Ce que la première réponse doit dire, mis en tête du dossier : le
 *  remarquable et les axes chargés. Le modèle écrit à partir de ce qu'il vient
 *  de lire — et non au milieu de six mille mots de tables. */
export function ouvertureEnClair(figure) {
  const trouves = ceQuiSortDeLOrdinaire(figure);
  const notables = `CE QUI SORT DE L'ORDINAIRE — la matière de la première rubrique\n`
    + (trouves.length
      ? trouves.map((x) => `  — ${x}`).join('\n')
      : '  (rien : cette figure est bien tempérée. Dis-le en une phrase, et n’invente aucune rareté.)');
  return `\n${notables}\n${lesAxesEnClair(figure)}`;
}

function figureEnClair(figure) {
  const astres = figure.astres.map((a) =>
    `  ${a.nom.padEnd(16)} ${enSigne(a.longitude).padEnd(22)} maison ${String(a.maison).padStart(2)}`
    + ` (${(a.force ?? '').padEnd(11)})`
    + ` seigneur du lieu : ${nomDe(a.seigneur).padEnd(9)} ${etatEnClair(a)}`
    + `${a.solaire && !a.noeud ? (a.solaire.orientale ? ', orientale' : ', occidentale') : ''}`
    + `${solaireEnClair(a)}`
    + `${a.retrograde && !a.noeud ? '   RÉTROGRADE' : ''}`
    + `${a.joie ? '   ← EN SA JOIE' : ''}`
    + `${perfectionEnClair(a)}`).join('\n');

  const pf = figure.perfections ?? {};
  const perfections = [
    pf.versExaltation
      ? `  Le corps le mieux placé de la figure : ${pf.versExaltation.nom}, à `
        + `${enDegresMinutes(pf.versExaltation.exaltation)} de son degré d’exaltation `
        + `(${pf.versExaltation.degreDansLeSigne}° ${SIGNES[pf.versExaltation.signeExalt]})`
        + `${pf.versExaltation.notable ? ' — c’est notable, et cela ne se lit sur aucune table '
          + 'de dignités : dis-le.' : ' — mais l’écart est grand, et cela ne mérite pas mention.'}`
      : null,
    pf.versChute
      ? `  Le plus proche de sa chute : ${pf.versChute.nom}, à `
        + `${enDegresMinutes(pf.versChute.chute)} du degré opposé à son exaltation`
        + `${pf.versChute.notable ? ' — notable.' : ' — écart grand, sans conséquence.'}`
      : null,
  ].filter(Boolean).join('\n');

  const c = figure.corps;
  const corps = c
    ? `  La complexion, par le signe qui monte : ${c.complexion.signe} (${c.complexion.element}), `
      + `qui gouverne ${c.complexion.membre}.\n`
      + `  Son seigneur ${c.complexion.seigneur.nom} est ${c.complexion.qualite}`
      + `${c.complexion.humeur ? `, et son humeur est ${c.complexion.humeur}` : ''} — `
      + `c’est de là que se prend la complexion du corps entier, en termes d’humeurs et jamais `
      + `de caractère.\n`
      + `  La Lune tient ${c.lune.signe}, qui gouverne ${c.lune.membre}.\n`
      + `  RÈGLE DE SAIGNÉE : ${c.lune.interdit}\n`
      + `  La sixième maison — la maladie, les serviteurs, les bêtes menues et le travail subi, `
      + `c’est-à-dire tout ce à quoi l’on est assujetti — a pour seigneur ${c.maladie.seigneur.nom}, `
      + `en la ${rang(c.maladie.seigneur.maison)} maison (${c.maladie.seigneur.force}), `
      + `${etatEnClair(c.maladie.seigneur)}.\n`
      + `  Ce que ${c.maladie.seigneur.nom} charge dans le corps : ${c.maladie.corps}\n`
      + (c.maladie.hotes.length
        ? c.maladie.hotes.map((h) => `  Y séjourne aussi ${h.nom} : ${h.corps}`).join('\n') + '\n'
        : '')
      + `  Source : ${c.source}\n`
      + `  ${c.regle}`
    : '';

  const maisons = figure.maisonsHabitees.map((m) =>
    `  ${String(m.rang).padStart(2)}. ${m.titre.padEnd(20)} pointe ${enSigne(m.pointe).padEnd(22)}`
    + ` seigneur ${nomDe(m.seigneur).padEnd(9)}`
    + ` ${m.hotes.length ? `y sont : ${m.hotes.map((h) => h.nom).join(', ')}` : '(vide)'}`).join('\n');

  const parts = figure.parts.map((p) => (p.indecise
    ? `  ${p.nom.padEnd(20)} INDÉCISE — ${p.indecise}. Les deux points possibles :\n`
      + p.variantes.map((v) => `${' '.repeat(24)}si ${v.sexe} : `
        + `${enSigne(v.longitude).padEnd(22)} (${v.formule})`).join('\n')
    : `  ${p.nom.padEnd(20)} ${enSigne(p.longitude).padEnd(22)} (${p.formule})`
      + (p.sexe ? ` — prise dans le sens qui vaut pour ${p.sexe === 'homme' ? 'un homme' : 'une femme'}` : ''))).join('\n');

  const regards = (figure.regards ?? []).map((r) =>
    `  ${nomDe(r.de)} ${r.aspect.nom} ${nomDe(r.a)} `
    + `(${r.aspect.angle}°, à ${r.ecart.toFixed(1)}° près${r.partil ? ', EXACT — par degré partil (moins d’un degré de l’angle exact)' : ''}`
    + `, ${r.applique ? 's’APPLIQUE — la chose est à venir' : 'se SÉPARE — la chose est faite'})`)
    .join('\n');

  const almuten = figure.almuten.classement.map((c) =>
    `  ${nomDe(c.planete).padEnd(10)} ${c.score} (${c.dignites.join(', ')})`).join('\n');

  // Les planètes qui ne se voient pas : l'aversion ne produit aucune ligne
  // dans la table des regards, et c'est justement pour cela qu'on l'oublie.
  const clefsPl = figure.astres.filter((a) => !a.noeud).map((a) => a.clef);
  const enAversion = [];
  for (let i = 0; i < clefsPl.length; i++) {
    for (let j = i + 1; j < clefsPl.length; j++) {
      const vu = (figure.regards ?? []).some((r) =>
        (r.de === clefsPl[i] && r.a === clefsPl[j]) || (r.de === clefsPl[j] && r.a === clefsPl[i]));
      if (!vu) enAversion.push(`${nomDe(clefsPl[i])}/${nomDe(clefsPl[j])}`);
    }
  }

  const rec = figure.receptions ?? { simples: [], mutuelles: [] };
  const receptions = [
    ...rec.mutuelles.map((m) =>
      `  RÉCEPTION MUTUELLE — ${nomDe(m.a)} et ${nomDe(m.b)} sont chacune dans le domicile de `
      + `l’autre${m.regard ? `, et se regardent par ${m.regard.aspect.nom}`
        : `, MAIS NE SE REGARDENT D’AUCUN ASPECT : l’échange est en règle et ne se voit jamais`}`),
    ...rec.simples.filter((r) => r.regard).map((r) =>
      `  ${nomDe(r.recue)} est reçue par ${nomDe(r.hote)} (elle se tient dans son `
      + `${r.par}), et les deux se regardent par ${r.regard.aspect.nom} — la reçue emprunte `
      + `la force de celle qui la loge`),
  ].join('\n');

  const l = figure.lumiere;
  const lumiere = l
    ? `  La Lune est à ${l.elongation.toFixed(1)}° du Soleil, soit environ ${l.age.toFixed(1)} `
      + `jours après la conjonction : ${l.croissante ? 'CROISSANTE' : 'DÉCROISSANTE'} en lumière.\n`
      + `  ${l.glose}`
    : '';

  const m = figure.metier;
  const metier = m
    ? `  La planète qui se lève immédiatement avant le Soleil : `
      + `${m.precede ? `${m.precede.nom}, à ${m.distanceAuSoleil.toFixed(1)}° devant lui` : '—'}`
      + `${m.leverFaible ? ' — ATTENTION : elle est loin du Soleil et ne fait pas son lever '
        + 'héliaque à proprement parler. Le témoignage est faible ; appuie-toi d’abord sur le '
        + 'seigneur du milieu du ciel, et dis franchement que la règle ne désigne qu’à demi.' : ''}\n`
      + `  Le seigneur du milieu du ciel : ${m.seigneurMC ? m.seigneurMC.nom : '—'}\n`
      + `  Retenus par la règle (Mercure, Vénus ou Mars seulement) : `
      + `${m.retenus.length ? m.retenus.map(nomDe).join(' et ') : 'AUCUN'}\n`
      + (m.sansDistinction
        ? `  → Aucune des trois planètes de l’action ne témoigne : selon Ptolémée, LE MÉTIER EST `
          + `SANS DISTINCTION. Écris-le ainsi ; ne force pas la règle.`
        : `  → ${m.combinaison}\n`
          + `  Applique ensuite les modificateurs : le signe du significateur (fixe, mobile ou `
          + `commun), son lieu (angle, succédente, cadente), sa dignité, et s’il est brûlé.`)
    : '';

  const ouTombe = (longitude) => {
    const maison = figure.maisonsHabitees.find((h) => {
      const debut = figure.pointes[h.rang];
      const fin = figure.pointes[h.rang % 12 + 1];
      return mod360(longitude - debut) < mod360(fin - debut);
    });
    const seigneur = figure.astres.find((a) => a.clef === seigneurDuSigne(longitude));
    return `la ${maison ? `${rang(maison.rang)} maison — ${maison.titre} (${maison.detail})`
      : '?'}\n    son seigneur est ${seigneur.nom}, en la ${rang(seigneur.maison)} maison, `
      + `${etatEnClair(seigneur)}`;
  };

  const lieuxParts = (figure.parts ?? []).map((p) => {
    // Une part indécise n'a pas de seigneur : lui en calculer un reviendrait à
    // trancher en sous-main. On rend les deux lectures, et l'écart entre elles
    // est précisément ce que le modèle doit rapporter.
    if (p.indecise) {
      return `  ${p.nom.padEnd(20)} INDÉCISE — ${p.indecise}. Les deux lectures :\n`
        + p.variantes.map((v) => `    si ${v.sexe}, elle tombe en ${ouTombe(v.longitude)}`).join('\n');
    }
    return `  ${p.nom.padEnd(20)} tombe en ${ouTombe(p.longitude)}`;
  }).join('\n');

  return `L'ASCENDANT ET LES ANGLES
  Ascendant (horoscopus) : ${enSigne(figure.ascendant)} — signe ${SIGNES[signeDe(figure.ascendant)]}
  Milieu du ciel         : ${enSigne(figure.milieuDuCiel)}
  Seigneur de l'ascendant: ${nomDe(figure.seigneurAscendant)}
  Secte                  : figure ${figure.deJour ? 'DIURNE' : 'NOCTURNE'} (le Soleil est `
    + `${figure.deJour ? 'au-dessus' : 'au-dessous'} de la terre)

L'ALMUTEN DE L'ASCENDANT — la planète qui gouverne toute la figure
${almuten}
  L'emporte : ${nomDe(figure.almuten.vainqueur.planete)}

LES ASTRES
${astres}

LES DEGRÉS DE PERFECTION — la table des exaltations donne un degré, non un signe
${perfections || '  (aucun corps n’approche son degré d’exaltation ni celui de sa chute)'}

LE CORPS — la complexion, le membre chargé, la règle de saignée
${corps}

LES DOUZE MAISONS (maisons d'Alcabitius)
${maisons}

LES PARTS
${parts}

OÙ TOMBENT LES PARTS, ET QUI LES GOUVERNE — c'est ainsi qu'on juge l'avoir
${lieuxParts}

LA LUMIÈRE DE LA LUNE
${lumiere}

LES REGARDS
${regards || '  (aucun dans les orbes)'}

LES PLANÈTES QUI NE SE VOIENT PAS (aversion — elles ne peuvent rien l'une pour l'autre)
  ${enAversion.join(', ') || '(aucune : toutes se regardent)'}

LES RÉCEPTIONS
${receptions || '  (aucune)'}

LE MÉTIER — la règle de Ptolémée, appliquée
${metier}`;
}

function contexte({ saisie, temps, heures, planetaires, julien, dateLabel = 'Date' }) {
  const c = CONVENTIONS[temps?.convention];
  const lignes = [
    `${dateLabel} : ${saisie.jour}/${saisie.mois}/${saisie.annee}`
    + `${julien ? ' (calendrier JULIEN, comme l\'aurait lu un calculateur du temps)' : ' (calendrier grégorien)'}`,
    `Heure annoncée : ${saisie.heure} h ${String(saisie.minute).padStart(2, '0')}`,
    `Lieu : ${saisie.lieu ? `${saisie.lieu} — ` : ''}latitude ${saisie.latitude}°, `
    + `longitude ${saisie.longitude}°`,
    saisie.sexe
      ? `Sexe du natif : ${saisie.sexe}, donné par le consultant. Il ne sert qu’à une chose, `
        + 'et à une seule : la Part du Mariage se prend de Saturne à Vénus pour un homme et de '
        + 'Vénus à Saturne pour une femme, si bien qu’elle est ci-dessous calculée dans le bon '
        + 'sens. N’en tire rien d’autre — pas de rôle, pas d’état matrimonial, pas de caractère.'
      : 'Sexe du natif : NON DONNÉ. Le champ existe et le consultant l’a laissé vide ; ne le '
        + 'devine pas. Cela a une conséquence précise et une seule : la Part du Mariage se prend '
        + 'de Saturne à Vénus pour un homme et de Vénus à Saturne pour une femme, si bien qu’elle '
        + 'reste indécise entre deux degrés. Les deux te sont donnés plus bas. Rends-les tous les '
        + 'deux, dis à quelle condition chacun vaut, et ne choisis pas. Partout ailleurs, écris '
        + 'sans supposer ni le sexe ni l’état matrimonial.',
  ];
  if (temps) {
    lignes.push(temps.convention
      ? `Convention de temps appliquée : ${c?.nom ?? temps.convention}`
        + `${temps.zone && temps.decalage != null
          ? ` (fuseau ${temps.zone}, ${enDecalage(temps.decalage)})` : ''}`
      : 'Instant connu exactement — aucune convention d’heure à interpréter'
        + `${temps.zone ? ` (fuseau ${temps.zone})` : ''}`);
    lignes.push(`Au soleil du lieu : ${enHeures(temps.vrai)} vrai, ${enHeures(temps.moyen)} moyen ; `
      + `${enHeures(temps.universel)} au méridien de Greenwich`);
    lignes.push(`Équation du temps ce jour-là : ${temps.equation >= 0 ? '+' : '−'}`
      + `${Math.abs(temps.equation).toFixed(1)} minutes`);
  }
  if (heures && planetaires) {
    lignes.push(`Heure inégale : naissance ${planetaires.deJour ? 'de jour' : 'de nuit'}, à la `
      + `${rang(planetaires.rang)} heure ${planetaires.deJour ? 'du jour' : 'de la nuit'}`);
    lignes.push(`Le jour est un ${planetaires.jourSemaine}, jour de `
      + `${nomDe(planetaires.seigneurDuJour)} ; l'heure présente est heure de `
      + `${nomDe(planetaires.seigneurDeLHeure)}`);
  }
  return `LA FIGURE QU'ON TE REMET\n  ${lignes.join('\n  ')}`;
}

// ─── Les trois dossiers ──────────────────────────────────────────────────────

const SEPARATEUR = (t) => `\n\n${'═'.repeat(78)}\n${t}\n${'═'.repeat(78)}\n`;

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre'];

function enDate(jj, julien = false) {
  if (jj === null || jj === undefined) return '(inconnu)';
  const d = dateCivile(jj, julien);
  return `${d.jour} ${MOIS_FR[d.mois - 1]} ${d.annee}`;
}

/** Le rang d'une maison : la première est « 1re », les autres « ne ». */
const rang = rangTexte;


/** Le compte des trois témoignages, écrit de sorte qu'on voie lequel manque.
 *  Un jugement qui dit « faible » sans dire pourquoi ne se vérifie pas. */
function comptesEnClair(etiquette, f) {
  if (!f) return '';
  return `${etiquette} : ${f.compte}/3 — ${f.fort ? 'ELLE PEUT DONNER' : 'ELLE NE PEUT PAS'}\n`
    + f.appuis.map((x) => `        pour   : ${x}\n`).join('')
    + f.manques.map((x) => `        contre : ${x}\n`).join('');
}

/** Les douze mois de l'année révolue, avec leur matière et leur seigneur.
 *  C'est le seul calendrier que la technique produise honnêtement : il dit
 *  quelle matière est en jeu à quel moment, non ce qui arrivera. */
function calendrier(annee, julien) {
  const lignes = annee.mois.map((m) => {
    const s = m.seigneur;
    const marque = m.clef === annee.maitre.clef ? '  ←  le maître de l’année lui-même' : '';
    return `  ${String(m.rang).padStart(2)}. ${enDate(m.debut, julien).padEnd(20)} `
      + `${(rang(m.maison.rang) + ' — ' + m.maison.titre).padEnd(26)} `
      + `seigneur ${s.nom} (${s.force}, ${etatEnClair(s)})${marque}`;
  });
  return `On avance d'un signe par mois révolu depuis le signe profecté de l'année. Chaque mois\n`
    + `reçoit ainsi une matière et un seigneur. Les dates sont calculées : ne les recalcule pas.\n\n`
    + lignes.join('\n')
    + `\n\n  Source : Alcabitius, dist. IV ; Abū Maʿshar, De revolutionibus nativitatum,\n`
    + `  sur la division de l'année révolue.`;
}

/** Ce qui a bougé d'une figure à l'autre. On ne retient que les changements
 *  francs : le lieu (angle, succédente, cadente), les dignités, la combustion.
 *  Le reste est du bruit, et le donner encouragerait à en tirer quelque chose. */
function lesChangements(annee) {
  const lignes = [];
  for (const n of annee.natale.astres) {
    if (n.noeud) continue;
    const a = annee.annuelle.astres.find((x) => x.clef === n.clef);
    if (!a) continue;
    const notes = [];
    if (n.force !== a.force) {
      notes.push(`de ${n.force} à ${a.force}`);
    }
    const dignN = n.etat?.tenues.length ?? 0;
    const dignA = a.etat?.tenues.length ?? 0;
    if (dignN === 0 && dignA > 0) {
      notes.push(`de ${peregrinDe(n.clef)} à ${a.etat.tenues.join(' et ')}`);
    }
    if (dignN > 0 && dignA === 0) {
      notes.push(`perd ses dignités, devient ${peregrinDe(n.clef)}`);
    }
    const brulN = n.solaire?.classe === 'combuste';
    const brulA = a.solaire?.classe === 'combuste';
    if (!brulN && brulA) notes.push('entre dans la combustion du Soleil');
    if (brulN && !brulA) notes.push('sort de la combustion du Soleil');
    if (n.retrograde !== a.retrograde) {
      notes.push(a.retrograde ? 'devient rétrograde' : 'redevient directe');
    }
    if (notes.length) {
      lignes.push(`  ${n.nom.padEnd(9)} maison ${n.maison} → ${a.maison} : ${notes.join(' ; ')}`);
    }
  }
  return lignes.length
    ? `Ce qui a franchement changé entre la nativité et la révolution :\n\n${lignes.join('\n')}`
    : '  (rien n’a franchement changé : l’année reprend la nativité sans la déplacer)';
}

/** Le dossier d'une nativité. */
export function dossierNativite({ saisie, resultat }) {
  return [
    consigne(PLAN_NATIVITE),
    SEPARATEUR('LA COMMANDE') + `Rédige la lecture de cette nativité.`,
    SEPARATEUR('CE QUE TU DOIS DIRE DANS CETTE PREMIÈRE RÉPONSE')
      + ouvertureEnClair(resultat.figure),
    SEPARATEUR('LES DONNÉES') + contexte({ ...resultat, saisie, dateLabel: 'Date de naissance' }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une révolution d'année. */
export function dossierAnnee({ saisie, resultat, annee, julien = false }) {
  const m = annee.maitre;
  const retours = Array.from({ length: 8 }, (_, i) => annee.age - 12 * (i + 1))
    .filter((x) => x >= 0);

  return [
    consigne(PLAN_REVOLUTION),
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de l'année qui court des ${annee.age} ans `
      + `de ce natif à ses ${annee.age + 1} ans — un jugement de révolution, non de nativité.\n\n`
      + `La révolution court du ${enDate(annee.jj, julien)} au ${enDate(annee.finit, julien)}.`,
    SEPARATEUR('CE QUE TU DOIS DIRE DANS CETTE PREMIÈRE RÉPONSE')
      + ouvertureEnClair(annee.annuelle),
    SEPARATEUR('LA NATIVITÉ (le fond, qui ne se rejuge pas)')
      + contexte({ ...resultat, saisie, dateLabel: 'Date de naissance' }),
    '',
    figureEnClair(annee.natale),
    SEPARATEUR('LA PROFECTION ET LE MAÎTRE DE L\'ANNÉE')
      + `  Âge : ${annee.age} ans\n`
      + `  Maison profectée : ${rang(m.profection.rang)} — ${m.profection.titre} `
      + `(${m.profection.latin}) : ${m.profection.detail}\n`
      + `  Signe profecté : ${enSigne(annee.signeProfecte)}\n`
      + `  La même profection est déjà revenue aux âges de : `
      + `${retours.length ? retours.reverse().join(', ') + ' ans' : '(jamais — c’est la première fois)'}\n`
      + `  MAÎTRE DE L'ANNÉE (dominus anni) : ${m.nom}\n`
      + `    au natal        : ${enSigne(m.natal.longitude)}, maison ${m.natal.maison} `
      + `(${m.natal.force}), ${etatEnClair(m.natal)}\n`
      + `    à la révolution : ${enSigne(m.annuel.longitude)}, maison ${m.annuel.maison} `
      + `(${m.annuel.force}), ${etatEnClair(m.annuel)}\n`
      + `    PEUT-ELLE DONNER ? Trois témoignages, il en faut deux — le lieu (angle ou\n`
      + `      succédente), la grande dignité (domicile, exaltation, triplicité ; le terme et\n`
      + `      la face ne comptent pas), la liberté (directe et hors des rayons).\n`
      + comptesEnClair('      au natal       ', m.ecart.natal)
      + comptesEnClair('      à la révolution', m.ecart.annuel)
      + `    LEQUEL DES QUATRE CAS : ${m.ecart.clef} — ${m.ecart.texte}\n`
      + `  Règle : on avance d'un signe par année de vie depuis l'ascendant natal ; le seigneur `
      + `du lieu où l'on tombe gouverne l'année entière.\n`
      + `  Source : Alcabitius, dist. IV (l'intihā') ; Bonatti, Liber astronomiae, tr. VIII.`,
    SEPARATEUR('LE CALENDRIER DES DOUZE MOIS') + calendrier(annee),
    SEPARATEUR('CE QUI A CHANGÉ DEPUIS LA NATIVITÉ') + lesChangements(annee),
    SEPARATEUR('LA FIGURE DE LA RÉVOLUTION') + figureEnClair(annee.annuelle),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une interrogation. */
export function dossierInterrogation({ saisie, resultat, question, jugement }) {
  const j = jugement;
  const gardes = j.considerations.length
    ? j.considerations.map((c) => `  — ${c.texte.replace(/<[^>]+>/g, '')}`).join('\n')
    : '  (aucune considération ne s\'oppose au jugement)';

  const nu = (t) => t.replace(/<[^>]+>/g, '');
  const obstacles = j.obstacles.length
    ? j.obstacles.map((o) => `  — ${nu(o.texte)}`).join('\n')
    : '  (rien ne vient couper la voie)';

  return [
    consigne(PLAN_INTERROGATION),
    SEPARATEUR('LA COMMANDE') + `On te pose cette question, et tu dois y répondre :\n\n`
      + `      « ${question} »\n\n`
      + `LA RÉPONSE CALCULÉE EST : ${j.verdict.reponse.toUpperCase()}\n`
      + `Elle t'est donnée. Tu ne la choisis pas, tu l'exposes — et tu la donnes dès ta `
      + `première phrase. Si une considération grave figure ci-dessous, tu donnes quand même `
      + `cette réponse, puis tu dis pourquoi la figure n'est pas en état qu'on s'y fie : `
      + `récuser le jugement n'est pas le taire.`,
    SEPARATEUR('LES CONSIDÉRATIONS AVANT JUGEMENT') + gardes,
    SEPARATEUR('LE CONSULTANT ET LA CHOSE')
      + `  Consultant : l'ascendant, et son seigneur ${nomDe(j.consultant.clef)}, `
      + `maison ${j.consultant.maison} (${j.consultant.force}), ${etatEnClair(j.consultant)}\n`
      + `  La chose : ${rang(j.matiere.rang)} maison — ${j.matiere.titre} (${j.matiere.latin}) : `
      + `${j.matiere.detail}\n`
      + `  Son seigneur : ${nomDe(j.seigneurChose.clef)}, maison ${j.seigneurChose.maison} `
      + `(${j.seigneurChose.force}), ${etatEnClair(j.seigneurChose)}`,
    SEPARATEUR('LA VOIE — comment la chose se fait, ou ne se fait pas')
      + `  Voie retenue : ${j.verdict.clef}\n`
      + `  ${j.verdict.titre}\n\n`
      + `  ${nu(j.verdict.texte)}\n\n`
      + (j.jonction
        ? `  Aspect entre les deux seigneurs : ${j.jonction.nom} (${j.jonction.angle}°), à `
          + `${j.jonction.ecart.toFixed(2)}° de l'exactitude, en ${j.jonction.mouvement}.\n`
          + `  ${j.jonction.glose}\n`
        : `  Aucun aspect entre les deux seigneurs.\n`)
      + (j.translation
        ? `  Translation : ${j.translation.porteur.nom} quitte `
          + `${nomDe(j.translation.quitte.clef)} et joint ${nomDe(j.translation.joint.clef)}.\n`
        : '')
      + (j.collection
        ? `  Collection : ${j.collection.collecteur.nom} recueille les deux lumières.\n`
        : '')
      + (j.vide ? `  Lune vide de course : il lui reste ${j.vide.reste.toFixed(1)}° sans `
        + `rencontre.\n` : '')
      + `\n  CE QUI COUPE LA VOIE :\n${obstacles}`,
    SEPARATEUR('QUAND') + (j.echeance
      ? `  ${nu(j.echeance.texte)}\n`
        + `  Degrés restants : ${j.echeance.degres.toFixed(2)} — unité : ${j.echeance.unite} `
        + `(signe ${j.echeance.mode}, maison ${j.echeance.lieu})\n`
        + `  Source : ${j.echeance.source}`
      : `  La règle ne donne pas d'échéance ici : il n'y a pas d'aspect qui s'applique entre\n`
        + `  les deux seigneurs. N'en invente aucune, et dis que le genre ne permet pas de\n`
        + `  répondre sur le temps.`),
    SEPARATEUR('LA FIGURE DE L\'INSTANT')
      + contexte({ ...resultat, saisie, dateLabel: 'Date de la question' }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

// ─── Le dossier d'une comparaison de deux figures ────────────────────────────

const NOM_RAPPORT = {
  'meme-signe': 'même signe',
  disjoints: 'signes disjoints',
  opposition: 'signes opposés',
  sympathie: 'trine ou sextile',
  antipathie: 'quartile',
};

const NOM_VERDICT_CONCORDE = {
  'sympathie-assuree': 'SYMPATHIE ASSURÉE ET INDISSOLUBLE',
  inimities: 'INIMITIÉS PROFONDES ET DURABLES',
  'sympathie-moindre': 'sympathie moindre',
  'antipathie-moindre': 'antipathie moindre',
  partagee: 'rapports partagés',
};

const NOM_VERDICT_MARIAGE = {
  durable: 'mariages durables',
  rupture: 'divorces et aliénations',
  partage: 'ni l’un ni l’autre',
};

function concordeEnClair(c) {
  const lignes = c.lieux.map((l) => `  ${l.nom.padEnd(20)} `
    + `${l.rapport ? NOM_RAPPORT[l.rapport] : '—'}`
    + `${l.ecart != null ? `   (écart ${enDegresMinutes(l.ecart)})` : ''}`).join('\n');
  return `  VERDICT : ${NOM_VERDICT_CONCORDE[c.verdict]}\n`
    + `  Compte : ${c.compte['meme-signe']} même(s) signe(s), ${c.compte.sympathie} trine(s) `
    + `ou sextile(s), ${c.compte.antipathie} quartile(s), ${c.compte.disjoints} disjoint(s), `
    + `${c.compte.opposition} opposition(s).\n`
    + `  Les quatre lieux chefs des deux figures, l'un sous l'autre :\n${lignes}\n`
    + (c.genres.length
      ? `  Les lieux qui se répondent donnent une amitié ${c.genres.join(', ')}.\n` : '')
    + (c.echanges.length
      ? `  Échange de places : ${c.echanges.map((e) => `${e.a}/${e.b}`).join(', ')} — le texte `
        + `le met au rang du même signe.\n` : '')
    + `  Ascendants à ${enDegresMinutes(c.ecartDesAscendants)} l'un de l'autre`
    + `${c.ascendantsSerres ? ' — le cas que le texte dit le plus fort (environ 17°).' : '.'}\n`
    + `  Source : Ptolémée, Tetrabiblos, IV, 7 (trad. Robbins).`;
}

function mariageEnClair(l) {
  const lignes = l.paires.map((p) => `  ${`${p.de} × ${p.a}`.padEnd(20)} `
    + `${p.nom ? `${p.nom} (${p.ecart != null ? enDegresMinutes(p.ecart) : '—'})` : 'aucun aspect'}`
    + `  — par signe : ${p.signe ?? 'aucun'}`).join('\n');
  const privilegie = l.privilegie
    ? `  Le croisement privilégié (Lune du mari au Soleil de la femme) : `
      + `${l.privilegie.nom
        ? `${l.privilegie.nom}, ${enDegresMinutes(l.privilegie.ecart)}` : 'aucun aspect'}`
      + ` — ${l.privilegie.nature}.\n`
    : '  Les sexes n’étant pas donnés, le croisement privilégié n’est pas désigné.\n';
  return `  VERDICT : ${NOM_VERDICT_MARIAGE[l.verdict]}\n`
    + `  (${l.compte.harmonieuses} harmonieux, ${l.compte.inharmonieuses} durs, `
    + `${l.compte.aversions} en aversion, ${l.compte.conjonctions} conjonction(s))\n`
    + `${lignes}\n${privilegie}`
    + `  Source : Ptolémée, Tetrabiblos, IV, 5 (trad. Robbins).`;
}

function temoignagesEnClair(t) {
  const ligne = (x) => `  ${x.nom} de ${x.figure} ${x.aspect} ${nomDe(x.sur)} de ${x.surFigure}, `
    + `à ${enDegresMinutes(x.ecart)}`;
  return `  Bénéfiques :\n${t.benefiques.length ? t.benefiques.map(ligne).join('\n')
    : '  (aucun)'}\n`
    + `  Maléfiques :\n${t.malefiques.length ? t.malefiques.map(ligne).join('\n')
      : '  (aucun)'}\n`
    + `  Source : les bénéfiques gardent le mariage agréable et profitable, les maléfiques le `
    + `rendent querelleur (Ptolémée, IV, 5).`;
}

function aspectsCroisesEnClair(aspects) {
  if (!aspects.length) return '  (aucun aspect entre les deux figures dans les orbes)';
  return aspects.map((r) => `  ${`${nomDe(r.de)} ${r.glyphe} ${nomDe(r.a)}`.padEnd(26)} `
    + `${r.nom}, à ${enDegresMinutes(r.ecart)}${r.partil ? ' — PARTIL (moins d’un degré)' : ''}`).join('\n');
}

function echangesEnClair(e) {
  const lignes = [];
  for (const x of e.aRecuParB) {
    lignes.push(`  ${nomDe(x.recue)} (I) est reçue par ${nomDe(x.hote)} (II), par ${x.par}`);
  }
  for (const x of e.bRecuParA) {
    lignes.push(`  ${nomDe(x.recue)} (II) est reçue par ${nomDe(x.hote)} (I), par ${x.par}`);
  }
  for (const m of e.mutuels) {
    lignes.push(`  ÉCHANGE MUTUEL : ${nomDe(m.a)} et ${nomDe(m.b)} se logent l’une l’autre`);
  }
  return lignes.length ? lignes.join('\n') : '  (aucune)';
}

export function dossierSynastrie({ saisieA, saisieB, resultatA, resultatB, synastrie: s }) {
  const personne = (nom, saisie, resultat) =>
    contexte({ ...resultat, saisie, dateLabel: `Date de naissance ${nom}` })
    + '\n\n' + figureEnClair(resultat.figure);

  return [
    consigne(PLAN_SYNASTRIE),
    SEPARATEUR('LA COMMANDE') + `Compare ces deux nativités. La concorde d'abord — elle vaut `
      + `pour toute relation — puis, si les sexes sont donnés, ce que Ptolémée dit du mariage.`,
    SEPARATEUR('PREMIÈRE FIGURE (I)') + personne('I', saisieA, resultatA),
    SEPARATEUR('SECONDE FIGURE (II)') + personne('II', saisieB, resultatB),
    SEPARATEUR('LA CONCORDE — Ptolémée, IV, 7') + concordeEnClair(s.concorde),
    SEPARATEUR('LE MARIAGE — Ptolémée, IV, 5') + mariageEnClair(s.luminaires),
    SEPARATEUR('CE QUE LES BÉNÉFIQUES ET LES MALÉFIQUES REGARDENT')
      + temoignagesEnClair(s.temoignages),
    SEPARATEUR('LES ASPECTS CROISÉS — sans mouvement, les deux ciels sont figés')
      + aspectsCroisesEnClair(s.aspects),
    SEPARATEUR('LES RÉCEPTIONS ENTRE LES DEUX FIGURES') + echangesEnClair(s.echanges),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

// Le dossier — tout ce qu'il faut donner à un modèle de langue pour qu'il
// rédige une lecture sans rien inventer.
//
// Le danger, en branchant un LLM sur de l'astrologie, est qu'il produise de
// l'horoscope de magazine : il connaît mille fois mieux le Bélier caractériel
// du XXe siècle qu'Alcabitius. On le tient donc court. La figure est calculée
// ici, les règles lui sont fournies ici avec leur source, et ce qu'il n'a pas
// le droit de dire lui est dit ici. Il n'apporte que la prose.

import { SIGNES, PLANETES, GENRES, enSigne, signeDe, mod360, dateGregorienne } from './ciel.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS, RESERVES, NATURES_SIGNES, FORCE_DES_LIEUX,
  SIGNIFICATIONS, ETATS_SOLAIRES, CONDITIONS, LUMIERE, MATIERES, MELOTHESIE, JOIES,
} from './doctrine.js';
import { nomDe, seigneurDuSigne, enDegresMinutes, peregrinDe, rangTexte } from './jugement.js';
import { CONVENTIONS, enHeures, enDecalage } from './temps.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));

// ─── Le ton et la consigne ───────────────────────────────────────────────────

const SOCLE_HAUT = `Tu rédiges une lecture de la figure calculée ci-dessous. Écris en français
d'aujourd'hui : clair, mesuré, sans costume d'époque. Tu n'es pas un astrologien de 1380 ; tu
traduis un calcul médiéval pour quelqu'un qui lit maintenant.

La figure, les dignités, les regards, les règles et leurs sources sont déjà calculés. Tu
n'apportes que la prose. Si une donnée n'est pas ci-dessous, tu ne l'as pas.

Une position n'est pas une lecture. Tu n'écris une longitude, une dignité ou un regard que si
tu les traduis aussitôt en une chose du monde — un métier, un bien, un corps, un lieu, une
conduite. La table des SIGNIFICATIONS sert à cela. Forme voulue, sur un exemple qui n'est pas
le tien : « Mercure est brûlé par le Soleil, à ⟨tant⟩ degrés de lui : la planète de la plume
et du compte n'agit plus pour son propre compte. Ce qui s'écrit de cette main sortira sous
une autre signature. » Le ⟨tant⟩ n'est pas un nombre : chaque chiffre de ton texte doit se
lire dans le dossier, et nulle part ailleurs.

Les titres sont en Markdown (## ). Ils concluent : la matière, un tiret, ce que tu retiens,
cinq à dix mots. « Le métier » n'apprend rien ; « Le métier — le travail porte le nom d'un
autre » apprend tout. Cet exemple n'est pas le tien — ne le recopie pas.

Prose suivie, pas de listes à puces. Si une phrase pourrait convenir à n'importe quelle autre
figure, raye-la.

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

const PLAN_NATIVITE = `DEUX PARTIES, DANS CET ORDRE — 700 à 900 mots en tout

1. LE CIEL
Une seule voix, 400 à 600 mots. La date de naissance est ci-dessous ; elle a déjà produit
cette figure. Ne la relis pas à part : pas de type solaire (« né un 12 mars, donc… »), pas
d'horoscope du jour. Tu expliques ce ciel-ci, pas le calendrier.

Dis, dans cet ordre :
- ce qui tient la figure : l'almuten, le seigneur de l'ascendant, ce qui est en angle, et
  un accident notable s'il y en a vraiment (combustion, joie, réception, aspect partil,
  proximité d'un degré d'exaltation ou de chute). Une ou deux choses, pas un inventaire.
  La plupart des figures n'ont rien d'extraordinaire : si c'est le cas, dis-le et passe
  aux faits. N'invente aucune rareté.
- ce que cela donne concrètement : de quoi l'on vit, ce que l'on tient et de qui, le corps,
  les alliés et les adversaires. Tu peux nommer un mot technique (ascendant, almuten,
  pérégrin) si tu l'expliques à sa première occurrence.
- deux ou trois gestes : ce qu'il faut pousser, ce qu'il ne faut pas forcer, ce qu'il faut
  surveiller (un membre, une démarche, une matière à laisser dormir).

Nomme le plus fort et le plus faible, chacun dans sa phrase, sans les coller par un « mais ».
Le métier se juge ici, une seule fois, d'après LE MÉTIER déjà calculé (Ptolémée : la planète
qui se lève juste avant le Soleil, et le seigneur du milieu du ciel ; Mercure, Vénus ou Mars
seulement). Si la règle ne désigne personne, le métier est sans distinction : écris-le, ne
force pas.

2. TROIS OU QUATRE AXES
Seulement les matières que CETTE figure charge vraiment. Un titre qui conclut, un court
paragraphe chacun. Les portes habituelles : le métier (10e), l'avoir (2e et part de Fortune),
le corps (Lune, ascendant, 6e), les contrats et adversaires (7e). Ce sont des dispositions
de vie — comment on gagne, de qui on dépend, où le corps lâche — jamais des traits de
caractère. N'écris pas les douze maisons. Ce qui est banal reste hors de ton texte.`;

const PLAN_REVOLUTION = `Ceci est une RÉVOLUTION D'ANNÉE. Ne rédige pas un second jugement de
nativité. Une année ne donne que ce que la nativité promet : elle en avance ou en retarde
l'effet, elle ne le crée pas. Tu ne juges pas ici le métier, la complexion, le naturel, ni
la durée de la vie.

DEUX PARTIES, DANS CET ORDRE — 700 à 900 mots en tout

1. CETTE ANNÉE
Une seule voix, 400 à 600 mots. Ouvre sur l'année, pas sur l'homme : la matière imposée par
la maison profectée (dis-la en une phrase nette), le maître de l'année lu deux fois — au
natal, ce qu'il peut promettre ; à la révolution, ce qu'il en fera. Le dossier te donne
lequel des quatre cas s'applique (fort/fort, fort/faible, faible/fort, faible/faible) :
développe-le, ne le recopie pas. Rappelle que la profection revient tous les douze ans, et
nomme les âges déjà connus. Deux ou trois gestes : quelle matière pousser, laquelle laisser
dormir, quel mois est le plus chargé.

2. TROIS OU QUATRE AXES
Seulement ce que CETTE année charge : le maître (peut-il donner, oui ou non), deux ou trois
changements francs depuis la nativité (lieu, dignité, combustion — pas le bruit), et les
mois dont le seigneur est le maître lui-même ou une planète mal disposée. Le calendrier
entier est ci-dessous : n'en fais pas l'inventaire. Les dates des mois sont calculées ; elles
disent quelle matière est en jeu, non ce qui arrivera.`;

const PLAN_INTERROGATION = `Ceci est une INTERROGATION. On te pose une question ; tu réponds.
La figure est celle de l'instant — la nativité n'y entre pour rien, n'en parle pas. Le
consultant est l'ascendant et son seigneur ; la chose est la maison qui la gouverne et son
seigneur.

Le oui ou le non doit figurer dans ta première phrase comme dans ta dernière, et dans le
titre de la réponse. Un jugement qui finit en nuances n'a pas été rendu. Tu peux dire à
quelles conditions, par quelle voie, avec quel retard — la réponse elle-même est l'un des
deux mots.

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

4. LA CONDUITE. Une phrase : ce qu'il faut faire demain matin.`;

const SOCLE_BAS = `CE QUE TU NE FAIS PAS
- Aucun portrait par signe solaire. Personne n'est « un Bélier ». Le Soleil est une planète
  parmi sept ; sa place se juge par maison, dignité et regard.
- « Vous êtes quelqu'un de… » est interdit. Tu décris des dispositions de vie, jamais un
  type d'homme.
- Aucun de ces mots : chance, personnalité, caractère, tempérament moral, épanouissement,
  potentiel, énergie, vibration, intuition, karma, destinée intérieure, « être soi-même ».
- Aucun nombre calculé, arrondi ou déduit par soustraction. Tous sont ci-dessous. Si un
  écart n'y figure pas, tu ne l'as pas.
- Aucun âge, aucune durée de vie, même déguisée (« longue vie »). S'il y a une section
  DURÉE DE VIE, elle te donne un désaccord d'auteurs : rapporte-le, n'en tire pas un chiffre.
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
  const mots = { cazimi: 'AU CŒUR DU SOLEIL', combuste: 'BRÛLÉE', rayons: 'sous les rayons' };
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
    + `(${r.aspect.angle}°, à ${r.ecart.toFixed(1)}° près${r.partil ? ', EXACT — par degré partil' : ''}`
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
    `Lieu : latitude ${saisie.latitude}°, longitude ${saisie.longitude}°`,
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
    lignes.push(`Convention de temps appliquée : ${c?.nom ?? temps.convention}`
      + `${temps.zone ? ` (fuseau ${temps.zone}, ${enDecalage(temps.decalage)})` : ''}`);
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

function enDate(jj) {
  if (jj === null || jj === undefined) return '(inconnu)';
  const d = dateGregorienne(jj);
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
function calendrier(annee) {
  const lignes = annee.mois.map((m) => {
    const s = m.seigneur;
    const marque = m.clef === annee.maitre.clef ? '  ←  le maître de l’année lui-même' : '';
    return `  ${String(m.rang).padStart(2)}. ${enDate(m.debut).padEnd(20)} `
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
/** La durée de vie, remise au modèle comme un désaccord et non comme un blanc.
 *
 *  L'ancienne consigne se contentait d'interdire le chiffre. Une interdiction
 *  sans preuve invite à la contourner ; on remet donc la marche entière des deux
 *  auteurs, pour que le refus soit lisible comme un résultat. */
function dureeDeVieEnClair(vie) {
  if (!vie?.marches?.length) return '';

  const marche = (m) => {
    // Trois états, et non deux : un candidat peut être en lieu convenable sans
    // être celui qu'on retient. Ptolémée le dit en propres termes lorsque les
    // deux luminaires conviennent.
    const etat = (e) => (e.elu ? '→ ÉLU     ' : e.retenu ? '  éligible' : '  écarté  ');
    const etapes = m.marches.map((e) =>
      `    ${etat(e)} ${(e.nom ?? '').padEnd(30)} ${e.pourquoi}`
      + (e.detail ? `\n${' '.repeat(15)}${e.detail}` : '')).join('\n');

    const donneurs = m.alcocodens.map((a) =>
      `    selon ${a.auteur.padEnd(36)} ${a.elu
        ? `${a.elu.nom} (par ${a.elu.dignite}) — ${a.elu.atteinte.glose}`
        : 'AUCUN : pas un des seigneurs du degré ne l’atteint, donc le hyleg est incomplet'}`)
      .join('\n');

    return `  ${m.auteur} — ${m.source}\n${etapes}\n`
      + `    HYLEG : ${m.nom}${m.position ? ` à ${m.position}` : ''} — ${m.raison}\n`
      + (m.ecartInterne ? `    (Ptolémée se contredit ici : ${m.ecartInterne})\n` : '')
      + `    L'ALCOCODEN, selon l'ordre de commandement qu'on suit :\n${donneurs}`;
  };

  const verdict = vie.accord.memePoint && vie.accord.memeDonneur
    ? 'Sur cette figure, les deux marches tombent d’accord. C’est le cas le moins fréquent, '
      + 'et il ne rend pourtant pas le nombre calculable : il resterait à choisir entre les '
      + 'années majeures, moyennes et mineures du donneur, puis à ajouter et retrancher selon '
      + 'les regards. Dis l’accord, il vaut d’être dit — et n’en tire pas un âge.'
    : 'Les deux marches divergent sur cette figure. C’est le fait à rapporter, et il se rapporte '
      + 'tel quel : deux autorités qu’on enseignait ensemble ne partent pas du même point et ne '
      + 'nomment pas le même donneur d’années. Nomme les deux points, nomme les donneurs, et '
      + 'conclus que le nombre aurait dit quel livre était ouvert, non l’âge du natif.';

  return `${SEPARATEUR('LA DURÉE DE VIE — un désaccord, pas un blanc')}Cette section ne te donne `
    + 'aucun âge, et tu n’en dois produire aucun. Elle te donne mieux : la marche complète de deux '
    + 'auteurs sur cette figure, pour que tu puisses montrer d’où vient le silence.\n\n'
    + (vie.syzygie ? `  La syzygie qui a précédé la naissance : ${vie.syzygie.nom}, `
      + `à ${enSigne(vie.syzygie.longitude)}. Elle entre dans les deux marches, différemment.\n\n` : '')
    + `${vie.marches.map(marche).join('\n\n')}\n\n`
    + `  CE QU'IL FAUT EN DIRE\n  ${verdict}\n\n`
    + `  ET POURQUOI ON S'ARRÊTE LÀ\n  ${vie.pasDeNombre}\n`;
}

export function dossierNativite({ saisie, resultat }) {
  return [
    consigne(PLAN_NATIVITE),
    SEPARATEUR('LA COMMANDE') + `Rédige la lecture de cette nativité.`,
    SEPARATEUR('LES DONNÉES') + contexte({ ...resultat, saisie, dateLabel: 'Date de naissance' }),
    '',
    figureEnClair(resultat.figure),
    dureeDeVieEnClair(resultat.vie),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une révolution d'année. */
export function dossierAnnee({ saisie, resultat, annee }) {
  const m = annee.maitre;
  const retours = Array.from({ length: 8 }, (_, i) => annee.age - 12 * (i + 1))
    .filter((x) => x >= 0);

  return [
    consigne(PLAN_REVOLUTION),
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de l'année qui court des ${annee.age} ans `
      + `de ce natif à ses ${annee.age + 1} ans — un jugement de révolution, non de nativité.\n\n`
      + `La révolution court du ${enDate(annee.jj)} au ${enDate(annee.finit)}.`,
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

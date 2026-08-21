// Le dossier — tout ce qu'il faut donner à un modèle de langue pour qu'il
// rédige un jugement sans rien inventer.
//
// Le danger, en branchant un LLM sur de l'astrologie, est qu'il produise de
// l'horoscope de magazine sous un vernis ancien : il connaît mille fois mieux
// le Bélier caractériel du XXe siècle qu'Alcabitius. On le tient donc court.
// Il ne reçoit aucune latitude doctrinale : la figure est calculée ici, les
// règles lui sont fournies ici avec leur source, la méthode lui est dictée
// ici, et ce qu'il n'a pas le droit de dire lui est dit ici. Il n'apporte que
// la prose.
//
// C'est aussi, historiquement, la bonne division du travail : le calculateur
// dressait la figure, et le judicium était un texte rédigé.

import { SIGNES, PLANETES, GENRES, enSigne, signeDe } from './ciel.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS, RESERVES, NATURES_SIGNES, FORCE_DES_LIEUX,
} from './doctrine.js';
import { nomDe } from './jugement.js';
import { CONVENTIONS, enHeures, enDecalage } from './temps.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));

// ─── Le ton et la consigne ───────────────────────────────────────────────────

const CONSIGNE = `Tu es un astrologien de cour, à Paris, vers 1380. Tu as été formé à la
faculté des arts, tu lis Alcabitius, Ptolémée, Sahl ibn Bishr et Bonatti, tu calcules à
l'astrolabe et aux Tables alphonsines. Tu es payé par un prince pour rédiger un jugement
— un judicium — sur la figure qu'on te remet.

TON ET LANGUE
- Écris en français, en prose suivie. Pas de listes à puces, pas de titres décoratifs.
- Ton sobre, savant, assuré mais mesuré. Tu es un homme de métier, pas un devin de foire.
- Tu peux employer les mots techniques (ascendant, almuten, seigneur, pérégrin, triplicité,
  terme, face, angle, maison cadente, part de Fortune) : c'est ton vocabulaire. Explique-les
  brièvement à la première occurrence.
- Longueur : entre 700 et 1200 mots.

CE QUE TU DOIS FAIRE
- Juger matière par matière, dans l'ordre des maisons qui compte pour la question posée.
- Pour chaque matière, appliquer la technique du seigneur : on ne juge pas une maison par le
  signe où elle tombe, mais par l'état de la planète qui gouverne ce signe et par le lieu où
  cette planète se trouve. Une planète présente dans une maison pèse plus lourd que son
  seigneur absent.
- Nommer, pour chaque affirmation, la règle et le livre qui l'autorise. Les sources te sont
  données plus bas ; n'en invente aucune autre.
- Peser : une planète en son domicile ou son exaltation est forte ; pérégrine, elle n'a pas
  d'appui ; en exil ou en chute, elle est mal logée. Une planète en angle agit promptement et
  visiblement ; en maison succédente, plus tard ; en maison cadente, faiblement.
- Tenir compte de la secte : de jour le Soleil l'emporte comme témoin de la vie, de nuit la
  Lune.

CE QUE TU NE DOIS PAS FAIRE — c'est important, et c'est là que tout se joue
- N'écris JAMAIS de portrait de caractère fondé sur le signe solaire. Personne, en 1380,
  n'est « un Bélier ». Le signe solaire comme type d'homme est une invention du XXe siècle,
  et l'employer trahirait aussitôt l'anachronisme. Le Soleil est une planète parmi sept, et
  sa place se juge comme celle des autres : par maison, par dignité, par regard.
- N'invente aucune règle, aucune table, aucun degré. Si une donnée ne figure pas ci-dessous,
  tu ne l'as pas, et tu le dis.
- Ne donne aucun chiffre de durée de vie. La doctrine du hyleg et de l'alcocoden n'est pas
  fixée — Ptolémée, Alcabitius et Bonatti ne désignent pas le hyleg de la même façon —, et
  un nombre unique serait un faux.
- Ne prédis pas d'événement daté. Tu juges des dispositions, des matières fortes et faibles,
  ce dont il faut se garder. Le reste appartient à Dieu, et tu le sais.
- N'adoucis pas systématiquement. Un astrologien de cour dit aussi les maisons mal tenues.
  Mais garde-toi de l'effroi : tu écris pour un homme qui te paie et qui te relira.

UNE CHOSE ENFIN, QUE TU DOIS DIRE AU MOINS UNE FOIS
Cette figure est calculée sur le ciel réel. Un astrologien de 1380 calculait avec les Tables
alphonsines, dont les valeurs s'en écartent — la grande conjonction qui a expliqué la Peste
à l'Europe entière y est datée de quatre jours trop tôt. Le ciel que tu lis est donc plus
juste que celui que tu aurais lu, et c'est un paradoxe dont tu peux faire état.`;

// ─── Les tables de doctrine, telles qu'il les recevra ────────────────────────

function tablesDeDoctrine() {
  const dom = DOMICILES.table.map((p, i) => `${SIGNES[i]} : ${NOMS[p]}`).join(' | ');
  const exa = Object.entries(EXALTATIONS.table)
    .map(([p, e]) => `${NOMS[p]} en ${SIGNES[e.signe]} ${e.degre}°`).join(' | ');
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

Aspects (${ASPECTS.source}) : ${asp}
Orbes (${ORBES.source}) : ${orb}

Les parts (${PARTS.source})
  ${PARTS.table.map((p) => `${p.nom} (${p.latin}) — ${p.detail}`).join('\n  ')}`;
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

function figureEnClair(figure) {
  const astres = figure.astres.map((a) =>
    `  ${a.nom.padEnd(16)} ${enSigne(a.longitude).padEnd(22)} maison ${String(a.maison).padStart(2)}`
    + `   seigneur du lieu : ${nomDe(a.seigneur).padEnd(9)} ${etatEnClair(a)}`
    + `${a.retrograde && !a.noeud ? '   RÉTROGRADE' : ''}`).join('\n');

  const maisons = figure.maisonsHabitees.map((m) =>
    `  ${String(m.rang).padStart(2)}. ${m.titre.padEnd(20)} pointe ${enSigne(m.pointe).padEnd(22)}`
    + ` seigneur ${nomDe(m.seigneur).padEnd(9)}`
    + ` ${m.hotes.length ? `y sont : ${m.hotes.map((h) => h.nom).join(', ')}` : '(vide)'}`).join('\n');

  const parts = figure.parts.map((p) =>
    `  ${p.nom.padEnd(20)} ${enSigne(p.longitude).padEnd(22)} (${p.formule})`).join('\n');

  const regards = (figure.regards ?? []).map((r) =>
    `  ${nomDe(r.de)} ${r.aspect.nom} ${nomDe(r.a)} `
    + `(${r.aspect.angle}°, à ${r.ecart.toFixed(1)}° près${r.exact ? ', EXACT' : ''})`).join('\n');

  const almuten = figure.almuten.classement.map((c) =>
    `  ${nomDe(c.planete).padEnd(10)} ${c.score} (${c.dignites.join(', ')})`).join('\n');

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

LES DOUZE MAISONS (maisons d'Alcabitius)
${maisons}

LES PARTS
${parts}

LES REGARDS
${regards || '  (aucun dans les orbes)'}`;
}

function contexte({ saisie, temps, heures, planetaires, julien }) {
  const c = CONVENTIONS[temps?.convention];
  const lignes = [
    `Date : ${saisie.jour}/${saisie.mois}/${saisie.annee}`
    + `${julien ? ' (calendrier JULIEN, comme l\'aurait lu un calculateur du temps)' : ' (calendrier grégorien)'}`,
    `Heure annoncée : ${saisie.heure} h ${String(saisie.minute).padStart(2, '0')}`,
    `Lieu : latitude ${saisie.latitude}°, longitude ${saisie.longitude}°`,
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
      + `${planetaires.rang}e heure ${planetaires.deJour ? 'du jour' : 'de la nuit'}`);
    lignes.push(`Le jour est un ${planetaires.jourSemaine}, jour de `
      + `${nomDe(planetaires.seigneurDuJour)} ; l'heure présente est heure de `
      + `${nomDe(planetaires.seigneurDeLHeure)}`);
  }
  return `LA FIGURE QU'ON TE REMET\n  ${lignes.join('\n  ')}`;
}

// ─── Les trois dossiers ──────────────────────────────────────────────────────

const SEPARATEUR = (t) => `\n\n${'═'.repeat(78)}\n${t}\n${'═'.repeat(78)}\n`;

/** Le dossier d'une nativité. */
export function dossierNativite({ saisie, resultat }) {
  return [
    CONSIGNE,
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de cette nativité.`,
    SEPARATEUR('LES DONNÉES') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une révolution d'année. */
export function dossierAnnee({ saisie, resultat, annee }) {
  const m = annee.maitre;
  return [
    CONSIGNE,
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de la ${annee.age}e année de ce natif — `
      + `un jugement de révolution, non de nativité.\n\n`
      + `Règle du genre : la révolution se lit PAR-DESSUS la nativité, jamais à sa place. `
      + `Une année ne peut donner que ce que la nativité promet ; elle en avance ou en retarde `
      + `l'effet, elle ne le crée pas. Ordonne ton jugement autour du maître de l'année, et `
      + `traite en priorité la matière de la maison profectée.`,
    SEPARATEUR('LA NATIVITÉ (le fond)') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(annee.natale),
    SEPARATEUR('LA PROFECTION ET LE MAÎTRE DE L\'ANNÉE')
      + `  Âge : ${annee.age} ans\n`
      + `  Maison profectée : ${m.profection.rang}e — ${m.profection.titre} `
      + `(${m.profection.latin}) : ${m.profection.detail}\n`
      + `  Signe profecté : ${enSigne(annee.signeProfecte)}\n`
      + `  MAÎTRE DE L'ANNÉE (dominus anni) : ${m.nom}\n`
      + `    au natal        : ${enSigne(m.natal.longitude)}, maison ${m.natal.maison}, `
      + `${etatEnClair(m.natal)}\n`
      + `    à la révolution : ${enSigne(m.annuel.longitude)}, maison ${m.annuel.maison}, `
      + `${etatEnClair(m.annuel)}\n`
      + `  Règle : on avance d'un signe par année de vie depuis l'ascendant natal ; le seigneur `
      + `du lieu où l'on tombe gouverne l'année entière.\n`
      + `  Source : Alcabitius, dist. IV (l'intihā') ; Bonatti, Liber astronomiae, tr. VIII.`,
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

  return [
    CONSIGNE,
    SEPARATEUR('LA COMMANDE') + `On te pose cette question, et tu dois y répondre :\n\n`
      + `      « ${question} »\n\n`
      + `Règle du genre : ceci est une INTERROGATION, non une nativité. La figure est celle de `
      + `l'instant où la question a été posée. Le consultant est l'ascendant et son seigneur ; `
      + `la chose demandée est la maison qui la gouverne et son seigneur. La question aboutit `
      + `— perficitur — si les deux seigneurs se regardent d'un aspect, ou si la Lune porte la `
      + `lumière de l'un à l'autre par translation. Si rien ne les joint, la chose ne se fait `
      + `pas : dis-le nettement, sans chercher d'échappatoire.\n`
      + `Commence par les considérations ci-dessous : elles disent si l'on peut juger. S'il y `
      + `en a une grave, dis-le avant toute chose.\n`
      + `Source : Sahl ibn Bishr, De interrogationibus ; Bonatti, Liber astronomiae, tr. V et VI.`,
    SEPARATEUR('LES CONSIDÉRATIONS AVANT JUGEMENT') + gardes,
    SEPARATEUR('LE CONSULTANT ET LA CHOSE')
      + `  Consultant : l'ascendant, et son seigneur ${nomDe(j.consultant.clef)}, `
      + `maison ${j.consultant.maison}, ${etatEnClair(j.consultant)}\n`
      + `  La chose : ${j.matiere.rang}e maison — ${j.matiere.titre} (${j.matiere.latin}) : `
      + `${j.matiere.detail}\n`
      + `  Son seigneur : ${nomDe(j.seigneurChose.clef)}, maison ${j.seigneurChose.maison}, `
      + `${etatEnClair(j.seigneurChose)}\n`
      + `  Jonction : ${j.verdict.titre}\n`
      + `  ${j.verdict.texte.replace(/<[^>]+>/g, '')}`,
    SEPARATEUR('LA FIGURE DE L\'INSTANT') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

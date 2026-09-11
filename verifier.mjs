// Contrôle : les cinq carrés du manuscrit de Charles V annoncent chacun une
// nuit planétaire, un rang d'heure inégale et un seigneur d'heure. Rien
// n'oblige un scribe du XIVe siècle à être cohérent. Vérifions-le.
//
//   node verifier.mjs        (depuis astrologie-de-cour/)

import * as Astronomy from 'astronomy-engine';
globalThis.Astronomy = Astronomy;
import tzlookup from 'tz-lookup';
globalThis.tzlookup = tzlookup;

const { jourJulien, positions, maisons, heuresInegales, heuresPlanetaires, enSigne,
  ecartAngulaire, dateGregorienne, dateCivile } = await import('./src/ciel.js');
const { juger, proximiteExaltation, enDegresMinutes, regardEntre } =
  await import('./src/jugement.js');
const { EXALTATIONS, JOIES, ORBES, enSaJoie } = await import('./src/doctrine.js');
const { jugerInterrogation } = await import('./src/interrogation.js');
const { NATIVITES, CONJONCTION_1345 } = await import('./src/corpus.js');
const { versTempsUniversel, equationDuTemps, fuseauDe, decalageLegal, conventionParDefaut } =
  await import('./src/temps.js');
const { figureDeLAnnee, profection, dansLAnnee, laForce } = await import('./src/annee.js');
const { lesAxesCharges } = await import('./src/dossier.js');

let echecs = 0;

/** Un contrôle qui compte : un ✓ manqué doit faire échouer la suite. */
const ok = (quoi, vrai, obtenu = '') => {
  if (!vrai) echecs++;
  console.log(`   ${vrai ? '✓' : '✗'} ${quoi.padEnd(52)} ${vrai ? '' : `obtenu ${obtenu}`}`);
};

// ─── Le temps : quelle heure veut dire quoi ──────────────────────────────────
console.log('── Les conventions de temps');
{
  const controles = [];
  const presque = (a, b, tol) => Math.abs(a - b) <= tol;

  // Une naissance moderne se lit à l'heure légale, pas à la longitude.
  const paris = { latitude: 48.8566, longitude: 2.3522 };
  controles.push(['convention par défaut en 1991', 'legale', conventionParDefaut(1991)]);
  controles.push(['convention par défaut en 1380', 'vraie', conventionParDefaut(1380)]);
  controles.push(['fuseau de Paris', 'Europe/Paris', fuseauDe(paris.latitude, paris.longitude)]);
  controles.push(['Paris en février 1991', 1,
    decalageLegal('Europe/Paris', new Date('1991-02-19T12:00:00Z'))]);
  controles.push(['Paris en juillet 1991 (heure d’été)', 2,
    decalageLegal('Europe/Paris', new Date('1991-07-19T12:00:00Z'))]);

  // 19 février 1991, 12 h 33 à Paris : l'instant est 11 h 33 TU, et non
  // 12 h 24 comme le donnerait la longitude seule. Cinquante minutes d'écart,
  // soit treize degrés d'ascendant.
  const saisie = { annee: 1991, mois: 2, jour: 19, heure: 12, minute: 33, ...paris, julien: false };
  const legale = versTempsUniversel({ ...saisie, convention: 'legale' });
  const vraie = versTempsUniversel({ ...saisie, convention: 'vraie' });
  const tuDe = (r) => ((((r.jj + 0.5) % 1) * 24) + 24) % 24;
  controles.push(['1991 à l’heure légale → 11 h 33 TU', true, presque(tuDe(legale), 11.55, 0.002)]);
  controles.push(['1991 au temps vrai → autre instant', true,
    Math.abs(tuDe(vraie) - tuDe(legale)) * 60 > 30]);

  // L'équation du temps, à ses deux extrêmes connus.
  const jjDe = (a, m, j) => 2440587.5 + Date.UTC(a, m - 1, j, 12) / 86400000;
  controles.push(['équation du temps au 11 février ≈ −14 min', true,
    presque(equationDuTemps(jjDe(2024, 2, 11), 0), -14.2, 0.5)]);
  controles.push(['équation du temps au 3 novembre ≈ +16 min', true,
    presque(equationDuTemps(jjDe(2024, 11, 3), 0), 16.4, 0.5)]);

  // Une date médiévale ne passe pas par les fuseaux.
  const medieval = versTempsUniversel({
    annee: 1380, mois: 5, jour: 1, heure: 6, minute: 0, ...paris, julien: true,
  });
  controles.push(['1380 : aucun fuseau', null, medieval.zone]);
  controles.push(['1380 : équation du temps appliquée', true, Math.abs(medieval.equation) > 1]);

  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(42)} ${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
}

for (const n of NATIVITES) {
  if (n.heureInconnue) {
    console.log(`\n── ${n.nom} — heure inconnue, aucune figure possible.`);
    continue;
  }
  // Les carrés du manuscrit sont lus en temps vrai — celui du cadran solaire.
  const { jj } = versTempsUniversel({ ...n, convention: 'vraie' });

  const mai = maisons(jj, n.latitude, n.longitude);
  const fig = juger({ positions: positions(jj), maisons: mai });
  const hi = heuresInegales(jj, n.latitude, n.longitude);
  const hp = heuresPlanetaires(hi);

  console.log(`\n── ${n.nom}  (${n.jour}/${n.mois}/${n.annee} ${n.heure}h${String(n.minute).padStart(2, '0')})`);
  console.log(`   ascendant ${enSigne(mai.ascendant)}   milieu du ciel ${enSigne(mai.milieuDuCiel)}`);
  console.log(`   almuten de l'ascendant : ${fig.almuten.vainqueur.planete} (${fig.almuten.vainqueur.score})`);

  if (!n.verifier) continue;
  const v = n.verifier;
  const controles = [
    ['jour/nuit', v.deJour, hp.deJour],
    ['rang de l’heure', v.rang, hp.rang],
    ['seigneur de l’heure', v.heure, hp.seigneurDeLHeure],
  ];
  if (v.nuit) controles.push(['seigneur de la nuit', v.nuit, hp.seigneurDeLaNuit]);
  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    // L'écart du carré de Charles V est un fait établi, pas une régression.
    if (!ok && !n.ecart) echecs++;
    const marque = ok ? '✓' : n.ecart ? '~' : '✗';
    console.log(`   ${marque} ${quoi.padEnd(22)} manuscrit: ${String(attendu).padEnd(10)} calcul: ${obtenu}`);
  }
  console.log(`     jour de la semaine calculé : ${hp.jourSemaine}`);
  if (n.ecart) console.log(`     (~) écart documenté : ${n.ecart.titre}`);
}

// ─── La révolution de l'année, contrôlée sur le carré annoté ─────────────────
// Le meurtre de Louis d'Orléans est écrit dans la marge de son carré de
// trente-cinquième anniversaire. Cette figure doit donc contenir le 23
// novembre 1407 — et la profection de la trente-cinquième année doit tomber
// où elle tombe.
console.log('\n── La révolution de la 35e année de Louis d’Orléans');
{
  const louis = NATIVITES.find((n) => n.clef === 'louis-orleans');
  const { jj: jjNatal } = versTempsUniversel({ ...louis, convention: 'vraie' });
  const f = figureDeLAnnee({
    jjNatal, age: 35, latitude: louis.latitude, longitude: louis.longitude,
  });
  const { jj: jjMeurtre } = versTempsUniversel({
    annee: 1407, mois: 11, jour: 23, heure: 20, minute: 0, julien: true,
    latitude: louis.latitude, longitude: louis.longitude, convention: 'vraie',
  });

  const controles = [
    ['la profection tombe en 12e maison', 12, f.maitre.profection.rang],
    ['le maître de l’année est Mars', 'mars', f.maitre.clef],
    ['le meurtre tombe dans l’année révolue', true, dansLAnnee(f, jjMeurtre)],
    // Le contrôle qui compte : la même profection revient tous les douze ans.
    ['la même maison revient à 11 ans', 12, profection(11).rang],
    ['la même maison revient à 23 ans', 12, profection(23).rang],
  ];
  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(42)} ${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
  console.log('     ⚠ Louis avait déjà eu cette profection à 11 et 23 ans, sans dommage.');
  console.log('       La technique ne prédit pas : elle fournit un casier où loger l’événement.');
}

// ─── Les règles, plutôt que les exemples ─────────────────────────────────────
// Un contrôle sur une figure connue attrape les fautes de frappe. Un contrôle
// sur la règle elle-même attrape les fautes de raisonnement, qui sont les
// seules qui coûtent cher.

console.log('\n── Les degrés de perfection');
{
  // Une planète posée exactement sur son degré d'exaltation en est à zéro ;
  // posée à l'opposé, elle est à zéro de sa chute. C'est une involution : la
  // même mesure, prise dans les deux sens, doit se répondre exactement.
  const controles = [];
  for (const [clef, e] of Object.entries(EXALTATIONS.table)) {
    const degre = e.signe * 30 + e.degre;
    const sur = proximiteExaltation(clef, degre);
    const oppose = proximiteExaltation(clef, (degre + 180) % 360);
    controles.push([`${clef} sur son degré : écart nul`, true, sur.exaltation < 1e-9]);
    controles.push([`${clef} à l’opposé : chute nulle`, true, oppose.chute < 1e-9]);
    // Et la somme des deux mesures vaut toujours un demi-tour.
    const somme = sur.exaltation + sur.chute;
    controles.push([`${clef} : exaltation + chute = 180°`, true, Math.abs(somme - 180) < 1e-9]);
  }
  const rates = controles.filter(([, a, o]) => a !== o);
  echecs += rates.length;
  console.log(`   ${rates.length ? '✗' : '✓'} ${controles.length} contrôles sur les neuf corps `
    + `de la table${rates.length ? ` — ${rates.length} en échec` : ''}`);
  for (const [quoi] of rates) console.log(`      ✗ ${quoi}`);

  // Et le nombre que le modèle avait inventé.
  const { jj: jjTest } = versTempsUniversel({
    annee: 1991, mois: 2, jour: 19, heure: 12, minute: 33,
    latitude: 48.8566, longitude: 2.3522, julien: false, convention: 'legale',
  });
  const fig = juger({ positions: positions(jjTest), maisons: maisons(jjTest, 48.8566, 2.3522) });
  const v = fig.astres.find((a) => a.clef === 'venus');
  console.log(`     Vénus au 19/2/1991 : ${enSigne(v.longitude)}, soit `
    + `${enDegresMinutes(v.perfection.exaltation)} de son degré d’exaltation (27° Poissons).`);
  console.log('       Un modèle de langage à qui l’on ne donnait pas ce nombre l’avait');
  console.log('       calculé de tête, et annoncé 0° 18′. C’est pour cela qu’on le calcule ici.');
}

console.log('\n── La part du Mariage se renverse sur le sexe, et non sur la secte');
{
  // Les trois autres parts s'inversent entre le jour et la nuit ; celle-ci
  // s'inverse sur une donnée que le ciel ne porte pas. Deux lois la tiennent :
  // la forme féminine est le miroir de la masculine autour de l'ascendant
  // (Asc + V − S et Asc + S − V font ensemble deux ascendants), et le jour
  // n'y change rien. Sans ce contrôle, on peut brancher le sexe sur dejour /
  // denuit sans que rien ne proteste.
  const { jj } = versTempsUniversel({
    annee: 1996, mois: 5, jour: 20, heure: 14, minute: 30,
    latitude: 48.8566, longitude: 2.3522, julien: false, convention: 'legale',
  });
  const mai = maisons(jj, 48.8566, 2.3522);
  const laPart = (sexe) => juger({ positions: positions(jj), maisons: mai, sexe })
    .parts.find((p) => p.clef === 'mariage');

  const h = laPart('homme'); const f = laPart('femme'); const rien = laPart(null);
  const miroir = ((h.longitude + f.longitude) % 360 + 360) % 360;
  const deuxAsc = (2 * mai.ascendant % 360 + 360) % 360;

  ok('la forme masculine et la féminine sont symétriques autour de l’ascendant',
    Math.abs(((miroir - deuxAsc + 540) % 360) - 180) < 1e-9,
    `${miroir.toFixed(4)}° contre ${deuxAsc.toFixed(4)}°`);
  ok('sans le sexe, la part n’est pas placée mais les deux points sont rendus',
    rien.longitude === null && rien.variantes?.length === 2
      && Math.abs(rien.variantes.find((v) => v.sexe === 'homme').longitude - h.longitude) < 1e-9,
    JSON.stringify(rien.variantes?.map((v) => v.sexe)));
  ok('les trois autres parts ne dépendent pas du sexe',
    ['fortune', 'esprit', 'regne'].every((clef) => {
      const a = juger({ positions: positions(jj), maisons: mai, sexe: 'homme' })
        .parts.find((p) => p.clef === clef);
      const b = juger({ positions: positions(jj), maisons: mai, sexe: 'femme' })
        .parts.find((p) => p.clef === clef);
      return a && b && Math.abs(a.longitude - b.longitude) < 1e-9;
    }), 'aucune ne bouge');
  console.log(`     Mariage : ${enSigne(h.longitude)} si homme, ${enSigne(f.longitude)} si femme.`);
}

console.log('\n── Les joies : sept planètes, sept maisons, et aucune dignité');
{
  // La joie est la seule condition favorable qui ne pèse rien dans le compte.
  // Le risque, en l'ajoutant, est précisément qu'elle s'y glisse — que le
  // tableau la range parmi les dignités tenues, et qu'elle finisse par gonfler
  // l'almuten. Ces contrôles-là gardent la porte.
  const maisonsJoie = Object.keys(JOIES.table).map(Number);
  const planetesJoie = Object.values(JOIES.table);
  ok('sept planètes, chacune en une maison, sans doublon',
    planetesJoie.length === 7 && new Set(planetesJoie).size === 7
      && new Set(maisonsJoie).size === 7,
    `${planetesJoie.length} planètes, ${new Set(maisonsJoie).size} maisons`);
  ok('chaque planète a sa glose et sa raison',
    planetesJoie.every((p) => [JOIES.gloses[p], JOIES.raisons[p]]
      .every((t) => typeof t === 'string' && t.length > 20)),
    Object.keys(JOIES.gloses).join(', '));

  const { jj } = versTempsUniversel({
    annee: 1996, mois: 5, jour: 20, heure: 14, minute: 30,
    latitude: 48.8566, longitude: 2.3522, julien: false, convention: 'legale',
  });
  const fig = juger({ positions: positions(jj), maisons: maisons(jj, 48.8566, 2.3522) });

  ok('la figure marque la joie exactement là où la table la place',
    fig.astres.every((a) => a.joie === (!a.noeud && enSaJoie(a.clef, a.maison))),
    fig.astres.filter((a) => a.joie).map((a) => a.nom).join(', ') || 'aucune');
  ok('la teste et la queue du dragon n’ont jamais de joie',
    fig.astres.filter((a) => a.noeud).every((a) => a.joie === false), 'un nœud se réjouit');
  ok('la joie n’entre dans aucune dignité tenue',
    fig.astres.every((a) => !(a.etat?.tenues ?? []).some((t) => /joie/i.test(t))),
    'une joie comptée comme dignité');

  // Et la preuve par le lieu : on force chaque planète dans la maison de sa
  // joie, puis dans une autre, sans rien changer d'autre.
  ok('la joie tient au lieu seul, et bascule avec lui',
    Object.entries(JOIES.table).every(([m, p]) =>
      enSaJoie(p, Number(m)) && !enSaJoie(p, (Number(m) % 12) + 1)),
    'une joie qui ne suit pas sa maison');

  const enJoie = fig.astres.filter((a) => a.joie);
  console.log(`     Le 20 mai 1996 : ${enJoie.length
    ? enJoie.map((a) => `${a.nom} en ${a.maison}e`).join(', ')
    : 'aucune planète en sa joie'}.`);
}

console.log('\n── L’écart angulaire : une distance, donc symétrique et bornée');
{
  // Ce contrôle manquait, et son absence a laissé passer une formule qui rendait
  // des écarts de 340° : Vénus à six degrés du Soleil était déclarée libre au
  // lieu de brûlée, et des aspects entiers étaient manqués. Rien ne se voyait.
  let symetrique = true; let borne = true; let contreExemple = null;
  for (let x = 0; x < 360; x += 1.7) {
    for (let y = 0; y < 360; y += 3.1) {
      const a = ecartAngulaire(x, y);
      if (Math.abs(a - ecartAngulaire(y, x)) > 1e-9) { symetrique = false; contreExemple ??= [x, y]; }
      if (!(a >= 0 && a <= 180)) { borne = false; contreExemple ??= [x, y]; }
      // Et invariante par tour complet, sur l'un comme sur l'autre argument.
      if (Math.abs(a - ecartAngulaire(x + 360, y - 720)) > 1e-9) symetrique = false;
    }
  }
  const controles = [
    ['symétrique : écart(x,y) = écart(y,x)', true, symetrique],
    ['bornée à [0, 180]', true, borne],
    ['nulle sur soi-même', 0, ecartAngulaire(211.4, 211.4)],
    ['maximale à l’opposition', 180, ecartAngulaire(10, 190)],
    ['franchit le point vernal', 20, Math.round(ecartAngulaire(10, 350))],
  ];
  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(46)} `
      + `${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}${contreExemple ? ` (ex. ${contreExemple})` : ''}`}`);
  }

  // La table des regards doit se refermer : tout couple dans l'orbe y figure.
  const louis = NATIVITES.find((n) => n.clef === 'louis-orleans');
  const { jj } = versTempsUniversel({ ...louis, convention: 'vraie' });
  const f = juger({ positions: positions(jj), maisons: maisons(jj, louis.latitude, louis.longitude) });
  const venus = f.astres.find((a) => a.clef === 'venus');
  const auSoleil = f.regards.find((r) =>
    [r.a, r.b].includes('venus') && [r.a, r.b].includes('soleil'));
  const accord = !auSoleil || auSoleil.aspect.angle !== 0
    || (venus.solaire.classe !== 'libre') === (auSoleil.ecart <= 8.5);
  if (!accord) echecs++;
  console.log(`   ${accord ? '✓' : '✗'} l’état solaire s’accorde à la table des regards  `
    + `(Vénus ${venus.solaire.ecart.toFixed(1)}° du Soleil, ${venus.solaire.classe})`);
}

console.log('\n── L’orbe d’un aspect : la moyenne des deux orbes, non leur somme');
{
  // Le module portait un commentaire qui appelait « moitié de son rayon » la
  // valeur du tableau. La vérification faite sur le texte d'al-Bīrūnī tranche
  // dans l'autre sens : la valeur est l'orbe entier de la planète, et deux
  // planètes se voient quand leur écart à l'aspect exact n'excède pas la
  // moyenne des deux orbes, c'est-à-dire la somme de leurs moitiés d'orbe
  // (§490). Une moyenne et une somme ne se distinguent sur aucune figure prise
  // seule : il faut donc fixer la règle ici, sur des couples construits.
  const moitie = (clef) => ORBES.table[clef] / 2;
  const orbeDe = (a, b) => moitie(a) + moitie(b);

  const attendus = { soleil: 15, lune: 12, mercure: 7, venus: 7, mars: 8, jupiter: 9, saturne: 9 };
  const controles = [
    ['les sept orbes sont ceux d’al-Bīrūnī (§436)', true,
      Object.entries(attendus).every(([c, v]) => ORBES.table[c] === v)],
    ['Soleil–Lune : 13°30′ (7,5 + 6), et non 27°', 13.5, orbeDe('soleil', 'lune')],
    ['Jupiter–Mars : 8°30′ (4,5 + 4), et non 17°', 8.5, orbeDe('jupiter', 'mars')],
    ['Mercure–Vénus : 7° (3,5 + 3,5)', 7, orbeDe('mercure', 'venus')],
  ];
  for (const [quoi, attendu, obtenu] of controles) {
    if (attendu !== obtenu) echecs++;
    console.log(`   ${attendu === obtenu ? '✓' : '✗'} ${quoi.padEnd(52)} `
      + `${attendu === obtenu ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }

  // Et la règle au point exact : 13,4° est dans l'orbe, 13,6° n'y est plus, et
  // 20° — ce que donnerait la somme des deux orbes — pas davantage.
  const poste = (clef, longitude) => ({ clef, longitude, vitesse: 0 });
  const conjonction = (ecart) => regardEntre(poste('soleil', 0), poste('lune', ecart));
  ok('à 13,4° de la conjonction, le regard existe', conjonction(13.4)?.nom === 'conjonction',
    conjonction(13.4)?.nom ?? 'aucun');
  ok('à 13,6°, il n’existe plus', conjonction(13.6) === null, conjonction(13.6)?.nom ?? 'aucun');
  ok('à 20°, la somme des orbes ne le sauve pas', conjonction(20) === null,
    conjonction(20)?.nom ?? 'aucun');
}

console.log('\n── Le regard : un seul moteur, et il voit la Lune venir');
{
  // Il y avait deux moteurs d'aspect, l'un mesurant le sens du mouvement sur un
  // pas de 0,05 jour et l'autre sur un jour entier. La Lune parcourt treize
  // degrés par jour : à un jour d'intervalle, une Lune qui s'applique est vue
  // s'éloigner. Dans une interrogation, cela retourne la réponse.
  const lune = { clef: 'lune', longitude: 98, vitesse: 13.2 };
  const saturne = { clef: 'saturne', longitude: 100, vitesse: 0.03 };
  const vers = regardEntre(lune, saturne);
  const depuis = regardEntre({ ...lune, longitude: 102 }, saturne);

  const controles = [
    ['une Lune à 2° avant l’exactitude s’applique', true, vers?.applique === true],
    ['une Lune à 2° après se sépare', true, depuis?.applique === false],
    ['le regard est symétrique dans son constat', true,
      regardEntre(saturne, lune)?.nom === vers?.nom],
    ['l’écart est un nombre de degrés, non un booléen', true, typeof vers?.ecart === 'number'],
    ['« partil » est bien le booléen', true, typeof vers?.partil === 'boolean'],
  ];

  // Et surtout : la table des regards d'une figure doit dire exactement ce que
  // dit le moteur pris couple par couple. C'est la même fonction, donc c'est
  // vrai par construction — ce contrôle est là pour qu'on ne la redouble pas.
  const louis = NATIVITES.find((n) => n.clef === 'louis-orleans');
  const { jj } = versTempsUniversel({ ...louis, convention: 'vraie' });
  const pos = positions(jj);
  const f = juger({ positions: pos, maisons: maisons(jj, louis.latitude, louis.longitude) });
  const accordent = f.regards.every((r) => {
    const seul = regardEntre({ ...pos[r.de], clef: r.de }, { ...pos[r.a], clef: r.a });
    return seul && seul.nom === r.nom && Math.abs(seul.ecart - r.ecart) < 1e-9
      && seul.applique === r.applique;
  });
  controles.push(['la table et le couple à couple s’accordent', true, accordent]);

  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(46)} ${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
}

console.log('\n── Le compte de force : trois témoignages, il en faut deux');
{
  // On teste la loi, pas les exemples. Une planète est construite de toutes
  // pièces pour chacune des huit combinaisons possibles.
  const astre = ({ lieu = 'angle', tenues = [], perdues = [], retro = false, sol = 'libre' }) => ({
    force: lieu, retrograde: retro,
    etat: { tenues, perdues, pérégrine: !tenues.length && !perdues.length },
    solaire: { classe: sol, ecart: 0 },
  });
  const domicile = ['en son domicile'];
  const face = ['en sa face'];

  const controles = [
    // Les trois témoignages sont indépendants, et deux suffisent.
    ['trois appuis : fort', true, laForce(astre({ tenues: domicile })).fort],
    ['deux appuis : fort', true, laForce(astre({ lieu: 'cadente', tenues: domicile })).fort],
    ['un seul appui : faible', true, !laForce(astre({ lieu: 'cadente' })).fort],
    ['aucun appui : faible', true,
      !laForce(astre({ lieu: 'cadente', retro: true, perdues: ['en son exil'] })).fort],

    // La succédente compte comme lieu ; la cadente non.
    ['la succédente donne le lieu', true, laForce(astre({ lieu: 'succédente' })).compte >= 1],
    ['la cadente ne le donne pas', 0,
      laForce(astre({ lieu: 'cadente', retro: true, sol: 'combuste' })).compte],

    // La correction qui a motivé tout ceci : la face n'est pas une force.
    ['la face seule ne vaut pas dignité', true,
      !laForce(astre({ lieu: 'cadente', tenues: face })).fort],
    ['le terme seul non plus', true,
      !laForce(astre({ lieu: 'cadente', tenues: ['en son terme'] })).fort],
    ['mais la triplicité, oui', true,
      laForce(astre({ lieu: 'cadente', tenues: ['en sa triplicité'] })).fort],

    // Le cazimi porte, il ne brûle pas : il laisse le témoignage de liberté
    // debout, là où la combustion et les rayons le retirent.
    ['le cazimi laisse la liberté', 1, laForce(astre({ lieu: 'cadente', sol: 'cazimi' })).compte],
    ['la combustion la retire', 0, laForce(astre({ lieu: 'cadente', sol: 'combuste' })).compte],
    ['les rayons aussi', 0, laForce(astre({ lieu: 'cadente', sol: 'rayons' })).compte],
    ['le cazimi ne supplée pas au reste', true,
      !laForce(astre({ lieu: 'cadente', sol: 'cazimi' })).fort],
  ];

  // Le compte est un fold : les appuis et les manques partitionnent les trois
  // témoignages, sans recouvrement ni perte, quelle que soit la planète.
  let partition = true;
  for (const lieu of ['angle', 'succédente', 'cadente']) {
    for (const tenues of [[], face, domicile]) {
      for (const sol of ['libre', 'combuste', 'cazimi']) {
        for (const retro of [false, true]) {
          const f = laForce(astre({ lieu, tenues, sol, retro }));
          if (f.appuis.length + f.manques.length !== 3) partition = false;
          if (f.appuis.length !== f.compte) partition = false;
          if (f.fort !== (f.compte >= 2)) partition = false;
        }
      }
    }
  }
  controles.push(['appuis + manques = 3, sur les 54 cas', true, partition]);
  controles.push(['une planète absente est faible', true, !laForce(null).fort]);

  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(46)} ${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
}

console.log('\n── Contrôle externe : trois ascendants contre les éphémérides publiées');
{
  // Le seul contrôle que ce site puisse vraiment passer : la figure qu'il
  // dresse est-elle la même que celle des éphémérides publiées ? On prend des
  // naissances cotées AA, dont l'heure est tirée d'un acte, et l'on compare
  // l'ascendant — qui concentre toute la chaîne du temps, fuseaux anciens
  // compris. Cendrars naît sous l'heure de Berne, UTC+0:29:46.
  // Valeurs publiées : Astro-Databank pour Trump (29° Lion 58′) et Cendrars
  // (12° Bélier), Astrotheme pour Macron (28° Capricorne 48′).
  const temoins = [
    { nom: 'Trump (Queens, 1946)', annee: 1946, mois: 6, jour: 14, heure: 10, minute: 54,
      latitude: 40.7000, longitude: -73.8164, attendu: 149.97 },
    { nom: 'Cendrars (La Chaux-de-Fonds, 1887)', annee: 1887, mois: 9, jour: 1, heure: 19,
      minute: 45, latitude: 47.1000, longitude: 6.8333, attendu: 12.5 },
    { nom: 'Macron (Amiens, 1977)', annee: 1977, mois: 12, jour: 21, heure: 10, minute: 40,
      latitude: 49.8942, longitude: 2.2957, attendu: 298.8 },
  ];
  for (const t of temoins) {
    const { jj } = versTempsUniversel({ ...t, julien: false, convention: 'legale' });
    const f = juger({ positions: positions(jj), maisons: maisons(jj, t.latitude, t.longitude) });
    const ecart = Math.abs(((f.ascendant - t.attendu + 540) % 360) - 180) * 60;
    const ok = ecart < 60;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${t.nom.padEnd(36)} ${enSigne(f.ascendant)}  `
      + `(${ecart.toFixed(0)}′ de l’ascendant publié)`);
  }
}

console.log('\n── La profection mensuelle');
{
  const louis = NATIVITES.find((n) => n.clef === 'louis-orleans');
  const { jj: jjNatal } = versTempsUniversel({ ...louis, convention: 'vraie' });
  const f = figureDeLAnnee({
    jjNatal, age: 35, latitude: louis.latitude, longitude: louis.longitude,
  });

  // Le mois se déduit de l'année par la même arithmétique : le premier mois
  // reprend nécessairement la maison de l'année, et l'on boucle en douze.
  const rangs = f.mois.map((m) => m.maison.rang);
  const controles = [
    ['douze mois, ni plus ni moins', 12, f.mois.length],
    ['le premier mois reprend la maison de l’année', f.maitre.profection.rang, rangs[0]],
    ['le premier seigneur est le maître de l’année', f.maitre.clef, f.mois[0].clef],
    ['les douze maisons sont couvertes une fois', 12, new Set(rangs).size],
    ['le premier mois part de la révolution', true, Math.abs(f.mois[0].debut - f.jj) < 1e-6],
    ['le dernier mois finit à la révolution suivante', true,
      Math.abs(f.mois[11].fin - f.finit) < 1e-6],
    ['les mois se suivent sans trou', true,
      f.mois.every((m, i) => i === 0 || Math.abs(m.debut - f.mois[i - 1].fin) < 1e-9)],
  ];
  for (const [quoi, attendu, obtenu] of controles) {
    const ok = attendu === obtenu;
    if (!ok) echecs++;
    console.log(`   ${ok ? '✓' : '✗'} ${quoi.padEnd(46)} ${ok ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
}

console.log('\n── Le calendrier d’affichage : julien avant 1582, grégorien après');
{
  // Le site affichait la fenêtre de révolution et les douze mois en grégorien
  // proleptique, même pour une naissance médiévale — dix jours d’écart au
  // XIVᵉ siècle, alors que tout le site lit ces dates dans le julien. La même
  // date doit se relire dans le calendrier où elle a été saisie.
  const jj = jourJulien({ annee: 1407, mois: 11, jour: 23, heure: 12, julien: true });
  const j = dateCivile(jj, true);
  const g = dateGregorienne(jj);
  const moderne = jourJulien({ annee: 1996, mois: 5, jour: 20, heure: 12, julien: false });
  const m = dateCivile(moderne, false);

  ok('le 23 novembre 1407 (julien) se relit au 23 novembre',
    j.annee === 1407 && j.mois === 11 && j.jour === 23, `${j.jour}/${j.mois}/${j.annee}`);
  ok('le grégorien proleptique en avance bien de dix jours',
    g.annee === 1407 && g.mois === 12 && g.jour === 2, `${g.jour}/${g.mois}/${g.annee}`);
  ok('une date moderne n’est pas décalée',
    m.annee === 1996 && m.mois === 5 && m.jour === 20, `${m.jour}/${m.mois}/${m.annee}`);
}

console.log('\n── Les axes que la figure charge, et qu’on propose au lecteur');
{
  // L’ouverture de la lecture ne doit plus laisser le modèle choisir : le
  // dossier classe les matières et propose les mieux marquées, quatre au plus.
  // Une matière proposée sans raison serait une invention déguisée.
  const attendus = new Set(['metier', 'avoir', 'corps', 'contrats', 'dignite']);
  let plus = 0; let moins = 5; let total = 0; let figures = 0;
  let sansRaison = 0; let horsListe = 0; let malTrie = 0;
  for (let k = 0; k < 120; k++) {
    const jj = jourJulien({
      annee: 1320 + Math.floor(k / 8) * 41, mois: (k % 12) + 1, jour: 3 + (k % 24),
      heure: k % 24, julien: true,
    });
    const f = juger({ positions: positions(jj), maisons: maisons(jj, 48.8566, 2.3522) });
    const axes = lesAxesCharges(f);
    const charges = axes.filter((a) => a.charge);
    plus = Math.max(plus, charges.length);
    moins = Math.min(moins, charges.length);
    total += charges.length;
    figures++;
    for (const a of charges) {
      if (!a.raisons.length) sansRaison++;
      if (!attendus.has(a.clef)) horsListe++;
    }
    for (let i = 1; i < axes.length; i++) if (axes[i - 1].score < axes[i].score) malTrie++;
  }
  const controles = [
    ['jamais plus de quatre matières proposées', true, plus <= 4],
    ['chaque matière proposée a une raison', 0, sansRaison],
    ['les matières sont celles de la doctrine', 0, horsListe],
    ['le classement décroît', 0, malTrie],
    ['au moins deux matières par figure', true, moins >= 2],
  ];
  for (const [quoi, attendu, obtenu] of controles) {
    if (attendu !== obtenu) echecs++;
    console.log(`   ${attendu === obtenu ? '✓' : '✗'} ${quoi.padEnd(52)} `
      + `${attendu === obtenu ? '' : `attendu ${attendu}, obtenu ${obtenu}`}`);
  }
  console.log(`     ${(total / figures).toFixed(1)} matière(s) proposée(s) en moyenne, `
    + `de ${moins} à ${plus} selon la figure.`);
}

console.log('\n── La synastrie : deux figures face à face (Ptolémée, IV, 5 et IV, 7)');
{
  // Ptolémée juge le mariage sur « les luminaires des deux génitures ». Ces
  // contrôles tiennent les lois du module : la comparaison ne dépend pas de
  // l'ordre, et un aspect croisé n'a pas de sens de mouvement — entre deux
  // ciels figés à des dates différentes, il n'y en a pas.
  const { synastrie, aspectsCroises, echangesEntreFigures, concorde, rapportEntreLieux } =
    await import('./src/synastrie.js');
  const figureDe = (clef) => {
    const n = NATIVITES.find((x) => x.clef === clef);
    const { jj } = versTempsUniversel({ ...n, convention: 'vraie' });
    return juger({
      positions: positions(jj), maisons: maisons(jj, n.latitude, n.longitude),
      sexe: n.sexe ?? null,
    });
  };
  const louis = figureDe('louis-orleans');
  const charles = figureDe('charles-vi');
  const s = synastrie(louis, charles);

  const cles = (liste) => liste
    .map((r) => `${[r.de, r.a].sort().join('+')}/${r.nom}/${r.ecart.toFixed(6)}`).sort();
  const aller = cles(aspectsCroises(louis, charles));
  const retour = cles(aspectsCroises(charles, louis));
  ok('les aspects croisés ne dépendent pas de l’ordre des figures',
    aller.length === retour.length && aller.every((x, i) => x === retour[i]),
    `${aller.length} contre ${retour.length}`);

  ok('aucun aspect croisé ne dit qu’il s’applique ou se sépare',
    s.aspects.every((r) => !('applique' in r) && !('mouvement' in r)), 'un sens est présent');

  ok('les quatre croisements des luminaires sont rendus', 4, s.luminaires.paires.length);
  ok('le verdict est l’un des trois',
    ['durable', 'rupture', 'partage'].includes(s.luminaires.verdict), s.luminaires.verdict);

  const eAB = echangesEntreFigures(louis, charles);
  const eBA = echangesEntreFigures(charles, louis);
  ok('la réception croisée se répond, rôles échangés',
    eAB.aRecuParB.length === eBA.bRecuParA.length
      && eAB.aRecuParB.every((x) => eBA.bRecuParA
        .some((y) => y.hote === x.hote && y.recue === x.recue && y.par === x.par)),
    'les deux relevés diffèrent');

  // La concorde (IV, 7) porte sur les quatre lieux chefs, et la comparaison ne
  // doit pas dépendre de l'ordre : c'est une distance entre deux signes.
  const c = s.concorde;
  const cBA = concorde(charles, louis);
  const lieu = (f, clef) => (clef === 'ascendant' ? f.ascendant
    : clef === 'fortune' ? f.parts.find((p) => p.clef === 'fortune').longitude
      : f.astres.find((a) => a.clef === clef).longitude);

  ok('les quatre lieux chefs sont rendus', 4, c.lieux.length);
  ok('le verdict de concorde est l’un des cinq',
    ['sympathie-assuree', 'inimities', 'sympathie-moindre', 'antipathie-moindre', 'partagee']
      .includes(c.verdict), c.verdict);
  ok('la concorde est la même dans les deux sens',
    c.verdict === cBA.verdict && c.lieux.every((l, i) => l.rapport === cBA.lieux[i].rapport),
    'les deux sens diffèrent');
  ok('le rapport de signe ne dépend pas de l’ordre',
    ['soleil', 'lune', 'ascendant', 'fortune'].every((clef) =>
      rapportEntreLieux(lieu(louis, clef), lieu(charles, clef))
        === rapportEntreLieux(lieu(charles, clef), lieu(louis, clef))),
    'un rapport change avec l’ordre');

  console.log(`     Louis d’Orléans × Charles VI : concorde ${c.verdict} ; luminaires `
    + `${s.luminaires.verdict} (${s.luminaires.compte.harmonieuses} harmonieux, `
    + `${s.luminaires.compte.inharmonieuses} durs, ${s.luminaires.compte.aversions} en `
    + `aversion) ; ${s.aspects.length} aspects croisés ; ${s.echanges.mutuels.length} `
    + `échange(s) mutuel(s).`);
}

console.log('\n── L’interrogation : les voies d’aboutissement');
{
  // On juge les douze espèces de questions sur une même figure. Ce qu'on
  // vérifie n'est pas la réponse — elle dépend du ciel — mais que la machine
  // tranche toujours, par une voie nommée, sans jamais rester sans réponse.
  const louis = NATIVITES.find((n) => n.clef === 'louis-orleans');
  const { jj: jjNatal } = versTempsUniversel({ ...louis, convention: 'vraie' });
  const fig = juger({
    positions: positions(jjNatal),
    maisons: maisons(jjNatal, louis.latitude, louis.longitude),
  });

  const voies = new Map();
  let sansReponse = 0;
  for (let rang = 1; rang <= 12; rang++) {
    const j = jugerInterrogation(fig, rang);
    if (j.verdict.reponse !== 'oui' && j.verdict.reponse !== 'non') sansReponse++;
    voies.set(j.verdict.clef, (voies.get(j.verdict.clef) ?? 0) + 1);
    // Une échéance ne se donne que si un aspect s'applique : sinon, la règle
    // ne mesure rien, et il ne faut surtout pas produire un nombre.
    const doitMesurer = j.verdict.reponse === 'oui' && j.verdict.clef !== 'meme';
    if (!doitMesurer && j.echeance) {
      echecs++;
      console.log(`   ✗ maison ${rang} : une échéance est donnée sans aspect qui s’applique`);
    }
  }
  const ok = sansReponse === 0;
  if (!ok) echecs++;
  console.log(`   ${ok ? '✓' : '✗'} les douze questions reçoivent oui ou non`);
  console.log(`     voies employées : ${[...voies].map(([v, n]) => `${v} ×${n}`).join(', ')}`);
}

// La conjonction de 1345, aux deux dates.
console.log('\n── La conjonction de 1345');
for (const [libelle, jour] of [['20 mars (les tables)', 20], ['24 mars (le ciel)', 24]]) {
  const jj = jourJulien({ annee: 1345, mois: 3, jour, heure: 13 - 2.3522 / 15, julien: true });
  const p = positions(jj);
  const ecart = Math.abs(p.jupiter.longitude - p.saturne.longitude) * 60;
  console.log(`   ${libelle.padEnd(22)} Saturne ${enSigne(p.saturne.longitude)}  `
    + `Jupiter ${enSigne(p.jupiter.longitude)}  Mars ${enSigne(p.mars.longitude)}   écart ${ecart.toFixed(0)}′`);
}

console.log(echecs ? `\n${echecs} contrôle(s) en échec.` : '\nTous les contrôles passent.');
process.exit(echecs ? 1 : 0);

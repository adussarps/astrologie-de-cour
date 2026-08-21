// Contrôle : les cinq carrés du manuscrit de Charles V annoncent chacun une
// nuit planétaire, un rang d'heure inégale et un seigneur d'heure. Rien
// n'oblige un scribe du XIVe siècle à être cohérent. Vérifions-le.
//
//   node verifier.mjs        (depuis astrologie-de-cour/)

import * as Astronomy from 'astronomy-engine';
globalThis.Astronomy = Astronomy;
import tzlookup from 'tz-lookup';
globalThis.tzlookup = tzlookup;

const { jourJulien, positions, maisons, heuresInegales, heuresPlanetaires, enSigne, ecartAngulaire,
  syzygiePrecedente } = await import('./src/ciel.js');
const { laDureeDeVie } = await import('./src/vie.js');
const { juger, proximiteExaltation, enDegresMinutes, regardEntre } =
  await import('./src/jugement.js');
const { EXALTATIONS } = await import('./src/doctrine.js');
const { jugerInterrogation } = await import('./src/interrogation.js');
const { NATIVITES, CONJONCTION_1345 } = await import('./src/corpus.js');
const { versTempsUniversel, equationDuTemps, fuseauDe, decalageLegal, conventionParDefaut } =
  await import('./src/temps.js');
const { figureDeLAnnee, profection, dansLAnnee, laForce } = await import('./src/annee.js');

let echecs = 0;

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

console.log('\n── La syzygie qui précède la naissance');
{
  // Deux lois suffisent, et elles se vérifient sans éphéméride de contrôle :
  // la syzygie tombe avant la naissance et pas plus de trente jours avant
  // (le mois synodique en fait 29,53), et les deux luminaires y sont soit au
  // même degré, soit dos à dos. Le piège que cela attrape est réel : chercher
  // la phase dans une seule fenêtre de quarante jours rend parfois
  // l'avant-dernière syzygie, ce qui décale le hyleg d'al-Qabīṣī d'un mois.
  const ok = (quoi, vrai, obtenu) => console.log(
    `   ${vrai ? '✓' : '✗'} ${quoi.padEnd(58)} ${vrai ? '' : `obtenu ${obtenu}`}`);

  let avant = true; let recente = true; let alignee = true; let pire = 0;
  for (let annee = 1300; annee <= 2000; annee += 37) {
    for (const [mois, jour] of [[1, 8], [4, 19], [7, 3], [10, 27]]) {
      const jj = jourJulien({ annee, mois, jour, heure: 9, julien: annee < 1582 });
      const s = syzygiePrecedente(jj);
      if (!s) { avant = false; continue; }
      const age = jj - s.jj;
      if (!(age > 0)) avant = false;
      if (!(age < 29.6)) { recente = false; pire = Math.max(pire, age); }
      const ecart = ecartAngulaire(s.soleil, s.lune);
      const attendu = s.conjonction ? 0 : 180;
      if (Math.abs(ecart - attendu) > 0.05) alignee = false;
    }
  }
  ok('la syzygie tombe toujours avant la naissance', avant, 'une syzygie postérieure');
  ok('et jamais plus d’un mois synodique avant', recente, `${pire.toFixed(1)} jours`);
  ok('les luminaires y sont conjoints ou opposés à 3′ près', alignee, 'désalignement');

  const s = syzygiePrecedente(jourJulien({ annee: 1996, mois: 5, jour: 20, heure: 12.5 }));
  console.log(`     20/5/1996 : ${s.nom} trois jours plus tôt, à ${enSigne(s.longitude)}.`);
}

console.log('\n── Le hyleg : deux auteurs, deux marches, et l’écart qu’on ne chiffre pas');
{
  // Ce bloc ne contrôle aucune durée de vie — il n'y en a pas. Il contrôle que
  // les deux marches sont bien deux, c'est-à-dire qu'on n'a pas écrit deux fois
  // la même règle sous deux noms. Une divergence attestée vaut donc ici comme
  // un résultat positif : c'est elle qu'on publie.
  const ok = (quoi, vrai, obtenu) => console.log(
    `   ${vrai ? '✓' : '✗'} ${quoi.padEnd(58)} ${vrai ? '' : `obtenu ${obtenu}`}`);

  const louis = NATIVITES.find((n) => /Louis/.test(n.nom));
  const { jj } = versTempsUniversel({
    annee: louis.annee, mois: louis.mois, jour: louis.jour,
    heure: louis.heure, minute: louis.minute, julien: true,
    latitude: louis.latitude, longitude: louis.longitude, convention: 'vraie',
  });
  const f = juger({ positions: positions(jj), maisons: maisons(jj, louis.latitude, louis.longitude) });
  const v = laDureeDeVie(f, syzygiePrecedente(jj));

  const [ptol, alca] = v.marches;
  // Aucun luminaire n'est en lieu prorogatif : Ptolémée passe donc à la planète
  // qui domine le Soleil, la syzygie et l'ascendant, et c'est Mercure. Chez
  // al-Qabīṣī rien ne convient — luminaires mal logés, syzygie et Fortune
  // cadentes — et le hyleg échoit au degré de l'ascendant, en dernier recours.
  ok('Ptolémée, faute de luminaire bien logé, prend le dominateur : Mercure',
    ptol.clef === 'mercure', ptol.clef);
  ok('al-Qabīṣī, faute de tout, échoit au degré de l’ascendant',
    alca.clef === 'ascendant', alca.clef);
  ok('les deux ne partent donc pas du même point', !v.accord.memePoint, 'accord');
  ok('ni ne nomment le même donneur d’années', !v.accord.memeDonneur, 'accord');
  ok('trois planètes différentes sont nommées pour donner les années',
    v.donneurs.length === 3, `${v.donneurs.length} : ${v.donneurs.join(', ')}`);

  // La loi qui compte : tout hyleg élu doit avoir un alcocoden nommé, ou être
  // déclaré incomplet. Un hyleg dont l'alcocoden serait « undefined » passerait
  // inaperçu à l'écran et ferait dire n'importe quoi au modèle.
  let complet = true;
  for (let annee = 1320; annee <= 2000; annee += 23) {
    const q = jourJulien({ annee, mois: 6, jour: 11, heure: 15, julien: annee < 1582 });
    const g = juger({ positions: positions(q), maisons: maisons(q, 48.8566, 2.3522) });
    const w = laDureeDeVie(g, syzygiePrecedente(q));
    for (const m of w.marches) {
      if (!Number.isFinite(m.longitude)) { complet = false; break; }
      for (const a of m.alcocodens) if (!a.elu && !a.incomplet) complet = false;
    }
  }
  ok('tout hyleg a un alcocoden nommé, ou est déclaré incomplet', complet, 'un trou');

  console.log(`     Louis d’Orléans : Ptolémée part de ${ptol.nom} ; al-Qabīṣī, ${alca.nom}.`);
  console.log(`     Donneurs d’années nommés : ${v.donneurs.join(', ')} — `
    + `${v.donneurs.length} planètes pour un seul ciel.`);
  console.log('       Il a été assassiné à trente-cinq ans, et aucune de ces marches');
  console.log('       ne l’annonçait. C’est pour cela qu’aucun nombre n’est rendu.');
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

  const ok = (quoi, vrai, obtenu) => console.log(
    `   ${vrai ? '✓' : '✗'} ${quoi.padEnd(58)} ${vrai ? '' : `obtenu ${obtenu}`}`);

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
    ['fortune', 'ame', 'dignite'].every((clef) => {
      const a = juger({ positions: positions(jj), maisons: mai, sexe: 'homme' })
        .parts.find((p) => p.clef === clef);
      const b = juger({ positions: positions(jj), maisons: mai, sexe: 'femme' })
        .parts.find((p) => p.clef === clef);
      return !a || !b || Math.abs(a.longitude - b.longitude) < 1e-9;
    }), 'aucune ne bouge');
  console.log(`     Mariage : ${enSigne(h.longitude)} si homme, ${enSigne(f.longitude)} si femme.`);
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

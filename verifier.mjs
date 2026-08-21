// Contrôle : les cinq carrés du manuscrit de Charles V annoncent chacun une
// nuit planétaire, un rang d'heure inégale et un seigneur d'heure. Rien
// n'oblige un scribe du XIVe siècle à être cohérent. Vérifions-le.
//
//   node verifier.mjs        (depuis astrologie-de-cour/)

import * as Astronomy from 'astronomy-engine';
globalThis.Astronomy = Astronomy;
import tzlookup from 'tz-lookup';
globalThis.tzlookup = tzlookup;

const { jourJulien, positions, maisons, heuresInegales, heuresPlanetaires, enSigne } =
  await import('./src/ciel.js');
const { juger } = await import('./src/jugement.js');
const { NATIVITES, CONJONCTION_1345 } = await import('./src/corpus.js');
const { versTempsUniversel, equationDuTemps, fuseauDe, decalageLegal, conventionParDefaut } =
  await import('./src/temps.js');

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

// La conjonction de 1345, aux deux dates.
console.log('\n── La conjonction de 1345');
for (const [libelle, jour] of [['20 mars (les tables)', 20], ['24 mars (le ciel)', 24]]) {
  const jj = jourJulien({ annee: 1345, mois: 3, jour, heure: 13 - 2.3522 / 15, julien: true });
  const p = positions(jj);
  const ecart = Math.abs(p.jupiter.longitude - p.saturne.longitude) * 60;
  console.log(`   ${libelle.padEnd(22)} Saturne ${enSigne(p.saturne.longitude)}  `
    + `Jupiter ${enSigne(p.jupiter.longitude)}  Mars ${enSigne(p.mars.longitude)}   écart ${ecart.toFixed(0)}′`);
}
void CONJONCTION_1345;

console.log(echecs ? `\n${echecs} contrôle(s) en échec.` : '\nTous les contrôles passent.');
process.exit(echecs ? 1 : 0);

// Contrôle : les cinq carrés du manuscrit de Charles V annoncent chacun une
// nuit planétaire, un rang d'heure inégale et un seigneur d'heure. Rien
// n'oblige un scribe du XIVe siècle à être cohérent. Vérifions-le.
//
//   node verifier.mjs        (depuis astrologie-de-cour/)

import * as Astronomy from 'astronomy-engine';
globalThis.Astronomy = Astronomy;

const { jourJulien, positions, maisons, heuresInegales, heuresPlanetaires, enSigne } =
  await import('./src/ciel.js');
const { juger } = await import('./src/jugement.js');
const { NATIVITES, CONJONCTION_1345 } = await import('./src/corpus.js');

let echecs = 0;

for (const n of NATIVITES) {
  if (n.heureInconnue) {
    console.log(`\n── ${n.nom} — heure inconnue, aucune figure possible.`);
    continue;
  }
  const heureLocale = n.heure + n.minute / 60;
  const jj = jourJulien({
    annee: n.annee, mois: n.mois, jour: n.jour,
    heure: heureLocale - n.longitude / 15, julien: n.julien,
  });

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

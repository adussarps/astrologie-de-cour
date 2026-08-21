// Test de fumée : charger l'application hors navigateur, avec un document
// factice, et vérifier que chaque vue produit bien du HTML sans lever.
//
//   node fumee.mjs

import * as Astronomy from 'astronomy-engine';
globalThis.Astronomy = Astronomy;
import tzlookup from 'tz-lookup';
globalThis.tzlookup = tzlookup;

const ecrits = new Map();
const VALEURS = { '#annee': '1991', '#mois': '2', '#jour': '19' };
const faireElement = (nom) => ({
  nom,
  value: VALEURS[nom] ?? '',
  _html: '',
  get innerHTML() { return this._html; },
  set innerHTML(v) { this._html = v; ecrits.set(nom, v); },
  set textContent(v) { ecrits.set(nom, v); },
  dataset: {},
  hidden: false,
  classList: { toggle: () => {}, contains: () => false, add: () => {}, remove: () => {} },
  setAttribute: () => {},
  removeAttribute: () => {},
  getAttribute: () => null,
  addEventListener: () => {},
  scrollIntoView: () => {},
  click: () => {},
  closest: () => null,
});

const elements = new Map();
globalThis.document = {
  querySelector: (s) => elements.get(s) ?? (elements.set(s, faireElement(s)), elements.get(s)),
  querySelectorAll: () => [],
};
globalThis.window = { scrollTo: () => {} };

await import('./src/app.js');

// Les vues qui se peuplent au chargement.
// #lieux ne se peuple qu'à la saisie : la liste des lieux n'est plus figée.
const attendus = ['#convention', '#note-calendrier', '#galerie', '#autres-pieces',
  '#tables-doctrine', '#reserves'];
let echecs = 0;
for (const clef of attendus) {
  const contenu = ecrits.get(clef);
  const ok = typeof contenu === 'string' && contenu.length > 20;
  if (!ok) echecs++;
  console.log(`${ok ? '✓' : '✗'} ${clef.padEnd(20)} ${contenu ? `${contenu.length} car.` : 'vide'}`);
}

// Et les deux rendus lourds : une nativité complète, et le refus sans heure.
const { NATIVITES, CONJONCTION_1345 } = await import('./src/corpus.js');
const { carre } = await import('./src/figure.js');
const { juger } = await import('./src/jugement.js');
const { jourJulien, positions, maisons } = await import('./src/ciel.js');

for (const n of [...NATIVITES, CONJONCTION_1345]) {
  if (n.heureInconnue) continue;
  const jj = jourJulien({
    annee: n.annee, mois: n.mois, jour: n.jour,
    heure: n.heure + n.minute / 60 - n.longitude / 15, julien: n.julien,
  });
  const svg = carre(juger({ positions: positions(jj), maisons: maisons(jj, n.latitude, n.longitude) }),
    { titre: n.nom, lignes: [`${n.jour}.${n.mois}.${n.annee}`] });
  const douzeMaisons = (svg.match(/class="pointe"/g) ?? []).length === 12;
  const cartouche = svg.includes('cartouche-titre');
  const ok = svg.startsWith('<svg') && douzeMaisons && cartouche;
  if (!ok) echecs++;
  console.log(`${ok ? '✓' : '✗'} carré ${n.clef.padEnd(20)} ${svg.length} car., `
    + `${(svg.match(/class="pointe"/g) ?? []).length} pointes`);
}

console.log(echecs ? `\n${echecs} échec(s).` : '\nTout se rend sans erreur.');
process.exit(echecs ? 1 : 0);

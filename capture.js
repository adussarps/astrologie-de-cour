// Capture d'écran des trois vues, via Chrome en mode DevTools.
// Sert aussi de contrôle : toute erreur de console est rapportée.
//   node capture.js  (le site doit être servi sur :8765)

const BASE = process.env.BASE ?? 'http://localhost:8765';
const CIBLE = process.argv[2] ?? 'officine';

const point = await (await fetch('http://127.0.0.1:9222/json/new?' + BASE,
  { method: 'PUT' })).json();
const ws = new WebSocket(point.webSocketDebuggerUrl);
let id = 0;
const attente = new Map();
const erreurs = [];

ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && attente.has(m.id)) { attente.get(m.id)(m.result); attente.delete(m.id); }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    erreurs.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  }
  if (m.method === 'Runtime.exceptionThrown') {
    erreurs.push(m.params.exceptionDetails.exception?.description
      ?? m.params.exceptionDetails.text);
  }
};

const envoyer = (method, params = {}) => new Promise((res) => {
  const n = ++id;
  attente.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params }));
});

await new Promise((r) => { ws.onopen = r; });
await envoyer('Runtime.enable');
await envoyer('Page.enable');
await envoyer('Network.enable');
await envoyer('Network.setCacheDisabled', { cacheDisabled: true });
await envoyer('Page.reload', { ignoreCache: true });
await envoyer('Emulation.setDeviceMetricsOverride',
  { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });

await new Promise((r) => setTimeout(r, 2500));

const script = {
  officine: `document.querySelector('#heure').value = 14;
             document.querySelector('#minute').value = 30;
             document.querySelector('#formulaire').requestSubmit(); 'ok'`,
  'sans-heure': `document.querySelector('#sans-heure').click(); 'ok'`,
  lieu: `const c = document.querySelector('#lieu');
         c.focus(); c.value = 'Orth';
         c.dispatchEvent(new Event('input', { bubbles: true })); 'ok'`,
  nativites: `document.querySelector('[data-vue=nativites]').click();
              document.querySelector('#galerie button').click(); 'ok'`,
  methode: `document.querySelector('[data-vue=methode]').click(); 'ok'`,
  annee: `document.querySelector('#heure').value = 14;
          document.querySelector('#minute').value = 30;
          document.querySelector('[data-vue=questions]').click();
          document.querySelector('#formulaire-annee').requestSubmit(); 'ok'`,
  question: `document.querySelector('[data-vue=questions]').click();
             document.querySelector('#demande').value = '0';
             document.querySelector('#formulaire-question').requestSubmit(); 'ok'`,
  sources: `document.querySelector('[data-vue=sources]').click(); 'ok'`,
}[CIBLE];

const r = await envoyer('Runtime.evaluate', { expression: script, returnByValue: true });
if (r.exceptionDetails) erreurs.push(r.exceptionDetails.exception?.description);
await new Promise((res) => setTimeout(res, 1800));

// Un second argument = un sélecteur à cadrer plutôt que la page entière.
const selecteur = process.argv[3];
let clip;
let h;
if (selecteur) {
  const boite = await envoyer('Runtime.evaluate', {
    expression: `(() => { const r = document.querySelector(${JSON.stringify(selecteur.replace(/^~/, ''))})
      .getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; })()`,
    returnByValue: true,
  });
  const b = boite.result.value;
  // Un sélecteur préfixé de « ~ » cadre une bande pleine largeur à partir de
  // l'élément, ce qui est plus lisible qu'un élément isolé.
  clip = selecteur.startsWith('~')
    ? { x: 0, y: Math.max(0, b.y - 30), width: 1280, height: 760, scale: 1.6 }
    : { ...b, scale: 2 };
  h = Math.ceil(clip.y + clip.height) + 40;
} else {
  const metrics = await envoyer('Page.getLayoutMetrics');
  h = Math.min(Math.ceil(metrics.cssContentSize.height), 7000);
}
// Au-delà d'une certaine surface, Chrome renonce sans rien dire : on baisse
// l'échelle à mesure que la page s'allonge.
const echelle = clip ? 1 : Math.max(0.6, Math.min(1.5, 4200 / h));
await envoyer('Emulation.setDeviceMetricsOverride',
  { width: 1280, height: h, deviceScaleFactor: echelle, mobile: false });
await new Promise((res) => setTimeout(res, 700));

const shot = await envoyer('Page.captureScreenshot', clip ? { format: 'png', clip } : { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(`/tmp/site-${CIBLE}.png`, Buffer.from(shot.data, 'base64'));

console.log(`/tmp/site-${CIBLE}.png  (${h} px de haut)`);
if (erreurs.length) {
  console.log('\nERREURS DE CONSOLE :');
  erreurs.forEach((x) => console.log('  ' + x));
  process.exit(1);
}
console.log('Aucune erreur de console.');
ws.close();
process.exit(0);

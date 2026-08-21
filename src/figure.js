// Le carré astrologique.
//
// « On appelle carré astrologique une figure représentant douze triangles
//   combinés de façon à être inscrits dans un carré et dans lesquels sont
//   portées des indications astronomiques ; celles-ci résument l'état du ciel,
//   la figura celi, à un moment précis. […] La date du carré astrologique est
//   normalement indiquée dans le cartouche central de la figure. »
//        — Emmanuel Poulle, « Horoscopes princiers des XIVe et XVe siècles »,
//          Bulletin de la Société nationale des Antiquaires de France, 1969, p. 63-77.
//
// La roue n'existe pas au Moyen Âge. Elle est une invention du XIXe siècle.
// La construction est celle des manuscrits : un carré, le losange de ses
// milieux de côtés, et les deux diagonales. Quatre quadrilatères aux angles
// cardinaux (I, IV, VII, X), huit triangles entre eux. On lit dans le sens
// contraire des aiguilles d'une montre, en partant de l'ascendant à gauche.

import { SIGNES, enSigne, signeDe, mod360, PLANETES } from './ciel.js';
import { html } from './texte.js';

// U+FE0E force la présentation « texte » : sans lui, les navigateurs rendent
// les signes du zodiaque en émoji de couleur, ce qui n'est pas l'effet cherché.
const TEXTE = '\uFE0E';
const GLYPHES_SIGNES = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
  .map((g) => g + TEXTE);
const GLYPHES = Object.fromEntries(PLANETES.map((p) => [p.clef, p.glyphe + TEXTE]));
GLYPHES.teste = '☊' + TEXTE;
GLYPHES.queue = '☋' + TEXTE;
const GLYPHES_PARTS = { fortune: '⊗', esprit: '⊕', regne: '✦', mariage: '⚭' };

/** Les douze régions, dans l'ordre des maisons. W = côté du carré. */
function regions(W) {
  const h = W / 2, q = W / 4, t = 3 * W / 4;
  const TL = [0, 0], TR = [W, 0], BR = [W, W], BL = [0, W];
  const T = [h, 0], R = [W, h], B = [h, W], L = [0, h], C = [h, h];
  const X = [q, q], Y = [t, q], X2 = [t, t], Y2 = [q, t];
  return [
    [C, X, L, Y2],   // I    — l'ascendant, à gauche
    [L, BL, Y2],     // II
    [Y2, BL, B],     // III
    [C, Y2, B, X2],  // IV   — le fond du ciel, en bas
    [B, BR, X2],     // V
    [X2, BR, R],     // VI
    [C, Y, R, X2],   // VII  — le couchant, à droite
    [R, TR, Y],      // VIII
    [Y, TR, T],      // IX
    [C, X, T, Y],    // X    — le milieu du ciel, en haut
    [T, TL, X],      // XI
    [X, TL, L],      // XII
  ];
}

const centroide = (pts) => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];

/** Le point où poser la pointe de la maison, ramené vers le centre depuis le
 *  barycentre du champ. Les quatre champs des angles sont larges et tolèrent
 *  un fort décalage ; les huit triangles, non — au-delà, le chiffre romain
 *  vient s'asseoir sur le trait du losange. */
function ancrePointe(pts, W) {
  const [cx, cy] = centroide(pts);
  const k = pts.length === 4 ? 0.28 : 0.13;
  return [cx + (W / 2 - cx) * k, cy + (W / 2 - cy) * k];
}

const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * @param {object} figure  résultat de juger()
 * @param {object} cartouche  { titre, lignes: string[] }
 */
export function carre(figure, cartouche = {}, { cote = 620, partsVisibles = true } = {}) {
  const W = cote;
  const marge = 26;
  const regs = regions(W);
  const e = [];

  const poly = (pts, classe) => `<polygon class="${classe}" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
  const txt = (x, y, s, classe, extra = '') =>
    `<text class="${classe}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${extra}>${html(s)}</text>`;

  // Les douze champs, puis le trait.
  for (let i = 0; i < 12; i++) e.push(poly(regs[i], 'champ'));
  e.push(poly([[0, 0], [W, 0], [W, W], [0, W]], 'cadre'));
  e.push(poly([[W / 2, 0], [W, W / 2], [W / 2, W], [0, W / 2]], 'losange'));
  e.push(`<line class="trait" x1="0" y1="0" x2="${W}" y2="${W}"/>`);
  e.push(`<line class="trait" x1="${W}" y1="0" x2="0" y2="${W}"/>`);

  // Les astres, répartis par maison.
  const parMaison = new Map();
  for (const astre of figure.astres) {
    if (!parMaison.has(astre.maison)) parMaison.set(astre.maison, []);
    parMaison.get(astre.maison).push({
      glyphe: GLYPHES[astre.clef] ?? '·',
      texte: enSigne(astre.longitude, true),
      retrograde: astre.retrograde && !astre.noeud,
      fort: astre.etat?.tenues.length > 0,
    });
  }
  if (partsVisibles) {
    for (const part of figure.parts) {
      const m = figure.maisonsHabitees.find((h) => {
        const debut = figure.pointes[h.rang];
        const fin = figure.pointes[h.rang % 12 + 1];
        return mod360(part.longitude - debut) < mod360(fin - debut);
      });
      if (!m) continue;
      if (!parMaison.has(m.rang)) parMaison.set(m.rang, []);
      parMaison.get(m.rang).push({
        glyphe: GLYPHES_PARTS[part.clef] ?? '•',
        texte: enSigne(part.longitude, true),
        part: true,
      });
    }
  }

  for (let i = 0; i < 12; i++) {
    const rang = i + 1;
    const pts = regs[i];
    const [ax, ay] = ancrePointe(pts, W);
    const pointe = figure.pointes[rang];

    e.push(txt(ax, ay, `${Math.floor(mod360(pointe) % 30)} ${GLYPHES_SIGNES[signeDe(pointe)]}`,
      'pointe', 'text-anchor="middle"'));
    e.push(txt(ax, ay + 13, ROMAINS[i], 'rang', 'text-anchor="middle"'));

    // Les hôtes se posent au barycentre du champ, poussés vers l'extérieur pour
    // ne pas heurter la pointe, puis ramenés dans le cadre : les champs des
    // angles sont étroits et le texte en déborderait.
    const hotes = parMaison.get(rang) ?? [];
    const [cx, cy] = centroide(pts);
    const versCentre = [W / 2 - cx, W / 2 - cy];
    const norme = Math.hypot(...versCentre) || 1;
    const borne = (v, demi) => Math.max(demi, Math.min(W - demi, v));
    const bx = borne(cx - versCentre[0] / norme * 20, 48);
    const by = borne(cy - versCentre[1] / norme * 20 + 4, 16 + (hotes.length - 1) * 9);

    hotes.forEach((h, k) => {
      const y = by + (k - (hotes.length - 1) / 2) * 17;
      const classe = `astre${h.part ? ' part' : ''}${h.fort ? ' fort' : ''}`;
      e.push(`<text x="${bx.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle">`
        + `<tspan class="${classe}">${h.glyphe}${h.retrograde ? '℞' : ''}</tspan>`
        + `<tspan class="astre-degre" dx="4">${html(h.texte)}</tspan></text>`);
    });
  }

  // Le cartouche central : c'est là que le manuscrit inscrit la date.
  const cw = W * 0.30, ch = W * 0.17;
  e.push(`<rect class="cartouche" x="${(W - cw) / 2}" y="${(W - ch) / 2}" width="${cw}" height="${ch}" rx="2"/>`);
  const lignes = [cartouche.titre, ...(cartouche.lignes ?? [])].filter(Boolean);
  lignes.forEach((ligne, k) => {
    const y = W / 2 - (lignes.length - 1) * 8 + k * 16 + 4;
    e.push(txt(W / 2, y, ligne, k === 0 ? 'cartouche-titre' : 'cartouche-ligne', 'text-anchor="middle"'));
  });

  return `<svg class="carre" viewBox="${-marge} ${-marge} ${W + marge * 2} ${W + marge * 2}"
    xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="Carré astrologique : ${html(cartouche.titre ?? 'figure du ciel')}">
    <g>${e.join('\n')}</g>
  </svg>`;
}

export { GLYPHES, GLYPHES_SIGNES, SIGNES };

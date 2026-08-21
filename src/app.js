// L'interface. Tout se calcule dans le navigateur ; rien ne sort de la machine.

import {
  jourJulien, positions, maisons, heuresInegales, heuresPlanetaires,
  enSigne, PLANETES, NOMS_JOURS,
} from './ciel.js';
import { juger, enPhrases, nomDe, sommaire, lectureDesMaisons } from './jugement.js';
import { carre, GLYPHES } from './figure.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, MAISONS,
  POIDS, PARTS, RESERVES,
} from './doctrine.js';
import { NATIVITES, CONJONCTION_1345, AUTRES_PIECES } from './corpus.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const html = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LIEUX = [
  ['Paris', 48.8566, 2.3522], ['Orthez', 43.4906, -0.7728], ['Pau', 43.2951, -0.3708],
  ['Bordeaux', 44.8378, -0.5792], ['Toulouse', 43.6047, 1.4442], ['Avignon', 43.9493, 4.8055],
  ['Lyon', 45.7640, 4.8357], ['Marseille', 43.2965, 5.3698], ['Rouen', 49.4432, 1.0993],
  ['Dijon', 47.3220, 5.0415], ['Reims', 49.2583, 4.0317], ['Nantes', 47.2184, -1.5536],
  ['Lille', 50.6292, 3.0573], ['Strasbourg', 48.5734, 7.7521], ['Bruges', 51.2093, 3.2247],
  ['Londres', 51.5074, -0.1278], ['Oxford', 51.7520, -1.2577], ['Rome', 41.9028, 12.4964],
  ['Bologne', 44.4949, 11.3426], ['Florence', 43.7696, 11.2558], ['Venise', 45.4408, 12.3155],
  ['Tolède', 39.8628, -4.0273], ['Barcelone', 41.3874, 2.1686], ['Séville', 37.3891, -5.9845],
  ['Prague', 50.0755, 14.4378], ['Chiraz', 29.5918, 52.5837], ['Le Caire', 30.0444, 31.2357],
];

const BASCULE_GREGORIENNE = { annee: 1582, mois: 10, jour: 15 };
const estJulien = ({ annee, mois, jour }) =>
  annee < BASCULE_GREGORIENNE.annee
  || (annee === 1582 && (mois < 10 || (mois === 10 && jour < 15)));

/** Instant en jour julien, à partir d'une saisie. */
function instant({ annee, mois, jour, heure, minute, longitude, fuseau }) {
  const julien = estJulien({ annee, mois, jour });
  const locale = heure + minute / 60;
  const decalage = fuseau === 'local' ? longitude / 15 : Number(fuseau);
  return { jj: jourJulien({ annee, mois, jour, heure: locale - decalage, julien }), julien };
}

/** Tout ce qu'il faut pour afficher une figure. */
function dresser(saisie) {
  const { jj, julien } = instant(saisie);
  const mai = maisons(jj, saisie.latitude, saisie.longitude);
  const figure = juger({ positions: positions(jj), maisons: mai });
  const hi = heuresInegales(jj, saisie.latitude, saisie.longitude);
  return { jj, julien, figure, heures: hi, planetaires: heuresPlanetaires(hi) };
}

// ─── Rendu ───────────────────────────────────────────────────────────────────

function tableauDesAstres(figure) {
  const lignes = figure.astres.map((a) => {
    const dignites = a.etat
      ? [...a.etat.tenues, ...a.etat.perdues].join(', ') || (a.etat.pérégrine ? 'pérégrine' : '')
      : '—';
    return `<tr class="${a.etat?.tenues.length ? 'dignifie' : ''}">
      <td class="glyphe">${GLYPHES[a.clef] ?? ''}</td>
      <td>${html(a.nom)}${a.retrograde && !a.noeud ? ' <span class="retro">℞</span>' : ''}</td>
      <td class="deg">${html(enSigne(a.longitude))}</td>
      <td class="deg">${a.maison}</td>
      <td>${html(nomDe(a.seigneur))}</td>
      <td>${html(dignites)}</td>
    </tr>`;
  }).join('');

  const parts = figure.parts.map((p) => `<tr>
      <td class="glyphe">·</td><td>${html(p.nom)}</td>
      <td class="deg">${html(enSigne(p.longitude))}</td>
      <td class="deg">—</td><td>—</td>
      <td><i>${html(p.latin)}</i> — ${html(p.detail)}</td>
    </tr>`).join('');

  return `<table class="releve">
    <thead><tr><th></th><th>Astre</th><th>Lieu</th><th>Maison</th><th>Seigneur du lieu</th><th>État</th></tr></thead>
    <tbody>${lignes}${parts}</tbody></table>`;
}

function tableauDesMaisons(figure) {
  const lignes = figure.maisonsHabitees.map((m) => `<tr>
    <td class="deg">${m.rang}</td>
    <td><b>${html(m.titre)}</b> <i class="cote">${html(m.latin)}</i><br><span class="cote">${html(m.detail)}</span></td>
    <td class="deg">${html(enSigne(m.pointe))}</td>
    <td>${html(nomDe(m.seigneur))}</td>
    <td>${m.hotes.map((h) => GLYPHES[h.clef] ?? '').join(' ')}</td>
  </tr>`).join('');
  return `<table class="releve">
    <thead><tr><th>№</th><th>La question</th><th>Pointe</th><th>Seigneur</th><th>Hôtes</th></tr></thead>
    <tbody>${lignes}</tbody></table>`;
}

const GLYPHES_SOMMAIRE = { ascendant: 'ASC', seigneur: '⚜\uFE0E', secte: '◐\uFE0E' };

/** Les six lignes qu'un astrologien aurait dites en premier. */
function blocSommaire(figure) {
  const cartes = sommaire(figure).map((s) => `<div class="carte-sommaire">
      <span class="glyphe-sommaire">${GLYPHES_SOMMAIRE[s.clef]
        ?? GLYPHES[s.clef] ?? GLYPHES[figure.almuten.vainqueur.planete] ?? '·'}</span>
      <h4>${html(s.etiquette)}</h4>
      <p class="valeur">${html(s.valeur)}</p>
      <p class="detail">${s.detail}</p>
    </div>`).join('');
  return `<section class="sommaire">
    <h3>En six lignes</h3>
    ${cartes}
  </section>`;
}

/** Le jugement par le seigneur : douze matières, douze verdicts mécaniques. */
function blocLecture(figure) {
  const items = lectureDesMaisons(figure).map((m) => `<details class="maison-lue${m.angulaire ? ' angle' : ''}">
      <summary>
        <span class="numero">${m.rang}</span>
        <span class="matiere"><b>${html(m.titre)}</b> <i class="cote">${html(m.latin)}</i>
          <br><span class="cote">${html(m.question)}</span></span>
        <span class="seigneur-court">${GLYPHES[m.seigneur] ?? ''} ${html(nomDe(m.seigneur))}</span>
      </summary>
      <div class="corps">${m.phrases.map((p) => `<p>${p}</p>`).join('')}</div>
    </details>`).join('');

  return `<section class="lecture">
    <h3>Les douze matières, jugées une à une</h3>
    <p class="preambule">On ne juge pas une matière par le signe où elle tombe, mais par
    <b>l’état de la planète qui gouverne ce signe et par le lieu où elle se trouve</b>. C’est
    toute la technique, et elle est entièrement mécanique : rien n’est ajouté ici que le
    calcul ne donne. Dépliez une maison pour lire son jugement.</p>
    ${items}
    <span class="renvoi">Alcabitius, dist. I (les significations des maisons) et dist. IV
    (la force des planètes selon les lieux).</span>
  </section>`;
}

function blocHeures(heures, planetaires) {
  if (!heures || !planetaires) return '';
  const m = (x) => `${Math.round(x)} min`;
  return `<section>
    <h3>L’heure inégale</h3>
    <p>Naissance ${planetaires.deJour ? 'de jour' : 'de nuit'}, à la
    <b>${planetaires.rang}<sup>e</sup> heure ${planetaires.deJour ? 'du jour' : 'de la nuit'}</b>.
    Ce jour-là, l’heure de jour vaut ${m(heures.heureDeJour)} et celle de nuit ${m(heures.heureDeNuit)} :
    le jour artificiel se coupe en douze quelle que soit sa longueur.</p>
    <p>Le jour est un <b>${html(planetaires.jourSemaine)}</b>, jour de
    ${html(nomDe(planetaires.seigneurDuJour))} ; la nuit qui le suit appartient à
    ${html(nomDe(planetaires.seigneurDeLaNuit))} ; et l’heure présente est heure de
    <b>${html(nomDe(planetaires.seigneurDeLHeure))}</b>.</p>
    <span class="renvoi">Ordre chaldéen des heures planétaires ; c’est la notation qu’emploient les légendes latines des carrés.</span>
  </section>`;
}

function rendreFigure(saisie, cartouche, { titreCarre = '' } = {}) {
  const { figure, heures, planetaires, julien } = dresser(saisie);
  const phrases = enPhrases(figure).map((p) => `<section>
      <h3>${html(p.titre)}</h3><p>${p.texte}</p>
      <span class="renvoi">${html(p.source)}</span>
    </section>`).join('');

  return {
    figure, heures, planetaires,
    markup: `
      <div class="plan">
        <div>
          ${carre(figure, cartouche)}
          <p class="legende-carre">Carré astrologique — la construction des manuscrits :
          un carré, le losange de ses milieux de côtés, les deux diagonales. On lit dans le
          sens contraire des aiguilles d’une montre à partir de l’ascendant, à gauche. La roue
          n’existe pas au Moyen Âge ; c’est une invention du XIX<sup>e</sup> siècle.
          ${julien ? 'Date julienne.' : ''}</p>
        </div>
        <div class="jugement">
          ${titreCarre}
          ${phrases}
          ${blocHeures(heures, planetaires)}
        </div>
      </div>
      ${blocSommaire(figure)}
      ${blocLecture(figure)}
      <h3 style="margin-top:34px">Le relevé</h3>
      ${tableauDesAstres(figure)}
      <h3>Les douze maisons</h3>
      ${tableauDesMaisons(figure)}`,
  };
}

/** Quand l'heure manque : on ne dresse pas de figure, on montre pourquoi. */
function rendreSansHeure(saisie) {
  const cases = [];
  for (let h = 0; h < 24; h++) {
    const { jj } = instant({ ...saisie, heure: h, minute: 0 });
    const asc = maisons(jj, saisie.latitude, saisie.longitude).ascendant;
    cases.push(`<div>${String(h).padStart(2, '0')} h — <b>${html(enSigne(asc))}</b></div>`);
  }
  const { jj: jjMidi } = instant({ ...saisie, heure: 12, minute: 0 });
  const pos = positions(jjMidi);
  const lignes = [...PLANETES.map((p) => p.clef), 'teste'].map((clef) => `<tr>
      <td class="glyphe">${GLYPHES[clef] ?? ''}</td><td>${html(nomDe(clef))}</td>
      <td class="deg">${html(enSigne(pos[clef].longitude))}</td>
      <td>${pos[clef].retrograde && !pos[clef].noeud ? '<span class="retro">rétrograde</span>' : ''}</td>
    </tr>`).join('');

  return `<div class="refus">
    <h2>Sans l’heure, il n’y a pas de figure</h2>
    <p>Ce n’est pas une coquetterie de méthode : c’est la chose même. L’ascendant —
    l’<i>horoscopus</i>, le degré qui monte à l’horizon — avance d’un degré toutes les quatre
    minutes. Il commande les douze maisons, donc la place de chaque planète dans la vie, donc
    tout le jugement. Sans lui il reste une liste de positions, et un astrologien vous aurait
    renvoyé chercher un témoin.</p>
    <p>Voyez ce que devient l’ascendant ce jour-là, heure par heure, à ce lieu :</p>
    <div class="balayage">${cases.join('')}</div>
    <p style="margin-top:20px">Le zodiaque entier passe. Il n’y a pas une nativité, il y en a
    douze. <b>C’est exactement pourquoi on ne peut pas dresser celle de Gaston Fébus</b> :
    sa date est sûre — 30 avril 1331 — et personne n’a noté l’heure.</p>
    <p>Ce qu’on peut tout de même dire — les planètes lentes bougent peu en un jour, la Lune
    de treize degrés :</p>
    <table class="releve"><tbody>${lignes}</tbody></table>
    <p class="cote">Positions à midi, heure locale du lieu.</p>
  </div>`;
}

// ─── L'officine ──────────────────────────────────────────────────────────────

function lireFormulaire() {
  return {
    annee: +$('#annee').value, mois: +$('#mois').value, jour: +$('#jour').value,
    heure: +$('#heure').value, minute: +$('#minute').value || 0,
    latitude: +$('#latitude').value, longitude: +$('#longitude').value,
    fuseau: $('#fuseau').value,
  };
}

function noterCalendrier() {
  const s = { annee: +$('#annee').value, mois: +$('#mois').value, jour: +$('#jour').value };
  if (!s.annee) return;
  $('#note-calendrier').textContent = estJulien(s)
    ? 'Date antérieure à octobre 1582 : elle est lue dans le calendrier julien, comme l’aurait fait un calculateur du temps.'
    : 'Date lue dans le calendrier grégorien.';
}

function initOfficine() {
  $('#lieux').innerHTML = LIEUX.map(([n]) => `<option value="${html(n)}">`).join('');
  $('#lieu').addEventListener('input', (e) => {
    const trouve = LIEUX.find(([n]) => n.toLowerCase() === e.target.value.trim().toLowerCase());
    if (trouve) { $('#latitude').value = trouve[1]; $('#longitude').value = trouve[2]; }
  });
  for (const id of ['#annee', '#mois', '#jour']) $(id).addEventListener('input', noterCalendrier);
  noterCalendrier();

  $('#formulaire').addEventListener('submit', (e) => {
    e.preventDefault();
    const saisie = lireFormulaire();
    if ($('#heure').value === '') {
      $('#resultat').innerHTML = rendreSansHeure(saisie);
      return;
    }
    const { markup } = rendreFigure(saisie, {
      titre: 'Figura celi',
      lignes: [
        `${saisie.jour}/${saisie.mois}/${saisie.annee}`,
        `${String(saisie.heure).padStart(2, '0')} h ${String(saisie.minute).padStart(2, '0')}`,
        $('#lieu').value || '—',
      ],
    });
    $('#resultat').innerHTML = markup;
  });

  $('#sans-heure').addEventListener('click', () => {
    $('#heure').value = '';
    $('#resultat').innerHTML = rendreSansHeure(lireFormulaire());
  });
}

// ─── Les nativités ───────────────────────────────────────────────────────────

const TOUTES = [...NATIVITES, CONJONCTION_1345];

function ficheNativite(n) {
  const entete = `<h2>${html(n.nom)}</h2>
    <p class="devise" style="margin-top:-.4em">${html(n.sousTitre ?? '')}</p>`;

  const source = n.source ? `<p class="cote"><b>${html(n.source.cote)}</b>
      ${n.source.note ? `<br>${html(n.source.note)}` : ''}
      ${n.source.edition ? `<br>Édition : ${html(n.source.edition)}` : ''}
      ${n.source.lien ? ` — <a href="${n.source.lien}" target="_blank" rel="noopener">consulter</a>` : ''}
    </p>` : '';

  const latin = n.latin ? `<p class="latin">« ${html(n.latin)} »</p>
    ${n.traduction ? `<p class="traduction">${html(n.traduction)}</p>` : ''}` : '';

  const citation = n.citation ? `<p class="latin">« ${html(n.citation.texte)} »</p>
    <p class="cote">${html(n.citation.origine)}<br>${html(n.citation.traduction)}</p>` : '';

  if (n.heureInconnue) {
    return `${entete}${source}
      <p>${html(n.apres)}</p>
      ${rendreSansHeure({ ...n, heure: 12, minute: 0, fuseau: 'local' })}`;
  }

  const saisie = { ...n, fuseau: 'local' };
  const { markup, planetaires } = rendreFigure(saisie, {
    titre: n.nom.split(',')[0],
    lignes: [`${n.jour}/${n.mois}/${n.annee}`,
      `${String(n.heure).padStart(2, '0')} h ${String(n.minute).padStart(2, '0')}`, n.lieu],
  });

  // Le manuscrit annonce une nuit planétaire, un rang d'heure et un seigneur.
  // Rien n'oblige un scribe à être cohérent : vérifions.
  let controle = '';
  if (n.verifier && planetaires) {
    const items = [
      ['jour ou nuit', n.verifier.deJour ? 'de jour' : 'de nuit',
        planetaires.deJour ? 'de jour' : 'de nuit'],
      ['rang de l’heure inégale', `${n.verifier.rang}ᵉ`, `${planetaires.rang}ᵉ`],
      ['seigneur de l’heure', nomDe(n.verifier.heure), nomDe(planetaires.seigneurDeLHeure)],
    ];
    if (n.verifier.nuit) {
      items.push(['seigneur de la nuit', nomDe(n.verifier.nuit), nomDe(planetaires.seigneurDeLaNuit)]);
    }
    const lignes = items.map(([quoi, dit, calcule]) => {
      const ok = dit.toLowerCase() === calcule.toLowerCase();
      return `<li><span class="${ok ? 'oui' : 'non'}">${ok ? '✓' : '≠'}</span>
        <span style="flex:1">${html(quoi)}</span>
        <span>manuscrit : <b>${html(dit)}</b></span>
        <span>calcul : <b>${html(calcule)}</b></span></li>`;
    }).join('');
    controle = `<h3 style="margin-top:26px">Le manuscrit se recoupe-t-il ?</h3>
      <p>La légende latine ne donne pas que l’heure : elle annonce à quelle planète
      appartiennent la nuit et l’heure, et le rang de celle-ci. Ce sont des affirmations
      vérifiables, six siècles plus tard, dans votre navigateur.</p>
      <ul class="controle-liste">${lignes}</ul>`;
  }

  const ecart = n.ecart ? `<div class="encart-ecart">
      <h3>${html(n.ecart.titre)}</h3>
      <p>${html(n.ecart.texte)}</p>
      <p class="hypothese">${html(n.ecart.hypothese)}</p>
    </div>` : '';

  const verif = n.verification ? `<div class="encart-ecart">
      <h3>Ce que dit le ciel</h3><p>${html(n.verification.texte)}</p>
    </div>` : '';

  const annotation = n.annotation ? `<div class="encart-ecart">
      <h3>Ce qu’un autre astrologue a écrit sur son carré, trente-cinq ans plus tard</h3>
      <p class="latin">« ${html(n.annotation.latin)} »</p>
      <p class="traduction">« ${html(n.annotation.traduction)} »</p>
      <p class="cote">${html(n.annotation.cote)}</p>
      <p class="hypothese">${html(n.annotation.commentaire)}</p>
    </div>` : '';

  const apres = n.apres ? `<div class="apres"><h3>Ce qui est arrivé</h3><p>${html(n.apres)}</p></div>` : '';

  return `${entete}${latin}${citation}${source}${markup}${controle}${ecart}${verif}${annotation}${apres}`;
}

function initNativites() {
  $('#galerie').innerHTML = TOUTES.map((n) => `<button data-clef="${n.clef}">
      <span class="nom">${html(n.nom.split(',')[0])}</span>
      <span class="sous">${html(n.sousTitre ?? '')}</span>
      <span class="date">${n.jour}.${n.mois}.${n.annee}${n.heureInconnue ? ' — heure inconnue' : ''}</span>
    </button>`).join('');

  $('#galerie').addEventListener('click', (e) => {
    const bouton = e.target.closest('button[data-clef]');
    if (!bouton) return;
    $$('#galerie button').forEach((b) => b.classList.toggle('actif', b === bouton));
    $('#nativite-detail').innerHTML = ficheNativite(TOUTES.find((n) => n.clef === bouton.dataset.clef));
    $('#nativite-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('#autres-pieces').innerHTML = `<h2>Trois autres pièces, et un avertissement</h2>
    ${AUTRES_PIECES.map((p) => `<div class="reserve">
      <h3>${html(p.titre)}</h3><p>${html(p.texte)}</p>
      <p class="cote">${html(p.cote)}${p.lien ? ` — <a href="${p.lien}" target="_blank" rel="noopener">voir</a>` : ''}</p>
    </div>`).join('')}`;
}

// ─── La méthode ──────────────────────────────────────────────────────────────

function initMethode() {
  const SIGNES_COURTS = ['Bél', 'Tau', 'Gém', 'Can', 'Lio', 'Vie', 'Bal', 'Sco', 'Sag', 'Cap', 'Ver', 'Poi'];

  const domiciles = DOMICILES.table.map((p, i) => `<tr>
    <td>${SIGNES_COURTS[i]}</td><td>${html(nomDe(p))}</td>
    <td>${Object.entries(EXALTATIONS.table).filter(([, e]) => e.signe === i)
      .map(([pl, e]) => `${nomDe(pl)} à ${e.degre}°`).join(', ') || '—'}</td>
    <td>${html(nomDe(TRIPLICITES.table.find((t) => t.signes.includes(i)).jour))} /
        ${html(nomDe(TRIPLICITES.table.find((t) => t.signes.includes(i)).nuit))}</td>
    <td>${TERMES.table[i].map(([pl, f]) => `${nomDe(pl).slice(0, 3)}·${f}`).join('  ')}</td>
    <td>${[0, 1, 2].map((d) => nomDe(FACES.ordre[(i * 3 + d) % 7]).slice(0, 3)).join(' ')}</td>
  </tr>`).join('');

  const maisonsTable = MAISONS.table.map((m, i) => `<tr>
    <td class="deg">${i + 1}</td><td><i>${html(m.latin)}</i></td>
    <td><b>${html(m.titre)}</b></td><td>${html(m.detail)}</td></tr>`).join('');

  const partsTable = PARTS.table.map((p) => `<tr>
    <td><b>${html(p.nom)}</b> <i class="cote">${html(p.latin)}</i></td>
    <td>asc + ${nomDe(p.dejour[0])} − ${nomDe(p.dejour[1])}</td>
    <td>asc + ${nomDe(p.denuit[0])} − ${nomDe(p.denuit[1])}</td>
    <td>${html(p.detail)}</td></tr>`).join('');

  $('#tables-doctrine').innerHTML = `
    <div class="table-doctrine">
      <h3>Les cinq dignités, signe par signe</h3>
      <p class="source-table">${html(DOMICILES.source)} — pondération : domicile ${POIDS.domicile},
      exaltation ${POIDS.exaltation}, triplicité ${POIDS.triplicite}, terme ${POIDS.terme},
      face ${POIDS.face}. ⚠ Cette pondération n’est pas dans Alcabitius, qui décrit les
      dignités sans les chiffrer : c’est l’usage des praticiens latins.</p>
      <table class="releve">
        <thead><tr><th>Signe</th><th>Domicile</th><th>Exaltation</th>
        <th>Triplicité jour / nuit</th><th>Termes égyptiens</th><th>Faces</th></tr></thead>
        <tbody>${domiciles}</tbody></table>
    </div>
    <div class="table-doctrine">
      <h3>Les douze maisons et leurs questions</h3>
      <p class="source-table">${html(MAISONS.source)}</p>
      <table class="releve"><tbody>${maisonsTable}</tbody></table>
    </div>
    <div class="table-doctrine">
      <h3>Les parts</h3>
      <p class="source-table">${html(PARTS.source)} — une part n’est pas un astre : c’est une
      distance reportée depuis l’ascendant, et la plupart se renversent entre le jour et la nuit.</p>
      <table class="releve">
        <thead><tr><th>Part</th><th>De jour</th><th>De nuit</th><th>Ce qu’elle regarde</th></tr></thead>
        <tbody>${partsTable}</tbody></table>
    </div>`;

  $('#reserves').innerHTML = RESERVES.map((r) => `<div class="reserve">
    <h3>${html(r.titre)}</h3><p>${html(r.texte)}</p></div>`).join('');
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function initNavigation() {
  $$('.onglet').forEach((onglet) => onglet.addEventListener('click', () => {
    $$('.onglet').forEach((o) => o.classList.toggle('actif', o === onglet));
    $$('.vue').forEach((v) => v.classList.toggle('cachee', v.id !== `vue-${onglet.dataset.vue}`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onglet.dataset.vue === 'nativites' && !$('#nativite-detail').innerHTML) {
      $('#galerie button').click();
    }
  }));
}

initNavigation();
initOfficine();
initNativites();
initMethode();
void NOMS_JOURS;

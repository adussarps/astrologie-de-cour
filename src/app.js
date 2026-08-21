// L'interface. Tout se calcule dans le navigateur ; rien ne sort de la machine.

import {
  positions, maisons, heuresInegales, heuresPlanetaires,
  enSigne, dateGregorienne, syzygiePrecedente, PLANETES, SIGNES,
} from './ciel.js';
import { laDureeDeVie } from './vie.js';
import {
  juger, enPhrases, nomDe, sommaire, lectureDesMaisons, enDegresMinutes, rangHtml, peregrinDe,
  avecArticle,
} from './jugement.js';
import { html } from './texte.js';
import { carre, GLYPHES } from './figure.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, MAISONS,
  POIDS, PARTS, RESERVES, laGrandeDignite,
} from './doctrine.js';
import { NATIVITES, CONJONCTION_1345, AUTRES_PIECES } from './corpus.js';
import {
  CONVENTIONS, versTempsUniversel, lectureDuTemps, conventionParDefaut,
  fuseauDe, enHeures, enDecalage,
} from './temps.js';
import { installerRechercheDeLieu } from './lieux.js';
import { figureDeLAnnee, SOURCES as SOURCES_ANNEE } from './annee.js';
import {
  DEMANDES, jugerInterrogation, SOURCES as SOURCES_QUESTION,
} from './interrogation.js';
import { dossierNativite, dossierAnnee, dossierInterrogation } from './dossier.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const BASCULE_GREGORIENNE = { annee: 1582, mois: 10, jour: 15 };
const estJulien = ({ annee, mois, jour }) =>
  annee < BASCULE_GREGORIENNE.annee
  || (annee === 1582 && (mois < 10 || (mois === 10 && jour < 15)));

/** Instant en jour julien, à partir d'une saisie. */
function instant(saisie) {
  const julien = estJulien(saisie);
  return { ...versTempsUniversel({ ...saisie, julien }), julien };
}

/** Tout ce qu'il faut pour afficher une figure. */
function dresser(saisie) {
  const { jj, julien, convention, decalage, equation, zone } = instant(saisie);
  const mai = maisons(jj, saisie.latitude, saisie.longitude);
  const figure = juger({ positions: positions(jj), maisons: mai, sexe: saisie.sexe ?? null });
  const hi = heuresInegales(jj, saisie.latitude, saisie.longitude);
  const vie = laDureeDeVie(figure, syzygiePrecedente(jj));
  return {
    jj, julien, figure, vie, heures: hi, planetaires: heuresPlanetaires(hi),
    temps: { convention, decalage, equation, zone, ...lectureDuTemps(jj, saisie.longitude, zone) },
  };
}

// ─── Rendu ───────────────────────────────────────────────────────────────────

function tableauDesAstres(figure) {
  const lignes = figure.astres.map((a) => {
    const dignites = a.etat
      ? [...a.etat.tenues, ...a.etat.perdues].join(', ')
        || (a.etat.pérégrine ? peregrinDe(a.clef) : '')
      : '—';
    return `<tr class="${laGrandeDignite(a.etat?.tenues).length ? 'dignifie' : ''}">
      <td class="glyphe">${GLYPHES[a.clef] ?? ''}</td>
      <td>${html(a.nom)}${a.retrograde && !a.noeud ? ' <span class="retro">℞</span>' : ''}</td>
      <td class="deg">${html(enSigne(a.longitude))}</td>
      <td class="deg">${a.maison}</td>
      <td>${html(nomDe(a.seigneur))}</td>
      <td>${html(dignites)}</td>
    </tr>`;
  }).join('');

  const parts = figure.parts.map((p) => `<tr${p.indecise ? ' class="indecise"' : ''}>
      <td class="glyphe">·</td><td>${html(p.nom)}</td>
      <td class="deg">${p.indecise
    ? p.variantes.map((v) => `${html(enSigne(v.longitude))} <span class="cote">si ${v.sexe}</span>`).join('<br>')
    : html(enSigne(p.longitude))}</td>
      <td class="deg">—</td><td>—</td>
      <td><i>${html(p.latin)}</i> — ${html(p.detail)}${p.indecise
  ? ` <span class="cote">— non placée : ${html(p.indecise)}</span>` : ''}</td>
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

/** Le corps, par l'homme zodiacal — la seule partie de l'art dont l'usage fût
 *  quotidien, parce que c'est par elle que l'astrologie tient à la médecine. */
function blocCorps(figure) {
  const c = figure.corps;
  if (!c) return '';
  const s = c.maladie.seigneur;
  return `<section class="corps">
    <h3>Le corps, et de quoi se garder</h3>
    <p>Le signe qui monte donne la complexion du corps entier : <b>${html(c.complexion.signe)}</b>,
    qui gouverne ${html(c.complexion.membre)}. Son seigneur ${html(c.complexion.seigneur.nom)}
    est ${html(c.complexion.qualite)}${c.complexion.humeur
  ? `, et son humeur est ${html(c.complexion.humeur)}` : ''}.</p>
    <p>La Lune tient <b>${html(c.lune.signe)}</b>, qui gouverne ${html(c.lune.membre)}.
    <b class="interdit">${html(c.lune.interdit)}</b> C’est une règle opératoire, imprimée dans
    tous les almanachs : aucun médecin formé n’y contrevient.</p>
    <p>La sixième maison range ensemble la maladie, les serviteurs, les bêtes menues et le
    travail subi — tout ce à quoi l’on est assujetti. Son seigneur est
    <b>${html(s.nom)}</b>, en ${rangHtml(s.maison)} maison, ${html(s.force)}. Ce qu’il charge
    dans le corps : ${html(c.maladie.corps)}.</p>
    <span class="renvoi">${html(c.source)}</span>
  </section>`;
}

/** La durée de vie — c'est-à-dire l'écart entre ceux qui prétendent la dire.
 *
 *  Ce bloc est le seul du site qui ne conclut rien, et c'est délibéré : il fait
 *  marcher deux autorités sur la même figure et montre où elles se séparent.
 *  Rendre un nombre reviendrait à choisir un livre sans le dire. */
/** Ce que l'écart veut dire, dit en français et non en drapeaux booléens.
 *
 *  Trois cas se présentent réellement, et le troisième surprend : il arrive
 *  qu'une des deux marches ne trouve aucun donneur d'années du tout. Écrire
 *  « elles ne nomment pas le même » serait alors faux — l'une n'en nomme
 *  aucun, ce qui est un jugement plus dur qu'un désaccord. */
function leVerdict(vie) {
  const noms = vie.donneurs.map(avecArticle);
  const liste = noms.length > 1
    ? `${noms.slice(0, -1).join(', ')} et ${noms.at(-1)}`
    : noms[0] ?? null;

  if (vie.accord.memePoint && vie.accord.memeDonneur) {
    return `<p class="verdict-vie accord">Sur cette figure, les deux marches tombent d’accord :
      même point de départ, et <b>${html(liste)}</b> pour donner les années. C’est le cas le moins
      fréquent, et il ne rend pas le nombre calculable pour autant — il resterait à choisir entre
      les années majeures, moyennes et mineures selon l’état de cette planète, puis à ajouter et
      retrancher selon les regards.</p>`;
  }

  const surLePoint = vie.accord.memePoint
    ? 'Les deux marches partent du même point'
    : 'Les deux marches ne partent pas du même point';

  const surLeDonneur = !liste
    ? ', et ni l’une ni l’autre ne trouve de planète à qui donner les années'
    : vie.sansDonneur
      ? `, et l’une nomme <b>${html(liste)}</b> pour donner les années quand l’autre n’en trouve
         aucune — un hyleg qu’aucun de ses seigneurs n’atteint est déclaré incomplet, et la règle
         veut alors qu’on en cherche un autre`
      : vie.accord.memeDonneur
        ? `, mais nomment la même planète pour donner les années : <b>${html(liste)}</b>`
        : `, et ne nomment pas la même planète pour donner les années : <b>${html(liste)}</b>`;

  return `<p class="verdict-vie desaccord">${surLePoint}${surLeDonneur}. Un chiffre rendu ici
    n’aurait pas dit l’âge du natif : il aurait dit quel livre était ouvert sur la table.</p>`;
}

function blocVie(vie) {
  if (!vie?.marches?.length) return '';

  const marche = (m) => {
    const etapes = m.marches.map((e) => `<li class="${e.elu ? 'elu' : e.retenu ? 'retenu' : 'ecarte'}">
      <b>${html(e.nom ?? '')}</b>${e.detail ? ` <span class="cote">${html(e.detail)}</span>` : ''}
      — ${html(e.pourquoi)}${e.retenu && !e.elu
  ? ' <span class="cote">(en lieu convenable, mais un autre l’emporte)</span>' : ''}</li>`).join('');

    const donneurs = m.alcocodens.map((a) => `<li>
      <span class="cote">${html(a.auteur)}</span>
      ${a.elu ? `<b>${html(a.elu.nom)}</b>, par ${html(a.elu.dignite)} — ${html(a.elu.atteinte.glose)}`
    : '<b>aucun</b> — pas un des seigneurs du degré ne l’atteint, et le hyleg est donc incomplet'}
      </li>`).join('');

    return `<div class="marche">
      <h4>${html(m.auteur)}</h4>
      <p class="renvoi">${html(m.source)}</p>
      <ol class="etapes">${etapes}</ol>
      <p class="issue-hyleg">Hyleg : <b>${html(m.nom)}</b>${m.position
  ? ` à ${html(m.position)}` : ''} — ${html(m.raison)}.</p>
      ${m.ecartInterne ? `<p class="ecart-interne">Ptolémée se contredit ici lui-même :
        ${html(m.ecartInterne)}.</p>` : ''}
      <p class="donneurs-titre">Le donneur d’années, selon l’ordre de commandement qu’on suit :</p>
      <ul class="donneurs">${donneurs}</ul>
    </div>`;
  };

  const verdict = leVerdict(vie);

  return `<section class="vie">
    <h3>La durée de vie : pourquoi il n’y a pas de nombre</h3>
    <p class="preambule">C’est la pièce la plus chère d’une nativité princière, et la seule que
    ce site refuse de chiffrer. Le refus n’est pas de la prudence : c’est le calcul lui-même qui
    le rend. On fait marcher ici, sur votre figure, les deux autorités qu’on lisait ensemble dans
    les universités latines — et l’on regarde où elles se séparent.</p>
    ${vie.syzygie ? `<p class="syzygie">La syzygie qui a précédé la naissance —
      ${html(vie.syzygie.nom)}, à ${html(enSigne(vie.syzygie.longitude))} — entre dans les deux
      marches, et pas de la même façon.</p>` : ''}
    <div class="marches">${vie.marches.map(marche).join('')}</div>
    ${verdict}
    <p class="pas-de-nombre">${html(vie.pasDeNombre)}</p>
  </section>`;
}

/** Les degrés de perfection. La table des exaltations donne un degré, non un
 *  signe — et une planète qui s'en approche à quelques minutes ne se lit sur
 *  aucune table de dignités. */
function blocPerfection(figure) {
  const p = figure.perfections;
  if (!p) return '';
  const lignes = [];
  if (p.versExaltation?.notable) {
    lignes.push(`<p><b>${html(p.versExaltation.nom)}</b> est à
      <b>${html(enDegresMinutes(p.versExaltation.exaltation))}</b> de son degré d’exaltation
      (${p.versExaltation.degreDansLeSigne}° ${html(SIGNES[p.versExaltation.signeExalt])}) :
      c’est le corps le mieux placé de la figure, et de loin.</p>`);
  }
  if (p.versChute?.notable) {
    lignes.push(`<p><b>${html(p.versChute.nom)}</b> est à
      <b>${html(enDegresMinutes(p.versChute.chute))}</b> du degré de sa chute : c’est le corps
      le plus mal placé, et cela ne se rattrape pas.</p>`);
  }
  if (!lignes.length) return '';

  return `<section class="perfection">
    <h3>Les degrés de perfection</h3>
    <p class="preambule">La table des exaltations ne donne pas un signe : elle donne un
    <b>degré</b> — Vénus au vingt-septième des Poissons, la Lune au troisième du Taureau.
    Une planète qui s’en approche à quelques minutes est à son point de perfection, ce qui
    ne se lit sur aucune table de dignités.</p>
    ${lignes.join('')}
    <span class="renvoi">Alcabitius, dist. I (les exaltations).</span>
  </section>`;
}

/** Ce que valait l'heure annoncée, et ce qu'elle vaut au soleil du lieu.
 *  L'écart n'est pas un détail technique : c'est le sujet. */
function blocTemps(temps) {
  if (!temps) return '';
  const c = CONVENTIONS[temps.convention];
  const eq = temps.equation;
  const signe = eq >= 0 ? '+' : '−';

  const lignes = [];
  lignes.push(`L’heure saisie a été lue comme <b>${html(c.nom)}</b> — ${html(c.detail)}.`);

  if (temps.convention === 'legale') {
    lignes.push(`Fuseau <b>${html(temps.zone ?? '—')}</b>, soit <b>${html(enDecalage(temps.decalage))}</b> `
      + `à cette date : c’est ce que marquait la pendule, heure d’été comprise. `
      + `Sans cela la figure serait fausse — le décalage entre l’heure légale et le soleil du lieu `
      + `déplace l’ascendant d’un degré par quatre minutes.`);
  } else {
    lignes.push(`Aucun fuseau : avant 1891 il n’en existe pas, et l’heure d’un lieu est celle de `
      + `son soleil. La longitude vaut <b>${html(enDecalage(temps.decalage - eq / 60))}</b>.`);
  }

  lignes.push(`Au soleil de ce lieu, cet instant est <b>${html(enHeures(temps.vrai))}</b> vrai `
    + `et ${html(enHeures(temps.moyen))} moyen ; il est ${html(enHeures(temps.universel))} `
    + `au méridien de Greenwich. L’équation du temps vaut ce jour-là `
    + `<b>${signe}${Math.abs(eq).toFixed(1)} min</b> : c’est de cela que le cadran solaire `
    + `${eq >= 0 ? 'avance sur' : 'retarde sur'} l’horloge.`);

  return `<section>
    <h3>L’heure, et laquelle</h3>
    ${lignes.map((l) => `<p>${l}</p>`).join('')}
    <span class="renvoi">Fuseaux : base tz du système, via tz-lookup. Équation du temps :
    angle horaire du Soleil, astronomy-engine.</span>
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

/** Le carré, et sous lui la ligne qui commente les regards au survol. */
function hoteDuCarre(figure, cartouche, repos) {
  return `<div class="carre-hote">
    ${carre(figure, cartouche)}
    <p class="glose-aspect" data-repos="${html(repos)}">${html(repos)}</p>
  </div>`;
}

const AU_REPOS = 'Touchez ou survolez une planète pour voir ses regards.';

/** Ce qu'un astrologien aurait dit debout, avant de s'asseoir : trois lignes.
 *  Tout le reste est du détail, et le détail se replie. */
function troisLignes(figure) {
  const s = figure.seigneurAscendantPlace;
  const etat = s.etat?.tenues.length ? s.etat.tenues.join(' et ')
    : s.etat?.perdues.length ? s.etat.perdues.join(' et ')
      : peregrinDe(figure.seigneurAscendant);
  const soleil = figure.astres.find((a) => a.clef === 'soleil');

  return `<dl class="verdict-court">
    <dt>Ascendant</dt>
    <dd>${html(enSigne(figure.ascendant))} — son seigneur <b>${html(nomDe(figure.seigneurAscendant))}</b>
      en ${rangHtml(s.maison)} maison, ${html(etat)}</dd>
    <dt>Almuten</dt>
    <dd><b>${html(nomDe(figure.almuten.vainqueur.planete))}</b> — c’est lui qui gouverne la
      figure entière, et non le signe du Soleil</dd>
    <dt>Soleil</dt>
    <dd>${html(enSigne(soleil.longitude))}, en ${rangHtml(soleil.maison)} maison —
      ${figure.deJour ? 'nativité de jour' : 'nativité de nuit'}</dd>
  </dl>`;
}

function rendreFigure(saisie, cartouche, { titreCarre = '', dossier = null } = {}) {
  const resultat = dresser(saisie);
  const { figure, heures, planetaires, julien, temps, vie } = resultat;
  const phrases = enPhrases(figure).map((p) => `<section>
      <h3>${html(p.titre)}</h3><p>${p.texte}</p>
      <span class="renvoi">${html(p.source)}</span>
    </section>`).join('');

  return {
    figure, heures, planetaires, resultat,
    markup: `
      <div class="issue">
        ${hoteDuCarre(figure, cartouche, AU_REPOS)}
        <div class="issue-texte">
          ${titreCarre}
          ${troisLignes(figure)}
          ${dossier ? actions(dossier, dossierNativite({ saisie, resultat })) : ''}
        </div>
      </div>
      <details class="detail">
        <summary>Le détail : les douze matières, le relevé, l’heure vraie</summary>
        <div class="detail-corps">
          <p class="legende-carre">Carré astrologique — la construction des manuscrits :
          un carré, le losange de ses milieux de côtés, les deux diagonales. On lit dans le
          sens contraire des aiguilles d’une montre à partir de l’ascendant, à gauche. La roue
          n’existe pas au Moyen Âge ; c’est une invention du XIX<sup>e</sup> siècle.
          ${julien ? 'Date julienne.' : ''}</p>
          ${phrases}
          ${blocSommaire(figure)}
          ${blocPerfection(figure)}
          ${blocCorps(figure)}
          ${blocVie(vie)}
          ${blocLecture(figure)}
          ${blocHeures(heures, planetaires)}
          ${blocTemps(temps)}
          <h3>Le relevé</h3>
          ${tableauDesAstres(figure)}
          <h3>Les douze maisons</h3>
          ${tableauDesMaisons(figure)}
        </div>
      </details>`,
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
    convention: $('#convention').value,
    sexe: $('#sexe').value || null,
  };
}

/** La convention proposée dépend de la date : l'heure légale n'existe pas
 *  avant 1891. On la met à jour tant que le lecteur n'a pas choisi lui-même. */
let conventionChoisieALaMain = false;

function noterConvention() {
  const annee = +$('#annee').value;
  const select = $('#convention');
  if (!conventionChoisieALaMain) select.value = conventionParDefaut(annee);

  const zone = fuseauDe(+$('#latitude').value, +$('#longitude').value);
  const etat = $('#etat-temps');
  if (!etat) return;
  if (select.value === 'legale') {
    etat.textContent = zone ? `fuseau ${zone}` : 'fuseau introuvable — heure du lieu';
  } else {
    etat.textContent = annee >= 1891 ? 'avant les fuseaux — inhabituel après 1891' : 'avant les fuseaux';
  }
}

// ─── Le dossier pour un modèle de langue ─────────────────────────────────────
//
// On ne branche pas d'API : le site reste statique, sans clé, sans serveur et
// sans rien qui sorte de la machine. Le lecteur emporte le dossier et le colle
// où il veut. Le modèle ne reçoit aucune latitude doctrinale — la figure, les
// règles, la méthode et les interdits lui sont fournis d'un bloc.

const DOSSIERS = new Map();

/** Le chemin principal. Le dossier fait plusieurs milliers de mots : aucune URL
 *  ne le porterait. On le copie, et le lecteur le colle dans le modèle qu'il
 *  veut — le site ne nomme aucun fournisseur et n'en ouvre aucun. */
function actions(clef, texte) {
  DOSSIERS.set(clef, texte);
  const mots = texte.split(/\s+/).length;
  return `<div class="actions" data-dossier="${clef}">
    <button type="button" class="principal copier">Interpréter avec un LLM</button>
    <p class="actions-note" aria-live="polite">≈ ${mots.toLocaleString('fr-FR')} mots : la figure,
      les tables de doctrine avec leurs sources, la méthode, le ton, et ce que le modèle n’a pas
      le droit de dire. Il n’a rien à inventer.</p>
    <details class="dossier-voir">
      <summary>Voir le dossier</summary>
      <pre>${html(texte)}</pre>
    </details>
  </div>`;
}

function initCopie() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('.copier');
    if (!b) return;
    const zone = b.closest('.actions');
    const texte = DOSSIERS.get(zone?.dataset.dossier);
    if (!texte) return;

    // L'appel doit partir dans le même tour de boucle que le clic : le
    // presse-papier exige une activation de l'utilisateur, qu'un await
    // consommerait.
    const copie = navigator.clipboard?.writeText(texte);

    const note = zone.querySelector('.actions-note');
    const dire = (m) => { note.textContent = m; note.classList.add('dit'); };
    const fait = () => dire('Dossier copié. Collez-le (⌘V, ou Ctrl+V) dans le modèle de '
      + 'votre choix — il contient la consigne, il n’y a rien à ajouter.');

    Promise.resolve(copie).then(fait).catch(() => {
      // L'API moderne exige un contexte sécurisé et une permission ; ni l'un
      // ni l'autre n'est garanti. Le vieux execCommand n'en demande aucun, et
      // c'est la seule raison de le garder.
      if (copierALAncienne(texte)) return fait();
      zone.querySelector('details').open = true;
      return dire('La copie a été refusée par le navigateur. Le dossier est déplié ci-dessous : '
        + 'sélectionnez-le et copiez-le à la main.');
    });
  });
}

function copierALAncienne(texte) {
  const zone = document.createElement('textarea');
  zone.value = texte;
  zone.setAttribute('readonly', '');
  zone.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
  document.body.appendChild(zone);
  zone.select();
  let fait = false;
  try { fait = document.execCommand('copy'); } catch { fait = false; }
  zone.remove();
  return fait;
}

/** Le carré s'anime tout seul à l'insertion — c'est du CSS. Ne reste ici que
 *  ce qui demande un pointeur : allumer les regards d'une planète. */
function initCarre() {
  const eteindre = (svg) => {
    svg.classList.remove('survol');
    svg.querySelectorAll('.aspect.vif').forEach((l) => l.classList.remove('vif'));
    const p = svg.parentElement?.querySelector('.glose-aspect');
    if (p) p.textContent = p.dataset.repos ?? '';
  };

  const allumer = (groupe) => {
    const svg = groupe.closest('svg.carre');
    const clef = groupe.dataset.astre;
    const gloses = [];
    svg.querySelectorAll('.aspect').forEach((l) => {
      const vif = l.dataset.de === clef || l.dataset.a === clef;
      l.classList.toggle('vif', vif);
      if (vif) gloses.push(l.dataset.glose);
    });
    svg.classList.add('survol');
    const p = svg.parentElement?.querySelector('.glose-aspect');
    if (p) {
      p.textContent = gloses.length ? gloses.join(' · ')
        : 'Cette planète ne regarde aucune autre : elle est seule dans la figure.';
    }
  };

  const suivre = (e) => {
    const groupe = e.target.closest?.('.astre-groupe[data-astre]');
    document.querySelectorAll('svg.carre.survol').forEach((svg) => {
      if (!groupe || !svg.contains(groupe)) eteindre(svg);
    });
    if (groupe) allumer(groupe);
  };

  document.addEventListener('mouseover', suivre);
  document.addEventListener('click', suivre);
}

// ─── Les questions : la révolution de l'année, et l'interrogation ────────────

function rendreAnnee(saisie, age) {
  const resultat = dresser(saisie);
  const f = figureDeLAnnee({
    jjNatal: resultat.jj, age, latitude: saisie.latitude, longitude: saisie.longitude,
    sexe: saisie.sexe ?? null,
  });
  if (!f) return '<p>Le retour solaire n’a pas été trouvé pour cet âge.</p>';

  const d = dateGregorienne(f.jj);
  const fin = dateGregorienne(f.finit);
  const m = f.maitre;
  const etat = m.annuel.etat;
  // On dit ici ce que la planète tient, et rien de plus : le verdict — peut-elle
  // donner, oui ou non — se lit plus bas, où l'on montre le compte entier.
  const force = etat?.tenues.length ? etat.tenues.join(' et ')
    : etat?.perdues.length ? etat.perdues.join(' et ')
      : `${peregrinDe(m.clef)} — sans dignité aucune en ce lieu`;

  const peut = f.maitre.ecart.annuel?.fort;

  return `<div class="issue">
    ${hoteDuCarre(f.annuelle, {
    titre: 'Revolutio anni',
    lignes: [`${age} ans`, `${d.jour}/${d.mois}/${d.annee}`, $('#lieu').value || '—'],
  }, AU_REPOS)}
    <div class="issue-texte">
      <dl class="verdict-court">
        <dt>La matière</dt>
        <dd>${rangHtml(m.profection.rang)} maison — ${html(m.profection.titre.toLowerCase())}</dd>
        <dt>Le maître de l’année</dt>
        <dd><b>${html(m.nom)}</b>, en ${rangHtml(m.annuel.maison)} maison, ${html(force)}</dd>
        <dt>Peut-il donner ?</dt>
        <dd class="${peut ? 'oui' : 'non'}">${peut
    ? 'Oui — il réunit les témoignages qu’il faut'
    : 'Non — il lui manque de quoi tenir sa promesse'}</dd>
      </dl>
      <p class="cadre-dates">Vaut du ${d.jour}/${d.mois}/${d.annee} au
        ${fin.jour}/${fin.mois}/${fin.annee}.</p>
      ${actions('annee', dossierAnnee({ saisie, resultat, annee: f }))}
    </div>
  </div>
  <details class="detail">
    <summary>Le détail : la profection, le compte des témoignages, les douze mois</summary>
    <div class="detail-corps">
      <section>
        <h3>La maison de l’année</h3>
        <p>À <b>${age} ans</b>, la profection porte sur la
        <b>${rangHtml(m.profection.rang)} maison</b> — ${html(m.profection.titre.toLowerCase())} :
        ${html(m.profection.detail)}. C’est la matière que l’année met en jeu.</p>
        <p>Le signe profecté est ${html(enSigne(m.signeProfecte))}.</p>
        <span class="renvoi">${html(SOURCES_ANNEE.profection)}</span>
      </section>
      <section>
        <h3>Le maître de l’année</h3>
        <p>Le seigneur de ce signe est <b>${html(m.nom)}</b> : c’est le <i>dominus anni</i>.
        Tout le jugement de l’année pend à l’état de cette seule planète.</p>
        <p>À la naissance il se tenait à ${html(enSigne(m.natal.longitude))}, en
        ${rangHtml(m.natal.maison)} maison. Dans la figure de l’année il est à
        ${html(enSigne(m.annuel.longitude))}, en <b>${rangHtml(m.annuel.maison)} maison</b>,
        ${html(force)}.</p>
        <span class="renvoi">${html(SOURCES_ANNEE.revolution)}</span>
      </section>
      <section>
        <h3>Fort, ou faible — et où</h3>
        <p>C’est la règle propre au genre, et elle n’a pas d’équivalent dans la nativité : le
        maître de l’année se juge <b>deux fois</b>. Son état au natal dit ce qu’il peut
        promettre ; son état à la révolution dit ce qu’il en fera cette année-ci.</p>
        <p>Une planète peut donner ce qu’elle signifie si elle réunit <b>deux témoignages sur
        trois</b> : le lieu (angle ou succédente), la grande dignité — domicile, exaltation ou
        triplicité, car le terme et la face ne commandent rien — et la liberté, c’est-à-dire
        directe et hors des rayons du Soleil.</p>
        ${leCompte('À la naissance', f.maitre.ecart.natal)}
        ${leCompte('Dans l’année', f.maitre.ecart.annuel)}
        <p class="cas-du-maitre ${f.maitre.ecart.clef}">${html(f.maitre.ecart.texte)}</p>
      </section>
      ${blocMois(f)}
      <section>
        <h3>L’ascendant de l’année</h3>
        <p>${html(enSigne(f.annuelle.ascendant))} monte à l’instant du retour. L’almuten de la
        révolution est <b>${html(nomDe(f.annuelle.almuten.vainqueur.planete))}</b>.</p>
        <p class="mise-en-garde">La révolution ne remplace pas la nativité : elle se lit
        <b>par-dessus</b>. Une année ne donne que ce que la nativité promet — et elle ne rejuge
        ni le métier, ni la complexion, ni le naturel, qui se décident à la naissance et n’en
        bougent plus.</p>
      </section>
    </div>
  </details>`;
}

/** Le compte des trois témoignages, montré pièce à pièce. Dire « faible » sans
 *  dire ce qui manque, c'est demander qu'on vous croie sur parole. */
function leCompte(quand, force) {
  if (!force) return '';
  const ligne = (classe, texte) => `<li class="${classe}">${html(texte)}</li>`;
  return `<div class="compte ${force.fort ? 'peut' : 'ne-peut'}">
    <p><b>${html(quand)}</b> — ${force.compte} sur 3 :
    ${force.fort ? 'elle peut donner' : 'elle ne peut pas donner'}</p>
    <ul>${force.appuis.map((x) => ligne('pour', x)).join('')}${
  force.manques.map((x) => ligne('contre', x)).join('')}</ul>
  </div>`;
}

/** Les douze mois de l'année révolue : le seul calendrier que la technique
 *  produise honnêtement. Il ne dit pas ce qui arrivera, il dit quelle matière
 *  est en jeu à quel moment. */
function blocMois(f) {
  const lignes = f.mois.map((m) => {
    const d = dateGregorienne(m.debut);
    const sien = m.clef === f.maitre.clef;
    return `<tr class="${sien ? 'mois-du-maitre' : ''}">
      <td class="mois-date">${d.jour}/${d.mois}/${d.annee}</td>
      <td class="mois-matiere"><b>${html(m.maison.titre)}</b>
        <span class="cote">${html(m.maison.detail)}</span></td>
      <td class="mois-seigneur">${GLYPHES[m.clef] ?? ''} ${html(m.nom)}${
  sien ? ' <span class="cote">— le maître de l’année</span>' : ''}</td>
    </tr>`;
  }).join('');

  return `<section class="calendrier">
    <h3>Les douze mois</h3>
    <p>La même arithmétique que la profection annuelle, d’un cran plus fin : on avance d’un
    signe par mois révolu. Chaque mois reçoit ainsi une matière et un seigneur.</p>
    <table class="table-mois">${lignes}</table>
    <p class="mise-en-garde">Ce calendrier ne dit pas qu’un événement arrivera à telle date.
    Il dit quelle matière est en jeu à quel moment de l’année — c’est tout ce que la règle
    autorise, et c’est déjà beaucoup.</p>
    <span class="renvoi">Alcabitius, dist. IV ; Abū Maʿshar, De revolutionibus nativitatum.</span>
  </section>`;
}

function rendreQuestion(rangMaison, texteQuestion) {
  const maintenant = new Date();
  const saisie = {
    annee: maintenant.getFullYear(), mois: maintenant.getMonth() + 1, jour: maintenant.getDate(),
    heure: maintenant.getHours(), minute: maintenant.getMinutes(),
    latitude: 48.8566, longitude: 2.3522, convention: 'legale',
  };
  const resultat = dresser(saisie);
  const { figure } = resultat;
  const j = jugerInterrogation(figure, rangMaison);
  const dossier = actions('question', dossierInterrogation({
    saisie, resultat, question: texteQuestion, jugement: j,
  }));

  const gardes = j.considerations.length
    ? `<section class="considerations">
        <h3>Avant de juger</h3>
        ${j.considerations.map((c) => `<p class="${c.grave ? 'grave' : ''}">${c.texte}</p>`).join('')}
        <span class="renvoi">${html(SOURCES_QUESTION.considerations)}</span>
      </section>`
    : `<section class="considerations">
        <h3>Avant de juger</h3>
        <p>Aucune des considérations de Bonatti ne s’oppose au jugement : l’ascendant n’est ni
        au début ni à la fin de son signe, Saturne n’est pas en septième, et la Lune n’est pas
        vide de course. On peut juger.</p>
        <span class="renvoi">${html(SOURCES_QUESTION.considerations)}</span>
      </section>`;

  return `<div class="issue">
    ${hoteDuCarre(figure, {
    titre: 'Interrogatio',
    lignes: [`${saisie.jour}/${saisie.mois}/${saisie.annee}`,
      `${String(saisie.heure).padStart(2, '0')} h ${String(saisie.minute).padStart(2, '0')}`,
      'Paris'],
  }, AU_REPOS)}
    <div class="issue-texte">
      <div class="verdict-net ${j.verdict.clef}">
        <span class="reponse ${j.verdict.reponse}">${j.verdict.reponse}</span>
        <p>${html(j.verdict.titre)}</p>
      </div>
      ${j.echeance ? `<p class="cadre-dates">${j.echeance.texte}</p>` : ''}
      ${j.considerations.some((c) => c.grave)
    ? '<p class="cadre-dates alerte">Une considération de Bonatti s’oppose au jugement — '
      + 'voyez le détail avant de vous y fier.</p>' : ''}
      ${dossier}
    </div>
  </div>
  <details class="detail">
    <summary>Le détail : les considérations, la voie de la question, l’échéance</summary>
    <div class="detail-corps">
      <p class="legende-carre">Le ciel à l’instant où la question a été posée. Reposez-la dans
      une heure : ce ne sera plus la même figure. C’est le principe même du genre — et c’est ce
      qu’on lui a le plus reproché.</p>
      ${gardes}
      <section>
        <h3>Le consultant, et la chose</h3>
        <p>Vous êtes l’ascendant, ${html(enSigne(figure.ascendant))}, et son seigneur
        <b>${html(nomDe(j.consultant.clef))}</b>, qui se tient en
        ${rangHtml(j.consultant.maison)} maison.</p>
        <p>La chose demandée est la <b>${rangHtml(j.matiere.rang)} maison</b> —
        ${html(j.matiere.titre.toLowerCase())} : ${html(j.matiere.detail)}. Son seigneur est
        <b>${html(nomDe(j.seigneurChose.clef))}</b>, en ${rangHtml(j.seigneurChose.maison)}
        maison.</p>
      </section>
      <section class="verdict ${j.verdict.clef}">
        <h3><span class="reponse ${j.verdict.reponse}">${j.verdict.reponse}</span>
        ${html(j.verdict.titre)}</h3>
        <p>${j.verdict.texte}</p>
        ${j.jonction ? `<p class="cote">L’aspect est en <b>${html(j.jonction.mouvement)}</b> :
        ${html(j.jonction.glose)}.</p>` : ''}
        <span class="renvoi">${html(SOURCES_QUESTION.interrogation)}</span>
      </section>
      ${j.obstacles.length ? `<section class="obstacles">
        <h3>Ce qui coupe la voie</h3>
        ${j.obstacles.map((o) => `<p>${o.texte}</p>`).join('')}
      </section>` : ''}
      ${j.echeance ? `<section class="echeance">
        <h3>Quand</h3>
        <p>${j.echeance.texte}</p>
        <p class="mise-en-garde">C’est le produit d’une table, non une chose que l’on sache.
        Les auteurs ne s’accordent pas sur l’échelle, et il vaut mieux le dire que le taire.</p>
        <span class="renvoi">${html(j.echeance.source)}</span>
      </section>` : ''}
    </div>
  </details>`;
}

function initQuestions() {
  $('#demande').innerHTML = DEMANDES
    .map((d, i) => `<option value="${i}">${html(d.texte)}</option>`).join('');

  $('#formulaire-annee').addEventListener('submit', (e) => {
    e.preventDefault();
    const saisie = lireFormulaire();
    // Le champ vide vaut zéro une fois converti — il faut donc regarder la
    // saisie, non le nombre, sous peine de dresser la profection sur minuit.
    if ($('#heure').value === '') {
      $('#resultat-annee').innerHTML = '<p class="mise-en-garde">Il faut d’abord une heure de '
        + 'naissance dans l’officine : sans ascendant natal, il n’y a pas de profection.</p>';
      return;
    }
    $('#resultat-annee').innerHTML = rendreAnnee(saisie, +$('#age').value);
    montrer('#resultat-annee');
  });

  $('#formulaire-question').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = DEMANDES[+$('#demande').value];
    $('#resultat-question').innerHTML = rendreQuestion(d.maison, d.texte);
    montrer('#resultat-question');
  });

  $('#avertissement-oresme').innerHTML = `
    <h3>Ce que l’Église en pensait</h3>
    <p>C’est ici que l’astrologie cesse d’être tolérée. Juger une nativité passait pour
    naturel — on y lisait une complexion, comme un médecin lit un pouls. Mais <b>poser une
    question au ciel revient à tenir la réponse pour déjà écrite</b>, donc à nier le libre
    arbitre. C’est l’astrologie judiciaire au sens strict, et c’est elle que les
    condamnations visent.</p>
    <p>L’attaque française la plus dure, le <i>Livre de divinacions</i>, est de
    <b>Nicole Oresme</b> — le traducteur de Charles V. Et son traité de la sphère ouvre le
    manuscrit même où sont reliées les cinq nativités royales, Oxford, St John’s College,
    MS 164. <b>Le roi gardait dans un seul volume son astrologue et son sceptique.</b></p>
    <span class="renvoi">Nicole Oresme, Livre de divinacions, v. 1361-1365 ;
    Jean-Patrice Boudet, Entre science et nigromance, Publications de la Sorbonne, 2006.</span>`;
}

function noterCalendrier() {
  const s = { annee: +$('#annee').value, mois: +$('#mois').value, jour: +$('#jour').value };
  if (!s.annee) return;
  $('#note-calendrier').textContent = estJulien(s)
    ? 'Date antérieure à octobre 1582 : elle est lue dans le calendrier julien, comme l’aurait fait un calculateur du temps.'
    : 'Date lue dans le calendrier grégorien.';
}

/** Sur un téléphone, le formulaire occupe l'écran entier : sans cela le lecteur
 *  reste devant ses champs et croit qu'il ne s'est rien passé. */
function montrer(selecteur) {
  $(selecteur).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Les deux autres genres ne servent à rien sans naissance saisie : la page ne
 *  les montre qu'une fois la figure dressée, et propose d'emblée l'âge qu'a le
 *  natif aujourd'hui — c'est celui qu'on veut neuf fois sur dix. */
function ouvrirLaSuite(saisie) {
  const suite = $('#suite');
  if (!suite.hidden) return;
  suite.hidden = false;
  const maintenant = new Date();
  const age = maintenant.getFullYear() - saisie.annee
    - (maintenant.getMonth() + 1 < saisie.mois
      || (maintenant.getMonth() + 1 === saisie.mois && maintenant.getDate() < saisie.jour) ? 1 : 0);
  if (age >= 0 && age <= 110) $('#age').value = age;
}

function initOfficine() {
  $('#convention').innerHTML = Object.values(CONVENTIONS)
    .map((c) => `<option value="${c.clef}">${html(c.nom)}</option>`).join('');
  $('#convention').addEventListener('change', () => {
    conventionChoisieALaMain = true;
    noterConvention();
  });

  installerRechercheDeLieu({
    champ: $('#lieu'),
    liste: $('#lieux'),
    etat: $('#etat-lieu'),
    surChoix: (lieu) => {
      $('#latitude').value = lieu.latitude.toFixed(4);
      $('#longitude').value = lieu.longitude.toFixed(4);
      noterConvention();
    },
  });

  for (const id of ['#latitude', '#longitude']) {
    $(id).addEventListener('input', noterConvention);
  }
  for (const id of ['#annee', '#mois', '#jour']) {
    $(id).addEventListener('input', () => { noterCalendrier(); noterConvention(); });
  }
  noterCalendrier();
  noterConvention();

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
    }, { dossier: 'nativite' });
    $('#resultat').innerHTML = markup;
    ouvrirLaSuite(saisie);
    montrer('#resultat');
  });

  $('#sans-heure').addEventListener('click', () => {
    $('#heure').value = '';
    $('#resultat').innerHTML = rendreSansHeure(lireFormulaire());
    $('#suite').hidden = true;
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
      ${rendreSansHeure({ ...n, heure: 12, minute: 0, convention: 'vraie' })}`;
  }

  const saisie = { ...n, convention: 'vraie' };
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

  const formule = (paire) => `asc + ${nomDe(paire[0])} − ${nomDe(paire[1])}`;
  const partsTable = PARTS.table.map((p) => `<tr${p.selonLeSexe ? ' class="indecise"' : ''}>
    <td><b>${html(p.nom)}</b> <i class="cote">${html(p.latin)}</i></td>
    ${p.selonLeSexe
    ? `<td>${formule(p.selonLeSexe.homme)} <span class="cote">si le natif est un homme</span></td>
       <td>${formule(p.selonLeSexe.femme)} <span class="cote">si c’est une femme</span></td>`
    : `<td>${formule(p.dejour)} <span class="cote">de jour</span></td>
       <td>${formule(p.denuit)} <span class="cote">de nuit</span></td>`}
    <td>${html(p.detail)}</td>
    </tr>`).join('');

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
      distance reportée depuis l’ascendant. La Fortune et l’Esprit se renversent entre le jour et
      la nuit, et le ciel dit lui-même dans quel cas on se trouve ; le Règne se prend toujours du
      même côté. Le Mariage, lui, se renverse sur le sexe du natif — une donnée que le ciel ne
      porte pas, et la seule que ce site demande sans pouvoir la calculer.</p>
      <table class="releve">
        <thead><tr><th>Part</th><th>Un sens…</th><th>…ou l’autre</th>
          <th>Ce qu’elle regarde</th></tr></thead>
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

initCopie();
initCarre();
initNavigation();
initOfficine();
initQuestions();
initNativites();
initMethode();

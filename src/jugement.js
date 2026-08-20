// Le jugement : appliquer la doctrine à une figure.
//
// Tout ce qui suit est mécanique et incontesté — les dignités, l'almuten, les
// parts, les regards. Ce qui ne l'est pas (la durée de vie, le caractère)
// n'est pas calculé : voir RESERVES dans doctrine.js.

import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS,
} from './doctrine.js';
import { PLANETES, maisonDe, signeDe, mod360, enSigne } from './ciel.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));
NOMS.teste = 'Teste du dragon';
NOMS.queue = 'Queue du dragon';
export const nomDe = (clef) => NOMS[clef] ?? clef;

/** Le seigneur du domicile d'un degré. */
export const seigneurDuSigne = (longitude) => DOMICILES.table[signeDe(longitude)];

/** Le seigneur du terme — cinq tranches inégales par signe. */
export function seigneurDuTerme(longitude) {
  const degre = mod360(longitude) % 30;
  return TERMES.table[signeDe(longitude)].find(([, fin]) => degre < fin)[0];
}

/** Le seigneur de la face — un décan de dix degrés. */
export function seigneurDeLaFace(longitude) {
  const rang = Math.floor(mod360(longitude) / 10) % 36;
  return FACES.ordre[rang % 7];
}

/** Le seigneur de la triplicité, qui dépend du jour et de la nuit. */
export function seigneurDeLaTriplicite(longitude, deJour) {
  const t = TRIPLICITES.table.find((x) => x.signes.includes(signeDe(longitude)));
  return deJour ? t.jour : t.nuit;
}

/** Les cinq dignités essentielles tenues sur un degré donné, avec leur poids.
 *  C'est la seule opération de tout le site qui produise un classement. */
export function dignitesDe(longitude, deJour) {
  const signe = signeDe(longitude);
  const degre = mod360(longitude) % 30;
  const trouvees = [];

  trouvees.push({ planete: DOMICILES.table[signe], dignite: 'domicile', poids: POIDS.domicile });

  for (const [planete, e] of Object.entries(EXALTATIONS.table)) {
    if (e.signe === signe) trouvees.push({ planete, dignite: 'exaltation', poids: POIDS.exaltation });
  }

  const t = TRIPLICITES.table.find((x) => x.signes.includes(signe));
  trouvees.push({
    planete: deJour ? t.jour : t.nuit, dignite: 'triplicité', poids: POIDS.triplicite,
  });

  trouvees.push({ planete: seigneurDuTerme(longitude), dignite: 'terme', poids: POIDS.terme });
  trouvees.push({ planete: seigneurDeLaFace(longitude), dignite: 'face', poids: POIDS.face });

  void degre;
  return trouvees;
}

/** L'almuten d'un degré : la planète qui y cumule le plus de dignités.
 *  Le mot est arabe (al-mubtazz, « celui qui l'emporte ») et le calcul est
 *  la seule chose qu'un astrologien fasse deux fois de la même manière. */
export function almutenDe(longitude, deJour) {
  const scores = {};
  const detail = {};
  for (const d of dignitesDe(longitude, deJour)) {
    if (d.planete === 'teste' || d.planete === 'queue') continue;
    scores[d.planete] = (scores[d.planete] ?? 0) + d.poids;
    (detail[d.planete] ??= []).push(d.dignite);
  }
  const classement = Object.entries(scores)
    .map(([planete, score]) => ({ planete, score, dignites: detail[planete] }))
    .sort((a, b) => b.score - a.score);
  return { vainqueur: classement[0], classement };
}

/** L'état d'une planète : où elle est, ce qu'elle y tient, ce qu'elle y perd. */
export function etatDe(clef, longitude, deJour) {
  const signe = signeDe(longitude);
  const tenues = [];
  if (DOMICILES.table[signe] === clef) tenues.push('en son domicile');
  const ex = EXALTATIONS.table[clef];
  if (ex && ex.signe === signe) tenues.push('en son exaltation');
  if (seigneurDeLaTriplicite(longitude, deJour) === clef) tenues.push('en sa triplicité');
  if (seigneurDuTerme(longitude) === clef) tenues.push('en son terme');
  if (seigneurDeLaFace(longitude) === clef) tenues.push('en sa face');

  const perdues = [];
  if (DOMICILES.table[(signe + 6) % 12] === clef) perdues.push('en son exil');
  if (ex && (ex.signe + 6) % 12 === signe) perdues.push('en sa chute');

  return { tenues, perdues, pérégrine: tenues.length === 0 && perdues.length === 0 };
}

/** Les regards que les planètes se portent, avec l'orbe propre à chacune. */
export function regards(positions) {
  const clefs = PLANETES.map((p) => p.clef);
  const trouves = [];
  for (let i = 0; i < clefs.length; i++) {
    for (let j = i + 1; j < clefs.length; j++) {
      const a = clefs[i], b = clefs[j];
      const ecart = Math.abs(((positions[a].longitude - positions[b].longitude + 180) % 360) - 180);
      const orbe = (ORBES.table[a] + ORBES.table[b]) / 2;
      for (const asp of ASPECTS.table) {
        const distance = Math.abs(ecart - asp.angle);
        if (distance <= orbe) {
          trouves.push({ de: a, a: b, aspect: asp, ecart: distance, exact: distance < 1 });
          break;
        }
      }
    }
  }
  return trouves.sort((x, y) => x.ecart - y.ecart);
}

/** Les parts. Une part est une distance reportée depuis l'ascendant, et
 *  la plupart se renversent entre le jour et la nuit. */
export function parts(positions, ascendant, deJour) {
  return PARTS.table.map((p) => {
    const [de, a] = deJour ? p.dejour : p.denuit;
    return {
      ...p,
      longitude: mod360(ascendant + positions[de].longitude - positions[a].longitude),
      formule: `ascendant + ${nomDe(de)} − ${nomDe(a)}`,
    };
  });
}

/** La figure complète : positions, maisons, dignités, parts, regards. */
export function juger({ positions: pos, maisons: mai }) {
  const soleilEnMaison = maisonDe(pos.soleil.longitude, mai.pointes);
  const deJour = soleilEnMaison >= 7;

  const astres = [...PLANETES.map((p) => p.clef), 'teste', 'queue'].map((clef) => {
    const longitude = pos[clef].longitude;
    return {
      clef,
      nom: nomDe(clef),
      longitude,
      retrograde: pos[clef].retrograde,
      noeud: !!pos[clef].noeud,
      maison: maisonDe(longitude, mai.pointes),
      seigneur: seigneurDuSigne(longitude),
      etat: pos[clef].noeud ? null : etatDe(clef, longitude, deJour),
    };
  });

  const seigneurAscendant = seigneurDuSigne(mai.ascendant);
  const almuten = almutenDe(mai.ascendant, deJour);

  return {
    deJour,
    soleilEnMaison,
    astres,
    ascendant: mai.ascendant,
    milieuDuCiel: mai.milieuDuCiel,
    pointes: mai.pointes,
    seigneurAscendant,
    seigneurAscendantPlace: astres.find((a) => a.clef === seigneurAscendant),
    almuten,
    parts: parts(pos, mai.ascendant, deJour),
    regards: regards(pos),
    maisonsHabitees: MAISONS.table.map((m, i) => ({
      rang: i + 1,
      ...m,
      pointe: mai.pointes[i + 1],
      seigneur: seigneurDuSigne(mai.pointes[i + 1]),
      hotes: astres.filter((a) => a.maison === i + 1),
    })),
  };
}

/** Le jugement en toutes lettres — chaque phrase renvoyant à sa règle. */
export function enPhrases(figure) {
  const p = [];
  const nom = (c) => nomDe(c);
  const seigneur = figure.seigneurAscendantPlace;

  p.push({
    titre: 'La secte',
    texte: figure.deJour
      ? `Nativité de jour : le Soleil est en la ${figure.soleilEnMaison}ᵉ maison, au-dessus de la terre. Les seigneurs de triplicité diurnes gouvernent, et le Soleil l’emporte sur la Lune.`
      : `Nativité de nuit : le Soleil est en la ${figure.soleilEnMaison}ᵉ maison, sous la terre. Les seigneurs de triplicité nocturnes gouvernent, et la Lune l’emporte sur le Soleil.`,
    source: 'Alcabitius, dist. III — la secte du jour et de la nuit',
  });

  p.push({
    titre: 'L’ascendant',
    texte: `L’horoscopus — le degré qui monte — est à ${enSigne(figure.ascendant)}. `
      + `Son seigneur est ${nom(figure.seigneurAscendant)}, qui se trouve à ${enSigne(seigneur.longitude)}, `
      + `en la ${seigneur.maison}ᵉ maison`
      + (seigneur.etat.tenues.length ? `, ${seigneur.etat.tenues.join(' et ')}.`
        : seigneur.etat.perdues.length ? `, ${seigneur.etat.perdues.join(' et ')}.`
          : `, pérégrine — sans dignité aucune en ce lieu.`),
    source: 'Alcabitius, dist. I — les domiciles ; dist. IV — l’état des planètes',
  });

  const a = figure.almuten;
  p.push({
    titre: 'L’almuten de l’ascendant',
    texte: `Sur ce degré, ${nom(a.vainqueur.planete)} l’emporte avec ${a.vainqueur.score} forces `
      + `(${a.vainqueur.dignites.join(', ')}). `
      + `Viennent ensuite ${a.classement.slice(1, 3).map((x) => `${nom(x.planete)} (${x.score})`).join(' et ')}. `
      + `C’est cette planète, non le signe, qui gouverne la figure.`,
    source: 'Dignités : Alcabitius, dist. I. Pondération : tradition latine (Bonatti)',
  });

  const dixieme = figure.maisonsHabitees[9];
  p.push({
    titre: 'La dignité — dixième maison',
    texte: `La pointe de la dixième maison, dite regnum, est à ${enSigne(dixieme.pointe)}, `
      + `dont le seigneur est ${nom(dixieme.seigneur)}. `
      + (dixieme.hotes.length
        ? `S’y tiennent : ${dixieme.hotes.map((h) => `${h.nom} à ${enSigne(h.longitude)}`).join(', ')}.`
        : `Aucune planète ne s’y tient : on juge alors par son seigneur seul.`),
    source: 'Alcabitius, dist. I — les maisons et leurs significations',
  });

  const fortune = figure.parts[0];
  p.push({
    titre: 'La part de Fortune',
    texte: `${enSigne(fortune.longitude)} — calculée ${fortune.formule}, `
      + `comme il convient ${figure.deJour ? 'de jour' : 'de nuit'} : la formule se renverse avec la secte. `
      + `Elle regarde le corps et l’avoir, non le bonheur.`,
    source: 'Alcabitius, dist. V — les parts universelles',
  });

  const serres = figure.regards.filter((r) => r.ecart < 3).slice(0, 4);
  if (serres.length) {
    p.push({
      titre: 'Les regards serrés',
      texte: serres.map((r) => `${nom(r.de)} ${r.aspect.glyphe} ${nom(r.a)} `
        + `(${r.aspect.nom}, ${r.ecart.toFixed(1)}°${r.exact ? ', par degré partil' : ''})`).join(' ; ') + '.',
      source: 'Alcabitius, dist. III — les aspects ; orbes d’après al-Bīrūnī',
    });
  }

  return p;
}

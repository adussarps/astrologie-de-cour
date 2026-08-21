// Le lieu — parce qu'une figure sans longitude n'est pas une figure.
//
// Deux sources, dans cet ordre : une liste courte de lieux qui comptent pour
// ce site, disponible hors ligne et affichée d'emblée ; puis Photon, le
// géocodeur libre de Komoot, adossé à OpenStreetMap, sans clé ni compte. Si
// le réseau manque ou refuse, la liste courte et la saisie manuelle des
// coordonnées suffisent : le site continue de fonctionner seul.

const PHOTON = 'https://photon.komoot.io/api/';

// Les lieux du dossier. Ils restent proposés d'office, avant toute recherche.
export const LIEUX_CORPUS = [
  { nom: 'Paris', latitude: 48.8566, longitude: 2.3522, note: 'les cinq nativités royales' },
  { nom: 'Vincennes', latitude: 48.8478, longitude: 2.4370, note: 'naissance de Charles V' },
  { nom: 'Orthez', latitude: 43.4906, longitude: -0.7728, note: 'la cour de Fébus' },
  { nom: 'Pau', latitude: 43.2951, longitude: -0.3708, note: 'naissance de Fébus' },
  { nom: 'Avignon', latitude: 43.9493, longitude: 4.8055, note: 'la cour pontificale' },
  { nom: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
  { nom: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
  { nom: 'Lyon', latitude: 45.7640, longitude: 4.8357 },
  { nom: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
  { nom: 'Rouen', latitude: 49.4432, longitude: 1.0993 },
  { nom: 'Dijon', latitude: 47.3220, longitude: 5.0415 },
  { nom: 'Reims', latitude: 49.2583, longitude: 4.0317 },
  { nom: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
  { nom: 'Lille', latitude: 50.6292, longitude: 3.0573 },
  { nom: 'Strasbourg', latitude: 48.5734, longitude: 7.7521 },
  { nom: 'Bruges', latitude: 51.2093, longitude: 3.2247 },
  { nom: 'Londres', latitude: 51.5074, longitude: -0.1278 },
  { nom: 'Oxford', latitude: 51.7520, longitude: -1.2577, note: 'St John’s College, MS 164' },
  { nom: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { nom: 'Bologne', latitude: 44.4949, longitude: 11.3426, note: 'la faculté d’astrologie' },
  { nom: 'Florence', latitude: 43.7696, longitude: 11.2558 },
  { nom: 'Venise', latitude: 45.4408, longitude: 12.3155 },
  { nom: 'Tolède', latitude: 39.8628, longitude: -4.0273, note: 'les Tables alphonsines' },
  { nom: 'Barcelone', latitude: 41.3874, longitude: 2.1686 },
  { nom: 'Séville', latitude: 37.3891, longitude: -5.9845 },
  { nom: 'Prague', latitude: 50.0755, longitude: 14.4378 },
  { nom: 'Chiraz', latitude: 29.5918, longitude: 52.5837 },
  { nom: 'Le Caire', latitude: 30.0444, longitude: 31.2357 },
];

const sansAccents = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** La liste courte, filtrée — instantanée, et disponible hors ligne. */
export function chercherLocalement(requete, limite = 6) {
  const q = sansAccents(requete.trim());
  if (!q) return LIEUX_CORPUS.slice(0, limite).map((l) => ({ ...l, source: 'corpus' }));
  return LIEUX_CORPUS
    .filter((l) => sansAccents(l.nom).startsWith(q))
    .slice(0, limite)
    .map((l) => ({ ...l, source: 'corpus' }));
}

/** Le libellé d'un résultat Photon : « Orthez, Pyrénées-Atlantiques, France ». */
function libelle(p) {
  const parties = [p.name, p.city && p.city !== p.name ? p.city : null, p.state, p.country];
  return parties.filter(Boolean).join(', ');
}

/** Photon. Renvoie une liste vide plutôt que de lever : l'absence de réseau
 *  n'est pas une erreur, c'est un mode de fonctionnement. */
export async function chercherEnLigne(requete, { signal } = {}) {
  const q = requete.trim();
  if (q.length < 2) return [];
  const url = `${PHOTON}?q=${encodeURIComponent(q)}&limit=8&lang=fr`;
  try {
    const r = await fetch(url, { signal });
    if (!r.ok) return [];
    const donnees = await r.json();
    return (donnees.features ?? [])
      .filter((f) => Array.isArray(f.geometry?.coordinates))
      .map((f) => ({
        nom: libelle(f.properties),
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        source: 'photon',
      }));
  } catch {
    return [];
  }
}

/** Fusionner les deux sources sans doublon de coordonnées. */
function fusionner(locaux, distants, limite = 10) {
  const vus = new Set(locaux.map((l) => `${l.latitude.toFixed(2)},${l.longitude.toFixed(2)}`));
  const retenus = [...locaux];
  for (const d of distants) {
    const clef = `${d.latitude.toFixed(2)},${d.longitude.toFixed(2)}`;
    if (vus.has(clef)) continue;
    vus.add(clef);
    retenus.push(d);
    if (retenus.length >= limite) break;
  }
  return retenus;
}

/** Le champ de recherche : liste déroulante, navigable au clavier, qui
 *  n'attend jamais le réseau pour afficher quelque chose. */
export function installerRechercheDeLieu({ champ, liste, etat, surChoix }) {
  let resultats = [];
  let actif = -1;
  let minuterie = null;
  let requeteEnCours = null;

  const fermer = () => {
    liste.innerHTML = '';
    liste.hidden = true;
    actif = -1;
    champ.setAttribute('aria-expanded', 'false');
    champ.removeAttribute('aria-activedescendant');
  };

  const dessiner = () => {
    if (!resultats.length) return fermer();
    liste.innerHTML = resultats.map((r, i) => `<li role="option" id="lieu-opt-${i}"
        class="${i === actif ? 'actif' : ''}" data-rang="${i}"
        aria-selected="${i === actif}">
        <span class="nom">${r.nom.replace(/</g, '&lt;')}</span>
        ${r.note ? `<span class="note">${r.note}</span>` : ''}
        <span class="coord">${r.latitude.toFixed(2)}°, ${r.longitude.toFixed(2)}°</span>
      </li>`).join('');
    liste.hidden = false;
    champ.setAttribute('aria-expanded', 'true');
    if (actif >= 0) champ.setAttribute('aria-activedescendant', `lieu-opt-${actif}`);
  };

  const choisir = (i) => {
    const r = resultats[i];
    if (!r) return;
    champ.value = r.nom;
    fermer();
    surChoix(r);
  };

  const chercher = async (q) => {
    resultats = chercherLocalement(q);
    actif = -1;
    dessiner();

    if (q.trim().length < 2) return;
    requeteEnCours?.abort();
    requeteEnCours = new AbortController();
    if (etat) etat.textContent = 'recherche…';
    const distants = await chercherEnLigne(q, { signal: requeteEnCours.signal });
    if (champ.value !== q) return; // la saisie a changé entre-temps
    if (etat) {
      etat.textContent = distants.length ? '' : 'hors ligne — liste courte et saisie manuelle';
    }
    resultats = fusionner(chercherLocalement(q), distants);
    dessiner();
  };

  champ.setAttribute('role', 'combobox');
  champ.setAttribute('aria-autocomplete', 'list');
  champ.setAttribute('aria-expanded', 'false');
  champ.setAttribute('aria-controls', liste.id);
  liste.setAttribute('role', 'listbox');
  liste.hidden = true;

  champ.addEventListener('input', () => {
    clearTimeout(minuterie);
    const q = champ.value;
    minuterie = setTimeout(() => chercher(q), 220);
  });

  champ.addEventListener('focus', () => { if (!champ.value.trim()) chercher(''); });

  champ.addEventListener('keydown', (e) => {
    if (liste.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      chercher(champ.value);
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown') { actif = Math.min(actif + 1, resultats.length - 1); dessiner(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { actif = Math.max(actif - 1, 0); dessiner(); e.preventDefault(); }
    else if (e.key === 'Enter' && actif >= 0) { choisir(actif); e.preventDefault(); }
    else if (e.key === 'Escape') fermer();
  });

  liste.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-rang]');
    if (li) { choisir(Number(li.dataset.rang)); e.preventDefault(); }
  });

  champ.addEventListener('blur', () => setTimeout(fermer, 120));
}

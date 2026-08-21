// L'échappement, en un seul endroit.
//
// Il en existait trois copies — dans app.js, dans figure.js et dans lieux.js —
// et la troisième était incomplète : elle ne traitait que le chevron ouvrant,
// sur des données venues de Photon, c'est-à-dire d'ailleurs. Une fonction de
// sûreté écrite trois fois est une fonction de sûreté écrite une fois de trop.

const ENTITES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

/** Le texte rendu inoffensif dans un contenu comme dans une valeur d'attribut.
 *  Les guillemets sont échappés eux aussi : sans cela, une chaîne placée dans
 *  un attribut peut en sortir. */
export const html = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENTITES[c]);

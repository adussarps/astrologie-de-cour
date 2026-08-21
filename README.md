# L’Officine

**Dresser une figure du ciel comme on la dressait en 1380 — et montrer chaque règle avec le
livre qui la porte.**

Un site statique, sans serveur, qui calcule des nativités à la manière des astrologiens de
cour du XIVᵉ siècle : maisons d’Alcabitius, calendrier julien, heures inégales, carré
médiéval, dignités essentielles. Avec les **cinq nativités royales du manuscrit de Charles V**,
leurs légendes latines et leurs cotes de manuscrit.

➡️ **[Voir le site](https://adussarps.github.io/astrologie-de-cour/)**

---

## Pourquoi

Il n’existait pas. On trouve d’un côté des éditions savantes admirables — DISHAS pour les
Tables alphonsines, *Ptolemaeus Arabus et Latinus* pour les manuscrits — et de l’autre des
calculateurs modernes qui proposent « maisons d’Alcabitius » dans un menu déroulant, sans une
source, et qui vous rendent un signe solaire et un caractère. Le raccord manquait : un outil
qui calcule juste **et** qui dit d’où vient chaque règle.

L’astrologie du XIVᵉ siècle n’est pas une superstition tolérée en marge du savoir. C’est une
science universitaire enseignée dans le quadrivium, indissociable de la médecine, et un
service de cour qui se paie. Elle a besoin de tables, d’un astrolabe et d’un calculateur.
Quand un prince consulte, il ne consulte pas un devin : **il paie un homme qui sait compter.**

## Ce que le site montre

### Les cinq carrés de Charles V

Charles V possédait un livre où il avait fait relier le traité de la sphère de Nicole Oresme,
deux traités écrits pour lui par Pèlerin de Prusse, et l’*Introductorius* d’Alcabitius en
français. On y a joint un cahier de trois feuillets : sa nativité, et celles de ses quatre
enfants. Le manuscrit est à **Oxford, St John’s College, MS 164**.

Emmanuel Poulle, qui les a publiés, y voit « une sorte de *livret familial*, constitué par un
père de famille soucieux de conserver […] les données astronomiques qui permettront au
médecin, en cas de maladie, de pronostiquer son évolution ». **Ce n’est pas un recueil de
bonne aventure, c’est un carnet de santé.** Des quatre enfants du cahier, deux mourront en
bas âge dans les cinq ans, un sera assassiné, un deviendra fou.

### Les légendes latines se recoupent — sauf une

Chaque légende annonce non seulement l’heure, mais la **nuit planétaire**, le **rang de
l’heure inégale** et le **seigneur de cette heure**. Ce sont des affirmations vérifiables. Le
site les recalcule dans le navigateur :

| Nativité | nuit planétaire | rang de l’heure | seigneur de l’heure |
|---|---|---|---|
| Charles VI, 3 déc. 1368 | ✓ Mercure | ✓ 9ᵉ | ✓ Lune |
| Louis d’Orléans, 12 mars 1372 | ✓ Lune | ✓ 8ᵉ | ✓ Lune |
| Marie, 27 fév. 1371 | ✓ Soleil | ✓ 9ᵉ | ✓ Vénus |
| Isabelle, 23 juil. 1373 | — (de jour) | ✓ 9ᵉ | ✓ Jupiter |
| **Charles V, 21 janv. 1338** | ✓ Saturne | **≠ 10ᵉ annoncé, 11ᵉ calculé** | **≠ Mars annoncé, Soleil calculé** |

Les quatre enfants tombent juste. Le roi, non : la dixième heure de cette nuit-là court de
3 h 55 à 5 h 09, et la légende annonce 5 h 36. Une explication tient à la règle de
l’**animodar** — la précision à la minute n’est jamais celle d’une horloge, l’astrologien part
de l’heure approximative que donnent les témoins puis la rectifie par le calcul. Les carrés
des enfants ont été dressés sur des relevés frais ; celui du roi, trente-cinq ans après sa
naissance, sur un souvenir.

### La nativité impossible

**Gaston Fébus**, né le 30 avril 1331 à Orthez. La date est sûre, l’heure n’est notée nulle
part. Or ce jour-là l’ascendant parcourt les douze signes en vingt-quatre heures : il n’y a
pas une nativité de Fébus, il y en a douze. Le site refuse de dresser la figure et montre
pourquoi — et il fera de même si **vous** ne donnez pas votre heure.

### La conjonction qui a expliqué la Peste, fausse de quatre jours

En octobre 1348, la faculté de médecine de Paris remet à Philippe VI son *Compendium de
epidemia* et date la cause première de l’épidémie : « une heure après midi le 20 mars » 1345,
grande conjonction de trois planètes en Verseau. Le calcul place la conjonction exacte de
Jupiter et de Saturne au **24 mars**. Les maîtres de Paris n’ont pas regardé le ciel, ils ont
lu les Tables alphonsines. Une conjonction ne s’observe pas, elle se calcule — **c’est le
chiffre qui fait autorité, pas le ciel.**

## Ce que le site ne fait pas

- **Pas de signe solaire, pas de caractère.** Personne, en 1380, n’est *un Bélier* : la notion
  est une invention du XXᵉ siècle. L’astrologie savante travaille sur l’ascendant, les maisons
  et les seigneurs planétaires.
- **Pas de durée de vie chiffrée.** Le *hyleg* et l’*alcocoden* sont la pièce la plus chère
  d’une nativité princière, et la doctrine n’est pas fixée : Ptolémée, Alcabitius et Bonatti
  ne s’accordent pas. Un chiffre unique serait un faux. La règle est donnée, le nombre non.
- **Pas encore la seconde colonne.** Le site calcule le **ciel réel**. Un astrologien de 1380
  calculait avec les **Tables alphonsines**, et les deux divergent. Reconstruire le calcul
  alphonsin depuis les données de [DISHAS](https://dishas.obspm.fr/) et afficher les deux
  colonnes côte à côte avec l’écart en degrés : c’est le vrai travail, et il reste à faire.
  **C’est la contribution la plus utile que quelqu’un puisse apporter à ce dépôt.**

## Exactitude

| Ce qui est vérifié | Comment | Résultat |
|---|---|---|
| Positions planétaires | `astronomy-engine` confronté à Swiss Ephemeris en 1331, 1345 et 1991 | écart maximal **48″**, la plupart sous 20″ |
| Maisons d’Alcabitius | confrontées à Swiss Ephemeris (`hsys 'B'`) sur trois époques et trois latitudes | **écart nul** |
| Heures inégales et planétaires | confrontées aux légendes latines de cinq manuscrits du XIVᵉ siècle | **4 sur 5 exacts**, le cinquième documenté |

Les deux premiers contrôles ont été faits avec `pyswisseph` pendant le développement ; le
troisième tourne à chaque `npm test`.

## Le dossier pour un modèle de langue

Chaque figure — nativité, révolution d’année, interrogation — s’accompagne d’un bouton qui
copie un dossier de six à huit mille mots, à coller dans ChatGPT ou tout autre modèle, pour
qu’il rédige le *judicium*.

Aucune clé, aucun serveur, aucun appel réseau : le site reste statique et rien ne sort de la
machine. Surtout, **le modèle ne reçoit aucune latitude doctrinale**. C’est le point. Un
modèle de langue connaît mille fois mieux le Bélier caractériel du XXᵉ siècle qu’Alcabitius,
et laissé libre il produirait de l’horoscope de magazine sous un vernis ancien. On lui donne
donc tout, et rien d’autre : la figure calculée ici, les tables de doctrine avec leur source,
la méthode du seigneur, le ton, et la liste explicite de ce qu’il n’a pas le droit de dire —
pas de portrait de caractère fondé sur le signe solaire, pas de durée de vie chiffrée, pas
d’événement daté, aucune règle inventée. Il n’apporte que la prose.

**Trois consignes, pas une.** Les trois genres ne se jugent pas de la même façon, et les
confondre est l’erreur que les traités reprochent le plus. Le socle est commun — le ton, la
règle de traduction, la dureté permise, les interdits — mais le plan du *judicium* change :

| Genre | Plan | Ce qu’il refuse de juger |
|---|---|---|
| Nativité | les cinq matières du livre IV du *Tetrabiblos* : la complexion et le corps, le métier, l’avoir, la dignité, les parties adverses | la durée de vie, l’événement daté |
| Révolution | la matière de l’année, le maître jugé deux fois, ce qui a changé depuis la nativité, le calendrier des douze mois | le métier, la complexion, le naturel — ils se décident à la naissance et n’en bougent plus |
| Interrogation | peut-on juger, la voie d’aboutissement, l’échéance, la conduite à tenir | tout ce qui touche à la nativité, dont il ne doit pas parler |

**Aucun nombre n’est laissé à calculer.** C’est la leçon d’un essai réel : un modèle à qui
l’on donnait la position de Vénus mais pas son écart au degré d’exaltation a fait la
soustraction de tête, et annoncé dix-huit minutes d’arc là où il y en avait trente-quatre. Le
raisonnement était juste, le chiffre faux — et c’est le chiffre qu’on retient. Les écarts aux
degrés d’exaltation et de chute, les distances aux aspects, l’âge de la Lune, les dates des
douze mois sont donc tous précalculés et livrés en clair, avec l’ordre exprès de n’en déduire
aucun autre.

C’est aussi la bonne division du travail, historiquement : le calculateur dressait la figure,
et le jugement était un texte rédigé.

## Les trois genres, et ce qu’ils répondent

**La nativité** dit ce qu’un homme est et de quoi il vit. Elle se juge une fois. Le métier
s’y décide par la règle de Ptolémée — la planète qui se lève immédiatement avant le Soleil et
le seigneur du milieu du ciel, dont on ne retient que Mercure, Vénus ou Mars — et la table
nomme des métiers réels : les notaires, les changeurs, les teinturiers, les armuriers. La
santé s’y juge par la mélothésie, l’homme zodiacal : chaque signe gouverne un membre, et l’on
ne saigne pas celui dont la Lune occupe le signe. C’est la seule partie de l’art dont l’usage
fût quotidien, et c’est par elle que l’astrologie tient à la médecine.

**La révolution de l’année** ne rejuge rien. Elle dit ce qui, cette année-ci, est en jeu de ce
que la nativité avait promis. La profection désigne la matière et le maître de l’année ; ce
maître se lit deux fois, au natal et à la révolution, et les quatre cas ne se confondent pas
— fort et fort, la matière se décide ; fort puis faible, la promesse tient mais l’année la
sert mal ; faible puis fort, du mouvement pour rien ; faible et faible, l’année est sourde. La
profection mensuelle divise ensuite l’année en douze, ce qui donne le seul calendrier que la
technique produise honnêtement : non pas la date d’un événement, mais le mois où telle matière
est en jeu.

**L’interrogation** ignore la nativité et répond par oui ou par non. On vérifie d’abord, par
les considérations de Bonatti, qu’on a le droit de juger — et un refus motivé est un jugement
complet. Puis on cherche la voie : application directe, séparation (la chose est déjà faite ou
déjà manquée), translation de lumière (elle se fera par un tiers, dont la nature désigne qui
aller chercher), collection de lumière (il faut la porter devant un plus grand), prohibition,
réfrénation, Lune vide de course. Chaque voie commande une conduite différente, et c’est là
tout son usage. L’échéance se prend en comptant une unité de temps par degré restant, l’unité
venant du lieu et du mode du signe — les auteurs ne s’accordent pas sur l’échelle, et le site
le dit plutôt que de le taire.

C’est aussi ici que l’art cesse d’être toléré. Juger une nativité passait pour naturel ; poser
une question au ciel revient à tenir la réponse pour déjà écrite. C’est ce que Nicole Oresme
attaque dans son *Livre de divinacions* — Oresme, traducteur de Charles V, dont le traité de
la sphère ouvre le manuscrit même où sont reliées les cinq nativités royales.

## Le lieu, et quelle heure

Une figure sans longitude n’est pas une figure, et une heure sans sa convention n’est pas une
heure. Trois choses sont ici tenues séparées, parce qu’on les confond volontiers.

**Interpréter l’instant saisi.** « 12 h 33 » le 19 février 1991 à Paris a été lu sur une
pendule réglée sur l’heure légale, donc UTC+1 : l’instant est 11 h 33 TU. Le lire comme une
heure solaire donnerait 12 h 24 TU — **cinquante minutes plus tard, soit treize degrés
d’ascendant**, assez pour changer le signe qui monte et donc les douze maisons. Le fuseau
vient de `tz-lookup` (coordonnées → zone IANA), et le décalage à la date exacte de la base tz
du système, heure d’été et heures de guerre comprises. Avant 1891 aucun pays n’a d’heure
légale nationale : l’heure d’un lieu est celle de son soleil, et c’est le temps **vrai** —
celui du cadran solaire — qui s’applique, équation du temps comprise.

**Le calcul.** Il se fait en temps universel et n’a aucune convention : le ciel ne sait pas
quelle heure il est.

**L’affichage.** Toujours en temps solaire vrai et en heures inégales, parce que c’est le
cadre de 1380. Le site montre les trois lectures du même instant et l’équation du temps du
jour, plutôt que de les cacher.

Le lieu se cherche dans une liste courte embarquée — les lieux du dossier, disponibles hors
ligne — puis dans [Photon](https://photon.komoot.io), géocodeur libre adossé à OpenStreetMap.
Si le réseau manque, la liste courte et la saisie manuelle des coordonnées suffisent.

## Faire tourner le site

Aucune construction, aucune dépendance à l’exécution. Un serveur de fichiers suffit :

```bash
python3 -m http.server 8765
# puis http://localhost:8765
```

Les outils de développement demandent Node :

```bash
npm install
npm test          # recoupe le corpus avec les légendes des manuscrits
npm run fumee     # charge l'application hors navigateur et vérifie chaque vue
```

## Comment c’est fait

```
src/ciel.js        calendriers, positions, maisons d'Alcabitius, heures inégales et planétaires
src/doctrine.js    la base de règles — aucune donnée sans son champ `source`
src/jugement.js    dignités, almuten, parts, regards, et le jugement en toutes lettres
src/figure.js      le carré médiéval en SVG
src/corpus.js      les nativités documentées, avec latin, traduction et cote
src/temps.js       les conventions de temps — heure légale, heure vraie, équation du temps
src/lieux.js       la recherche de lieu : liste du corpus hors ligne, puis Photon
src/annee.js       la révolution de l'année, la profection, le maître de l'année
src/interrogation.js  les questions, les considérations de Bonatti, la perfection
src/dossier.js     le dossier à coller dans un modèle de langue
src/app.js         l'interface
vendor/            astronomy-engine (MIT) et tz-lookup (CC0), figés
```

**La règle du dépôt :** aucune affirmation sans sa source. Chaque table de `doctrine.js` porte
un champ `source` ; chaque nativité de `corpus.js` porte une cote de manuscrit et une édition.
Si vous ne pouvez pas citer, n’ajoutez pas.

## Contribuer

Les corrections sont bienvenues, et les reproches aussi. Ce qui manque le plus, dans l’ordre :

1. **Le calcul alphonsin** (voir plus haut) — le seul endroit au monde où ce serait fait.
2. **D’autres nativités documentées.** La BnF conserve deux recueils entiers : `lat. 7443`
   (une soixantaine de carrés réunis par Simon de Boesmare) et `nouv. acq. lat. 398`. Chaque
   ajout doit venir avec sa cote, sa légende latine et son édition.
3. **La vérification des termes et des faces** contre l’édition critique d’Alcabitius plutôt
   que contre la tradition imprimée.
4. **L’heure de naissance de Gaston Fébus**, si elle existe quelque part dans les comptes de
   Gaston II. Elle changerait tout.

## Sources

- **[DISHAS / projet ALFA](https://dishas.obspm.fr/)** — les Tables alphonsines numérisées,
  avec API. Observatoire de Paris, ERC 723085.
- **[Ptolemaeus Arabus et Latinus](https://ptolemaeus.badw.de/start)** — 695 manuscrits
  latins catalogués, transcriptions, images.
- **[AstroBibl](https://ptolemaeus.badw.de/astrobibl/start)** — plus de 5 500 titres.
- **Emmanuel Poulle**, « Horoscopes princiers des XIVᵉ et XVᵉ siècles », *Bulletin de la
  Société nationale des Antiquaires de France*, 1969, p. 63-77 —
  [en accès libre sur Persée](https://www.persee.fr/doc/bsnaf_0081-1181_1971_num_1969_1_2163).
  La source directe des cinq nativités.
- **Alcabitius**, *Introductorius ad magisterium iudiciorum astrorum*, éd. Ch. Burnett,
  K. Yamamoto, M. Yano, Warburg Institute, 2004.
- **Jean-Patrice Boudet**, *Entre science et nigromance*, Publications de la Sorbonne, 2006.
- **R. Horrox**, *The Black Death*, Manchester University Press, 1994, pour le *Compendium de
  epidemia*.

## Licence

Le code est sous [licence MIT](LICENSE). Les textes de présentation et les traductions
originales sont sous [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.fr).
`vendor/astronomy.browser.min.js` est
[astronomy-engine](https://github.com/cosinekitty/astronomy) de Don Cross, sous licence MIT.

Rien de ce que vous entrez ne quitte votre navigateur : il n’y a pas de serveur, pas de
mesure d’audience, pas de dépendance chargée à l’exécution hormis une fonte.

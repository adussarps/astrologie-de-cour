# Gaudia planetarum

**Dresser une figure du ciel comme on la dressait en 1380 — et montrer chaque règle avec le
livre qui la porte.**

*Les joies des planètes.* Le nom vient de la doctrine : chaque planète a une maison où les
livres disent qu’elle se réjouit — *gaudet* —, et c’est le mot technique, sans métaphore.
C’est aussi la seule condition favorable de tout le système qui ne pèse rien dans un calcul.
Le site est à son image : il donne ce qui se démontre, il nomme ce qui se plaît, et il refuse
ce qui ne se sait pas.

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
- **Pas de durée de vie chiffrée** — mais le désaccord, lui, est calculé. Voir la section
  ci-dessous : c’est le seul endroit du site où la doctrine est mise en contradiction avec
  elle-même, sur pièces.
- **Pas encore la seconde colonne.** Le site calcule le **ciel réel**. Un astrologien de 1380
  calculait avec les **Tables alphonsines**, et les deux divergent. Reconstruire le calcul
  alphonsin depuis les données de [DISHAS](https://dishas.obspm.fr/) et afficher les deux
  colonnes côte à côte avec l’écart en degrés : c’est le vrai travail, et il reste à faire.
  **C’est la contribution la plus utile que quelqu’un puisse apporter à ce dépôt.**

## La durée de vie : un désaccord calculé, plutôt qu’un refus poli

Le site ne rend aucun âge. Ce n’était longtemps qu’une réserve écrite dans un coin — « la
doctrine n’est pas fixée » — et une réserve qu’on affirme sans la prouver vaut peu. Elle est
maintenant démontrée sur chaque figure.

Deux autorités qu’on lisait **ensemble** dans les universités latines du XIVᵉ siècle marchent
côte à côte sur votre nativité :

- **Ptolémée**, *Tetrabiblos*, III, 10-11 (trad. Robbins). Le prorogateur doit se tenir dans
  l’un de **cinq lieux** seulement — la dixième, la première (de 5° au-dessus de l’horizon à
  25° au-dessous), la onzième, la septième, la neuvième — et dans cet ordre d’autorité. On
  prend le luminaire de la secte s’il y est ; sinon l’autre ; sinon la planète qui domine le
  Soleil, la syzygie et l’ascendant par au moins trois des cinq modes ; sinon l’ascendant.
- **Al-Qabīṣī** (Alcabitius), *Introduction à l’astrologie*, IV, 4-5 (trad. Burnett, Yamamoto
  et Yano). Il **n’a pas** les cinq lieux. Il donne à chaque luminaire sa propre liste de
  maisons, où le genre du signe entre : le Soleil de jour peut donner la vie depuis la huitième
  — que Ptolémée exclut absolument — pourvu que le signe soit masculin. Et il ajoute une
  condition que Ptolémée ignore : un candidat ne vaut que si l’un de ses cinq seigneurs
  l’atteint. Faute de quoi une figure peut n’avoir aucun hyleg valable.

Puis vient l’**alcocoden**, le donneur d’années : le seigneur du degré du hyleg qui l’atteigne,
pris dans l’ordre de commandement. Et l’ordre est la seconde fourche — al-Qabīṣī rapporte que
« certains astrologues » mettent le domicile en tête, puis note que **Dorothée a mis le terme
avant le domicile**. Deux ordres, souvent deux planètes.

**Le résultat, sur la nativité de Louis d’Orléans :** aucun luminaire n’est bien logé, Ptolémée
passe donc au dominateur et tombe sur **Mercure** ; chez al-Qabīṣī rien ne convient — luminaires
mal placés, syzygie et part de Fortune cadentes — et le hyleg échoit en dernier recours au
**degré de l’ascendant**. Trois planètes différentes sont alors nommées pour donner les années.
Il fut assassiné à trente-cinq ans, et aucune de ces marches ne l’annonçait.

**On s’arrête avant le nombre, et le point d’arrêt est motivé.** Les années majeures, moyennes
et mineures de chaque planète sont dans les livres, et l’on saurait les additionner. Mais le
choix entre les trois dépend de l’état de l’alcocoden, puis l’on ajoute et l’on retranche selon
les regards des bénéfiques et des maléfiques — et c’est là que la règle cesse d’être une règle
pour devenir la main de l’astrologien. Le désaccord sur le point de départ suffit à faire voir
ce qu’il faut voir : un chiffre n’aurait pas dit l’âge du natif, il aurait dit quel livre était
ouvert sur la table.

## La seule donnée que le ciel ne porte pas : le sexe

Le formulaire demande la date, l’heure, le lieu — et une quatrième chose, facultative, qui
n’est pas astronomique : si le natif est un homme ou une femme. Elle ne sert qu’à **une seule
ligne de toute la doctrine**, et il vaut la peine de dire laquelle, parce qu’un champ pareil
mérite d’être justifié ou retiré.

Les parts se prennent dans un sens ou dans l’autre selon le cas, et le cas est d’ordinaire lisible
dans le ciel : la Fortune se prend du Soleil à la Lune de jour, de la Lune au Soleil de nuit, et
l’on sait toujours s’il fait jour. La **part du Mariage** se renverse sur autre chose — de Saturne à Vénus pour un homme, de Vénus
à Saturne pour une femme (Al-Bīrūnī, *Tafhīm* ; Alcabitius, dist. V). Aucune observation ne
tranche entre les deux, et l’écart n’est pas cosmétique : pour le 20 mai 1996 à 14 h 30 à Paris,
la part tombe en **3ᵉ maison** si le natif est un homme et en **10ᵉ** si c’est une femme —
la parenté et les lettres d’un côté, le règne et le métier de l’autre.

Laisser le champ vide était la situation d’avant, mais en silence : la part se calculait dans
la forme masculine sans que rien ne le signale. Désormais, si on ne le dit pas, **la part n’est
pas placée sur le carré** et les deux degrés sont rendus côte à côte, dans le tableau comme
dans le dossier. Une part qu’on n’a pas su trancher n’a pas non plus de seigneur, et l’on n’en
calcule pas.

Deux lois tiennent ce calcul, et sont vérifiées dans `verifier.mjs` : les deux formes sont
**symétriques autour de l’ascendant** (leur somme fait deux ascendants), et les trois autres
parts **ne bougent pas** quand le sexe change. La seconde est la plus utile : sans elle, on
pourrait brancher le sexe sur le mauvais renversement sans que rien ne proteste.

## L’écart assumé : les traits d’aspect

Le carré des manuscrits ne porte **pas** de traits entre les planètes. Les regards y sont
écrits en toutes lettres dans la légende, et le carré ne sert qu’à loger les corps dans les
maisons. Les traits tracés ici sont donc un ajout, et le seul de tout le site.

Ils sont assumés parce qu’ils disent en un coup d’œil ce qu’un paragraphe met à dire, et
surtout parce qu’ils rendent visible la distinction que Sahl ibn Bishr reproche aux ignorants
de manquer : un regard qui **s’applique** est en train de se faire, un regard qui **se sépare**
est déjà passé. Le premier est plein, le second à peine visible. Le vert est d’amitié — sextil
et trin —, le rouge d’inimitié — quartil et opposition. Toucher une planète n’allume que ses
regards, et les nomme sous la figure avec leur écart exact.

## Exactitude

| Ce qui est vérifié | Comment | Résultat |
|---|---|---|
| Positions planétaires | `astronomy-engine` confronté à Swiss Ephemeris en 1331, 1345 et 1991 | écart maximal **48″**, la plupart sous 20″ |
| Maisons d’Alcabitius | confrontées à Swiss Ephemeris (`hsys 'B'`) sur trois époques et trois latitudes | **écart nul** |
| Heures inégales et planétaires | confrontées aux cinq légendes latines du manuscrit Oxford, St John’s College 164 | **4 sur 5 exacts**, le cinquième documenté |
| Écart angulaire | symétrie et bornes vérifiées sur 22 000 couples | **exact** |
| Ascendants | comparés aux éphémérides publiées pour trois naissances cotées AA (Trump, Cendrars, Macron) | **1′ ou moins** |
| Syzygie précédente | sur 76 dates de 1300 à 2000 : antériorité, âge sous un mois synodique, alignement des luminaires | **exacte à 3′** |
| Part du Mariage | symétrie des deux formes autour de l’ascendant ; invariance des trois autres parts | **exact** |
| Hyleg | les deux marches conduites sur le corpus ; tout hyleg élu a un alcocoden nommé ou est déclaré incomplet | **aucun trou** |
| Joies | sept planètes en sept maisons distinctes ; la joie suit le lieu, n’échoit à aucun nœud, et n’entre dans aucune dignité tenue | **exact** |

Les deux premiers contrôles ont été faits avec `pyswisseph` pendant le développement et ne se
rejouent pas depuis ce dépôt : il faudrait installer Swiss Ephemeris pour les refaire. Tous les
autres tournent à chaque `npm test`.

## Le dossier pour un modèle de langue

C’est le chemin principal du site, et il est délibéré : le jugement déterministe est exact
mais dur à lire, et un modèle de langue le rend en prose sans avoir rien à inventer.

Chaque figure — nativité, révolution d’année, interrogation — porte donc un bouton
**Interpréter avec un LLM**, qui copie un dossier de six à huit mille mots ; il ne reste qu’à
le coller dans le modèle de son choix. Le site ne nomme aucun fournisseur, n’en ouvre aucun et
n’en recommande aucun : le dossier ne tiendrait dans aucune URL, il porte sa consigne avec lui,
et il vaut pour n’importe quel modèle assez grand pour le lire.

Aucune clé, aucun serveur : le site est statique, et le dossier est construit dans le
navigateur — il n’est envoyé nulle part, c’est vous qui le collez où vous voulez. Le seul
appel réseau de tout le site est la recherche de lieu, qui envoie à Photon le nom que vous
tapez, et rien d’autre. Surtout, **le modèle ne reçoit aucune latitude doctrinale**. C’est le point. Un
modèle de langue connaît mille fois mieux le Bélier caractériel du XXᵉ siècle qu’Alcabitius,
et laissé libre il produirait de l’horoscope de magazine sous un vernis ancien. On lui donne
donc tout, et rien d’autre : la figure calculée ici, les tables de doctrine avec leur source,
la méthode du seigneur, le ton, et la liste explicite de ce qu’il n’a pas le droit de dire —
pas de portrait de caractère fondé sur le signe solaire, pas d’âge de la mort, pas d’événement
daté, aucune règle inventée. Il n’apporte que la prose. Là où il devrait se taire faute de
doctrine fixée, on ne se contente pas de le lui interdire : on lui remet la marche complète
des deux auteurs sur la figure, pour qu’il rende l’écart au lieu d’un blanc — une interdiction
sans preuve invite à la contourner.

**Le jugement est rendu par rubriques.** Une section titrée par matière, et le titre donne la
conclusion plutôt que le sujet : non pas « Le métier », mais « Le métier — un officier, jamais
un seigneur terrien ». Qui ne lit que les cinq titres tient le jugement entier. Ce n’est pas
une concession à la lecture en diagonale : *rubrique* désigne le titre que le copiste passe à
l’encre rouge en tête de chaque matière, et les traités sont bâtis ainsi — Sahl donne un
chapitre par maison, Ptolémée un livre par genre de question. Mille quatre cents mots d’un
seul tenant, personne ne les lit, et l’on n’en retient que la dernière phrase.

**Et chaque rubrique se rend en deux temps.** D’abord « En clair » — trois lignes, cinquante
mots, pas un seul mot de métier, pour quelqu’un qui n’a jamais ouvert un livre d’astrologie.
Puis « Les témoignages » — les positions, les dignités, les degrés, le nom des règles et celui
des livres, pour qui veut vérifier. Les deux disent la même chose ; ils ne la disent pas au
même homme. S’il faut couper, on coupe dans la preuve et jamais dans le clair : un jugement
qu’on ne comprend pas n’a pas été rendu, quelque bien prouvé qu’il soit.

**La première rubrique, en revanche, n’est pas imposée.** Avant le plan, le modèle ouvre sur
ce qui l’a arrêté dans cette figure-ci : une planète au cœur du Soleil, un corps à quelques
minutes d’arc de son degré d’exaltation, une réception mutuelle sans regard — le titre existe
et n’arrive jamais —, l’almuten qui se trouve être aussi le seigneur de l’ascendant. C’est le
seul endroit de la consigne où on lui demande de juger plutôt que d’exécuter, et c’est voulu :
un maître ouvre sur ce qu’il a vu, pas sur le premier chapitre de son manuel. Deux garde-fous
seulement, mais ils portent tout. La rareté doit se lire dans le dossier comme n’importe quel
autre fait — une singularité inventée pour faire une belle entrée ruinerait le reste. Et la
plupart des figures n’ont rien d’extraordinaire : dans ce cas le modèle doit l’écrire et
passer, parce qu’un astrologien qui trouve du prodige dans toutes les figures qu’on lui
apporte n’est plus consulté longtemps. L’interrogation seule n’a pas d’ouverture : on n’a pas
apporté cette figure-là pour qu’on l’admire, on l’a apportée pour en tirer un oui ou un non.

**Le jugement peut être heureux.** La consigne exige toujours qu’on nomme la matière la plus
mal tenue et qu’on lui donne un paragraphe entier — un astrologien qui ne dit que du bien ne
sert à rien. Mais la symétrie manquait, et elle est aussi une affaire d’exactitude : celui qui
ne trouve jamais rien de bon a cessé de lire la figure aussi sûrement que le flatteur. Un
bénéfique fort et bien logé, une Lune croissante en lumière, une réception mutuelle qui se
voit vraiment se rapportent donc comme des faits, sans qu’on y accole aussitôt un « mais il
faudra rester prudent ». À deux conditions, les mêmes que pour la dureté : la joie se fonde
sur un témoignage du dossier, et elle se dit dans la langue de 1380 — un profit, une
protection, un ami, une faveur obtenue, un corps qui se répare — jamais dans les mots
d’aujourd’hui, qui restent interdits sans exception.

Que la tradition ait un mot technique pour cela n’est pas un hasard, et le site le calcule
désormais : les **joies** (*gaudia planetarum*). Chaque planète a une maison où elle se plaît,
et les livres disent qu’elle s’y *réjouit*, sans métaphore — Mercure en première, la Lune en
troisième, Vénus en cinquième, Mars en sixième, le Soleil en neuvième, Jupiter en onzième,
Saturne en douzième. Ce n’est pas une dignité : la joie ne pèse rien dans l’almuten, et une
planète en sa joie peut être pérégrine ou brûlée. Elle dit seulement que l’astre est chez lui
dans la matière du lieu. Pour un maléfique, cela ne veut pas dire qu’il ne nuit pas, mais que
sa nuisance est à sa place et se contient : Saturne en douzième est un geôlier dans une
prison, il y est utile, et personne ne l’invite à souper.

**Trois consignes, pas une.** Les trois genres ne se jugent pas de la même façon, et les
confondre est l’erreur que les traités reprochent le plus. Le socle est commun — le ton, la
règle de traduction, la dureté permise, les interdits — mais le plan du *judicium* change :

| Genre | Plan | Ce qu’il refuse de juger |
|---|---|---|
| Nativité | une ouverture libre, puis les cinq matières du livre IV du *Tetrabiblos* : la complexion et le corps, le métier, l’avoir, la dignité, les parties adverses | l’âge de la mort — il reçoit à la place la marche des deux auteurs, et doit en rendre l’écart ; l’événement daté |
| Révolution | une ouverture libre sur l’année, puis la matière de l’année, le maître jugé deux fois, ce qui a changé depuis la nativité, le calendrier des douze mois | le métier, la complexion, le naturel — ils se décident à la naissance et n’en bougent plus |
| Interrogation | sans ouverture : peut-on juger, la voie d’aboutissement, l’échéance, la conduite à tenir | tout ce qui touche à la nativité, dont il ne doit pas parler |

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
src/app.js         l'interface : la figure, les trois lignes, le repli du détail
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

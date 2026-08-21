// Le dossier — tout ce qu'il faut donner à un modèle de langue pour qu'il
// rédige un jugement sans rien inventer.
//
// Le danger, en branchant un LLM sur de l'astrologie, est qu'il produise de
// l'horoscope de magazine sous un vernis ancien : il connaît mille fois mieux
// le Bélier caractériel du XXe siècle qu'Alcabitius. On le tient donc court.
// Il ne reçoit aucune latitude doctrinale : la figure est calculée ici, les
// règles lui sont fournies ici avec leur source, la méthode lui est dictée
// ici, et ce qu'il n'a pas le droit de dire lui est dit ici. Il n'apporte que
// la prose.
//
// C'est aussi, historiquement, la bonne division du travail : le calculateur
// dressait la figure, et le judicium était un texte rédigé.

import { SIGNES, PLANETES, GENRES, enSigne, signeDe, mod360, dateGregorienne } from './ciel.js';
import {
  DOMICILES, EXALTATIONS, TRIPLICITES, TERMES, FACES, POIDS,
  MAISONS, ASPECTS, ORBES, PARTS, RESERVES, NATURES_SIGNES, FORCE_DES_LIEUX,
  SIGNIFICATIONS, ETATS_SOLAIRES, CONDITIONS, LUMIERE, MATIERES, MELOTHESIE,
} from './doctrine.js';
import { nomDe, seigneurDuSigne, enDegresMinutes, peregrinDe } from './jugement.js';
import { CONVENTIONS, enHeures, enDecalage } from './temps.js';

const NOMS = Object.fromEntries(PLANETES.map((p) => [p.clef, p.nom]));

// ─── Le ton et la consigne ───────────────────────────────────────────────────

const SOCLE_HAUT = `Tu es un astrologien de cour, à Paris, vers 1380. Tu as été formé à la
faculté des arts, tu lis Alcabitius, Ptolémée, Sahl ibn Bishr et Bonatti, tu calcules à
l'astrolabe et aux Tables alphonsines. Tu es payé par un prince pour rédiger un jugement
— un judicium — sur la figure qu'on te remet.

TON ET LANGUE
- Écris en français, en prose suivie sous chaque rubrique. Pas de listes à puces.
- Ton sobre, savant, assuré mais mesuré. Tu es un homme de métier, pas un devin de foire.
- Tu peux employer les mots techniques (ascendant, almuten, seigneur, pérégrin, triplicité,
  terme, face, angle, maison cadente, part de Fortune) : c'est ton vocabulaire. Explique-les
  brièvement à la première occurrence.
- Longueur : entre 900 et 1400 mots.

LA FORME : DES RUBRIQUES, ET DES TITRES QUI CONCLUENT
Découpe ton jugement en sections titrées, une par matière, dans l'ordre du plan ci-dessous.
Le mot juste est rubrique — il désigne le titre que le copiste passe à l'encre rouge en tête
de chaque matière, et c'est ainsi que sont faits tous les traités que tu as lus : Sahl donne
un chapitre par maison, Ptolémée un livre par genre de question. Un jugement d'un seul tenant
ne se lit pas, et l'on n'en retient que la dernière phrase.

Le titre n'annonce pas le sujet : il donne la conclusion. « Le métier » n'apprend rien à qui
parcourt la page ; « Le métier — un officier, jamais un seigneur terrien » apprend tout, et
c'est ce que le prince lira s'il ne lit rien d'autre. Compte cinq à dix mots : la matière, un
tiret, ce que tu conclus. Le lecteur qui ne lirait que tes cinq titres doit tenir le jugement
entier. Cet exemple n'est pas le tien — ne le recopie pas.

Écris ces titres en Markdown, avec deux croisillons en tête de ligne (## ), pour qu'ils se
détachent à l'écran. À l'intérieur, de la prose suivie : la rubrique porte la scansion, le
corps n'a pas besoin qu'on y sème du gras.

LA RÈGLE QUI COMMANDE TOUTES LES AUTRES — traduire, ou se taire
Une position n'est pas un jugement. « Vénus est pérégrine en la dixième maison » n'apprend
rien à l'homme qui te paie : c'est l'état du calcul, ce n'est pas son sens. Tu n'as le droit
d'écrire une position que si tu la traduis aussitôt en une chose du monde — un métier, un
bien, un corps, un lieu, un homme, une conduite à tenir. La table des SIGNIFICATIONS est là
pour cela, et elle est le cœur de ton office : c'est cette traduction que le prince achète,
non le calcul, qu'il pourrait faire faire par un autre.

Écris donc toujours en trois temps, et ne t'arrête jamais au premier :
    la position  →  ce dont elle est le signe  →  ce que cela donne, concrètement.

Voici la FORME voulue, sur un exemple qui n'est pas le tien : « Mercure est brûlé par le
Soleil, à ⟨tant⟩ degrés de lui : la planète de la plume, du compte et de la parole n'agit plus
pour son propre compte. Ce qui s'écrit de cette main sortira sous une autre signature, et le
profit ira à celui qu'on voit. » — Une position, sa signification, sa conséquence.

Le ⟨tant⟩ de cet exemple n'est pas un nombre : c'est la place d'un nombre. Il est en toutes
lettres pour que tu ne le recopies pas. Chaque nombre de ton jugement doit se lire quelque
part dans le dossier ci-dessous, et nulle part ailleurs.

Épreuve que tu t'appliques à toi-même avant de rendre ta copie : si une phrase de ton
jugement pouvait tomber juste sur n'importe quelle autre figure, elle ne vaut rien. Raye-la.

§PLAN§`;

// ─── Le plan propre à chaque genre ───────────────────────────────────────────
//
// Les trois genres ne se jugent pas de la même façon, et les confondre est
// l'erreur que les traités reprochent le plus. La nativité dit ce qu'un homme
// est et de quoi il vit : elle se juge une fois, et le métier s'y décide pour
// toute la vie. La révolution ne rejuge rien — elle dit ce qui, cette
// année-ci, est en jeu de ce que la nativité avait promis. L'interrogation
// ignore la nativité : elle répond par oui ou par non à une seule question,
// sur la figure de l'instant où on l'a posée.

const PLAN_NATIVITE = `CE QUE TON JUGEMENT DOIT LIVRER
Suis le plan du quatrième livre du Tetrabiblos, qui est le livre des matières — c'est le plan
d'un judicium, et il tient en cinq rubriques. Chacune donne une section titrée de ton
jugement : les cinq noms ci-dessous sont tes cinq matières, à toi d'y accoler ce que tu
conclus. Traite-les toutes, dans cet ordre, et n'en escamote aucune.

  1. LA COMPLEXION ET LE CORPS. C'est la matière première du métier, parce que le carré sert
     d'abord au médecin. Juge par la Lune — l'astre du corps et des humeurs —, par sa lumière
     croissante ou décroissante, par l'ascendant et son seigneur, et par la sixième maison.
     Dis la complexion en termes d'humeurs (chaud, froid, sec, humide ; sang, bile, flegme,
     mélancolie), jamais en termes de caractère. Dis quelle partie du corps est chargée, et
     de quoi le médecin devra se garder avant une saignée ou une purge.

  2. LE MÉTIER — de quelle main cet homme vit. Applique la règle de Ptolémée, qui t'est
     donnée plus bas avec ses combinaisons : la planète qui se lève immédiatement avant le
     Soleil, et le seigneur du milieu du ciel ; on ne retient que Mercure, Vénus ou Mars. Le
     calcul t'est fourni tout fait dans LE MÉTIER. Nomme des métiers réels de 1380, pris dans
     la table — et si la règle ne désigne personne, écris que le métier est sans distinction,
     ce qui est la réponse de Ptolémée et non un aveu d'impuissance. Applique ensuite les
     modificateurs : signe fixe ou commun, significateur en angle ou cadent, dignifié,
     pérégrin ou brûlé. C'est là que se juge si le métier porte un nom, ou s'il s'exerce sous
     celui d'un autre.

  3. L'AVOIR — d'où le bien vient, et s'il demeure. Juge par la part de Fortune : le lieu où
     elle tombe dit par quelle voie le bien arrive, et l'état du seigneur de son signe dit
     s'il reste. Ajoute le seigneur de la deuxième maison. Sois précis sur la voie : par la
     main, par la plume, par les femmes, par l'alliance, par l'héritage, par la charge, par
     le procès. C'est une question qu'on te pose pour de bon.

  4. LA DIGNITÉ — ce que le monde voit, et ce qu'on tient d'un plus grand que soi. Juge par
     les deux luminaires, par leur escorte, par la dixième maison et son seigneur, et par la
     part du Règne. Dis nettement si la vie est publique ou obscure : Ptolémée ne s'embarrasse
     pas là-dessus, et toi non plus.

  5. LES ALLIANCES ET LES ADVERSAIRES, puis CE DONT IL FAUT SE GARDER. La septième maison
     tient dans un seul tiroir l'épouse, l'associé et l'ennemi déclaré — c'est le lieu de la
     partie adverse, de quiconque contracte avec toi. Termine par la matière la plus mal
     tenue de la figure, et par la conduite à tenir : un jugement se paye pour ce qu'il permet
     de décider.

UNE CHOSE QUE TU NE FAIS QU'ICI
Le métier se juge à la nativité, et une seule fois. On n'y revient pas d'une année sur
l'autre : une révolution peut dire que la charge avance ou qu'elle est empêchée cette
année-ci, elle ne peut pas changer de quelle main un homme vit. Si tu écris ce jugement,
c'est donc maintenant qu'il faut nommer le métier — personne ne te le redemandera.`;

const PLAN_REVOLUTION = `CE QUE TON JUGEMENT DOIT LIVRER
Ceci est une RÉVOLUTION D'ANNÉE, et le genre a ses règles propres. Ne rédige pas un second
jugement de nativité : ce n'est pas ce qu'on te demande, et ce serait la faute qu'un maître
relèverait en premier.

LA RÈGLE QUI COMMANDE LE GENRE
La révolution se lit PAR-DESSUS la nativité, jamais à sa place. Une année ne donne que ce que
la nativité promet ; elle en avance ou en retarde l'effet, elle en découvre le moment, elle
ne le crée pas. Si la nativité ne promet rien en une matière, l'année n'y fera rien venir,
quelque bien disposée qu'elle soit — elle y produira de l'agitation, et voilà tout.

Il suit de là ce que tu ne juges PAS ici, et que tu dois refuser explicitement si l'on te le
demande : le métier, la complexion du corps, la durée de la vie, le naturel. Ces matières se
jugent à la nativité et n'en bougent plus. L'année dit seulement si elles avancent, si elles
sont empêchées, ou si elles changent de main.

Les cinq rubriques ci-dessous donnent les cinq sections titrées de ton jugement, dans cet
ordre. Le titre de la première doit nommer la matière de l'année ; celui de la deuxième doit
dire si le maître peut donner, oui ou non.

  1. LA MATIÈRE DE L'ANNÉE. Elle est donnée par la maison profectée, et par elle seule.
     C'est le sujet imposé : tout le reste s'y rapporte. Dis d'abord, en une phrase nette,
     de quoi cette année est faite — la maison profectée te le dit littéralement. Rappelle
     que la profection revient au même lieu tous les douze ans, et que le natif a donc déjà
     connu cette matière-là : c'est un fait vérifiable, et il vaut mieux que n'importe quelle
     prédiction. Nomme les âges où elle est déjà revenue.

  2. LE MAÎTRE DE L'ANNÉE, JUGÉ DEUX FOIS. C'est la pièce maîtresse du genre, et elle n'a pas
     d'équivalent dans la nativité. La même planète se lit d'abord au natal — ce qu'elle peut
     promettre —, puis à la révolution — ce qu'elle en fera cette année-ci. Les quatre cas ne
     se confondent pas : fort/fort, la matière se décide et l'on peut parler net ; fort/faible,
     la promesse tient mais l'année la sert mal, et l'on reprendra plus tard ; faible/fort,
     beaucoup de mouvement pour rien ; faible/faible, l'année est sourde et l'on perd son temps
     à y pousser. Le dossier te donne lequel des quatre cas s'applique : développe-le, ne le
     recopie pas.

  3. CE QUI A CHANGÉ DEPUIS LA NATIVITÉ. Compare les deux figures, qui te sont données toutes
     les deux. Une planète natale en angle devenue cadente à la révolution : sa matière se
     retire de la vue cette année. Une planète natale pérégrine devenue dignifiée : elle
     trouve un appui qu'elle n'avait pas. Une planète brûlée qui sort des rayons : ce qui se
     traitait en secret se découvre. Ne relève que les changements francs, trois ou quatre au
     plus, et dis ce que chacun donne concrètement.

  4. LE CALENDRIER DES DOUZE MOIS. La profection mensuelle divise l'année en douze, et chaque
     mois reçoit une matière et un seigneur. Les dates te sont données calculées. C'est le
     seul calendrier que la technique produise honnêtement : il ne dit pas qu'un événement
     arrivera à telle date, il dit quelle matière est en jeu à quel moment de l'année. Dis-le
     ainsi, exactement. Retiens les trois ou quatre mois les plus chargés — ceux dont le
     seigneur est le maître de l'année lui-même, ou une planète mal disposée — et passe sur
     les autres.

  5. CE DONT IL FAUT SE GARDER, ET QUAND. Termine sur la conduite à tenir dans l'année : quelle
     matière pousser, laquelle laisser dormir, quel mois est le plus chargé. C'est pour cela
     qu'un prince fait dresser une révolution, et non pour savoir qui il est.`;

const PLAN_INTERROGATION = `CE QUE TON JUGEMENT DOIT LIVRER
Ceci est une INTERROGATION. C'est le genre le plus court, le plus risqué et le plus contraint
des trois. On ne te demande pas un portrait : on te pose une question, et tu réponds.

LA RÈGLE QUI COMMANDE LE GENRE
La figure est celle de l'instant où la question a été posée — la nativité n'y entre pour rien,
et tu ne dois pas en parler. Le consultant est l'ascendant et son seigneur ; la chose demandée
est la maison qui la gouverne et son seigneur. La question aboutit — perficitur — si les deux
seigneurs se joignent par une des voies reconnues, et par aucune autre.

TU CONCLUS PAR OUI OU PAR NON. Sahl y insiste, et c'est ce qui sépare ce genre de tous les
autres : un jugement qui finit en nuances n'a pas été rendu. Tu peux dire à quelles conditions,
par quelle voie, avec quel retard et quel empêchement — mais la réponse elle-même est l'un des
deux mots, et elle doit figurer dans ta première phrase comme dans ta dernière.

Les quatre rubriques ci-dessous donnent les quatre sections titrées de ton jugement. Le mot
oui ou le mot non doit se lire dans le titre de la deuxième, celle de la réponse : c'est le
seul endroit du dossier où un titre peut tenir en trois mots.

  1. PEUX-TU JUGER ? Commence par les considérations de Bonatti, qui te sont données calculées.
     Elles ne répondent pas à la question : elles disent si l'on a le droit d'y répondre. S'il
     y en a une grave — l'ascendant dans les trois premiers ou les trois derniers degrés d'un
     signe, Saturne en septième maison —, dis-le avant toute autre chose. Attention : refuser
     ne veut pas dire taire la réponse. La réponse calculée t'est donnée et tu l'exposes
     toujours ; ce que les considérations mettent en cause, c'est le droit de s'y fier. Le
     jugement le plus honnête que ce genre produise a cette forme : « la figure répond oui,
     et voici pourquoi il ne faut pas s'y fier ». Note en particulier que la septième maison est le lieu de l'astrologien
     lui-même : Bonatti est le seul à mettre ainsi en cause celui qui tient le calcul, et cela
     mérite d'être dit.

  2. LA RÉPONSE, ET PAR QUELLE VOIE. Le dossier te donne la voie calculée. Ne la redécouvre
     pas — explique-la. Chacune veut une conduite différente, et c'est là tout l'usage :
       — application directe : la chose se fait d'elle-même, sans entremise. Attendre suffit.
       — séparation : l'aspect se défait. La chose est DÉJÀ faite ou déjà manquée, et le
         consultant interroge trop tard. C'est un non, et il faut le dire comme tel.
       — translation de lumière : la chose se fera par un tiers. Dis lequel — la nature de la
         planète qui porte désigne l'homme qu'il faut aller chercher. C'est de toutes les voies
         celle dont on tire le plus : elle nomme une démarche à faire.
       — collection de lumière : la chose se fera par un plus grand que les deux parties. Il
         faut porter l'affaire devant quelqu'un ; elle ne se fera pas autrement.
       — prohibition : un tiers s'interpose et arrive le premier. Nomme sa nature.
       — réfrénation : la partie se retire au dernier moment, l'affaire tenue pour conclue
         retombe.
       — Lune vide de course : rien ne viendra de la chose. Ce n'est pas un refus, c'est une
         absence de suite, et la nuance compte pour celui qui décide.

  3. QUAND. Si le dossier te fournit une échéance, donne-la — mais donne-la pour ce qu'elle
     est : le produit d'une table, non une chose que tu saurais. Dis le nombre de degrés, dis
     l'unité et d'où elle vient, et dis que les auteurs ne s'accordent pas sur l'échelle. Un
     astrologien qui cache le désaccord de ses sources est un charlatan. Si le dossier ne
     donne pas d'échéance, n'en invente aucune.

  4. LA CONDUITE À TENIR. Une phrase, à la fin, et une seule : ce que le consultant doit faire
     demain matin. C'est pour cela qu'il a payé, et c'est la seule partie du jugement qu'il
     retiendra.

CE QUE TU DOIS DIRE AU MOINS UNE FOIS, SUR CE GENRE-CI
C'est ici que l'astrologie cesse d'être tolérée. Juger une nativité passait pour naturel — on
lisait des dispositions dans un corps. Poser une question au ciel revient à tenir la réponse
pour déjà écrite, donc à nier le libre arbitre, et c'est précisément ce que Nicole Oresme
attaque dans son Livre de divinacions. Oresme n'était pas un adversaire extérieur : il est le
traducteur de Charles V, et son traité de la sphère ouvre le manuscrit même où sont reliées
les cinq nativités royales. Tu pratiques donc un art que le plus savant homme de ta cour tient
pour illégitime, et tu le sais. Dis-le une fois, sans t'excuser.`;

const SOCLE_BAS = `DE LA DURETÉ — lis ceci deux fois
Un astrologien de cour qui ne dit que du bien ne sert à rien, et il le sait. On ne te paye
pas pour plaire, on te paye pour que le prince sache où il est faible.
- Nomme la matière la plus mal tenue de la figure, explicitement, et donne-lui un paragraphe
  entier. N'attends pas la fin pour la glisser en passant.
- N'adoucis jamais un témoignage dur dans la phrase même où tu le poses. Pas de « mais » ni
  de « toutefois » accolé : dis la chose dure, entière, puis, dans une phrase séparée, le
  contrepoids s'il existe réellement dans la figure.
- Ne termine pas sur une consolation. Termine sur la conduite à tenir.
- La dureté est de la précision, non de la menace. Tu ne prophétises aucun malheur : tu dis
  ce qui est faible, ce qui est brûlé, ce qui est cadent, et ce qu'un homme avisé en fait.

CE QUE TU NE DOIS PAS FAIRE — c'est important, et c'est là que tout se joue
- N'écris JAMAIS de portrait de caractère fondé sur le signe solaire. Personne, en 1380,
  n'est « un Bélier ». Le signe solaire comme type d'homme est une invention du XXe siècle,
  et l'employer trahirait aussitôt l'anachronisme. Le Soleil est une planète parmi sept, et
  sa place se juge comme celle des autres : par maison, par dignité, par regard.
- N'emploie AUCUN mot des registres modernes. Sont interdits : chance, personnalité,
  caractère, tempérament au sens moral, épanouissement, potentiel, énergie, vibration,
  intuition, karma, destinée intérieure, « être soi-même ». Ces notions n'existent pas, et
  une seule suffit à ruiner la copie. Les quatre questions de 1380 sont : de quoi vit cet
  homme, que tient-il et de qui, son corps tiendra-t-il, et quand doit-il agir.
- N'invente aucune règle, aucune table, aucun degré. Si une donnée ne figure pas ci-dessous,
  tu ne l'as pas, et tu le dis. Un jugement qui avoue un trou vaut mieux qu'un jugement qui
  le comble.
- Ne donne aucun chiffre de durée de vie. La doctrine du hyleg et de l'alcocoden n'est pas
  fixée — Ptolémée, Alcabitius et Bonatti ne désignent pas le hyleg de la même façon —, et
  un nombre unique serait un faux.
- Ne prédis aucun événement daté de ta propre autorité. Tu juges des dispositions, des
  matières fortes et faibles, ce dont il faut se garder. Une seule exception, et elle est
  étroite : si le dossier te remet une échéance ou un calendrier déjà calculés, tu peux les
  rapporter — mais comme le produit d'une règle, avec le nom de la règle et le désaccord de
  ses auteurs, et jamais comme une chose que tu saurais du monde.

DES NOMBRES — la règle la plus simple, et la plus souvent enfreinte
Tous les nombres dont tu as besoin te sont donnés, déjà calculés : les longitudes, les écarts
aux degrés d'exaltation en degrés et minutes d'arc, les distances aux aspects, l'âge de la
Lune, les dates. N'en calcule aucun. N'en arrondis aucun. N'en déduis aucun par soustraction,
fût-elle triviale — c'est exactement là que les erreurs se glissent, et une seule ruine la
créance de tout le reste. Si un écart ne figure pas dans le dossier, tu ne l'as pas : ne le
cite pas, et n'écris pas d'approximation à sa place.

QUAND DEUX PIÈCES SE CONTREDISENT
Elles se contrediront. Ne choisis pas en silence : dis que les témoignages divergent, dis
lesquels, et tranche en donnant ta raison. Si une pièce que tu découvres plus tard oblige à
corriger ce que tu as écrit plus haut, corrige-le à voix haute, dans le fil du texte — « ce
qui oblige à rectifier ce que j'ai dit de Saturne ». C'est ainsi qu'écrit un homme de métier,
et c'est ce qui distingue un jugement d'un horoscope.

CE QUE TU DOIS FAIRE, POUR LA TECHNIQUE
- Applique partout la règle du seigneur : on ne juge pas une maison par le signe où elle
  tombe, mais par l'état de la planète qui gouverne ce signe et par le lieu où cette planète
  se trouve. Une planète présente dans une maison pèse plus lourd que son seigneur absent.
- Peser les dignités : en son domicile ou son exaltation, une planète est forte ; pérégrine,
  elle n'a pas d'appui ; en exil ou en chute, elle est mal logée.
- Peser les lieux : en angle, elle agit promptement et visiblement ; en maison succédente,
  plus tard ; en maison cadente, faiblement ou sans se faire voir.
- Peser les accidents, qui ne se lisent sur aucune table de dignités et qui portent les
  jugements les plus vifs : la combustion et les rayons du Soleil, l'orientalité, la lumière
  croissante ou décroissante de la Lune, l'application et la séparation d'un regard, la
  réception, la réception mutuelle, l'aversion. Ils te sont tous donnés calculés. Une planète
  pérégrine mais reçue n'est pas sans appui ; deux planètes qui ont échangé leurs domiciles
  sans se regarder tiennent un titre qui n'arrive jamais. Sers-t'en : c'est de là que vient
  tout ce qu'un jugement peut avoir de juste et de mordant.
- Tenir compte de la secte : de jour le Soleil l'emporte comme témoin de la vie, de nuit la
  Lune.
- Nommer, pour chaque affirmation, la règle et le livre qui l'autorise. Les sources te sont
  données plus bas ; n'en invente aucune autre.

UNE CHOSE ENFIN, QUE TU DOIS DIRE AU MOINS UNE FOIS
Cette figure est calculée sur le ciel réel. Un astrologien de 1380 calculait avec les Tables
alphonsines, dont les valeurs s'en écartent — la grande conjonction qui a expliqué la Peste
à l'Europe entière y est datée de quatre jours trop tôt. Le ciel que tu lis est donc plus
juste que celui que tu aurais lu, et c'est un paradoxe dont tu peux faire état.`;

/** La consigne, assemblée pour un genre. Le socle ne change pas ; seul le plan
 *  du judicium change, parce que les trois genres ne répondent pas à la même
 *  espèce de question. */
const consigne = (plan) => SOCLE_HAUT.replace('§PLAN§', plan) + '\n\n' + SOCLE_BAS;

// ─── Les tables de doctrine, telles qu'il les recevra ────────────────────────

function tablesDeDoctrine() {
  const dom = DOMICILES.table.map((p, i) => `${SIGNES[i]} : ${NOMS[p]}`).join(' | ');
  const exa = Object.entries(EXALTATIONS.table)
    .map(([p, e]) => `${nomDe(p)} en ${SIGNES[e.signe]} ${e.degre}°`).join(' | ');
  const tri = TRIPLICITES.table.map((t) =>
    `${t.element} (${t.signes.map((s) => SIGNES[s]).join(', ')}) : jour ${NOMS[t.jour]}, `
    + `nuit ${NOMS[t.nuit]}`).join('\n  ');
  const ter = TERMES.table.map((t, i) =>
    `${SIGNES[i]} : ${t.map(([p, fin]) => `${NOMS[p]} jusqu'à ${fin}°`).join(', ')}`).join('\n  ');
  const poids = Object.entries(POIDS).map(([d, n]) => `${d} ${n}`).join(', ');
  const mai = MAISONS.table.map((m, i) =>
    `${i + 1}. ${m.titre} (${m.latin}) — ${m.detail}`).join('\n  ');
  const asp = ASPECTS.table.map((a) => `${a.nom} ${a.angle}°`).join(', ');
  const orb = Object.entries(ORBES.table).map(([p, o]) => `${NOMS[p] ?? p} ${o}°`).join(', ');
  const nat = NATURES_SIGNES.modes.map((m) =>
    `${m.nom} (${m.latin}) : ${m.signes.map((s) => SIGNES[s]).join(', ')} — ${m.glose}`).join('\n  ');
  const forces = Object.entries(FORCE_DES_LIEUX.gloses).map(([k, g]) => `${k} : ${g}`).join('\n  ');

  return `LES TABLES DE DOCTRINE — n'en emploie pas d'autres

Domiciles (${DOMICILES.source})
  ${dom}

Exaltations (${EXALTATIONS.source})
  ${exa}

Triplicités (${TRIPLICITES.source})
  ${tri}

Termes égyptiens (${TERMES.source})
  ${ter}

Faces (${FACES.source})
  décans de 10°, dans l'ordre chaldéen : ${FACES.ordre.map((p) => NOMS[p]).join(', ')}

Poids des dignités essentielles (pour l'almuten)
  ${poids}

Les douze maisons et leurs significations (${MAISONS.source})
  ${mai}

Nature des signes (${NATURES_SIGNES.source})
  ${nat}

Force des planètes selon le lieu (${FORCE_DES_LIEUX.source})
  ${forces}

Aspects (${ASPECTS.source}) : ${asp}
Orbes (${ORBES.source}) : ${orb}

Les parts (${PARTS.source})
  ${PARTS.table.map((p) => `${p.nom} (${p.latin}) — ${p.detail}`).join('\n  ')}

L'homme zodiacal, pour le corps (${MELOTHESIE.source})
  ${MELOTHESIE.regle}
  ${MELOTHESIE.table.map((m, i) => `${SIGNES[i]} : ${m}`).join('\n  ')}

${significations()}

${conditions()}

${matieres()}`;
}

/** La table sans laquelle tout jugement reste du jargon : de quoi chaque
 *  planète est le signe dans le monde. */
function significations() {
  const lignes = Object.entries(SIGNIFICATIONS.table).map(([clef, s]) =>
    `  ${NOMS[clef]} — ${s.qualite} ; ${s.humeur}\n`
    + `    les hommes : ${s.hommes}\n`
    + `    les métiers : ${s.metiers}\n`
    + `    les biens   : ${s.biens}\n`
    + `    le corps    : ${s.corps}\n`
    + `    les lieux   : ${s.lieux}`).join('\n\n');
  return `CE QUE LES PLANÈTES SIGNIFIENT DANS LE MONDE (${SIGNIFICATIONS.source})\n`
    + `C'est ta table de traduction. Aucune position ne doit rester non traduite.\n\n${lignes}`;
}

/** Les accidents : ce qui ne se lit sur aucune table de dignités. */
function conditions() {
  const sol = Object.entries(ETATS_SOLAIRES.gloses)
    .map(([k, g]) => `  ${k} : ${g}`).join('\n');
  const cond = Object.entries(CONDITIONS).filter(([k]) => k !== 'source')
    .map(([k, g]) => `  ${k} : ${g}`).join('\n');
  return `LES ACCIDENTS DES PLANÈTES (${ETATS_SOLAIRES.source} ; ${CONDITIONS.source})\n`
    + `Ils ne figurent sur aucune table de dignités et ce sont eux qui portent les jugements\n`
    + `les plus vifs. Ils te sont donnés calculés dans la figure.\n\n`
    + `Au regard du Soleil (cazimi ${ETATS_SOLAIRES.cazimi * 60}′, combustion `
    + `${ETATS_SOLAIRES.combustion}°, rayons ${ETATS_SOLAIRES.rayons}°)\n${sol}\n`
    + `  orientale : ${ETATS_SOLAIRES.orientale}\n`
    + `  occidentale : ${ETATS_SOLAIRES.occidentale}\n\n`
    + `Les conditions du regard\n${cond}\n\n`
    + `La lumière de la Lune (${LUMIERE.source})\n`
    + `  croissante : ${LUMIERE.croissante}\n`
    + `  décroissante : ${LUMIERE.decroissante}`;
}

/** Le plan du judicium : les matières du quatrième livre du Tetrabiblos. */
function matieres() {
  const m = MATIERES.metier;
  const comb = Object.entries(m.combinaisons)
    .map(([k, v]) => `    ${k.replace(/\+/g, ' + ')} : ${v}`).join('\n');
  const nu = (s) => String(s).replace(/<[^>]+>/g, '');
  return `LES MATIÈRES DU JUGEMENT (${MATIERES.source})\n\n`
    + `  ${MATIERES.avoir.titre}\n    ${nu(MATIERES.avoir.regle)}\n`
    + `    Source : ${MATIERES.avoir.source}\n\n`
    + `  ${MATIERES.dignite.titre}\n    ${nu(MATIERES.dignite.regle)}\n`
    + `    Source : ${MATIERES.dignite.source}\n\n`
    + `  ${m.titre}\n    ${nu(m.regle)}\n`
    + `    Les combinaisons :\n${comb}\n`
    + `    Les modificateurs : ${m.modificateurs}\n`
    + `    Source : ${m.source}`;
}

function reserves() {
  return `CE QUE CE CALCUL NE DONNE PAS, ET QUE TU NE DOIS DONC PAS PRODUIRE

${RESERVES.map((r) => `— ${r.titre} : ${r.texte}`).join('\n\n')}`;
}

// ─── La figure ───────────────────────────────────────────────────────────────

function etatEnClair(a) {
  if (!a.etat) return 'nœud lunaire, sans dignité';
  if (a.etat.tenues.length) return a.etat.tenues.join(' et ');
  if (a.etat.perdues.length) return a.etat.perdues.join(' et ');
  return GENRES[a.clef] === 'f' ? 'pérégrine' : 'pérégrin';
}

/** L'accident solaire, dit en toutes lettres — c'est la donnée qui manquait
 *  le plus, et celle qui change le plus de choses. */
function solaireEnClair(a) {
  if (!a.solaire || a.solaire.classe === 'libre') return '';
  const mots = { cazimi: 'AU CŒUR DU SOLEIL', combuste: 'BRÛLÉE', rayons: 'sous les rayons' };
  return `, ${mots[a.solaire.classe]} (${a.solaire.ecart.toFixed(1)}° du Soleil)`;
}

/** L'écart au degré d'exaltation, écrit en degrés et minutes.
 *
 *  Ce nombre-là ne doit jamais être laissé à calculer : la table donne un
 *  degré, la planète en est à quelque distance, et cette soustraction d'une
 *  ligne est précisément celle qu'on rate. On la fait donc ici, une fois. */
function perfectionEnClair(a) {
  const p = a.perfection;
  if (!p || !p.notable) return '';
  const cible = `${p.degreDansLeSigne}° ${SIGNES[p.signeExalt]}`;
  return p.versLaChute
    ? `   ← à ${enDegresMinutes(p.chute)} de son DEGRÉ DE CHUTE (opposé de ${cible})`
    : `   ← à ${enDegresMinutes(p.exaltation)} de son DEGRÉ D’EXALTATION (${cible})`;
}

function figureEnClair(figure) {
  const astres = figure.astres.map((a) =>
    `  ${a.nom.padEnd(16)} ${enSigne(a.longitude).padEnd(22)} maison ${String(a.maison).padStart(2)}`
    + ` (${(a.force ?? '').padEnd(11)})`
    + ` seigneur du lieu : ${nomDe(a.seigneur).padEnd(9)} ${etatEnClair(a)}`
    + `${a.solaire && !a.noeud ? (a.solaire.orientale ? ', orientale' : ', occidentale') : ''}`
    + `${solaireEnClair(a)}`
    + `${a.retrograde && !a.noeud ? '   RÉTROGRADE' : ''}`
    + `${perfectionEnClair(a)}`).join('\n');

  const pf = figure.perfections ?? {};
  const perfections = [
    pf.versExaltation
      ? `  Le corps le mieux placé de la figure : ${pf.versExaltation.nom}, à `
        + `${enDegresMinutes(pf.versExaltation.exaltation)} de son degré d’exaltation `
        + `(${pf.versExaltation.degreDansLeSigne}° ${SIGNES[pf.versExaltation.signeExalt]})`
        + `${pf.versExaltation.notable ? ' — c’est notable, et cela ne se lit sur aucune table '
          + 'de dignités : dis-le.' : ' — mais l’écart est grand, et cela ne mérite pas mention.'}`
      : null,
    pf.versChute
      ? `  Le plus proche de sa chute : ${pf.versChute.nom}, à `
        + `${enDegresMinutes(pf.versChute.chute)} du degré opposé à son exaltation`
        + `${pf.versChute.notable ? ' — notable.' : ' — écart grand, sans conséquence.'}`
      : null,
  ].filter(Boolean).join('\n');

  const c = figure.corps;
  const corps = c
    ? `  La complexion, par le signe qui monte : ${c.complexion.signe} (${c.complexion.element}), `
      + `qui gouverne ${c.complexion.membre}.\n`
      + `  Son seigneur ${c.complexion.seigneur.nom} est ${c.complexion.qualite}`
      + `${c.complexion.humeur ? `, et son humeur est ${c.complexion.humeur}` : ''} — `
      + `c’est de là que se prend la complexion du corps entier, en termes d’humeurs et jamais `
      + `de caractère.\n`
      + `  La Lune tient ${c.lune.signe}, qui gouverne ${c.lune.membre}.\n`
      + `  RÈGLE DE SAIGNÉE : ${c.lune.interdit}\n`
      + `  La sixième maison — la maladie, les serviteurs, les bêtes menues et le travail subi, `
      + `c’est-à-dire tout ce à quoi l’on est assujetti — a pour seigneur ${c.maladie.seigneur.nom}, `
      + `en la ${rang(c.maladie.seigneur.maison)} maison (${c.maladie.seigneur.force}), `
      + `${etatEnClair(c.maladie.seigneur)}.\n`
      + `  Ce que ${c.maladie.seigneur.nom} charge dans le corps : ${c.maladie.corps}\n`
      + (c.maladie.hotes.length
        ? c.maladie.hotes.map((h) => `  Y séjourne aussi ${h.nom} : ${h.corps}`).join('\n') + '\n'
        : '')
      + `  Source : ${c.source}\n`
      + `  ${c.regle}`
    : '';

  const maisons = figure.maisonsHabitees.map((m) =>
    `  ${String(m.rang).padStart(2)}. ${m.titre.padEnd(20)} pointe ${enSigne(m.pointe).padEnd(22)}`
    + ` seigneur ${nomDe(m.seigneur).padEnd(9)}`
    + ` ${m.hotes.length ? `y sont : ${m.hotes.map((h) => h.nom).join(', ')}` : '(vide)'}`).join('\n');

  const parts = figure.parts.map((p) =>
    `  ${p.nom.padEnd(20)} ${enSigne(p.longitude).padEnd(22)} (${p.formule})`).join('\n');

  const regards = (figure.regards ?? []).map((r) =>
    `  ${nomDe(r.de)} ${r.aspect.nom} ${nomDe(r.a)} `
    + `(${r.aspect.angle}°, à ${r.ecart.toFixed(1)}° près${r.partil ? ', EXACT — par degré partil' : ''}`
    + `, ${r.applique ? 's’APPLIQUE — la chose est à venir' : 'se SÉPARE — la chose est faite'})`)
    .join('\n');

  const almuten = figure.almuten.classement.map((c) =>
    `  ${nomDe(c.planete).padEnd(10)} ${c.score} (${c.dignites.join(', ')})`).join('\n');

  // Les planètes qui ne se voient pas : l'aversion ne produit aucune ligne
  // dans la table des regards, et c'est justement pour cela qu'on l'oublie.
  const clefsPl = figure.astres.filter((a) => !a.noeud).map((a) => a.clef);
  const enAversion = [];
  for (let i = 0; i < clefsPl.length; i++) {
    for (let j = i + 1; j < clefsPl.length; j++) {
      const vu = (figure.regards ?? []).some((r) =>
        (r.de === clefsPl[i] && r.a === clefsPl[j]) || (r.de === clefsPl[j] && r.a === clefsPl[i]));
      if (!vu) enAversion.push(`${nomDe(clefsPl[i])}/${nomDe(clefsPl[j])}`);
    }
  }

  const rec = figure.receptions ?? { simples: [], mutuelles: [] };
  const receptions = [
    ...rec.mutuelles.map((m) =>
      `  RÉCEPTION MUTUELLE — ${nomDe(m.a)} et ${nomDe(m.b)} sont chacune dans le domicile de `
      + `l’autre${m.regard ? `, et se regardent par ${m.regard.aspect.nom}`
        : `, MAIS NE SE REGARDENT D’AUCUN ASPECT : l’échange est en règle et ne se voit jamais`}`),
    ...rec.simples.filter((r) => r.regard).map((r) =>
      `  ${nomDe(r.recue)} est reçue par ${nomDe(r.hote)} (elle se tient dans son `
      + `${r.par}), et les deux se regardent par ${r.regard.aspect.nom} — la reçue emprunte `
      + `la force de celle qui la loge`),
  ].join('\n');

  const l = figure.lumiere;
  const lumiere = l
    ? `  La Lune est à ${l.elongation.toFixed(1)}° du Soleil, soit environ ${l.age.toFixed(1)} `
      + `jours après la conjonction : ${l.croissante ? 'CROISSANTE' : 'DÉCROISSANTE'} en lumière.\n`
      + `  ${l.glose}`
    : '';

  const m = figure.metier;
  const metier = m
    ? `  La planète qui se lève immédiatement avant le Soleil : `
      + `${m.precede ? `${m.precede.nom}, à ${m.distanceAuSoleil.toFixed(1)}° devant lui` : '—'}`
      + `${m.leverFaible ? ' — ATTENTION : elle est loin du Soleil et ne fait pas son lever '
        + 'héliaque à proprement parler. Le témoignage est faible ; appuie-toi d’abord sur le '
        + 'seigneur du milieu du ciel, et dis franchement que la règle ne désigne qu’à demi.' : ''}\n`
      + `  Le seigneur du milieu du ciel : ${m.seigneurMC ? m.seigneurMC.nom : '—'}\n`
      + `  Retenus par la règle (Mercure, Vénus ou Mars seulement) : `
      + `${m.retenus.length ? m.retenus.map(nomDe).join(' et ') : 'AUCUN'}\n`
      + (m.sansDistinction
        ? `  → Aucune des trois planètes de l’action ne témoigne : selon Ptolémée, LE MÉTIER EST `
          + `SANS DISTINCTION. Écris-le ainsi ; ne force pas la règle.`
        : `  → ${m.combinaison}\n`
          + `  Applique ensuite les modificateurs : le signe du significateur (fixe, mobile ou `
          + `commun), son lieu (angle, succédente, cadente), sa dignité, et s’il est brûlé.`)
    : '';

  const lieuxParts = (figure.parts ?? []).map((p) => {
    const maison = figure.maisonsHabitees.find((h) => {
      const debut = figure.pointes[h.rang];
      const fin = figure.pointes[h.rang % 12 + 1];
      return mod360(p.longitude - debut) < mod360(fin - debut);
    });
    const seigneur = figure.astres.find((a) => a.clef === seigneurDuSigne(p.longitude));
    return `  ${p.nom.padEnd(20)} tombe en la ${maison ? `${rang(maison.rang)} maison — ${maison.titre} `
      + `(${maison.detail})` : '?'}\n`
      + `    son seigneur est ${seigneur.nom}, en la ${rang(seigneur.maison)} maison, `
      + `${etatEnClair(seigneur)}`;
  }).join('\n');

  return `L'ASCENDANT ET LES ANGLES
  Ascendant (horoscopus) : ${enSigne(figure.ascendant)} — signe ${SIGNES[signeDe(figure.ascendant)]}
  Milieu du ciel         : ${enSigne(figure.milieuDuCiel)}
  Seigneur de l'ascendant: ${nomDe(figure.seigneurAscendant)}
  Secte                  : figure ${figure.deJour ? 'DIURNE' : 'NOCTURNE'} (le Soleil est `
    + `${figure.deJour ? 'au-dessus' : 'au-dessous'} de la terre)

L'ALMUTEN DE L'ASCENDANT — la planète qui gouverne toute la figure
${almuten}
  L'emporte : ${nomDe(figure.almuten.vainqueur.planete)}

LES ASTRES
${astres}

LES DEGRÉS DE PERFECTION — la table des exaltations donne un degré, non un signe
${perfections || '  (aucun corps n’approche son degré d’exaltation ni celui de sa chute)'}

LE CORPS — la complexion, le membre chargé, la règle de saignée
${corps}

LES DOUZE MAISONS (maisons d'Alcabitius)
${maisons}

LES PARTS
${parts}

OÙ TOMBENT LES PARTS, ET QUI LES GOUVERNE — c'est ainsi qu'on juge l'avoir
${lieuxParts}

LA LUMIÈRE DE LA LUNE
${lumiere}

LES REGARDS
${regards || '  (aucun dans les orbes)'}

LES PLANÈTES QUI NE SE VOIENT PAS (aversion — elles ne peuvent rien l'une pour l'autre)
  ${enAversion.join(', ') || '(aucune : toutes se regardent)'}

LES RÉCEPTIONS
${receptions || '  (aucune)'}

LE MÉTIER — la règle de Ptolémée, appliquée
${metier}`;
}

function contexte({ saisie, temps, heures, planetaires, julien }) {
  const c = CONVENTIONS[temps?.convention];
  const lignes = [
    `Date : ${saisie.jour}/${saisie.mois}/${saisie.annee}`
    + `${julien ? ' (calendrier JULIEN, comme l\'aurait lu un calculateur du temps)' : ' (calendrier grégorien)'}`,
    `Heure annoncée : ${saisie.heure} h ${String(saisie.minute).padStart(2, '0')}`,
    `Lieu : latitude ${saisie.latitude}°, longitude ${saisie.longitude}°`,
    'Sexe du natif : NON DEMANDÉ, donc inconnu. Le site ne le demande pas, et tu ne dois pas '
    + 'le deviner. Cela a une conséquence précise : la Part du Mariage se prend dans un sens '
    + 'pour un homme et dans l’autre pour une femme, si bien que le degré calculé ci-dessous '
    + 'vaut pour l’une des deux lectures seulement. Dis-le, et ne tranche pas. Partout '
    + 'ailleurs, écris sans supposer ni le sexe ni l’état matrimonial.',
  ];
  if (temps) {
    lignes.push(`Convention de temps appliquée : ${c?.nom ?? temps.convention}`
      + `${temps.zone ? ` (fuseau ${temps.zone}, ${enDecalage(temps.decalage)})` : ''}`);
    lignes.push(`Au soleil du lieu : ${enHeures(temps.vrai)} vrai, ${enHeures(temps.moyen)} moyen ; `
      + `${enHeures(temps.universel)} au méridien de Greenwich`);
    lignes.push(`Équation du temps ce jour-là : ${temps.equation >= 0 ? '+' : '−'}`
      + `${Math.abs(temps.equation).toFixed(1)} minutes`);
  }
  if (heures && planetaires) {
    lignes.push(`Heure inégale : naissance ${planetaires.deJour ? 'de jour' : 'de nuit'}, à la `
      + `${rang(planetaires.rang)} heure ${planetaires.deJour ? 'du jour' : 'de la nuit'}`);
    lignes.push(`Le jour est un ${planetaires.jourSemaine}, jour de `
      + `${nomDe(planetaires.seigneurDuJour)} ; l'heure présente est heure de `
      + `${nomDe(planetaires.seigneurDeLHeure)}`);
  }
  return `LA FIGURE QU'ON TE REMET\n  ${lignes.join('\n  ')}`;
}

// ─── Les trois dossiers ──────────────────────────────────────────────────────

const SEPARATEUR = (t) => `\n\n${'═'.repeat(78)}\n${t}\n${'═'.repeat(78)}\n`;

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre'];

function enDate(jj) {
  if (jj === null || jj === undefined) return '(inconnu)';
  const d = dateGregorienne(jj);
  return `${d.jour} ${MOIS_FR[d.mois - 1]} ${d.annee}`;
}

/** Le rang d'une maison : la première est « 1re », les autres « ne ». */
const rang = (n) => (n === 1 ? '1re' : `${n}e`);


/** Le compte des trois témoignages, écrit de sorte qu'on voie lequel manque.
 *  Un jugement qui dit « faible » sans dire pourquoi ne se vérifie pas. */
function comptesEnClair(etiquette, f) {
  if (!f) return '';
  return `${etiquette} : ${f.compte}/3 — ${f.fort ? 'ELLE PEUT DONNER' : 'ELLE NE PEUT PAS'}\n`
    + f.appuis.map((x) => `        pour   : ${x}\n`).join('')
    + f.manques.map((x) => `        contre : ${x}\n`).join('');
}

/** Les douze mois de l'année révolue, avec leur matière et leur seigneur.
 *  C'est le seul calendrier que la technique produise honnêtement : il dit
 *  quelle matière est en jeu à quel moment, non ce qui arrivera. */
function calendrier(annee) {
  const lignes = annee.mois.map((m) => {
    const s = m.seigneur;
    const marque = m.clef === annee.maitre.clef ? '  ←  le maître de l’année lui-même' : '';
    return `  ${String(m.rang).padStart(2)}. ${enDate(m.debut).padEnd(20)} `
      + `${(rang(m.maison.rang) + ' — ' + m.maison.titre).padEnd(26)} `
      + `seigneur ${s.nom} (${s.force}, ${etatEnClair(s)})${marque}`;
  });
  return `On avance d'un signe par mois révolu depuis le signe profecté de l'année. Chaque mois\n`
    + `reçoit ainsi une matière et un seigneur. Les dates sont calculées : ne les recalcule pas.\n\n`
    + lignes.join('\n')
    + `\n\n  Source : Alcabitius, dist. IV ; Abū Maʿshar, De revolutionibus nativitatum,\n`
    + `  sur la division de l'année révolue.`;
}

/** Ce qui a bougé d'une figure à l'autre. On ne retient que les changements
 *  francs : le lieu (angle, succédente, cadente), les dignités, la combustion.
 *  Le reste est du bruit, et le donner encouragerait à en tirer quelque chose. */
function lesChangements(annee) {
  const lignes = [];
  for (const n of annee.natale.astres) {
    if (n.noeud) continue;
    const a = annee.annuelle.astres.find((x) => x.clef === n.clef);
    if (!a) continue;
    const notes = [];
    if (n.force !== a.force) {
      notes.push(`de ${n.force} à ${a.force}`);
    }
    const dignN = n.etat?.tenues.length ?? 0;
    const dignA = a.etat?.tenues.length ?? 0;
    if (dignN === 0 && dignA > 0) {
      notes.push(`de ${peregrinDe(n.clef)} à ${a.etat.tenues.join(' et ')}`);
    }
    if (dignN > 0 && dignA === 0) {
      notes.push(`perd ses dignités, devient ${peregrinDe(n.clef)}`);
    }
    const brulN = n.solaire?.classe === 'combuste';
    const brulA = a.solaire?.classe === 'combuste';
    if (!brulN && brulA) notes.push('entre dans la combustion du Soleil');
    if (brulN && !brulA) notes.push('sort de la combustion du Soleil');
    if (n.retrograde !== a.retrograde) {
      notes.push(a.retrograde ? 'devient rétrograde' : 'redevient directe');
    }
    if (notes.length) {
      lignes.push(`  ${n.nom.padEnd(9)} maison ${n.maison} → ${a.maison} : ${notes.join(' ; ')}`);
    }
  }
  return lignes.length
    ? `Ce qui a franchement changé entre la nativité et la révolution :\n\n${lignes.join('\n')}`
    : '  (rien n’a franchement changé : l’année reprend la nativité sans la déplacer)';
}

/** Le dossier d'une nativité. */
export function dossierNativite({ saisie, resultat }) {
  return [
    consigne(PLAN_NATIVITE),
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de cette nativité.`,
    SEPARATEUR('LES DONNÉES') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une révolution d'année. */
export function dossierAnnee({ saisie, resultat, annee }) {
  const m = annee.maitre;
  const retours = Array.from({ length: 8 }, (_, i) => annee.age - 12 * (i + 1))
    .filter((x) => x >= 0);

  return [
    consigne(PLAN_REVOLUTION),
    SEPARATEUR('LA COMMANDE') + `Rédige le jugement de l'année qui court des ${annee.age} ans `
      + `de ce natif à ses ${annee.age + 1} ans — un jugement de révolution, non de nativité.\n\n`
      + `La révolution court du ${enDate(annee.jj)} au ${enDate(annee.finit)}.`,
    SEPARATEUR('LA NATIVITÉ (le fond, qui ne se rejuge pas)') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(annee.natale),
    SEPARATEUR('LA PROFECTION ET LE MAÎTRE DE L\'ANNÉE')
      + `  Âge : ${annee.age} ans\n`
      + `  Maison profectée : ${rang(m.profection.rang)} — ${m.profection.titre} `
      + `(${m.profection.latin}) : ${m.profection.detail}\n`
      + `  Signe profecté : ${enSigne(annee.signeProfecte)}\n`
      + `  La même profection est déjà revenue aux âges de : `
      + `${retours.length ? retours.reverse().join(', ') + ' ans' : '(jamais — c’est la première fois)'}\n`
      + `  MAÎTRE DE L'ANNÉE (dominus anni) : ${m.nom}\n`
      + `    au natal        : ${enSigne(m.natal.longitude)}, maison ${m.natal.maison} `
      + `(${m.natal.force}), ${etatEnClair(m.natal)}\n`
      + `    à la révolution : ${enSigne(m.annuel.longitude)}, maison ${m.annuel.maison} `
      + `(${m.annuel.force}), ${etatEnClair(m.annuel)}\n`
      + `    PEUT-ELLE DONNER ? Trois témoignages, il en faut deux — le lieu (angle ou\n`
      + `      succédente), la grande dignité (domicile, exaltation, triplicité ; le terme et\n`
      + `      la face ne comptent pas), la liberté (directe et hors des rayons).\n`
      + comptesEnClair('      au natal       ', m.ecart.natal)
      + comptesEnClair('      à la révolution', m.ecart.annuel)
      + `    LEQUEL DES QUATRE CAS : ${m.ecart.clef} — ${m.ecart.texte}\n`
      + `  Règle : on avance d'un signe par année de vie depuis l'ascendant natal ; le seigneur `
      + `du lieu où l'on tombe gouverne l'année entière.\n`
      + `  Source : Alcabitius, dist. IV (l'intihā') ; Bonatti, Liber astronomiae, tr. VIII.`,
    SEPARATEUR('LE CALENDRIER DES DOUZE MOIS') + calendrier(annee),
    SEPARATEUR('CE QUI A CHANGÉ DEPUIS LA NATIVITÉ') + lesChangements(annee),
    SEPARATEUR('LA FIGURE DE LA RÉVOLUTION') + figureEnClair(annee.annuelle),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

/** Le dossier d'une interrogation. */
export function dossierInterrogation({ saisie, resultat, question, jugement }) {
  const j = jugement;
  const gardes = j.considerations.length
    ? j.considerations.map((c) => `  — ${c.texte.replace(/<[^>]+>/g, '')}`).join('\n')
    : '  (aucune considération ne s\'oppose au jugement)';

  const nu = (t) => t.replace(/<[^>]+>/g, '');
  const obstacles = j.obstacles.length
    ? j.obstacles.map((o) => `  — ${nu(o.texte)}`).join('\n')
    : '  (rien ne vient couper la voie)';

  return [
    consigne(PLAN_INTERROGATION),
    SEPARATEUR('LA COMMANDE') + `On te pose cette question, et tu dois y répondre :\n\n`
      + `      « ${question} »\n\n`
      + `LA RÉPONSE CALCULÉE EST : ${j.verdict.reponse.toUpperCase()}\n`
      + `Elle t'est donnée. Tu ne la choisis pas, tu l'exposes — et tu la donnes dès ta `
      + `première phrase. Si une considération grave figure ci-dessous, tu donnes quand même `
      + `cette réponse, puis tu dis pourquoi la figure n'est pas en état qu'on s'y fie : `
      + `récuser le jugement n'est pas le taire.`,
    SEPARATEUR('LES CONSIDÉRATIONS AVANT JUGEMENT') + gardes,
    SEPARATEUR('LE CONSULTANT ET LA CHOSE')
      + `  Consultant : l'ascendant, et son seigneur ${nomDe(j.consultant.clef)}, `
      + `maison ${j.consultant.maison} (${j.consultant.force}), ${etatEnClair(j.consultant)}\n`
      + `  La chose : ${rang(j.matiere.rang)} maison — ${j.matiere.titre} (${j.matiere.latin}) : `
      + `${j.matiere.detail}\n`
      + `  Son seigneur : ${nomDe(j.seigneurChose.clef)}, maison ${j.seigneurChose.maison} `
      + `(${j.seigneurChose.force}), ${etatEnClair(j.seigneurChose)}`,
    SEPARATEUR('LA VOIE — comment la chose se fait, ou ne se fait pas')
      + `  Voie retenue : ${j.verdict.clef}\n`
      + `  ${j.verdict.titre}\n\n`
      + `  ${nu(j.verdict.texte)}\n\n`
      + (j.jonction
        ? `  Aspect entre les deux seigneurs : ${j.jonction.nom} (${j.jonction.angle}°), à `
          + `${j.jonction.ecart.toFixed(2)}° de l'exactitude, en ${j.jonction.mouvement}.\n`
          + `  ${j.jonction.glose}\n`
        : `  Aucun aspect entre les deux seigneurs.\n`)
      + (j.translation
        ? `  Translation : ${j.translation.porteur.nom} quitte `
          + `${nomDe(j.translation.quitte.clef)} et joint ${nomDe(j.translation.joint.clef)}.\n`
        : '')
      + (j.collection
        ? `  Collection : ${j.collection.collecteur.nom} recueille les deux lumières.\n`
        : '')
      + (j.vide ? `  Lune vide de course : il lui reste ${j.vide.reste.toFixed(1)}° sans `
        + `rencontre.\n` : '')
      + `\n  CE QUI COUPE LA VOIE :\n${obstacles}`,
    SEPARATEUR('QUAND') + (j.echeance
      ? `  ${nu(j.echeance.texte)}\n`
        + `  Degrés restants : ${j.echeance.degres.toFixed(2)} — unité : ${j.echeance.unite} `
        + `(signe ${j.echeance.mode}, maison ${j.echeance.lieu})\n`
        + `  Source : ${j.echeance.source}`
      : `  La règle ne donne pas d'échéance ici : il n'y a pas d'aspect qui s'applique entre\n`
        + `  les deux seigneurs. N'en invente aucune, et dis que le genre ne permet pas de\n`
        + `  répondre sur le temps.`),
    SEPARATEUR('LA FIGURE DE L\'INSTANT') + contexte({ ...resultat, saisie }),
    '',
    figureEnClair(resultat.figure),
    SEPARATEUR('LA DOCTRINE') + tablesDeDoctrine(),
    SEPARATEUR('LES RÉSERVES') + reserves(),
  ].join('\n');
}

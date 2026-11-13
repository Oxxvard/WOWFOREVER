# Carnet du voleur Forever

Application web (une page, installable) de leveling pour un voleur elfe de la nuit sur WoW Forever. Déployée sur Render (wowforever.onrender.com) depuis ce dépôt : chaque push sur `main` redéploie automatiquement.

## Structure

- `carnet-voleur-site/` : dossier publié par Render (réglage Publish Directory).
- `carnet-voleur-site/index.html` : toute l'application, HTML, CSS et JS dans le même fichier. Les données sont dans le script :
  - `T` : talents Combat (+ Attaques impitoyables, arbre Assassinat), `LAYOUT` : placement dans l'arbre
  - `PATH` : talent pris à chaque niveau, de 10 à 40 (ordre du guide de leveling Combat Wowhead)
  - `SPELLS`, `POISONS` : sorts et poisons par niveau (obligatoire ou facultatif, d'après Wowhead)
  - `CLASSQ` : quêtes de classe, `ROUTE` : parcours de zones, `DJ` : donjons
  - `ITEMS` : armes et équipement, avec stats et nom d'icône Wowhead (`icon`). Provenance structurée : `from` vaut `drop` ou `quete` ; `mob`, `lieu`, `quest` sont des triplets `[fr, en, st]` passés à `nm()` ; `zone` est une chaîne ; `drop` est le pourcentage et `dropSt` vaut 1 si le taux est lu sur Wowhead Forever, 0 s'il reste à confirmer. `srcHtml()` et `srcLine()` les mettent en forme, ne plus écrire de champ `src` en texte libre
  - `TQ`, `TB` : quêtes et boss de la Salle des Thanes
  - `QPNJ` : qui donne la quête et où, `"<zone>|<nom>":[zoneId, x, y, nom du PNJ, horde?]`, relevé sur la carte de chaque page de quête Wowhead. `ZONE_NOM` nomme les zones, `carteUrl()` sert l'image de carte du jeu.
  - `QUETES` : par zone, les huit quêtes qui rapportent le plus d'expérience, `[nom, niveau, niveau requis, XP, élite, nouveauté Forever]`, relevées sur les listes de quêtes de Wowhead Forever. Chaque entrée de `ROUTE` pointe dessus par `qz`. Couvre les zones du 17 au 40.
  - `TREES`, `LAYOUT`, `LAYOUT_A`, `LAYOUT_F` : les trois arbres affichés côte à côte, chaque talent porte son icône officielle dans `ic`
- L'interface est en onglets (`.tab` + `data-p`) : Niveau, Talents, Armes, Mon perso, Parcours, et Salle des Thanes qui disparaît après le niveau 20.
- Cases à cocher : `DONE` dans `localStorage` sous `voleur-fait`, clés `i:<id>` pour un objet, `s:<niveau>:<sort EN>`, `p:<niveau>:<poison EN>`.
- Onglet Mon perso : `chargerPerso()` appelle le relais, `renderPerso()` affiche portrait, caractéristiques, pièces portées et l'objet conseillé par emplacement, avec sa provenance dépliable. La règle des deux mains (la lente à droite, épée ou hache à droite après le niveau 36) est dans le bloc `persoMains`.
- `api/` : relais Node vers l'armurerie Blizzard, déployé à part sur Render (voir `api/README.md`). La constante `API` de `index.html` pointe dessus.
- `carnet-voleur-site/sw.js` : service worker (mode hors ligne).
- `carnet-voleur-site/manifest.webmanifest` et `icons/` : installation en application.

## Règles à respecter

- À chaque modification de `index.html`, incrémente la constante `CACHE` dans `sw.js` (par exemple `carnet-voleur-v3` puis `carnet-voleur-v4`). Sinon l'application installée garde l'ancienne version.
- Noms du jeu : toujours le nom français puis le nom anglais entre parenthèses, via `nm(fr, en, st)`. `st` vaut 1 si le nom FR est vérifié sur une source, 0 s'il est à confirmer, -1 s'il est introuvable. Ne jamais traduire littéralement un nom d'objet, de quête ou de PNJ : le vérifier.
- Source des objets : API d'infobulles Wowhead Forever, `https://nether.wowhead.com/forever/tooltip/item/ID?locale=2` (français) et `locale=0` (anglais). Le champ `icon` de la réponse donne le nom de l'icône.
- Les icônes officielles sont chargées par le navigateur depuis `wow.zamimg.com`. Une icône dessinée en SVG (`ICONS`) sert de repli si l'image ne charge pas.
- Le joueur ne va pas en territoire Horde : les objets et donjons concernés portent `terr:true` et sont masqués par défaut.
- Textes en français, ton direct. Pas de tiret cadratin. Pas de tiret bas dans les noms de fichiers.
- Messages de commit courts, en français.

## Joueur

Voleur elfe de la nuit, Alliance, spé Combat, niveau 17 et plus au départ du carnet. Dans le Loch Modan, avec la Salle des Thanes (donjon de Forgefer) en groupe.

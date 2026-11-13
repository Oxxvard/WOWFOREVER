# Relais armurerie

Petit service Node sans dépendance qui lit la page d'armurerie Blizzard et en
renvoie le personnage en JSON. Le carnet est un site statique : son navigateur
n'a pas le droit d'appeler worldofwarcraft.blizzard.com, d'où ce relais.

## Déploiement Render

New > Web Service, ce dépôt, puis :

- Root Directory : `api`
- Runtime : Node
- Build Command : (vide)
- Start Command : `node server.js`
- Variable d'environnement `ORIGINES` : `https://wowforever.onrender.com`

Déployé sur https://wowforeverapi.onrender.com, l'URL que reprend la constante
`API` dans `carnet-voleur-site/index.html`.

## Points d'entrée

- `GET /armurerie?perso=oxvar-dinho` : nom, niveau, classe, race, niveau
  d'objet moyen et équipement par emplacement. Mis en cache 5 minutes.
- `GET /sante` : vérification que le service répond.

Sur le palier gratuit, le service s'endort après quelques minutes sans visite
et met une trentaine de secondes à se réveiller.

/* Relais vers l'armurerie Blizzard : le navigateur n'a pas le droit d'appeler
   worldofwarcraft.blizzard.com depuis le carnet, ce service le fait à sa place.
   Aucune dépendance : http et fetch natifs (Node 18 ou plus). */
const http = require("http");

const PORT = process.env.PORT || 8080;
const ORIGINES = (process.env.ORIGINES || "https://wowforever.onrender.com,http://127.0.0.1:8731,http://localhost:8731").split(",");
const TTL = 5 * 60 * 1000;
const cache = new Map();

function perso(slug){
  return "https://worldofwarcraft.blizzard.com/fr-fr/forever/eu/armory/character/" + encodeURIComponent(slug);
}

/* Le bloc JSON du personnage est inséré dans la page. On le découpe à l'accolade. */
function extraire(html){
  const i = html.indexOf('"character":{"avatar"');
  if (i < 0) return null;
  const debut = html.lastIndexOf("{", i);
  let profondeur = 0;
  for (let j = debut; j < html.length; j++){
    if (html[j] === "{") profondeur++;
    else if (html[j] === "}"){
      profondeur--;
      if (profondeur === 0){
        try { return JSON.parse(html.slice(debut, j + 1).replace(/&quot;/g, '"')); }
        catch(e){ return null; }
      }
    }
  }
  return null;
}

function resume(d){
  const c = (d && d.character) || d || {};
  const g = c.gear || {};
  const stuff = {};
  Object.keys(g).forEach(function(slot){
    const v = g[slot] || {};
    stuff[slot] = { id: v.id || null, nom: v.name || (v.item && v.item.name) || null };
  });
  return {
    nom: c.name || null,
    niveau: c.level || null,
    classe: (c.class || {}).name || null,
    race: (c.race || {}).name || null,
    ilvl: c.averageItemLevel || null,
    stuff: stuff,
    lu: new Date().toISOString()
  };
}

const serveur = http.createServer(async function(req, res){
  const url = new URL(req.url, "http://x");
  const origine = req.headers.origin;
  if (origine && ORIGINES.indexOf(origine) >= 0) res.setHeader("Access-Control-Allow-Origin", origine);
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS"){ res.writeHead(204); return res.end(); }

  if (url.pathname === "/sante") { res.writeHead(200, {"Content-Type":"application/json"}); return res.end('{"ok":true}'); }
  if (url.pathname !== "/armurerie"){ res.writeHead(404); return res.end("introuvable"); }

  const slug = (url.searchParams.get("perso") || "").toLowerCase();
  if (!/^[a-z0-9à-ÿ-]{3,40}$/.test(slug)){
    res.writeHead(400, {"Content-Type":"application/json"});
    return res.end(JSON.stringify({ erreur: "paramètre perso attendu, par exemple oxvar-dinho" }));
  }

  const dans = cache.get(slug);
  if (dans && Date.now() - dans.t < TTL){
    res.writeHead(200, {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"public, max-age=60"});
    return res.end(JSON.stringify(dans.v));
  }

  try {
    const r = await fetch(perso(slug), { headers: { "Accept": "text/html" } });
    if (!r.ok){
      res.writeHead(502, {"Content-Type":"application/json"});
      return res.end(JSON.stringify({ erreur: "l'armurerie a répondu " + r.status }));
    }
    const d = extraire(await r.text());
    if (!d){
      res.writeHead(502, {"Content-Type":"application/json"});
      return res.end(JSON.stringify({ erreur: "personnage introuvable ou page changée" }));
    }
    const v = resume(d);
    cache.set(slug, { t: Date.now(), v: v });
    res.writeHead(200, {"Content-Type":"application/json; charset=utf-8", "Cache-Control":"public, max-age=60"});
    res.end(JSON.stringify(v));
  } catch(e){
    res.writeHead(502, {"Content-Type":"application/json"});
    res.end(JSON.stringify({ erreur: "lecture impossible" }));
  }
});

serveur.listen(PORT, function(){ console.log("relais armurerie sur " + PORT); });

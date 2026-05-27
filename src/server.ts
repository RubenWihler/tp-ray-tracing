const BASE_PATH = process.cwd() + "/public";

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    // On récupère le chemin demandé (ex: "/css/style.css" ou "/")
    const url = new URL(req.url);
    let path = url.pathname;

    // Si on demande la racine, on renvoie index.html
    if (path === "/") {
      path = "/index.html";
    }

    // On cherche le fichier dans le dossier public
    const file = Bun.file(BASE_PATH + path);

    // Si le fichier existe, on le renvoie au navigateur
    if (await file.exists()) {
      return new Response(file);
    }

    // Sinon, erreur 404
    return new Response("Fichier non trouvé", { status: 404 });
  },
});

console.log(`🌍 Serveur web lancé sur http://localhost:${server.port}`);

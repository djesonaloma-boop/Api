// Endpoint de build / vérif pour Vercel
module.exports = (req, res) => {
  res.status(200).json({
    ok: true,
    app: "GENESIX",
    build: new Date().toISOString(),
    files: ["index.html","login.html","register.html","discussions.html","chat.html","app.js","Backend/app.js"]
  });
};

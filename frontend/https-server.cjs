const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");

// Kreiraj Express aplikaciju
const app = express();

// Čitaj SSL certifikate
const certPath = path.join(__dirname, "..", "ssl", "cert.pem");
const keyPath = path.join(__dirname, "..", "ssl", "key.pem");

const options = {
  cert: fs.readFileSync(certPath),
  key: fs.readFileSync(keyPath),
};

// Serviraj statički fajlove iz dist foldera
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Fallback na index.html za SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Kreiraj HTTPS server
const PORT = process.env.PORT || 8443;
const server = https.createServer(options, app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🔒 HTTPS Frontend server running on:`);
  console.log(`   Local:   https://localhost:${PORT}`);
  console.log(`   Network: https://10.0.0.3:${PORT}`);
  console.log(
    `   Domain:  https://filmovi.local (via nginx reverse proxy on 443)`
  );
});

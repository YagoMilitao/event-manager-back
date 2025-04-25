

// auth/firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
// Agora você pode usar o admin para autenticação e armazenamento
// Exemplo de uso       
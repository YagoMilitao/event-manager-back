const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

console.log('Inicializando Firebase com projeto:', serviceAccount.project_id);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
require('dotenv').config();
const admin = require("firebase-admin");

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error("❌ Variáveis de ambiente do Firebase não configuradas corretamente.");
  console.log("PROJECT_ID:", PROJECT_ID );
  console.log("CLIENT_EMAIL:", CLIENT_EMAIL );
  console.log("PRIVATE_KEY:", PRIVATE_KEY);
  throw new Error("Firebase env vars missing");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: PROJECT_ID,
    clientEmail: CLIENT_EMAIL,
    privateKey: PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: STORAGE_BUCKET,
});

module.exports = admin;

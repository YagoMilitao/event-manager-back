const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState;

  let dbStatus = "🟡 Desconectado";
  if (mongoStatus === 1) dbStatus = "🟢 Conectado";
  if (mongoStatus === 2) dbStatus = "🟠 Conectando";

  res.status(200).json({
    status: "✅ API funcionando",
    database: dbStatus,
  });
});

module.exports = router;

const express = require("express");
const eventRoutes = require("./events");  // Importando as rotas de eventos

const router = express.Router();

// Aplicando as rotas de evento na base `/api/events`
router.use("/events", eventRoutes);

module.exports = router;

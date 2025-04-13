const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const verifyToken = require("../middlewares/authMiddleware");

// Criar evento
router.post("/", verifyToken, async (req, res) => {
  try {
    const newEvent = new Event({ ...req.body, userId: req.user.uid });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
});

// Listar todos os eventos (público)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});

// Atualizar evento (apenas do usuário dono)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.userId !== req.user.uid) {
      return res.status(403).json({ error: "Sem permissão para editar" });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

// Deletar evento (apenas do usuário dono)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.userId !== req.user.uid) {
      return res.status(403).json({ error: "Sem permissão para deletar" });
    }
    await event.deleteOne();
    res.json({ message: "Evento deletado" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
});

module.exports = router;
// // Agora você pode usar essas rotas em seu servidor Express
// // Exemplo de uso em server.js
const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage"); // Importa a configuração do multer
const {
  createEvent,
  createEventWithImages,
  getAllEvents,
  getEventById,
  getMyEvents,
  getImage,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const isEventOwner = require("../middlewares/isEventOwner");
const sanitizeMiddleware = require("../middlewares/sanitize"); // Importa o middleware de sanitização

// 📌 Criar evento (sem imagens)
router.post("/create-event", verifyToken, sanitizeMiddleware, createEvent); // ✅ Aplica sanitização aqui

// 📌 Criar evento com imagens
router.post(
  "/create-with-images",
  verifyToken, // ✅ Garante que o usuário tem um token válido
  upload, // ✅ Usa o middleware multer diretamente\
  sanitizeMiddleware, // ✅ Aplica a sanitização DEPOIS do upload
  createEventWithImages  //✅ Controller que salva o evento + imagens
);

// 📌 Buscar todos os eventos (público)
router.get("/", getAllEvents);

// 📌 Buscar eventos do usuário autenticado
router.get("/my-event", verifyToken, getMyEvents);
router.get('/:id', getEventById);

// Obter imagem de evento
router.get("/image/:id", getImage);
// 📌 Atualizar evento
router.put("/:id", verifyToken, isEventOwner, updateEvent); // ✅ Aplica sanitização aqui também (boa prática)
// 📌 Deletar evento
router.delete("/:id", verifyToken, isEventOwner, deleteEvent);

module.exports = router;
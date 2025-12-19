const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");
const {
  createEvent,
  createEventWithImages,
  getAllEvents,
  getEventById,
  getMyEvents,
  getImage,
  updateEvent,
  deleteEvent,
  updateEventWithImages,
} = require("../controllers/eventController");
const isEventOwner = require("../middlewares/isEventOwner");
const sanitizeMiddleware = require("../middlewares/sanitize");

// 📌 Criar evento (sem imagens)
router.post("/create-event", verifyToken, sanitizeMiddleware, createEvent); 

// 📌 Criar evento com imagens
router.post(
  "/create-with-images",
  verifyToken,
  upload,
  sanitizeMiddleware,
  createEventWithImages
);

// 📌 Buscar todos os eventos (público)
router.get("/", getAllEvents);

// 📌 Buscar eventos do usuário autenticado
router.get("/my-event", verifyToken, getMyEvents);
router.get('/:id', getEventById);

// Obter imagem de evento
router.get("/image/:id", getImage);

// 📌 Atualizar evento
router.put("/:id", verifyToken, isEventOwner, updateEvent);

// 📌 Atualizar evento com imagens
router.put(
  "/:id/with-images",
  verifyToken,
  isEventOwner,
  upload,
  sanitizeMiddleware,
  updateEventWithImages
);

// 📌 Deletar evento
router.delete("/:id", verifyToken, isEventOwner, deleteEvent);

module.exports = router;
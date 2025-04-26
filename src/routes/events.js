const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadImage");
const {
  createEvent,
  createEventWithImages,
  getAllEvents,
  getMyEvents,
  getImage,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const isEventOwner = require("../middlewares/isEventOwner");
const sanitizeInputs = require("../middlewares/sanitizationMiddleware");



// 📌 Criar evento (sem imagens)
router.post("/", verifyToken, createEvent);
// 📌 Criar evento com imagens
router.post(
  "/create-with-images",
  verifyToken, // ✅ Garante que o usuário tem um token válido
  upload, // ✅ Faz o parse de imagens do multipart/form-data
  sanitizeInputs,  // Middleware para sanitizar os dados
  createEventWithImages  //✅ Controller que salva o evento + imagens
);
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retorna todos os eventos
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
// 📌 Buscar todos os eventos (público)
router.get("/", getAllEvents);
// 📌 Buscar eventos do usuário autenticado
router.get("/my-event", verifyToken, getMyEvents);
// Obter imagem de evento
router.get("/image/:id", getImage);
// 📌 Atualizar evento
router.put("/:id", verifyToken, isEventOwner, updateEvent);
// 📌 Deletar evento
router.delete("/:id", verifyToken, isEventOwner, deleteEvent);

module.exports = router;

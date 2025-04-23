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



// 📌 Criar evento (sem imagens)
router.post("/", verifyToken, createEvent);
// 📌 Criar evento com imagens
router.post(
  "/create-with-images",
  verifyToken, // ✅ Garante que o usuário tem um token válido
  upload, // ✅ Faz o parse de imagens do multipart/form-data
  createEventWithImages  //✅ Controller que salva o evento + imagens
);
// 📌 Buscar todos os eventos (público)
router.get("/", getAllEvents);
// 📌 Buscar eventos do usuário autenticado
router.get("/my-event", verifyToken, getMyEvents);
// Obter imagem de evento
router.get("/image/:id", getImage);
// 📌 Atualizar evento
router.put("/:id", verifyToken, updateEvent);
// 📌 Deletar evento
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const uploadEventImage = require('../controllers/uploadImage');

// 🔒 Upload de imagens — rota protegida
router.post('/:id/images', verifyToken, uploadEventImage);

module.exports = router;
// 🔒 Rota protegida para upload de imagens de eventos
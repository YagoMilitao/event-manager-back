const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { decodeToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/test-token', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não enviado.' });
  }

  const token = authHeader.split(' ')[1]; // pega só o token, tirando o "Bearer "

  try {
    const decodedToken = await decodeToken(token);
    res.status(200).json({ message: 'Token válido!', decodedToken });
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    res.status(401).json({ message: 'Token inválido.' });
  }
});
module.exports = router;

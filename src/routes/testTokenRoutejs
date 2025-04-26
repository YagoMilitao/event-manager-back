const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");

/**
 * Rota protegida para verificar se o token enviado no header é válido.
 * Útil para testar se a autenticação está funcionando corretamente.
 */
router.get("/", verifyToken, (req, res) => {
  // Se chegou aqui, o token foi validado com sucesso
  console.log("🔥 Entrou no controller test-auth");
  res.json({
    message: "✅ Token válido!",
    user: req.user, /* O middleware 'verifyToken' adiciona essas infos
                    * Mostra os dados do usuário autenticado
                    * (se o token for válido).
                    */
  });
});

module.exports = router;

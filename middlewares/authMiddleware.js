const admin = require("../auth/firebase");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente ou inválido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ message: "Token inválido" });
  }
};

module.exports = verifyToken;
// // Agora você pode usar o middleware verifyToken em suas rotas
// // Exemplo de uso em uma rota    
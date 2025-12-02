const admin = require("../auth/firebase");
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Token ausente ou inválido");
    return next({
      statusCode: 401,
      message: "Token ausente ou inválido",
    });
  }

  console.log("🛡️ Verificando token...");
  const token = authHeader.split(" ")[1];
  console.log("🔑 Token recebido:", token);

  try {
    console.log("🔍 Indo verificar o token com admin.auth...");
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Token verificado com sucesso:", decodedToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("❌ Erro na verificação do token:", err);
    return next({
      statusCode: 401,
      message: "Token inválido",
      stack: err.stack,
    });
  }
};

async function decodeToken(token) {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  verifyToken, 
  decodeToken
};

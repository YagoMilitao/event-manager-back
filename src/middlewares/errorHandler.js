module.exports = (err, req, res, next) => {
  console.error("🔥 ERRO GLOBAL:", err);

  const statusCode = err.statusCode || 500;

  let message = "Erro interno do servidor";
  let details = null;

  // Mensagem principal
  if (err.message) message = err.message;

  // Joi validation array
  if (Array.isArray(err.details)) {
    details = err.details.map((d) => d.message);
  }

  // Quando o erro vem de validações do Joi
  if (err.isJoi) {
    message = "Erro de validação dos dados enviados";
    details = err.details.map((d) => d.message);
    return res.status(400).json({ error: message, details });
  }

  // Erro padrão
  return res.status(statusCode).json({
    error: message,
    details,
  });
};

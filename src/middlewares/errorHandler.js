function errorHandler(err, req, res, next) {
    console.error("🔥 ERRO DETECTADO:", err); // Log completo no terminal
  
    const statusCode = err.statusCode || 500;
    const message = err.message || "Erro interno do servidor";
  
    res.status(statusCode).json({
      error: message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
  
  module.exports = errorHandler;
  
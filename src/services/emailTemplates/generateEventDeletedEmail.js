function generateEventDeletedEmail(nomeUsuario, nomeEvento) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h2>🗑️ Evento Deletado!</h2>
        <p>Olá <strong>${nomeUsuario}</strong>, seu evento <strong>${nomeEvento}</strong> foi deletado da nossa plataforma.</p>
        <p>Sentiremos falta desse evento!</p>
      </body>
      </html>
    `;
  }
  
  module.exports = generateEventDeletedEmail;
  
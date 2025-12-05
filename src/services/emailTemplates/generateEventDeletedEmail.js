function generateEventDeletedEmail(userName, eventName) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h2>🗑️ Evento Deletado!</h2>
        <p>Olá <strong>${userName}</strong>, seu evento <strong>${eventName}</strong> foi deletado da nossa plataforma.</p>
        <p>Sentiremos falta desse evento!</p>
      </body>
      </html>
    `;
  }
  
  module.exports = generateEventDeletedEmail;
  
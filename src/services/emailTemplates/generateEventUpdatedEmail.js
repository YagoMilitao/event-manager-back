function generateEventUpdatedEmail(userName, eventName, eventLink) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h2>✏️ Evento Atualizado!</h2>
        <p>Olá <strong>${userName}</strong>, seu evento <strong>${eventName}</strong> foi atualizado!</p>
        <a href="${eventLink}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Atualizações</a>
      </body>
      </html>
    `;
  }
  
  module.exports = generateEventUpdatedEmail;
  
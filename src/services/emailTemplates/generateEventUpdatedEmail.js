function generateEventUpdatedEmail(nomeUsuario, nomeEvento, linkEvento) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h2>✏️ Evento Atualizado!</h2>
        <p>Olá <strong>${nomeUsuario}</strong>, seu evento <strong>${nomeEvento}</strong> foi atualizado!</p>
        <a href="${linkEvento}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Atualizações</a>
      </body>
      </html>
    `;
  }
  
  module.exports = generateEventUpdatedEmail;
  
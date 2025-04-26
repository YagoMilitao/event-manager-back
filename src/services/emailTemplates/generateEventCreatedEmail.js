function generateEventCreatedEmail(nomeUsuario, nomeEvento, linkEvento) {
    return `
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center;">
        <h2>🎉 Evento Criado!</h2>
        <p>Olá <strong>${nomeUsuario}</strong>, seu evento <strong>${nomeEvento}</strong> foi criado com sucesso!</p>
        <a href="${linkEvento}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Evento</a>
      </body>
      </html>
    `;
  }
  
  module.exports = generateEventCreatedEmail;
  
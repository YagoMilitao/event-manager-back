const transporter = require('../config/emailConfig');

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Event Manager" <${process.env.EMAIL_USER}>`, //process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log('Email enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

module.exports = { sendEmail };

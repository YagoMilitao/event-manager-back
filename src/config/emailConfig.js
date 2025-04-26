require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // Use variável de ambiente depois
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;

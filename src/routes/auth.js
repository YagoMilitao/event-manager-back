// routes/auth.js
const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// 🎯 Rota de Signup
router.post('/signup',
  // Validação dos campos
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Verifica se o email já existe no banco
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso.' });
      }

      // Criptografa a senha
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Cria o usuário
      const newUser = new User({
        name,
        email,
        passwordHash: hashedPassword,
      });

      await newUser.save();

      // Responde ao cliente
      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (err) {
      console.error('🔥 ERRO AO CRIAR USUÁRIO:', err);
      res.status(500).json({ message: 'Erro ao criar o usuário' });
    }
  }
);

module.exports = router;

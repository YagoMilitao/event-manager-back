const admin = require('../auth/firebase');
// Função para registrar usuário
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Criar o usuário no Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso no Firebase!',
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(400).json({ message: error.message });
  }
};

// Função para login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // O admin SDK não autentica usuários diretamente.
    // Aqui, você teria que autenticar pelo Firebase Client SDK ou usar a REST API.

    // Vamos usar a API REST do Firebase para fazer login manualmente:
    const axios = require('axios');

    const apiKey = process.env.FIREBASE_API_KEY; // Você vai precisar dessa key no .env
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    res.status(200).json({
      message: 'Login efetuado com sucesso!',
      idToken: response.data.idToken,
      refreshToken: response.data.refreshToken,
    });
  } catch (error) {
    console.error('Erro ao logar usuário:', error.response?.data || error.message);
    res.status(400).json({ message: error.response?.data.error.message || error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

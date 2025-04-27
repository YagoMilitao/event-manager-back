const mongoose = require('mongoose');
constbcryptjs = require('bcryptjs');

// 🧩 Definição do schema do usuário
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // tira espaços extras
  },
  email: {
    type: String,
    required: true,
    unique: true, // garante que o email não repita
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔥 Método para comparar senha enviada com senha salva (bcrypt)
userSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

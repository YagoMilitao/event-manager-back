const mongoose = require("mongoose");
const connectDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ Erro ao conectar com MongoDB:", err.message);
    process.exit(1); // Encerra o app se der erro
  }
};
module.exports = connectDB;

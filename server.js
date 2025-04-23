const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
});

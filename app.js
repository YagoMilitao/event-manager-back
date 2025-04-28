const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const morgan = require("morgan");
const swaggerDocs = require("./src/swagger");
const sanitizeMiddleware = require("./src/middlewares/sanitize");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const eventRoutes = require("./src/routes/events");
const testAuthRoute = require("./src/routes/testTokenRoute.js");
const errorHandler = require("./src/middlewares/errorHandler");
const healthRoute = require("./src/routes/dbHealth");
const authRoutes = require('./src/routes/auth');
const { registerUser, loginUser } = require('./src/controllers/userController');

dotenv.config();
const app = express();

// Rota para a raiz do app 
app.get("/", (req, res) => {
  res.send("Bem-vindo ao Event Manager API!");
});


swaggerDocs(app); // Configuração do Swagger

// ✅ Segurança: Headers
app.use(helmet());


//Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://10.0.2.2:3000", 
    "https://seu-dominio.com"
  ], // ajustar conforme o frontend
  methods: [
    "GET", 
    "POST", 
    "PUT", 
    "DELETE"
  ], // métodos permitidos
  credentials: true
}));

// ✅ Parse do body da requisição
// 🔽 Esses dois devem vir antes do xss-clean!
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Adicionado para lidar com form-data e outros tipos




// ✅ Segurança: Limpa dados maliciosos (XSS)
// 🔽 Agora na ordem correta
//app.use(xssClean());

// ✅ Segurança: Evita injeção de MongoDB
app.use(sanitizeMiddleware);

// ✅ Segurança: Limita número de requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
});
app.use(limiter);

// ✅ Logger de requisições
app.use(morgan("dev"));

//Rotas

app.use('/auth', authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/test-auth", testAuthRoute);
app.use("/health", healthRoute);
app.use("/uploads", express.static("uploads"));

// ✅ Middleware de erro (deve vir por último)
app.use(errorHandler);

module.exports = app; // 🔧 Corrigido o "module. Exports" para "module.exports"

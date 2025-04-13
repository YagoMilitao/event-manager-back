const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const eventRoutes = require("./routes/events");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/events", eventRoutes);


app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001", "http://10.0.2.2:3000"], // Front e emulador mobile
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado!");
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  })
  .catch(err => console.error(err));
// // auth/firebase.js  
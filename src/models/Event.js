const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  nome: String,
  email: String,
  whatsapp: String,
  facebook: String,
  twitter: String,
  instagram: String,
});

const imageSchema = new mongoose.Schema({
  data: String, // base64
  contentType: String, // tipo do arquivo
});

const EventSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  horaInicio: { type: Number, required: true },
  horaFim: Number,
  traje: String,
  local: { type: String, required: true },
  preco: String,
  data: { type: String, required: true }, // data no formato YYYY-MM-DD
  descricao: String,
  imagens: [imageSchema],
  userId: { type: String, required: true }, // UID do Firebase
  criador: { type: String, required: true }, // UID do criador
  organizadores: [OrganizerSchema],
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
// module.exports = mongoose.model("Organizer", OrganizerSchema);
// module.exports = mongoose.model("Event", EventSchema);
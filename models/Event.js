const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  nome: String,
  email: String,
  whatsapp: String,
  facebook: String,
  twitter: String,
  instagram: String,
});

const EventSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  horaInicio: { type: Number, required: true },
  traje: String,
  local: String,
  preco: String,
  descricao: String,
  imagens: [String],
  organizadores: [OrganizerSchema],
  criador: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
// module.exports = mongoose.model("Organizer", OrganizerSchema);
// module.exports = mongoose.model("Event", EventSchema);
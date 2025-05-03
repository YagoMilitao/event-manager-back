const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String
  },
  whatsapp: {
    type: String
  },
  facebook: {
    type: String
  },
  twitter: {
    type: String
  },
  instagram: {
    type: String
  }
});

const ImageSchema = new mongoose.Schema({
  data: {
    type: String, // Base64
    required: true
  },
  contentType: {
    type: String, // image/jpeg, image/png, image/webp
    required: true
  }
});

const EventSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  descricao: {
    type: String,
    default: "Sem descrição informada."
  },
  data: {
    type: Date,
    required: true
  },
  horaInicio: {
    type: Number,
    required: true
  },
  horaFim: {
    type: Number
  },
  traje: {
    type: String,
    default: "Livre"
  },
  local: {
    type: String,
    required: true,
    minlength: 3
  },
  preco: {
    type: String,
    default: "0"
  },
  images: {
    type: [ImageSchema],
    default: []
  },
  userId: { type: String, required: true }, // UID do Firebase
  criador: { type: String, required: true }, // UID do criador
  organizadores: {
    type: [OrganizerSchema],
    default: []
  },
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
// module.exports = mongoose.model("Organizer", OrganizerSchema);
// module.exports = mongoose.model("Event", EventSchema);
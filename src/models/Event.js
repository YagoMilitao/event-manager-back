const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  organizerName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  email: {
    type: String,
  },
  whatsapp: {
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  instagram: {
    type: String,
  },
});

// imagem armazenada no GCP
const ImageSchema = new mongoose.Schema({
  url: String,      // URL pública no GCS
  filename: String, // Nome do arquivo no bucket (usado pra deletar)
});

// 📅 Schema principal de Evento
const EventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "Sem descrição informada.",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
    },
    dressCode: {
      type: String,
      default: "Livre",
    },
    location: {
      type: String,
      required: true,
      minlength: 3,
    },
    price: {
      type: String,
      default: "0",
    },

    // 🖼️ Imagem principal (capa)
    coverImage: ImageSchema,

    // 🖼️ Todas as imagens do evento
    images: {
      type: [ImageSchema],
      default: [],
    },

    // 🔐 Relacionamento com usuário (Firebase UID)
    userId: { type: String, required: true },
    creator: { type: String, required: true },

    // 👥 Organizadores
    organizers: {
      type: [OrganizerSchema],
      default: [],
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Event", EventSchema);

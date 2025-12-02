const mongoose = require("mongoose");

const OrganizerSchema = new mongoose.Schema({
  nome: {
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
    nome: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    descricao: {
      type: String,
      default: "Sem descrição informada.",
    },
    data: {
      type: Date,
      required: true,
    },
    horaInicio: {
      type: Number, // ex: 930, 1454
      required: true,
    },
    horaFim: {
      type: Number, // opcional
    },
    traje: {
      type: String,
      default: "Livre",
    },
    local: {
      type: String,
      required: true,
      minlength: 3,
    },
    preco: {
      type: String,
      default: "0",
    },

    // 🖼️ Imagem principal (capa)
    imagemCapa: ImageSchema,

    // 🖼️ Todas as imagens do evento
    imagens: {
      type: [ImageSchema],
      default: [],
    },

    // 🔁 (Opcional) campo duplicado pra compatibilizar com frontend antigo
    images: {
      type: [ImageSchema],
      default: [],
    },

    // 🔐 Relacionamento com usuário (Firebase UID)
    userId: { type: String, required: true },
    criador: { type: String, required: true },

    // 👥 Organizadores
    organizadores: {
      type: [OrganizerSchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

module.exports = mongoose.model("Event", EventSchema);

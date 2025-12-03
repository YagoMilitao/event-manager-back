const Joi = require("joi");

// 🔹 Schema para organizadores
const organizerSchema = Joi.object({
  nome: Joi.string().min(1).required().messages({
    "any.required": "O nome do organizador é obrigatório.",
    "string.empty": "O nome do organizador é obrigatório.",
  }),
  email: Joi.string().email().allow("", null),
  whatsapp: Joi.string().allow("", null),
  instagram: Joi.string().allow("", null),
});

// 🔹 Schema para imagens no GCP
const imageSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.uri": "URL da imagem é inválida.",
    "any.required": "URL da imagem é obrigatória.",
  }),
  filename: Joi.string().min(1).required().messages({
    "any.required": "O nome do arquivo é obrigatório.",
    "string.empty": "O nome do arquivo é obrigatório.",
  }),
});

// 🔹 Schema base de criação
const createEventSchema = Joi.object({
  nome: Joi.string().min(1).required().messages({
    "any.required": "O título é obrigatório.",
    "string.empty": "O título é obrigatório.",
  }),

  descricao: Joi.string().allow("", null),

  // vamos tratar como string "YYYY-MM-DD" mesmo
  data: Joi.string().min(10).required().messages({
    "any.required": "A data é obrigatória.",
    "string.empty": "A data é obrigatória.",
  }),

  // número tipo 1900, 2130 etc
  horaInicio: Joi.number().integer().min(0).max(2359).required().messages({
    "any.required": "Hora de início é obrigatória.",
  }),

  horaFim: Joi.number().integer().min(0).max(2359).allow(null),

  local: Joi.string().min(1).required().messages({
    "any.required": "O local é obrigatório.",
    "string.empty": "O local é obrigatório.",
  }),

  preco: Joi.string().allow("", null),
  traje: Joi.string().allow("", null),

  organizadores: Joi.array()
    .items(organizerSchema)
    .min(1)
    .required()
    .messages({
      "array.min": "Pelo menos um organizador é obrigatório.",
      "any.required": "Organizadores são obrigatórios.",
    }),

  // para criação com imagens (GCP)
  imagemCapa: imageSchema.optional(),
  imagens: Joi.array().items(imageSchema).default([]),
});

// 🔹 Schema de atualização – mesmos campos, mas todos opcionais
const updateEventSchema = createEventSchema.fork(
  ["nome", "data", "horaInicio", "local", "organizadores"],
  (field) => field.optional()
);

module.exports = {
  createEventSchema,
  updateEventSchema,
};

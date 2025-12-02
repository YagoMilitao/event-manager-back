// validations/eventValidation.js
const Joi = require("joi");

// imagem no formato novo (GCP)
const imageSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.uri": "URL da imagem é inválida.",
    "any.required": "URL da imagem é obrigatória.",
  }),
  filename: Joi.string().required().messages({
    "any.required": "Nome do arquivo da imagem é obrigatório.",
  }),
});

// organizador
const organizerSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required().messages({
    "any.required": "Nome do organizador é obrigatório.",
    "string.min": "Nome do organizador deve ter pelo menos 2 caracteres.",
  }),
  email: Joi.string().email().allow("", null),
  whatsapp: Joi.string().allow("", null),
  facebook: Joi.string().allow("", null),
  instagram: Joi.string().allow("", null),
  twitter: Joi.string().allow("", null),
});

const baseFields = {
  nome: Joi.string().min(3).max(100).required().messages({
    "any.required": "O título é obrigatório.",
    "string.min": "O título deve ter pelo menos 3 caracteres.",
  }),
  descricao: Joi.string().allow("", null),
  data: Joi.date().iso().required().messages({
    "any.required": "A data é obrigatória.",
  }),
  horaInicio: Joi.number().integer().required().messages({
    "any.required": "Hora de início é obrigatória.",
  }),
  horaFim: Joi.number().integer().allow(null),
  local: Joi.string().min(3).required().messages({
    "any.required": "O local é obrigatório.",
  }),
  preco: Joi.string().allow("", null),
  traje: Joi.string().allow("", null),
  organizadores: Joi.array().items(organizerSchema).default([]),

  // ✅ novo formato de imagem
  imagemCapa: imageSchema.optional(),
  imagens: Joi.array().items(imageSchema).default([]),

  // ❌ desabilita o formato antigo de imagens (buffer)
  images: Joi.forbidden().messages({
    "any.unknown":
      '"images" não é mais suportado. Use "imagemCapa" e "imagens" com url/filename.',
  }),
};

// criação exige os obrigatórios
const createEventSchema = Joi.object(baseFields);

// update: mesmos campos, mas todos opcionais
const updateEventSchema = Joi.object({
  ...baseFields,
})
  .fork(["nome", "data", "horaInicio", "local"], (schema) => schema.optional());

module.exports = {
  createEventSchema,
  updateEventSchema,
};

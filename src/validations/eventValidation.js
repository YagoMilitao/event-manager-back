const Joi = require("joi");

// Schema base para criar ou atualizar
const baseEventSchema = {
  nome: Joi.string().trim().min(3).max(100).required(),
  descricao: Joi.string().trim().min(10).max(1000).required(),
  data: Joi.date().iso().required(),
  local: Joi.string().trim().min(3).required(),
  imagemUrl: Joi.string().uri().optional(),
};

// 🎯 Validação individual de cada organizador
const organizerSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required().messages({
    "any.required": "Nome do organizador é obrigatório.",
    "string.base": "O nome do organizador deve ser uma string.",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Email do organizador inválido.",
  }),
  whatsapp: Joi.string().optional(),
  facebook: Joi.string().uri().optional(),
  twitter: Joi.string().uri().optional(),
  instagram: Joi.string().uri().optional(),
});

// 🖼️ Validação básica de imagem (base64 e tipo MIME)
const imageSchema = Joi.object({
  data: Joi.string().base64().required().messages({
    "any.required": "Imagem é obrigatória.",
    "string.base64": "Imagem deve estar codificada em base64.",
  }),
  contentType: Joi.string()
    .valid("image/jpeg", "image/png", "image/webp")
    .required()
    .messages({
      "any.only": "Tipo de imagem inválido. Apenas JPEG, PNG ou WebP são permitidos.",
    }),
});

// Validação para criação de evento
const createEventSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "any.required": "O título é obrigatório.",
    "string.base": "O título deve ser uma string."
  }),
  descricao: Joi.string().allow("").optional(),
  data: Joi.date().iso().required().messages({
    "any.required": "A data é obrigatória.",
    "date.base": "Data inválida."
  }),
  horaInicio: Joi.number().min(0).max(2359).required().messages({
    "any.required": "Hora de início é obrigatória.",
    "number.base": "Hora de início deve ser um número (formato HHMM).",
  }),
  horaFim: Joi.number().min(0).max(2359).optional(),
  traje: Joi.string().allow("").optional(),
  local: Joi.string().required().messages({
    "any.required": "O local é obrigatório.",
    "string.base": "O local deve ser uma string."
  }),
  preco: Joi.string().allow("").optional(),
  organizadores: Joi.array().items(organizerSchema).optional(),
  imagens: Joi.array().items(imageSchema).optional().messages({
    "array.includes": "Formato de imagem inválido.",
  }),
});

// Validação para atualização (campos opcionais)
const updateEventSchema = Joi.object({
  nome: Joi.string().min(3).max(100).messages({
    "string.base": "O nome deve ser um texto",
  }),
  descricao: Joi.string().min(10).max(1000).messages({
    "string.base": "A descrição deve ser um texto",
  }),
  data: Joi.string().isoDate().messages({
    "date.base": "A data deve estar no formato ISO",
  }),
  horaInicio: Joi.number().min(0).max(2359),
  horaFim: Joi.number().min(0).max(2359),
  traje: Joi.string().allow(""),
  local: Joi.string().min(3).max(200).messages({
    "string.base": "O local deve ser um texto",
  }),
  preco: Joi.string().allow(""),
  organizadores: Joi.array().items(organizerSchema),
  imagens: Joi.array().items(imageSchema),
});



module.exports = {
  baseEventSchema,
  createEventSchema,
  updateEventSchema
};

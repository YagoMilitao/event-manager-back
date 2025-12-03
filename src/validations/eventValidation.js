const Joi = require("joi");

// 🔹 Schema de organizador
const organizerSchema = Joi.object({
  nome: Joi.string().min(1).required().messages({
    "any.required": "O nome do organizador é obrigatório.",
    "string.empty": "O nome do organizador é obrigatório.",
  }),
  email: Joi.string().email().allow("", null).messages({
    "string.email": "E-mail do organizador inválido.",
  }),
  whatsapp: Joi.string().allow("", null),
  instagram: Joi.string().allow("", null),
});

// 🔹 Schema de imagem salva no GCP
const imageSchema = Joi.object({
  // deixamos BEM simples pra não dar erro com URL do GCS
  url: Joi.string().required().messages({
    "any.required": "URL da imagem é obrigatória.",
    "string.empty": "URL da imagem é obrigatória.",
  }),
  filename: Joi.string().required().messages({
    "any.required": "Filename da imagem é obrigatório.",
    "string.empty": "Filename da imagem é obrigatório.",
  }),
});

// 🔹 CREATE
const createEventSchema = Joi.object({
  // ⚠️ IMPORTANTE: aqui a chave é "nome" (é isso que o controller usa)
  nome: Joi.string().min(3).max(120).required().messages({
    "any.required": "O título é obrigatório.",
    "string.empty": "O título é obrigatório.",
    "string.min": "O título deve ter pelo menos {#limit} caracteres.",
    "string.max": "O título deve ter no máximo {#limit} caracteres.",
  }),

  descricao: Joi.string().allow("", null),

  // Pra evitar treta com timezone/ISO, vamos aceitar string mesmo
  data: Joi.string().required().messages({
    "any.required": "A data é obrigatória.",
    "string.empty": "A data é obrigatória.",
  }),

  horaInicio: Joi.number().integer().min(0).max(2359).required().messages({
    "any.required": "Hora de início é obrigatória.",
    "number.base": "Hora de início deve ser um número (HHMM).",
    "number.min": "Hora de início é inválida.",
    "number.max": "Hora de início é inválida.",
  }),

  horaFim: Joi.number().integer().min(0).max(2359).optional().allow(null),

  local: Joi.string().min(3).required().messages({
    "any.required": "O local é obrigatório.",
    "string.empty": "O local é obrigatório.",
  }),

  preco: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Preço inválido. Use apenas números, com até 2 casas decimais.",
    }),

  traje: Joi.string().allow("", null),

  organizadores: Joi.array()
    .items(organizerSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "Pelo menos um organizador é obrigatório.",
      "array.min": "Pelo menos um organizador é obrigatório.",
    }),

  // 🔹 Campos de imagem vindos do GCP
  imagemCapa: imageSchema.optional(),
  imagens: Joi.array().items(imageSchema).optional(),
})
  // remove qualquer campo extra que a gente não definiu
  .prefs({ stripUnknown: true });

// 🔹 UPDATE (bem flexível)
const updateEventSchema = Joi.object({
  nome: Joi.string().min(3).max(120).messages({
    "string.min": "O título deve ter pelo menos {#limit} caracteres.",
    "string.max": "O título deve ter no máximo {#limit} caracteres.",
  }),
  descricao: Joi.string().allow("", null),
  data: Joi.string().allow("", null),
  horaInicio: Joi.number().integer().min(0).max(2359),
  horaFim: Joi.number().integer().min(0).max(2359).allow(null),
  local: Joi.string().min(3),
  preco: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Preço inválido. Use apenas números, com até 2 casas decimais.",
    }),
  traje: Joi.string().allow("", null),
  organizadores: Joi.array().items(organizerSchema),
  imagemCapa: imageSchema.optional(),
  imagens: Joi.array().items(imageSchema).optional(),
}).prefs({ stripUnknown: true });

module.exports = {
  createEventSchema,
  updateEventSchema,
};

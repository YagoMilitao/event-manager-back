const Joi = require("joi");

// Schema base para criar ou atualizar
const baseEventSchema = {
  nome: Joi.string().trim().min(3).max(100).required(),
  descricao: Joi.string().trim().min(10).max(1000).required(),
  data: Joi.date().iso().required(),
  local: Joi.string().trim().min(3).required(),
  imagemUrl: Joi.string().uri().optional(),
};
// Validação para criação de evento
const createEventSchema = Joi.object({
  nome: Joi.string().required().messages({
    "any.required": "O título é obrigatório.",
    "string.base": "O título deve ser uma string."
  }),
  descricao: Joi.string().allow(""),
  data: Joi.date().iso().required().messages({
    "any.required": "A data é obrigatória.",
    "date.base": "Data inválida."
  }),
  local: Joi.string().required().messages({
    "any.required": "O local é obrigatório.",
    "string.base": "O local deve ser uma string."
  })
});

// Validação para atualização (campos opcionais)
const updateEventSchema = Joi.object({
  nome: Joi.string(),
  descricao: Joi.string().allow(""),
  data: Joi.date().iso(),
  local: Joi.string(),
});

module.exports = {
  baseEventSchema,
  createEventSchema,
  updateEventSchema
};

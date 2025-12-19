const Joi = require("joi");

const addressSchema = Joi.object({
  cep: Joi.string().allow("", null),
  street: Joi.string().required(),
  number: Joi.string().required(),
  neighborhood: Joi.string().allow("", null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  complement: Joi.string().allow("", null),
});

const geoSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});


// 🔹 Schema de organizador
const organizerSchema = Joi.object({
  organizerName: Joi.string().min(1).required().messages({
    "any.required": "O nome do organizador é obrigatório.",
    "string.empty": "O nome do organizador é obrigatório.",
  }),
  email: Joi.string().email().allow("", null).messages({
    "string.email": "E-mail do organizador inválido.",
  }),
  whatsapp: Joi.string().allow("", null),
  facebook: Joi.string().allow("", null),
  twitter: Joi.string().allow("", null),
  instagram: Joi.string().allow("", null),
});

// 🔹 Schema de imagem salva no GCP
const imageSchema = Joi.object({
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
  eventName: Joi.string().min(3).max(120).required().messages({
    "any.required": "O título é obrigatório.",
    "string.empty": "O título é obrigatório.",
    "string.min": "O título deve ter pelo menos {#limit} caracteres.",
    "string.max": "O título deve ter no máximo {#limit} caracteres.",
  }),

  description: Joi.string().allow("", null),

  // Pra evitar problemas com timezone/ISO, vamos aceitar string mesmo
  date: Joi.string().required().messages({
    "any.required": "A data é obrigatória.",
    "string.empty": "A data é obrigatória.",
  }),

  startTime: Joi.number().integer().min(0).max(2359).required().messages({
    "any.required": "Hora de início é obrigatória.",
    "number.base": "Hora de início deve ser um número (HHMM).",
    "number.min": "Hora de início é inválida.",
    "number.max": "Hora de início é inválida.",
  }),

  endTime: Joi.number().integer().min(0).max(2359).optional().allow(null),
  address: addressSchema.required(),
  locationLabel: Joi.string().required(),
  geo: geoSchema.optional(),
  price: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Preço inválido. Use apenas números, com até 2 casas decimais.",
    }),

  dressCode: Joi.string().allow("", null),

  organizers: Joi.array()
    .items(organizerSchema)
    .min(1)
    .required()
    .messages({
      "any.required": "Pelo menos um organizador é obrigatório.",
      "array.min": "Pelo menos um organizador é obrigatório.",
    }),

  // 🔹 Campos de imagem vindos do GCP
  coverImage: imageSchema.optional(),
  images: Joi.array().items(imageSchema).optional(),
})
  // remove qualquer campo extra que a gente não definiu
  .prefs({ stripUnknown: true });

// 🔹 UPDATE (bem flexível)
const updateEventSchema = Joi.object({
  eventName: Joi.string().min(3).max(120).messages({
    "string.min": "O título deve ter pelo menos {#limit} caracteres.",
    "string.max": "O título deve ter no máximo {#limit} caracteres.",
  }),
  description: Joi.string().allow("", null),
  date: Joi.string().allow("", null),
  startTime: Joi.number().integer().min(0).max(2359),
  endTime: Joi.number().integer().min(0).max(2359).allow(null),
  address: addressSchema.required(),
  locationLabel: Joi.string().required(),
  geo: geoSchema.optional(),
  price: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Preço inválido. Use apenas números, com até 2 casas decimais.",
    }),
  dressCode: Joi.string().allow("", null),
  organizers: Joi.array().items(organizerSchema),
  coverImage: imageSchema.optional(),
  images: Joi.array().items(imageSchema).optional(),
}).prefs({ stripUnknown: true });

module.exports = {
  createEventSchema,
  updateEventSchema,
};

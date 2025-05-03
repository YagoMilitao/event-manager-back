const Event = require("../models/Event");
const { createEventSchema, updateEventSchema } = require("../validations/eventValidation");
const { sendEmail } = require('../services/emailService');
const generateEventCreatedEmail = require('../services/emailTemplates/generateEventCreatedEmail');
const generateEventUpdatedEmail = require('../services/emailTemplates/generateEventUpdatedEmail');
const generateEventDeletedEmail = require('../services/emailTemplates/generateEventDeletedEmail');

// 🛠️ Função auxiliar para converter imagens do multer em base64
const processImages = (files) => {
  return files.map((file) => ({
    data: file.buffer.toString("base64"),
    contentType: file.mimetype,
  }));
};

// Criar novo evento (sem imagens)
const createEvent = async (req, res, next) => {
  try {
    const { error, value } = createEventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next({ statusCode: 400, message: error.details[0].message });
    }

    const newEvent = new Event({
      ...req.body,
      preco: value.preco || "0",
      traje: value.traje || "Livre",
      descricao: value.descricao || "Sem descrição informada.",
      userId: req.user.uid,
      criador: req.user.uid,
    });

    const savedEvent = await newEvent.save();

    const htmlContent = generateEventCreatedEmail(
      req.user.uid,
      req.body.nome,
      `https://event-manager-back.onrender.com/create-event/${savedEvent._id}`
    );

    res.status(201).json({
      message: "Evento criado com sucesso e email sendo enviado!",
      evento: savedEvent,
    });

    setImmediate(async () => {
      try {
        await sendEmail({
          to: req.user.email,
          subject: `Seu evento \"${req.body.nome}\" foi criado!`,
          html: htmlContent,
        });
        console.log(`📧 E-mail enviado com sucesso para \"${req.user.uid}\" com o email \"${req.user.email}\"`);
      } catch (error) {
        console.error('⚠️ Falha ao enviar e-mail em background:', error);
      }
    });
  } catch (err) {
    console.error("🔥 ERRO AO CRIAR EVENTO:", err);
    next({ statusCode: 500, message: "Erro ao criar evento", stack: err.stack });
  }
};

// Criar evento com imagens (multipart/form-data)
const createEventWithImages = async (req, res, next) => {
  try {
    const imagensConvertidas = req.files ? processImages(req.files) : [];

    const { nome, horaInicio, data, local } = req.body;
    if (!nome || !horaInicio || !data || !local) {
      return res.status(400).json({ message: "Dados obrigatórios ausentes" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Imagem obrigatória" });
    }

    const { error, value } = createEventSchema.validate(
      { ...req.body, imagens: imagensConvertidas },
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.details.map((err) => err.message),
      });
    }

    const newEvent = new Event({
      ...req.body,
      preco: value.preco?.trim() || "0",
      traje: value.traje?.trim() || "Livre",
      descricao: value.descricao?.trim() || "Sem descrição informada.",
      imagens: imagensConvertidas,
      criador: req.user.uid,
      userId: req.user.uid,
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: "Evento criado com sucesso",
      evento: savedEvent._id,
    });
  } catch (err) {
    console.error("❌ ERRO AO CRIAR EVENTO COM IMAGENS:", err);
    next(err);
  }
};

// Buscar todos os eventos
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    console.error("🔥 ERRO AO LISTAR EVENTOS:", err);
    next({ statusCode: 500, message: "Erro ao buscar eventos", stack: err.stack });
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    console.error("🔥 ERRO AO MOSTRAR O EVENTO:", err);
    next({ statusCode: 500, message: "Erro ao buscar evento", stack: err.stack });
  }
};

const getMyEvents = async (req, res, next) => {
  try {
    const userEvent = await Event.find({ criador: req.user.uid });
    res.status(200).json(userEvent);
  } catch (err) {
    console.error("🔥 ERRO AO BUSCAR EVENTOS DO USUÁRIO:", err);
    next({ statusCode: 500, message: "Erro ao buscar seus eventos", stack: err.stack });
  }
};

const getImage = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.imagem || !event.imagem.data) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }
    res.contentType(event.imagem.contentType);
    res.send(event.imagem.data);
  } catch (err) {
    console.error("🔥 ERRO AO RETORNAR IMAGEM:", err);
    next({ statusCode: 500, message: "Erro ao retornar imagem", stack: err.stack });
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { error } = updateEventSchema.validate(req.body);
    if (error) return next({ statusCode: 400, message: error.details[0].message });

    const event = await Event.findById(req.params.id);
    if (!event) return next({ statusCode: 404, message: "Evento não encontrado" });
    if (event.criador !== req.user.uid) return next({ statusCode: 403, message: "Você não é o criador deste evento" });

    Object.assign(event, req.body);
    await event.save();

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const htmlContent = generateEventUpdatedEmail(
      req.user.name,
      req.body.nome,
      `https://seusite.com/eventos/${updatedEvent._id}`
    );

    await sendEmail({
      to: req.user.email,
      subject: 'Evento Atualizado!',
      text: `Seu evento \"${req.body.nome}\" foi atualizado!`,
      html: htmlContent,
    });

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error("🔥 ERRO AO ATUALIZAR EVENTO:", err);
    next({ statusCode: 500, message: "Erro ao atualizar evento", stack: err.stack });
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next({ statusCode: 404, message: "Evento não encontrado" });
    if (event.criador !== req.user.uid) return next({ statusCode: 403, message: "Você não é o criador deste evento" });

    await Event.findByIdAndDelete(req.params.id);

    const htmlContent = generateEventDeletedEmail(
      req.user.name,
      req.body.nome,
      `https://seusite.com/eventos/${event._id}`
    );

    await sendEmail({
      to: req.user.email,
      subject: 'Evento deletado!',
      text: `Seu evento \"${req.body.nome}\" foi deletado!`,
      html: htmlContent,
    });

    res.status(200).json({ message: "Evento deletado com sucesso" });
  } catch (err) {
    console.error("🔥 ERRO AO DELETAR EVENTO:", err);
    next({ statusCode: 500, message: "Erro ao deletar evento", stack: err.stack });
  }
};

module.exports = {
  createEvent,
  createEventWithImages,
  getAllEvents,
  getEventById,
  getMyEvents,
  getImage,
  updateEvent,
  deleteEvent,
};

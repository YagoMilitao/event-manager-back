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
     console.log("➡️ createEvent chamado");
    console.log("   req.body:", req.body);
    const { error, value } = createEventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.error("   Erro de validação:", error.details);
      return next({ statusCode: 400, message: error.details[0].message });
    }

    console.log("   Dados validados:", value);

    const newEvent = new Event({
      ...req.body,
      preco: value.preco || "0",
      traje: value.traje || "Livre",
      descricao: value.descricao || "Sem descrição informada.",
      userId: req.user.uid,
      criador: req.user.uid,
    });
    console.log("   Evento a ser salvo:", newEvent);


    const savedEvent = await newEvent.save();
    console.log("   Evento salvo com sucesso:", savedEvent);

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
    console.log("➡️ createEventWithImages chamado");
    console.log("   req.body:", req.body);
    console.log("   req.files:", req.files);

    // Usa o helper processImages que você já tem
    const filesArray = Array.isArray(req.files) ? req.files : [];
    const convertImages = filesArray.length > 0 ? processImages(filesArray) : [];

    // Parse dos campos (strings vindas do multipart/form-data)
    const nome = req.body.nome?.toString();
    console.log("req.body.nome", nome);
    const descricao = req.body.descricao?.toString() || "Sem descrição informada.";
    console.log("req.body.descricao", descricao);
    const data = req.body.data?.toString();
    console.log("req.body.data", data);
    const horaInicio = req.body.horaInicio ? Number(req.body.horaInicio) : undefined;
    console.log("req.body.horaInicio", horaInicio);
    const horaFim = req.body.horaFim ? Number(req.body.horaFim) : undefined;
    console.log("req.body.horaFim", horaFim);
    const local = req.body.local?.toString();
    console.log("req.body.local", local);
    const traje = req.body.traje?.toString() || "Livre";
    console.log("req.body.traje", traje);
    const preco = req.body.preco?.toString() || "0";
    console.log("req.body.preco", preco);

    // Parse do array de organizadores
    const rawOrganizadores = req.body.organizadores;
    let parsedOrganizadores = [];
    if (rawOrganizadores) {
      try {
        parsedOrganizadores = JSON.parse(rawOrganizadores);
        console.log("   parsedOrganizadores:", parsedOrganizadores);
      } catch (err) {
        console.error("   Erro ao parsear organizadores:", err);
        return res.status(400).json({
          message: "Formato inválido para organizadores. Deve ser um JSON válido.",
        });
      }
    }

    const eventData = {
      nome,
      descricao,
      data,
      horaInicio,
      horaFim,
      local,
      traje,
      preco,
      organizadores: parsedOrganizadores,
      images: convertImages,
    };
    console.log("   eventData antes da validação:", eventData);

    // Validação com Joi
    const { error, value } = createEventSchema.validate(eventData, {
      abortEarly: false,
    });

    if (error) {
      console.error("   Erro de validação:", error.details);
      return next({
       statusCode: 400,
       message: "Erro de validação do evento",
       details: error.details.map(d => d.message)
     });
    }
    console.log("   Dados validados:", value);

    const newEvent = new Event({
      ...value,
      // capa (pra bater com getImage, que usa event.imagem)
      imagem: convertImages[0] || undefined,
      // array completo de imagens
      images: convertImages,
      criador: req.user.uid,
      userId: req.user.uid,
    });
    console.log("   Evento a ser salvo:", newEvent);

    const savedEvent = await newEvent.save();
    console.log("   Evento salvo com sucesso:", savedEvent);

    res.status(201).json({
      message: "Evento criado com sucesso",
      evento: savedEvent._id,
    });
  } catch (err) {
    console.error("❌ ERRO AO CRIAR EVENTO COM IMAGENS:", err);
    next({
      statusCode: 500,
      message: err.message || "Erro ao criar evento com imagens",
      stack: err.stack,
    });
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
    // 🔎 Validação com Joi (pode usar abortEarly: false pra mensagens mais ricas, se quiser)
    const { error } = updateEventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next({ statusCode: 400, message: error.details[0].message });
    }

    // 🔐 Busca o evento e garante que o usuário é o criador
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }

    if (event.criador !== req.user.uid) {
      return next({ statusCode: 403, message: "Você não tem permissão para editar este evento" });
    }

    // 📝 Atualiza os campos do evento
    Object.assign(event, req.body);
    await event.save();

    // 🔁 Garante que pegamos a versão atualizada do banco
    const updatedEvent = await Event.findById(req.params.id);

    // ✅ RESPONDE primeiro para o cliente
    res.status(200).json(updatedEvent);

    // 📧 Envia o e-mail EM BACKGROUND (não quebra a resposta se der erro)
    setImmediate(async () => {
      try {
        const htmlContent = generateEventUpdatedEmail(
          req.user.name,
          updatedEvent.nome || updatedEvent.titulo,
          `http://event-manager-back.onrender.com/api/events/${updatedEvent._id}`
        );

        await sendEmail({
          to: req.user.email,
          subject: `Evento Atualizado: "${updatedEvent.nome || updatedEvent.titulo}"`,
          text: `Seu evento "${updatedEvent.nome || updatedEvent.titulo}" foi atualizado!`,
          html: htmlContent,
        });

        console.log(`📧 E-mail de atualização enviado para ${req.user.email}`);
      } catch (emailErr) {
        console.error("⚠️ Falha ao enviar e-mail de atualização:", emailErr);
      }
    });
  } catch (err) {
    console.error("🔥 ERRO AO ATUALIZAR EVENTO:", err);
    next({ statusCode: 500, message: "Erro ao atualizar evento", stack: err.message });
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
      event.nome,
      `http://event-manager-back.onrender.com/api/events/${event._id}`
    );

    await sendEmail({
      to: req.user.email,
      subject: 'Evento deletado!',
      text: `Seu evento \"${event.nome}\" foi deletado!`,
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

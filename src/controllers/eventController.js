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

// ✅ Helper pra jogar erro de validação Joi no middleware de erro
function handleJoiError(error, next, contextoMensagem = "Erro de validação do evento") {
  console.error("Erro de validação Joi:", error.details);
  return next({
    statusCode: 400,
    message: contextoMensagem,
    details: error.details.map((d) => d.message),
  });
}

// Criar novo evento (sem imagens)
const createEvent = async (req, res, next) => {
  try {
    console.log("➡️ createEvent chamado");
    console.log("   req.body:", req.body);

    const { error, value } = createEventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.error("   Erro de validação:", error.details);
      return next({
        statusCode: 400,
        message: "Erro de validação ao criar evento",
        details: error.details.map(d => d.message),
      });
    }

    if (error) {
      return handleJoiError(error, next, "Erro de validação ao criar evento");
    }

    console.log("   Dados validados:", value);

    const newEvent = new Event({
      ...value,
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
      value.nome,
      `https://event-manager-back.onrender.com/create-event/${savedEvent._id}`
    );

    res.status(201).json({
      message: "Evento criado com sucesso! Um e-mail de confirmação está sendo enviado.",
      evento: savedEvent,
    });

    // 📧 E-mail em background (não afeta a resposta da API)
    setImmediate(async () => {
      try {
        console.log("req.user.email, req.organizadores.email" + req.user.email, req.organizadores.email);
        if (req.user.email != req.organizadores.email) {
          await sendEmail({
            to: req.organizadores.email && req.user.email,
            subject: `Seu evento "${value.nome}" foi criado!`,
            html: htmlContent,
          });
          console.log(`📧 E-mail enviado com sucesso para "${req.user.uid}" (${req.user.email}+${req.organizadores.email })`);
        }
        else{
          await sendEmail({
            to: req.user.email,
            subject: `Seu evento "${value.nome}" foi criado!`,
            html: htmlContent,
          });
          console.log(`📧 E-mail enviado com sucesso para "${req.user.uid}" (${req.user.email})`);
        }
        
      } catch (error) {
        console.error('⚠️ Falha ao enviar e-mail em background:', error);
      }
    });
  } catch (err) {
    console.error("🔥 ERRO AO CRIAR EVENTO:", err);
    next({
      statusCode: 500,
      message: "Erro ao criar evento",
      details: [err.message],
    });
  }
};

// Criar evento com imagens (multipart/form-data)
const createEventWithImages = async (req, res, next) => {
  try {
    console.log("➡️ createEventWithImages chamado");
    console.log("   req.body:", req.body);
    console.log("   req.files:", req.files);

    // Usa o helper processImages
    const filesArray = Array.isArray(req.files) ? req.files : [];
    const convertImages = filesArray.length > 0 ? processImages(filesArray) : [];

    // Parse dos campos (strings vindas do multipart/form-data)
    const nome = req.body.nome?.toString();
    const descricao = req.body.descricao?.toString() || "Sem descrição informada.";
    const data = req.body.data?.toString();
    const horaInicio = req.body.horaInicio ? Number(req.body.horaInicio) : undefined;
    const horaFim = req.body.horaFim ? Number(req.body.horaFim) : undefined;
    const local = req.body.local?.toString();
    const traje = req.body.traje?.toString() || "Livre";
    const preco = req.body.preco?.toString() || "0";

    console.log("req.body.nome", nome);
    console.log("req.body.descricao", descricao);
    console.log("req.body.data", data);
    console.log("req.body.horaInicio", horaInicio);
    console.log("req.body.horaFim", horaFim);
    console.log("req.body.local", local);
    console.log("req.body.traje", traje);
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
        return next({
          statusCode: 400,
          message: "Formato inválido para organizadores. Envie um JSON válido.",
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
    

    if (error) {
      return handleJoiError(error, next, "Erro de validação ao criar evento com imagens");
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
      message: "Evento criado com sucesso com imagens.",
      evento: savedEvent._id,
    });
  } catch (err) {
    console.error("❌ ERRO AO CRIAR EVENTO COM IMAGENS:", err);
    next({
      statusCode: 500,
      message: "Erro ao criar evento com imagens",
      details: [err.message],
    });
  }
};

// Buscar todos os eventos
const getAllEvents = async (req, res, next) => {
  try {
    // pega page e limit da query string. Ex: /api/events?page=2&limit=20
    const page = parseInt(String(req.query.page || '1'), 10);        // página atual (1-based)
    const limit = parseInt(String(req.query.limit || '10'), 10);     // itens por página

    // garante que nunca seja menor que 1
    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;

    // calcula quantos itens pular (skip) com base na página
    const skip = (safePage - 1) * safeLimit;

    // busca total de eventos (para saber quantas páginas existem)
    const total = await Event.countDocuments({});

    // busca os eventos da página atual, ordenados por data (mais próximos primeiro)
    const events = await Event.find({})
      .sort({ data: 1 }) // 1 = ascendente
      .skip(skip)        // pula (page-1) * limit registros
      .limit(safeLimit); // pega até "limit" registros

    // calcula se ainda tem mais páginas
    const hasMore = safePage * safeLimit < total;

    // responde com dados + metadados de paginação
    return res.json({
      events,     // lista de eventos dessa página
      page: safePage,
      limit: safeLimit,
      total,      // total geral de eventos
      hasMore,    // se ainda existem mais páginas depois dessa
    });
  } catch (err) {
    console.error('🔥 Erro ao listar eventos paginados:', err);
    return res.status(500).json({
      message: 'Erro ao listar eventos',
    });
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({
        statusCode: 404,
        message: "Evento não encontrado",
      });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error("🔥 ERRO AO MOSTRAR O EVENTO:", err);
    next({
      statusCode: 500,
      message: "Erro ao buscar evento",
      details: [err.message],
    });
  }
};

const getMyEvents = async (req, res, next) => {
  try {
    const userEvents = await Event.find({ criador: req.user.uid });
    res.status(200).json(userEvents);
  } catch (err) {
    console.error("🔥 ERRO AO BUSCAR EVENTOS DO USUÁRIO:", err);
    next({
      statusCode: 500,
      message: "Erro ao buscar seus eventos",
      details: [err.message],
    });
  }
};

const getImage = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.imagem || !event.imagem.data) {
      return next({
        statusCode: 404,
        message: "Imagem do evento não encontrada",
      });
    }
    res.contentType(event.imagem.contentType);
    res.send(event.imagem.data);
  } catch (err) {
    console.error("🔥 ERRO AO RETORNAR IMAGEM:", err);
    next({
      statusCode: 500,
      message: "Erro ao retornar imagem do evento",
      details: [err.message],
    });
  }
};

const updateEvent = async (req, res, next) => {
  try {
    console.log("✏️ updateEvent chamado. Body recebido:", req.body);

    const { error } = updateEventSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.error("   Erro de validação ao atualizar:", error.details);
      return next({
        statusCode: 400,
        message: "Erro de validação ao atualizar evento",
        details: error.details.map(d => d.message),
      });
    }
    if (error) {
      return handleJoiError(error, next, "Erro de validação ao atualizar evento");
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }

    if (event.criador !== req.user.uid) {
      return next({
        statusCode: 403,
        message: "Você não tem permissão para editar este evento",
      });
    }

    Object.assign(event, req.body);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id);

    // ✅ responde primeiro
    res.status(200).json({
      message: "Evento atualizado com sucesso",
      evento: updatedEvent,
    });

    // 📧 e-mail em background
    setImmediate(async () => {
      try {
        const htmlContent = generateEventUpdatedEmail(
          req.user.name,
          updatedEvent.nome || updatedEvent.titulo,
          `http://event-manager-back.onrender.com/api/events/${updatedEvent._id}`
        );
        if(req.user.email != req.organizadores.email){
          await sendEmail({
            to: req.user.email && req.organizadores.email,
            subject: `Evento Atualizado: "${updatedEvent.nome || updatedEvent.titulo}"`,
            text: `Seu evento "${updatedEvent.nome || updatedEvent.titulo}" para o dia "${updatedEvent.data}" foi atualizado!`,
            html: htmlContent,
          });
        }
        else{
          await sendEmail({
            to: req.user.email,
            subject: `Evento Atualizado: "${updatedEvent.nome || updatedEvent.titulo}"`,
            text: `Seu evento "${updatedEvent.nome || updatedEvent.titulo}" para o dia "${updatedEvent.data}" foi atualizado!`,
            html: htmlContent,
          });
        }
        
        console.log(`📧 E-mail de atualização enviado para ${req.user.email}`);
      } catch (emailErr) {
        console.error("⚠️ Falha ao enviar e-mail de atualização:", emailErr);
      }
    });
  } catch (err) {
    console.error("🔥 ERRO AO ATUALIZAR EVENTO:", err);
    next({
      statusCode: 500,
      message: "Erro ao atualizar evento",
      details: [err.message],
    });
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }
    if (event.criador !== req.user.uid) {
      return next({
        statusCode: 403,
        message: "Você não é o criador deste evento",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    const htmlContent = generateEventDeletedEmail(
      req.user.name,
      event.nome,
      `http://event-manager-back.onrender.com/api/events/${event._id}`
    );

    setImmediate(async () => {
      try {
        if(req.user.email != req.organizadores.email){
          await sendEmail({
          to: req.user.email && req.organizadores.email,
          subject: 'Evento deletado!',
          text: `Seu evento "${event.nome}" foi deletado!`,
          html: htmlContent,
        });
        console.log(`📧 E-mail de deleção enviado para ${req.user.email}`);
        }
        else{
          await sendEmail({
          to: req.user.email,
          subject: 'Evento deletado!',
          text: `Seu evento "${event.nome}" foi deletado!`,
          html: htmlContent,
        });
        }
        
      } catch (emailErr) {
        console.error("⚠️ Falha ao enviar e-mail de deleção:", emailErr);
      }
    });

    res.status(200).json({ message: "Evento deletado com sucesso" });
  } catch (err) {
    console.error("🔥 ERRO AO DELETAR EVENTO:", err);
    next({
      statusCode: 500,
      message: "Erro ao deletar evento",
      details: [err.message],
    });
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

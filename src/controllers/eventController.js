const Event = require("../models/Event");
const { bucket } = require("../auth/firebase"); 
// Criar novo evento(private)
const createEvent = async (req, res, next) => {
  try {

    const { error } = createEventSchema.validate(req.body);
    if (error) {
      return next({
        statusCode: 400,
        message: error.details[0].message,
      });
    }
    // Criação de um novo event com o UID do usuário autenticado
    const newEvent = new Event({
      ...req.body,
      userId: req.user.uid,
      criador: req.user.uid, // ✅ Pegando do token decodificado
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("🔥 ERRO AO CRIAR EVENTO:", err);
    next({ 
        statusCode: 500, 
        message: "Erro ao criar evento", 
        stack: err.stack 
    });
  }
};

// 📦 Criar evento com imagens (multipart/form-data)
const createEventWithImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const { nome, horaInicio, data, local } = req.body;

    if (!nome || !horaInicio || !data || !local) {
      return res.status(400).json({ message: "Dados obrigatórios ausentes" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Imagem obrigatória" });
    }

    const uploadedUrls = [];

    const imageObjects = files.map((file) => ({
      data: file.buffer.toString("base64"),
      contentType: file.mimetype,
    }));

    // 📌 Criação do novo evento
    const newEvent = new Event({
      ...req.body,
      imagens: imageObjects,
      criador: req.user.uid,
      userId: req.user.uid,
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: "Evento criado com sucesso",
      evento: savedEvent._id,
    });

  } catch (err) {
    console.error("🔥 ERRO AO CRIAR EVENTO COM IMAGENS:", err);
    next({
      statusCode: 500,
      message: "Erro ao criar evento com imagens",
      stack: err.stack,
    });
  }
};

// Buscar todos os eventos (público)
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    console.error("🔥 ERRO AO LISTAR EVENTOS:", err);
    next({
         statusCode: 500, 
         message: "Erro ao buscar eventos", 
         stack: err.stack 
    });
  }
};

// Buscar eventos do usuário autenticado
const getMyEvents = async (req, res, next) => {
  try {
    const userEvent = await Event.find({
         criador: req.user.uid // UID do usuário autenticado
    });
    res.status(200).json(userEvent);
  } catch (err) {
    console.error("🔥 ERRO AO BUSCAR EVENTOS DO USUÁRIO:", err);
    next({
         statusCode: 500, 
         message: "Erro ao buscar seus eventos", 
         stack: err.stack 
    });
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
    next({
      statusCode: 500,
      message: "Erro ao retornar imagem",
      stack: err.stack,
    });
  }
};

// Atualizar evento(somente se for o criador)
const updateEvent = async (req, res, next) => {
  try {
    const { error } = updateEventSchema.validate(req.body);
    if (error) {
      return next({
        statusCode: 400,
        message: error.details[0].message,
      });
    }
    const event = await Event.findById(req.params.id);
    // Verifica se o evento existe
    if (!event) {
        return next({
            statusCode: 404,
            message: "Evento não encontrado",
          });
    }

    // Verifica se o usuário logado é o dono do evento
    if (event.criador !== req.user.uid) {
        return next({
            statusCode: 403,
            message: "Você não é o criador deste evento",
          });
    }

    // Atualiza apenas os campos fornecidos
    Object.assign(event, req.body);
    await event.save();

    // Retorna o evento atualizado
    res.status(200).json(event);
  } catch (err) {
    console.error("🔥 ERRO AO ATUALIZAR EVENTO:", err);
    next({ 
        statusCode: 500, 
        message: "Erro ao atualizar evento", 
        stack: err.stack 
    });
  }
};

// Deletar evento(apenas do usuário dono)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
        return next({
            statusCode: 404,
            message: "Evento não encontrado",
          });
    }

    // Verifica se o usuário logado é o dono
    if (event.criador !== req.user.uid) {
        return next({
            statusCode: 403,
            message: "Você não é o criador deste evento",
        });
    }

    await event.deleteOne();
    res.status(200).json({ 
        message: "Evento deletado com sucesso" 
    });
  } catch (err) {
    console.error("🔥 ERRO AO DELETAR EVENTO:", err);
    next({ 
        statusCode: 500, 
        message: "Erro ao deletar evento", 
        stack: err.stack 
    });
  }
};

module.exports = {
  createEvent,
  createEventWithImages,
  getAllEvents,
  getMyEvents,
  getImage,
  updateEvent,
  deleteEvent,
};

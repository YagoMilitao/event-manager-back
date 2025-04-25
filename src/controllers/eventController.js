const Event = require("../models/Event");
const { createEventSchema } = require("../validations/eventValidation");

// 🛠️ Função auxiliar para converter imagens do multer em base64
const processImages = (files) => {
  return files.map((file) => ({
    data: file.buffer.toString("base64"),
    contentType: file.mimetype,
  }));
};

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
    console.log("📥 Dados recebidos (multipart):", req.body);
    console.log("🖼️ Imagens recebidas:", req.files);

    // 🔄 Convertendo imagens do multer para base64
    const imagensConvertidas = req.files ? processImages(req.files) : [];

    const files = req.files || [];
    const { nome, horaInicio, data, local } = req.body;

    if (!nome || !horaInicio || !data || !local) {
      return res.status(400).json({ message: "Dados obrigatórios ausentes" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Imagem obrigatória" });
    }

    // 🛡️ Validação dos campos do body com Joi
    const { error, value } = createEventSchema.validate(
      {
        ...req.body,
        imagens: imagensConvertidas, // insere imagens para validação também
      },
      { abortEarly: false } // mostra todos os erros de uma vez
    );
    if (error) {
      // 🔴 Se houver erros de validação, envia uma resposta 400 com detalhes
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.details.map((err) => err.message),
      });
    }

    // 🖼️ Processar as imagens recebidas via multer
    const imageObjects = req.files?.map((file) => ({
      data: file.buffer.toString("base64"),
      contentType: file.mimetype,
    })) || [];

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
    console.error("❌ ERRO AO CRIAR EVENTO COM IMAGENS:", err);
    next(err);
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

    // Atualização do evento
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Retorna o evento atualizado
    res.status(200).json(updatedEvent);
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

    // Deletando o evento
    await Event.findByIdAndDelete(req.params.id);
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

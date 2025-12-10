const Event = require("../models/Event");
const {
  createEventSchema,
  updateEventSchema,
} = require("../validations/eventValidation");
const { sendEmail } = require("../services/emailService");
const generateEventCreatedEmail = require("../services/emailTemplates/generateEventCreatedEmail");
const generateEventUpdatedEmail = require("../services/emailTemplates/generateEventUpdatedEmail");
const generateEventDeletedEmail = require("../services/emailTemplates/generateEventDeletedEmail");

// ☁️ Upload / delete no GCP
const { uploadImageToGCS, deleteImageFromGCS } = require("../middlewares/gcpStorage");

// ✅ Helper pra jogar erro de validação Joi no middleware de erro
function handleJoiError(
  error,
  next,
  contextMessage = "Erro de validação do evento"
) {
  console.error("Erro de validação Joi:", error.details);
  return next({
    statusCode: 400,
    message: contextMessage,
    details: error.details.map((d) => d.message),
  });
}

function getField(body, key) {
  if (body[key] !== undefined) return body[key];
  if (body[`${key} `] !== undefined) return body[`${key} `];
  return undefined;
}

// ---------------------------------------------------------------------
// Criar novo evento (sem imagens) - JSON puro
// ---------------------------------------------------------------------
const createEvent = async (req, res, next) => {
  try {
    console.log("➡️ createEvent chamado");
    console.log("   req.body:", req.body);

    const { error, value } = createEventSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.error("   Erro de validação:", error.details);
      return handleJoiError(error, next, "Erro de validação ao criar evento");
    }

    console.log("   Dados validados:", value);

    const newEvent = new Event({
      ...value,
      price: value.price || "0",
      dressCode: value.dressCode || "Livre",
      description: value.description || "Sem descrição informada.",
      userId: req.user.uid,
      creator: req.user.uid,
    });

    console.log("   Evento a ser salvo:", newEvent);

    const savedEvent = await newEvent.save();
    console.log("   Evento salvo com sucesso:", savedEvent);

    const htmlContent = generateEventCreatedEmail(
      req.user.uid,
      value.eventName,
      `https://event-manager-back.onrender.com/create-event/${savedEvent._id}`
    );

    res.status(201).json({
      message:
        "Evento criado com sucesso! Um e-mail de confirmação está sendo enviado.",
      evento: savedEvent,
    });

    // 📧 E-mail em background (não trava a resposta)
    setImmediate(async () => {
      try {
        console.log(
          "req.user.email, req.organizers.email",
          req.user.email,
          req.organizers?.email
        );

        if (req.user.email !== req.organizers?.email) {
          await sendEmail({
            to: req.organizers?.email && req.user.email,
            subject: `Seu evento "${value.eventName}" foi criado!`,
            html: htmlContent,
          });
          console.log(
            `📧 E-mail enviado com sucesso para "${req.user.uid}" (${req.user.email}+${req.organizers?.email})`
          );
        } else {
          await sendEmail({
            to: req.user.email,
            subject: `Seu evento "${value.eventName}" foi criado!`,
            html: htmlContent,
          });
          console.log(
            `📧 E-mail enviado com sucesso para "${req.user.uid}" (${req.user.email})`
          );
        }
      } catch (error) {
        console.error(`⚠️ Falha ao enviar e-mail para "${req.user.uid}" no e-mail "${req.organizers?.email}" em background:`, error);
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

// ---------------------------------------------------------------------
// Criar evento com imagens (multipart/form-data + GCP)
// ---------------------------------------------------------------------
const createEventWithImages = async (req, res, next) => {
  try {
    console.log("➡️ createEventWithImages chamado");
    console.log("   req.body:", req.body);
    console.log("   req.files:", req.files);

    const filesArray = Array.isArray(req.files) ? req.files : [];

    // 1) Sobe todas as imagens para o GCS
    const uploadedImages = [];
    for (const file of filesArray) {
      const uploaded = await uploadImageToGCS(file); // { publicUrl, filename }
      uploadedImages.push({
        url: uploaded.publicUrl,
        filename: uploaded.filename,
      });
    }

    // 2) Campos normais do body (usando helper pra tratar possíveis espaços)
    const eventName = getField(req.body, "eventName")?.toString();
    const description =
      getField(req.body, "description")?.toString() || "Sem descrição informada.";
    const date = getField(req.body, "date")?.toString();

    const startTimeStr = getField(req.body, "startTime");
    const endTimeStr = getField(req.body, "endTime");

    const startTime = startTimeStr ? Number(startTimeStr) : undefined;
    const endTime = endTimeStr ? Number(endTimeStr) : undefined;
    const location = getField(req.body, "location")?.toString();
    const dressCode = getField(req.body, "dressCode")?.toString() || "Livre";
    const price = getField(req.body, "price")?.toString() || "0";

    // 3) Parse do array de organizers (veio como string JSON)
    const raworganizers = getField(req.body, "organizers");
    let parsedorganizers = [];
    if (raworganizers) {
      try {
        parsedorganizers = JSON.parse(raworganizers);
      } catch (err) {
        console.error("   Erro ao parsear organizers:", err);
        return next({
          statusCode: 400,
          message: "Formato inválido para organizers. Envie um JSON válido.",
        });
      }
    }

    const eventData = {
      eventName,
      description,
      date,
      startTime,
      endTime,
      location,
      dressCode,
      price,
      organizers: parsedorganizers,
      coverImage: uploadedImages[0] || undefined,
      images: uploadedImages,
    };

    const { error, value } = createEventSchema.validate(eventData, {
      abortEarly: false,
    });

    if (error) {
      console.error("   Erro de validação:", error.details);
      return next({
        statusCode: 400,
        message: "Erro de validação do evento",
        details: error.details.map((d) => d.message),
      });
    }

    const newEvent = new Event({
      ...value,
      creator: req.user.uid,
      userId: req.user.uid,
    });

    const savedEvent = await newEvent.save();
    console.log("   Evento salvo com sucesso:", savedEvent._id);

    res.status(201).json({
      message: "Evento criado com sucesso com imagens no GCP.",
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

// ---------------------------------------------------------------------
// Listar eventos (paginado)
// ---------------------------------------------------------------------
const getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "10"), 10);

    const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : limit;

    const skip = (safePage - 1) * safeLimit;

    const total = await Event.countDocuments({});

    const events = await Event.find({})
      .sort({ data: 1 })
      .skip(skip)
      .limit(safeLimit);

    const hasMore = safePage * safeLimit < total;

    return res.json({
      events,
      page: safePage,
      limit: safeLimit,
      total,
      hasMore,
    });
  } catch (err) {
    console.error("🔥 Erro ao listar eventos paginados:", err);
    return res.status(500).json({
      message: "Erro ao listar eventos",
    });
  }
};

// ---------------------------------------------------------------------
// Buscar evento por ID
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// Eventos do usuário logado
// ---------------------------------------------------------------------
const getMyEvents = async (req, res, next) => {
  try {
    const userEvents = await Event.find({ creator: req.user.uid });
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

// ---------------------------------------------------------------------
// getImage - agora só faz redirect pra URL da capa no GCP
// ---------------------------------------------------------------------
const getImage = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.coverImage || !event.coverImage.url) {
      return next({
        statusCode: 404,
        message: "Imagem do evento não encontrada",
      });
    }

    // 👉 Redireciona o browser para a URL pública no GCP
    return res.redirect(event.coverImage.url);
  } catch (err) {
    console.error("🔥 ERRO AO RETORNAR IMAGEM:", err);
    next({
      statusCode: 500,
      message: "Erro ao retornar imagem do evento",
      details: [err.message],
    });
  }
};

// ---------------------------------------------------------------------
// Atualizar evento (ainda sem editar imagens – só dados)
// ---------------------------------------------------------------------
const updateEvent = async (req, res, next) => {
  try {
    console.log("✏️ updateEvent chamado. Body recebido:", req.body);

    const { error } = updateEventSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.error("   Erro de validação ao atualizar:", error.details);
      return handleJoiError(error, next, "Erro de validação ao atualizar evento");
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }

    if (event.creator !== req.user.uid) {
      return next({
        statusCode: 403,
        message: "Você não tem permissão para editar este evento",
      });
    }

    Object.assign(event, req.body);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id);

    res.status(200).json({
      message: "Evento atualizado com sucesso",
      evento: updatedEvent,
    });

    // 📧 e-mail em background
    setImmediate(async () => {
      try {
        const htmlContent = generateEventUpdatedEmail(
          req.user.name,
          updatedEvent.endTime,
          `http://event-manager-back.onrender.com/api/events/${updatedEvent._id}`
        );
        if (req.user.email !== req.organizers?.email) {
          await sendEmail({
            to: req.user.email && req.organizers?.email,
            subject: `Evento Atualizado: "${
              updatedEvent.eventName
            }"`,
            text: `Seu evento "${
              updatedEvent.eventName
            }" para o dia "${updatedEvent.date}" foi atualizado!`,
            html: htmlContent,
          });
        } else {
          await sendEmail({
            to: req.user.email,
            subject: `Evento Atualizado: "${
              updatedEvent.eventName
            }"`,
            text: `Seu evento "${
              updatedEvent.eventName
            }" para o dia "${updatedEvent.date}" foi atualizado!`,
            html: htmlContent,
          });
        }

        console.log(`📧 E-mail de atualização enviado para ${req.user.email} ou ${req.organizers?.email}`);
      } catch (emailErr) {
        console.error(`⚠️ Falha ao enviar e-mail para ${req.user.email}, ou ${req.organizers?.email} de atualização:`, emailErr);
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

// ---------------------------------------------------------------------
// Atualizar evento COM imagens (multipart/form-data + GCP)
// ---------------------------------------------------------------------
const updateEventWithImages = async (req, res, next) => {
  try {
    console.log("✏️ updateEventWithImages chamado. Body:", req.body);
    console.log("   req.files:", req.files);

    const eventId = req.params.id;

    // 1) Busca o evento existente
    const event = await Event.findById(eventId);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }

    // (já passou por verifyToken + isEventOwner no router, mas não custa logar)
    console.log("   Evento encontrado para update-with-images:", eventId);

    // 2) Lê os campos básicos do body (strings, numbers etc)
    const eventName = getField(req.body, "eventName")?.toString();
    const description =
      getField(req.body, "description")?.toString() ||
      event.description ||
      "Sem descrição informada.";
    const date = getField(req.body, "date")?.toString() || event.date;

    const startTimeStr = getField(req.body, "startTime");
    const endTimeStr = getField(req.body, "endTime");

    const startTime =
      startTimeStr !== undefined ? Number(startTimeStr) : event.startTime;
    const endTime =
      endTimeStr !== undefined ? Number(endTimeStr) : event.endTime;

    const location =
      getField(req.body, "location")?.toString() || event.location;
    const dressCode =
      getField(req.body, "dressCode")?.toString() || event.dressCode || "Livre";
    const price =
      getField(req.body, "price")?.toString() || event.price || "0";

    // 3) organizers (vem como JSON string no multipart)
    const rawOrganizers = getField(req.body, "organizers");
    let parsedOrganizers = event.organizers || [];
    if (rawOrganizers) {
      try {
        parsedOrganizers = JSON.parse(rawOrganizers);
      } catch (err) {
        console.error("   Erro ao parsear organizers:", err);
        return next({
          statusCode: 400,
          message: "Formato inválido para organizers. Envie um JSON válido.",
        });
      }
    }

    // 4) Lista de URLs a serem deletadas (imagens existentes)
    const rawImagesToDelete = getField(req.body, "imagesToDelete");
    let imagesToDelete = [];
    if (rawImagesToDelete) {
      try {
        const parsed = JSON.parse(rawImagesToDelete);
        if (Array.isArray(parsed)) {
          imagesToDelete = parsed;
        }
      } catch (err) {
        console.error("   Erro ao parsear imagesToDelete:", err);
        return next({
          statusCode: 400,
          message: "Formato inválido para imagesToDelete. Envie um JSON válido.",
        });
      }
    }
    const imagesToDeleteSet = new Set(imagesToDelete);

    // 5) Sobe novas imagens (se vierem arquivos)
    const filesArray = Array.isArray(req.files) ? req.files : [];
    const uploadedImages = [];
    for (const file of filesArray) {
      const uploaded = await uploadImageToGCS(file); // { publicUrl, filename }
      uploadedImages.push({
        url: uploaded.publicUrl,
        filename: uploaded.filename,
      });
    }

    // 6) Monta nova lista de imagens:
    //    - mantém só as que NÃO estão na lista de delete
    //    - adiciona as novas
    const existingImages = Array.isArray(event.images) ? event.images : [];

    const keptExistingImages = existingImages.filter(
      (img) => img && img.url && !imagesToDeleteSet.has(img.url)
    );

    let coverImage = event.coverImage;

    // se a capa atual estiver marcada pra deletar, zera
    if (coverImage && coverImage.url && imagesToDeleteSet.has(coverImage.url)) {
      coverImage = undefined;
    }

    // nova galeria final
    const finalImages = [...keptExistingImages, ...uploadedImages];

    // se não tiver capa, escolhe a primeira imagem da galeria
    if (!coverImage && finalImages.length > 0) {
      coverImage = finalImages[0];
    }

    // 7) Deletar do GCS as imagens removidas
    const removedImages = existingImages.filter(
      (img) => img && img.url && imagesToDeleteSet.has(img.url)
    );
    const filenamesToDelete = removedImages
      .map((img) => img.filename)
      .filter(Boolean);

    if (event.coverImage && imagesToDeleteSet.has(event.coverImage.url)) {
      if (event.coverImage.filename) {
        filenamesToDelete.push(event.coverImage.filename);
      }
    }

    setImmediate(async () => {
      try {
        await Promise.all(
          filenamesToDelete.map((filename) => deleteImageFromGCS(filename))
        );
      } catch (err) {
        console.error("⚠️ Erro ao deletar imagens do GCS (update):", err);
      }
    });

    // 8) Monta objeto pra validar no Joi (UPDATE schema)
    const eventDataForValidation = {
      eventName,
      description,
      date,
      startTime,
      endTime,
      location,
      dressCode,
      price,
      organizers: parsedOrganizers,
      coverImage,
      images: finalImages,
    };

    const { error, value } = updateEventSchema.validate(
      eventDataForValidation,
      {
        abortEarly: false,
      }
    );

    if (error) {
      console.error("   Erro de validação no update-with-images:", error.details);
      return handleJoiError(
        error,
        next,
        "Erro de validação ao atualizar evento com imagens"
      );
    }

    // 9) Aplica as mudanças no documento
    Object.assign(event, value);
    await event.save();

    const updatedEvent = await Event.findById(eventId);

    console.log("✅ Evento atualizado com imagens:", updatedEvent._id);

    return res.status(200).json({
      message: "Evento atualizado com sucesso (imagens incluídas).",
      evento: updatedEvent,
    });
  } catch (err) {
    console.error("🔥 ERRO AO ATUALIZAR EVENTO COM IMAGENS:", err);
    next({
      statusCode: 500,
      message: "Erro ao atualizar evento com imagens",
      details: [err.message],
    });
  }
};

// ---------------------------------------------------------------------
// Deletar evento + imagens do GCP
// ---------------------------------------------------------------------
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return next({ statusCode: 404, message: "Evento não encontrado" });
    }
    if (event.creator !== req.user.uid) {
      return next({
        statusCode: 403,
        message: "Você não é o creator deste evento",
      });
    }

    // 🗑️ Limpa imagens do GCS (se existir)
    const filenames = [];

    if (event.coverImage?.filename) {
      filenames.push(event.coverImage.filename);
    }

    if (Array.isArray(event.images)) {
      event.images.forEach((img) => {
        if (img?.filename) filenames.push(img.filename);
      });
    }

    // deleta em background (não precisa travar a resposta)
    setImmediate(async () => {
      try {
        await Promise.all(filenames.map((f) => deleteImageFromGCS(f)));
      } catch (err) {
        console.error("⚠️ Erro ao deletar imagens do GCS:", err);
      }
    });

    await Event.findByIdAndDelete(req.params.id);

    const htmlContent = generateEventDeletedEmail(
      req.user.name,
      event.eventName,
      `http://event-manager-back.onrender.com/api/events/${event._id}`
    );

    setImmediate(async () => {
      try {
        if (req.user.email !== req.organizers?.email) {
          await sendEmail({
            to: req.user.email && req.organizers?.email,
            subject: "Evento deletado!",
            text: `Seu evento "${event.eventName}" foi deletado!`,
            html: htmlContent,
          });
          console.log(`📧 E-mail de deleção enviado para ${req.user.email}`);
        } else {
          await sendEmail({
            to: req.user.email,
            subject: "Evento deletado!",
            text: `Seu evento "${event.eventName}" foi deletado!`,
            html: htmlContent,
          });
        }
      } catch (emailErr) {
        console.error(`⚠️ Falha ao enviar e-mail para ${req.user.email}, ou ${req.organizers?.email} de deleção:`, emailErr);
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
  updateEventWithImages,
};

const Event = require("../models/Event");

const isEventOwner = async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.uid; // vindo do middleware de auth

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
         message: "Evento não encontrado." 
      });
    }

    if (event.criador !== userId) {
      return res.status(403).json({
         message: "Você não tem permissão para alterar este evento." 
      });
    }

    // Tudo certo, segue o baile
    next();
  } catch (error) {
    console.error("Erro na verificação de dono do evento:", error);
    res.status(500).json({
         message: "Erro interno do servidor." 
    });
  }
};

module.exports = isEventOwner;

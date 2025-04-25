const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const Event = require('../models/Event');
const admin = require('firebase-admin');

// 🧠 Configura multer para armazenar arquivos na memória temporariamente
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🧠 Inicializa o Storage do Firebase com as credenciais do firebase-admin
const bucket = admin.storage().bucket();

// 🔽 Middleware que faz o upload
const uploadEventImage = [
  upload.array('images', 5), // Aceita até 5 arquivos no campo "images"

  async (req, res) => {
    try {
      const eventId = req.params.id;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Nenhuma imagem enviada' });
      }

      const uploadedUrls = [];

      for (const file of files) {
        const filename = `events/${eventId}/${Date.now()}-${file.originalname}`;
        
        // Envia para o bucket do Firebase
        const fileRef = bucket.file(filename);

        await fileRef.save(file.buffer, {
          metadata: { contentType: file.mimetype },
        });

        // Torna o arquivo público (ou gere um token se preferir)
        await fileRef.makePublic();

        // Gera a URL pública
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        uploadedUrls.push(publicUrl);
      }

      // 🧠 Atualiza o evento com os links das imagens
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $push: { imagens: { $each: uploadedUrls } } },
        { new: true }
      );

      res.status(200).json({
        message: 'Imagens enviadas com sucesso',
        imagens: uploadedUrls,
        evento: updatedEvent,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao fazer upload', error });
    }
  }
];

module.exports = uploadEventImage;

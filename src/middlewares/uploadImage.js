const multer = require("multer");

// 🧠 Configura o multer para armazenar arquivos na memória (buffer)
const storage = multer.memoryStorage();// Upload em buffer (ideal p/ Firebase)

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de arquivo inválido. Apenas JPEG, PNG, JPG e WEBP são permitidos."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  },
}).array("images", 5); // Espera o campo "images" com até 5 arquivos

// Middleware para tratar erros do multer
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // 📛 Erros do Multer (como limite de tamanho)
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // 📛 Outros erros (ex: tipo de arquivo inválido)
      return res.status(400).json({ message: err.message });
    }

    next(); // ✅ Prossegue para o controller se tudo certo
  });
};

const multer = require("multer");

// 🧠 Armazena os arquivos em memória (buffer) – perfeito pra subir para GCP
const storage = multer.memoryStorage();

// ✅ Filtro de tipos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // ok
  } else {
    cb(
      new Error(
        "Tipo de arquivo inválido. Apenas JPEG, PNG, JPG e WEBP são permitidos."
      ),
      false
    );
  }
};

// ⚙️ Configuração do multer
const upload = multer({
  storage,      // usa memória
  fileFilter,   // valida tipo
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  },
});

// 📤 Exporta como middleware: array de arquivos no campo "images"
module.exports = upload.array("images", 5);

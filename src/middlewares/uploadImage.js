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
});

// ✅ Exporta a configuração do multer diretamente
module.exports = upload.array("images", 5);
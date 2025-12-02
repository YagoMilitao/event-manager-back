const { Storage } = require("@google-cloud/storage");
const path = require("path");

const BUCKET_NAME = process.env.BUCKET_NAME;
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_CLIENT_EMAIL = process.env.GCP_CLIENT_EMAIL;
const GCP_PRIVATE_KEY = process.env.GCP_PRIVATE_KEY;

if (!BUCKET_NAME) {
  throw new Error("BUCKET_NAME não definido nas variáveis de ambiente");
}
if (!GCP_PROJECT_ID || !GCP_CLIENT_EMAIL || !GCP_PRIVATE_KEY) {
  throw new Error(
    "Credenciais GCP (GCP_PROJECT_ID / GCP_CLIENT_EMAIL / GCP_PRIVATE_KEY) não configuradas"
  );
}

// 🔹 Deixa o nome do arquivo seguro (sem espaço, acento, caractere estranho)
function sanitizeFileName(originalName) {
  // pega só o nome do arquivo (remove caminho, se tiver)
  const base = path.basename(originalName);

  // remove acentos
  const noAccents = base.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // troca qualquer coisa que não seja letra, número, ponto, hífen ou underline por "_"
  return noAccents.replace(/[^\w.-]/g, "_");
}

// ⚠️ IMPORTANTE: o replace é porque no .env o private key vem com \n
const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  credentials: {
    client_email: GCP_CLIENT_EMAIL,
    private_key: GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(BUCKET_NAME);

/**
 * Sobe uma imagem para o GCS
 * @param {Express.Multer.File} file  Arquivo recebido via multer
 * @returns {Promise<{publicUrl: string, filename: string}>}
 */
async function uploadImageToGCS(file) {
  const safeName = sanitizeFileName(file.originalname);

  // Ex: events/1764714676866-minha_foto.png
  const gcsFilename = `events/${Date.now()}-${safeName}`;
  const gcsFile = bucket.file(gcsFilename);

  await gcsFile.save(file.buffer, {
    contentType: file.mimetype,
    resumable: false,
  });

  // 🔹 Como o bucket já está público, isso é opcional — mas não faz mal:
  // await gcsFile.makePublic();

  const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${gcsFilename}`;

  console.log("✅ Upload para GCS OK:", { publicUrl, gcsFilename });

  return {
    publicUrl,
    filename: gcsFilename,
  };
}

/**
 * Deleta uma imagem do GCS pelo filename salvo no banco
 * @param {string} filename
 */
async function deleteImageFromGCS(filename) {
  if (!filename) return;

  try {
    const file = bucket.file(filename);
    await file.delete({ ignoreNotFound: true });
    console.log(`🗑️ Imagem deletada do GCS: ${filename}`);
  } catch (err) {
    console.error("⚠️ Erro ao deletar imagem do GCS:", err.message);
  }
}

module.exports = {
  uploadImageToGCS,
  deleteImageFromGCS,
};

const { Storage } = require("@google-cloud/storage");
const path = require("path");


const BUCKET_NAME = process.env.BUCKET_NAME;

const KEY_FILE =
  process.env.GCP_KEY_FILE || path.join(__dirname, "serviceAccountKey.json");


const storage = new Storage({
  keyFilename: KEY_FILE,
});

const bucket = storage.bucket(BUCKET_NAME);

/**
 * Sobe uma imagem para o GCS
 * @param {Express.Multer.File} file  Arquivo recebido via multer
 * @returns {Promise<{publicUrl: string, filename: string}>}
 */
async function uploadImageToGCS(file) {
  // Ex: events/1688329371-minha-foto.png
  const gcsFilename = `events/${Date.now()}-${file.originalname}`;
  const gcsFile = bucket.file(gcsFilename);

  // Salva o buffer no GCS
  await gcsFile.save(file.buffer, {
    contentType: file.mimetype,
    resumable: false,
  });

  // Deixa o arquivo público (caso o bucket esteja com ACL liberado)
  await gcsFile.makePublic();

  const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${gcsFilename}`;

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

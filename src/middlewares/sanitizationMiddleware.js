const xss = require('xss-clean');

const sanitizeInputs = (req, res, next) => {
  req.body.nome = xss(req.body.nome);
  req.body.descricao = xss(req.body.descricao);
  req.body.local = xss(req.body.local);
  req.body.traje = req.body.traje ? xss(req.body.traje) : req.body.traje;
  req.body.preco = req.body.preco ? xss(req.body.preco) : req.body.preco;
  req.body.imagens = req.body.imagens ? req.body.imagens.map(img => {
    return {
      ...img,
      data: xss(img.data) // Sanitiza as imagens (se necessário)
    };
  }) : [];

  next();
};

module.exports = sanitizeInputs;

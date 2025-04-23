const sanitize = require("mongo-sanitize");

module.exports = function sanitizeMiddleware(req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

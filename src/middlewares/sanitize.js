const sanitize = require("mongo-sanitize");

module.exports = function sanitizeMiddleware(req, res, next) {
  // Sanitize body
  if (req.body) {
    for (let prop in req.body) {
      req.body[prop] = sanitize(req.body[prop]);
    }
  }

  // Sanitize query
  if (req.query) {
    for (let prop in req.query) {
      req.query[prop] = sanitize(req.query[prop]);
    }
  }

  // Sanitize params
  if (req.params) {
    for (let prop in req.params) {
      req.params[prop] = sanitize(req.params[prop]);
    }
  }

  next();
};

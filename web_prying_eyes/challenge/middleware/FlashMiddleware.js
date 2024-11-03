const FlashMiddleware = (req, res, next) => {
  req.flashError = (message) => {
    req.session.flashes.error.push(message);
  };
  req.flashSuccess = (message) => {
    req.session.flashes.success.push(message);
  };
  req.clearFlashes = () => {
    req.session.flashes = { success: [], error: [] };
  };

  if (!req.session || !req.session.flashes) {
    req.clearFlashes();
  }

  next();
};

module.exports = FlashMiddleware;

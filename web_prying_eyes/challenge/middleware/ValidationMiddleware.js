const { loadSchemas } = require("../utils");

const ajv = loadSchemas();

const ValidationMiddleware = (schema, redirect) => (req, res, next) => {
  const validate = ajv.getSchema(schema);
  if (!validate(req.body)) {
    validate.errors.forEach((error) => {
      if (error.message) req.flashError(error.message);
    });
    return res.redirect(redirect);
  }
  next();
};

module.exports = ValidationMiddleware;

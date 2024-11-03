const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const ajvErrors = require("ajv-errors");

const loadSchemas = () => {
  const ajv = new Ajv({ coerceTypes: true, allErrors: true });
  ajvErrors(ajv, { singleError: true });

  fs.readdirSync(path.join(__dirname, "schemas")).forEach((jsonFile) => {
    ajv.addSchema(require(path.join(__dirname, "schemas", jsonFile)), jsonFile.replace(".json", ""));
  });

  return ajv;
};

const render = (req, res, template, args = {}) => {
  const flashes = { success: [], error: [] };
  if (req.session && req.session.flashes) {
    flashes.success = req.session.flashes.success;
    flashes.error = req.session.flashes.error;

    req.clearFlashes();
  }

  res.render(template, { session: req.session, flashes, ...args });
};

module.exports = {
  loadSchemas,
  render,
};

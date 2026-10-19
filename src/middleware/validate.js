const logger = require('../config/logger');
const { objectId } = require('../validators/schemas');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      logger.warn(`Validation failure: ${req.method} ${req.path}`);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: result.error.issues.map(i => ({
        field: i.path.join('.') || 'body', message: i.message
      })) });
    }
    req.validatedBody = result.data;
    next();
  };
}
function validateEmployeeId(req, res, next) {
  const id = req.params.eid || req.query.eid;
  if (!objectId.safeParse(id).success) {
    return res.status(400).json({ success: false, message: 'Invalid employee ID' });
  }
  req.employeeId = id;
  next();
}
module.exports = { validateBody, validateEmployeeId };

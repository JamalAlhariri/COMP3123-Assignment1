const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { validateBody, validateEmployeeId } = require('../middleware/validate');
const { employeeFields, updateEmployeeSchema } = require('../validators/schemas');
const c = require('../controllers/employeeController');
router.use(authenticate);
router.route('/employees')
  .get(c.listEmployees)
  .post(validateBody(employeeFields), c.createEmployee)
  .delete(validateEmployeeId, c.deleteEmployee);
router.route('/employees/:eid')
  .get(validateEmployeeId, c.getEmployee)
  .put(validateEmployeeId, validateBody(updateEmployeeSchema), c.updateEmployee);
module.exports = router;

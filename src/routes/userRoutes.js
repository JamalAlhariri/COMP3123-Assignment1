const router = require('express').Router();
const { signup, login } = require('../controllers/userController');
const { validateBody } = require('../middleware/validate');
const { signupSchema, loginSchema } = require('../validators/schemas');
const { authLimiter } = require('../middleware/limits');
router.post('/signup', authLimiter, validateBody(signupSchema), signup);
router.post('/login', authLimiter, validateBody(loginSchema), login);
module.exports = router;

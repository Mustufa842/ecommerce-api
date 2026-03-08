import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/schemas';

const router = Router();

/**
 * @route  POST /api/v1/auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Login and receive JWT
 * @access Public
 */
router.post('/login', validate(loginSchema), login);

export default router;
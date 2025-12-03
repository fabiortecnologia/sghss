import express from 'express';
import { login, register, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refreshToken', refreshToken);

export default router;

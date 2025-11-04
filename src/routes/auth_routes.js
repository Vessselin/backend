// routes/auth_routes.js
import express from 'express';
import { register, login } from '../controllers/auth_controller.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);

export default router;

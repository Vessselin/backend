// routes/auth_routes.js
import express from 'express';
import { register, login } from '../controllers/auth_controller.js';

const router = express.Router();

// Ruta para registrarse
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

export default router;

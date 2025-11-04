import express from 'express';
import { getUsuarios, crearUsuario, getUsuarioById } from '../controllers/usuario_controller.js';

const router = express.Router();

// Rutas para la gestión de usuarios
router.get('/', getUsuarios);
router.post('/', crearUsuario);
router.get('/:id', getUsuarioById);

export default router;

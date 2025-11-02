// routes/solicitud_routes.js
import express from 'express';
import {
  crearSolicitud,
  obtenerSolicitudes,
  obtenerSolicitudesPorCliente
} from '../controllers/solicitud_controller.js';

const router = express.Router();

// Crear nueva solicitud
router.post('/crear', crearSolicitud);

// Obtener todas las solicitudes (solo admin)
router.get('/', obtenerSolicitudes);

// Obtener solicitudes por cliente
router.get('/cliente/:idUsuario', obtenerSolicitudesPorCliente);

export default router;

// routes/solicitud_routes.js
import express from 'express';
import {
  crearSolicitud,
  obtenerSolicitudesPorCliente,
  cancelarSolicitud,
  obtenerSolicitudesPorTransportista
} from '../controllers/solicitud_controller.js';

const router = express.Router();

// Crear nueva solicitud
router.post("/crear", crearSolicitud);

// Obtener solicitudes por cliente
router.get("/cliente/:idUsuario", obtenerSolicitudesPorCliente);

// Obtener solicitudes por transportista
router.get("/transportista/:idTransportista", obtenerSolicitudesPorTransportista);

// Cancelar solicitud
router.put("/cancelar/:idSolicitud_Carga", cancelarSolicitud);

export default router;

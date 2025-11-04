// routes/solicitud_routes.js
import express from 'express';
import {
  crearSolicitud,
  obtenerSolicitudesPorCliente,
  cancelarSolicitud,
  obtenerSolicitudesPorTransportista
} from '../controllers/solicitud_controller.js';

const router = express.Router();

// Rutas para la gestión de solicitudes
router.post("/crear", crearSolicitud);
router.get("/cliente/:idUsuario", obtenerSolicitudesPorCliente);
router.get("/transportista/:idTransportista", obtenerSolicitudesPorTransportista);
router.put("/cancelar/:idSolicitud_Carga", cancelarSolicitud);

export default router;

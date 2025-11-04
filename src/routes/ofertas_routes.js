import express from 'express';
import {
  obtenerSolicitudesDisponibles,
  crearOferta,
  aceptarOferta,
  listarOfertasPorTransportista
} from '../controllers/ofertas_controller.js';

const router = express.Router();

// Rutas para la gestión de ofertas
router.get('/solicitudes-disponibles', obtenerSolicitudesDisponibles);
router.post('/crear', crearOferta);
router.put('/aceptar/:idOferta', aceptarOferta);
router.get('/mis-ofertas/:idTransportista', listarOfertasPorTransportista);

export default router;

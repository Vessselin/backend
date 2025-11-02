import express from 'express';
import {
  obtenerSolicitudesDisponibles,
  crearOferta,
  aceptarOferta,
  listarOfertasPorTransportista
} from '../controllers/ofertas_controller.js';

const router = express.Router();

// Ver todas las solicitudes disponibles para ofertar
router.get('/solicitudes-disponibles', obtenerSolicitudesDisponibles);

// Crear una nueva oferta o contraoferta
router.post('/crear', crearOferta);

// Aceptar una oferta existente
router.put('/aceptar/:idOferta', aceptarOferta);

// Ver las ofertas que ha hecho un transportista
router.get('/mis-ofertas/:idTransportista', listarOfertasPorTransportista);

export default router;

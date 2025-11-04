// routes/negociaciones_routes.js
import express from 'express';
import {
  crearNegociacion,
  actualizarNegociacion,
  pactarNegociacion,
  obtenerNegociacionesPorCarga
} from '../controllers/negociaciones_controller.js';

const router = express.Router();

// Rutas generales para negociaciones
router.post('/crear', crearNegociacion);
router.put('/actualizar/:idNegociacion', actualizarNegociacion);
router.put('/pactar/:idNegociacion', pactarNegociacion);
router.get('/por-carga/:idSolicitud_Carga', obtenerNegociacionesPorCarga);

export default router;

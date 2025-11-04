import express from "express";
import {
  crearContratoBlockchain,
  obtenerContratosPorUsuario,
  completarContratoBlockchain
} from "../controllers/contrato_controller.js";

const router = express.Router();

// Rutas para la gestión de contratos en blockchain
router.post("/contrato", crearContratoBlockchain);
router.get("/contratos/:tipo/:idUsuario", obtenerContratosPorUsuario);
router.put("/contrato/:idContrato/completar", completarContratoBlockchain);

export default router;

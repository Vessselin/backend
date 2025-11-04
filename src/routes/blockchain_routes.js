import express from "express";
import {
  crearContratoBlockchain,
  obtenerContratosPorUsuario,
  completarContratoBlockchain
} from "../controllers/contrato_controller.js";

const router = express.Router();

// Crear nuevo contrato
router.post("/contrato", crearContratoBlockchain);

// Obtener todos los contratos de un usuario (cliente o transportista)
router.get("/contratos/:tipo/:idUsuario", obtenerContratosPorUsuario);

// Completar un contrato
router.put("/contrato/:idContrato/completar", completarContratoBlockchain);

export default router;

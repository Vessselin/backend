import express from "express";
import {
  obtenerNegociacionesPorCliente,
  enviarContraofertaCliente,
  cancelarNegociacionCliente
} from "../controllers/negociaciones_controller.js";

const router = express.Router();

// 🔹 Rutas específicas para el cliente
router.get("/:idCliente", obtenerNegociacionesPorCliente);
router.post("/contraoferta", enviarContraofertaCliente);
router.put("/cancelar/:idNegociacion", cancelarNegociacionCliente);

export default router;

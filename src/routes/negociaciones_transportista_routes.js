import express from "express";
import {
  obtenerNegociacionesPorTransportista,
  enviarContraoferta,
  cancelarNegociacion
} from "../controllers/negociaciones_controller.js";

const router = express.Router();

// 🔹 Rutas específicas para el transportista
router.get("/:idTransportista", obtenerNegociacionesPorTransportista);
router.post("/contraoferta", enviarContraoferta);
router.put("/cancelar/:idNegociacion", cancelarNegociacion);

export default router;

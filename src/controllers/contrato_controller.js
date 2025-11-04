// controllers/contrato_controller.js
import Web3 from "web3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a Ganache
const web3 = new Web3("http://127.0.0.1:7545");

// Dirección del contrato desplegado
const CONTRACT_ADDRESS = "0xEc9827bb11c46339d89123167eA55fDf2bA9B447";

// Cargar ABI del contrato
const ABI_PATH = path.resolve(__dirname, "../contracts/build/TransporteContrato.json");
const contractJSON = JSON.parse(fs.readFileSync(ABI_PATH, "utf8"));
const contrato = new web3.eth.Contract(contractJSON.abi, contractJSON.address);

// Cuenta predeterminada (la primera de Ganache)
let defaultAccount;
(async () => {
  const accounts = await web3.eth.getAccounts();
  defaultAccount = accounts[0];
  web3.eth.defaultAccount = defaultAccount;
})();

/**
 * 🔹 Crear un nuevo contrato en Ganache (simulado)
 */
export const crearContratoBlockchain = async (req, res) => {
  try {
    const { idNegociacion } = req.body;

    if (!idNegociacion) {
      return res.status(400).json({ success: false, message: "Falta idNegociacion" });
    }

    // 🔍 Obtener negociación desde la base de datos
    const [rows] = await pool.query(
      "SELECT * FROM negociacion WHERE idNegociacion = ?",
      [idNegociacion]
    );
    const negociacion = rows[0];

    if (!negociacion) {
      return res.status(404).json({ success: false, message: "Negociación no encontrada" });
    }

    // Obtener datos de solicitud_carga (para origen y destino)
    const [solicitudRows] = await pool.query(
      "SELECT origen, destino FROM solicitud_carga WHERE idSolicitud_Carga = ?",
      [negociacion.idSolicitud_Carga]
    );
    const solicitud = solicitudRows[0] || {};

    // Traducir IDs de usuario a IDs de cliente/transportista reales
    const [[cliente]] = await pool.query(
      "SELECT idCliente FROM cliente WHERE idUsuario = ?",
      [negociacion.idCliente]
    );
    const [[transportista]] = await pool.query(
      "SELECT idTransportista FROM transportista WHERE idUsuario = ?",
      [negociacion.idTransportista]
    );

    if (!cliente || !transportista) {
      return res.status(400).json({
        success: false,
        message: "No se encontró cliente o transportista asociado al usuario",
      });
    }

    // 🔧 Cargar ABI y bytecode del contrato dentro de la función
    const contractPath = path.resolve("./src/contracts/build/TransporteContrato.json");
    const contractJSON = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const abi = contractJSON.abi;
    const bytecode =
      contractJSON.bytecode ||
      (contractJSON.evm && contractJSON.evm.bytecode && contractJSON.evm.bytecode.object) ||
      null;

    if (!bytecode) {
      throw new Error("Bytecode del contrato no encontrado en TransporteContrato.json");
    }

    // Crear y desplegar el contrato en Ganache
    const contratoInstance = new web3.eth.Contract(abi);

    const deployTx = contratoInstance.deploy({
      data: "0x" + bytecode.replace(/^0x/, ""),
      arguments: [
        negociacion.idCliente, // ID del usuario cliente
        negociacion.idTransportista, // ID del usuario transportista
        negociacion.monto,
        solicitud.origen || "Origen no definido",
        solicitud.destino || "Destino no definido",
      ],
    });

    let transactionHashValue = null;

    const nuevoContrato = await deployTx
        .send({
            from: defaultAccount,
            gas: 3000000,
        })
        .on("transactionHash", (hash) => {
            transactionHashValue = hash;
            console.log("🔗 Tx Hash:", hash);
        });

    console.log("✅ Contrato desplegado en:", nuevoContrato.options.address);


    // Guardar el contrato en la base de datos
    await pool.query(
      `INSERT INTO contrato 
       (idSolicitud_Carga, idCliente, idTransportista, fecha_inicio, valor_final, estado_contrato, hashBlockchain)
       VALUES (?, ?, ?, NOW(), ?, 'Activo', ?)`,
      [
        negociacion.idSolicitud_Carga,
        cliente.idCliente,
        transportista.idTransportista,
        negociacion.monto,
        nuevoContrato.options.address,
      ]
    );

    res.json({
      success: true,
      message: "Contrato creado correctamente en blockchain (Ganache)",
      address: nuevoContrato.options.address,
      txHash: transactionHashValue,
    });
  } catch (error) {
    console.error("❌ Error al crear contrato:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear contrato en blockchain",
      error: error.message,
    });
  }
};

/**
 *  Obtener contratos por usuario
 */
export const obtenerContratosPorUsuario = async (req, res) => {
  try {
    const { idUsuario, tipo } = req.params; // tipo = "cliente" o "transportista"
    const campo = tipo === "cliente" ? "idCliente" : "idTransportista";

    const [contratos] = await pool.query(
      `SELECT * FROM contrato WHERE ${campo} = ? ORDER BY fecha_inicio DESC`,
      [idUsuario]
    );

    return res.json({
      totalContratos: contratos.length,
      contratos,
    });
  } catch (err) {
    console.error("❌ Error al obtener contratos por usuario:", err);
    res.status(500).json({ error: "Error al obtener contratos del usuario" });
  }
};

//  Marcar contrato como completado
export const completarContratoBlockchain = async (req, res) => {
  try {
    const { idContrato } = req.params;

    // 🔗 Simula llamada al contrato inteligente (en Ganache)
    const tx = await contrato.methods
      .completarContrato(idContrato)
      .send({ from: defaultAccount, gas: 200000 });

    // Actualizar en la base de datos
    await pool.query(
      "UPDATE contrato SET estado_contrato = 'Finalizado', fecha_fin = NOW() WHERE idContrato = ?",
      [idContrato]
    );

    res.json({
      success: true,
      message: "✅ Contrato completado correctamente",
      txHash: tx.transactionHash,
    });
  } catch (err) {
    console.error("❌ Error al completar contrato:", err);
    res.status(500).json({ error: "Error al completar contrato" });
  }
};

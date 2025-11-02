import connection from '../config/db.js';

// Crear solicitud de carga
// controllers/solicitud_controller.js
import db from "../config/db.js";

export const crearSolicitud = async (req, res) => {
  try {
    const {
      descripcion,
      peso,
      origen,
      destino,
      origen_lat,
      origen_lng,
      destino_lat,
      destino_lng,
      distancia_km,
      precio_usuario,
      idUsuario
    } = req.body;

    // 1️⃣ Crear solicitud
    const [solicitud] = await db.query(
      `INSERT INTO solicitud_carga 
       (descripcion, peso, origen, destino, origen_lat, origen_lng, destino_lat, destino_lng, distancia_km, idUsuario, fecha_publicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        descripcion,
        peso,
        origen,
        destino,
        origen_lat,
        origen_lng,
        destino_lat,
        destino_lng,
        distancia_km,
        idUsuario
      ]
    );

    const idSolicitud = solicitud.insertId;

    // 2️⃣ Crear registro de precios
    const precioEstimado = parseFloat(precio_usuario);
    const precioMin = precioEstimado * 0.9;
    const precioMax = precioEstimado * 1.1;
    const precioFinal = precioEstimado; // mismo valor inicial

    await db.query(
      `INSERT INTO precio_carga (idSolicitud_Carga, precio_estimado, precio_min, precio_max, precio_final)
       VALUES (?, ?, ?, ?, ?)`,
      [idSolicitud, precioEstimado, precioMin, precioMax, precioFinal]
    );

    res.json({ message: "✅ Solicitud creada correctamente" });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ message: "❌ Error al crear la solicitud" });
  }
};


// Obtener todas las solicitudes
export const obtenerSolicitudes = async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT * FROM solicitud_carga');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener solicitudes por cliente
export const obtenerSolicitudesPorCliente = async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const [rows] = await connection.query(
      'SELECT * FROM solicitud_carga WHERE idUsuario = ?',
      [idUsuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay solicitudes para este cliente' });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

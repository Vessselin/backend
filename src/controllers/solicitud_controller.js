import connection from '../config/db.js';
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

    // Calcular precio estimado en el backend
    const precioKm = 950;
    const precioKg = 1500;
    const precioEstimado = (distancia_km * precioKm) + (peso * precioKg);

    // Calcular rango permitido
    const precioMin = precioEstimado * 0.9;
    const precioMax = precioEstimado * 1.1;

    // Validar que el usuario esté dentro del rango permitido
    const precioFinal = parseFloat(precio_usuario);
    if (precioFinal < precioMin || precioFinal > precioMax) {
      return res.status(400).json({
        message: `⚠️ El precio ingresado está fuera del rango permitido (${precioMin.toFixed(0)} - ${precioMax.toFixed(0)}).`
      });
    }

    // Crear solicitud
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

    // Registrar precios (estimado, rango y precio ingresado)
    await db.query(
      `INSERT INTO precio_carga (idSolicitud_Carga, precio_estimado, precio_min, precio_max, precio_final)
       VALUES (?, ?, ?, ?, ?)`,
      [idSolicitud, precioEstimado, precioMin, precioMax, precioFinal]
    );

    res.json({
      message: "Solicitud creada correctamente",
      data: {
        idSolicitud,
        precio_estimado: precioEstimado,
        precio_final: precioFinal,
        rango: { min: precioMin, max: precioMax }
      }
    });

  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ message: "Error al crear la solicitud" });
  }
};

// Obtener solicitudes del cliente
export const obtenerSolicitudesPorCliente = async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const sql = `
      SELECT 
        s.idSolicitud_Carga,
        s.descripcion,
        s.peso,
        s.origen,
        s.destino,
        s.fecha_publicacion,
        s.estado_carga,
        n.monto AS precio_final,
        c.hashBlockchain
      FROM solicitud_carga s
      LEFT JOIN negociacion n 
        ON s.idSolicitud_Carga = n.idSolicitud_Carga 
        AND n.estado = 'Pactado'
      LEFT JOIN contrato c 
        ON s.idSolicitud_Carga = c.idSolicitud_Carga
      WHERE s.idUsuario = ?
        AND s.estado_carga IN ('disponible', 'cerrado')
      ORDER BY s.fecha_publicacion DESC
    `;

    const [rows] = await connection.query(sql, [idUsuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay solicitudes registradas." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener solicitudes del cliente:", error);
    res.status(500).json({ message: "Error al obtener solicitudes del cliente" });
  }
};


// Obtener cargas cerradas del transportista
export const obtenerSolicitudesPorTransportista = async (req, res) => {
  try {
    const { idTransportista } = req.params;

    const sql = `
      SELECT 
        s.idSolicitud_Carga,
        s.descripcion,
        s.peso,
        s.origen,
        s.destino,
        s.fecha_publicacion,
        s.estado_carga,
        n.monto AS precio_final,
        c.hashBlockchain
      FROM solicitud_carga s
      LEFT JOIN negociacion n 
        ON s.idSolicitud_Carga = n.idSolicitud_Carga 
        AND n.estado = 'Pactado'
      LEFT JOIN contrato c 
        ON s.idSolicitud_Carga = c.idSolicitud_Carga
      WHERE s.idTransportista = ?
        AND s.estado_carga = 'cerrado'
      ORDER BY s.fecha_publicacion DESC
    `;

    const [rows] = await connection.query(sql, [idTransportista]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No hay cargas cerradas para este transportista." });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener cargas del transportista:", error);
    res.status(500).json({ message: "Error al obtener cargas del transportista" });
  }
};

// Cancelar solicitud (solo si está disponible)
export const cancelarSolicitud = async (req, res) => {
  try {
    const { idSolicitud_Carga } = req.params;

    // Verificar que esté disponible
    const [[solicitud]] = await connection.query(
      "SELECT estado_carga FROM solicitud_carga WHERE idSolicitud_Carga = ?",
      [idSolicitud_Carga]
    );
    if (!solicitud) {
      return res.status(404).json({ message: "Solicitud no encontrada" });
    }
    if (solicitud.estado_carga !== "disponible") {
      return res
        .status(400)
        .json({ message: "Solo se pueden cancelar solicitudes disponibles." });
    }
    await connection.query(
      "UPDATE solicitud_carga SET estado_carga = 'cancelado' WHERE idSolicitud_Carga = ?",
      [idSolicitud_Carga]
    );
    res.json({ success: true, message: "Solicitud cancelada correctamente." });
  } catch (error) {
    console.error("Error al cancelar solicitud:", error);
    res.status(500).json({ message: "Error al cancelar la solicitud." });
  }
};

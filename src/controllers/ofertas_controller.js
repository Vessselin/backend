import db from '../config/db.js';

// Obtener solicitudes disponibles (solo las que no estén cerradas)
export const obtenerSolicitudesDisponibles = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sc.idSolicitud_Carga,
        sc.descripcion,
        sc.peso,
        sc.origen,
        sc.destino,
        sc.distancia_km,
        sc.estado_carga,
        pc.precio_min,
        pc.precio_max,
        pc.precio_final
      FROM solicitud_carga sc
      JOIN precio_carga pc ON sc.idSolicitud_Carga = pc.idSolicitud_Carga
      WHERE sc.estado_carga != 'cerrado'
      ORDER BY sc.fecha_publicacion DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener solicitudes disponibles:", error);
    res.status(500).json({ message: "Error al obtener solicitudes" });
  }
};

// Crear una nueva oferta o contraoferta
export const crearOferta = async (req, res) => {
  try {
    const { idSolicitud_Carga, idTransportista, monto, comentarios, tipo } = req.body;

    // Asegurar que el ENUM coincida con los valores válidos de MySQL
    const estado = tipo === 'contraoferta' ? 'Pendiente' : 'Pendiente';

    await db.query(`
      INSERT INTO oferta (idSolicitud_Carga, idTransportista, monto, estado, comentarios, fecha_oferta)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [idSolicitud_Carga, idTransportista, monto, estado, comentarios]);

    res.json({ message: 'Oferta creada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la oferta' });
  }
};

// Aceptar una oferta
export const aceptarOferta = async (req, res) => {
  try {
    const { idOferta } = req.params;

    await db.query(`UPDATE oferta SET estado = 'Aceptada' WHERE idOferta = ?`, [idOferta]);

    res.json({ message: 'Oferta aceptada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al aceptar la oferta' });
  }
};

// 🔹 Ver ofertas hechas por un transportista
export const listarOfertasPorTransportista = async (req, res) => {
  try {
    const { idTransportista } = req.params;
    const [result] = await db.query(`
      SELECT o.idOferta, o.monto, o.estado, o.fecha_oferta, s.origen, s.destino
      FROM oferta o
      JOIN solicitud_carga s ON o.idSolicitud_Carga = s.idSolicitud_Carga
      WHERE o.idTransportista = ?
      ORDER BY o.fecha_oferta DESC;
    `, [idTransportista]);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las ofertas' });
  }
};

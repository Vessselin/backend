// controllers/negociaciones_controller.js
import connection from '../config/db.js';

// Crear negociación (oferta inicial o contraoferta)
export const crearNegociacion = async (req, res) => {
  try {
    const { idSolicitud_Carga, idTransportista, monto, comentarios } = req.body;

    if (!idSolicitud_Carga || !idTransportista) {
      return res.status(400).json({ error: "Faltan datos obligatorios (idSolicitud_Carga o idTransportista)" });
    }

    // Buscar idCliente asociado a esa solicitud
    const [solicitudRows] = await connection.execute(
      "SELECT idUsuario FROM solicitud_carga WHERE idSolicitud_Carga = ?",
      [idSolicitud_Carga]
    );

    if (solicitudRows.length === 0) {
      return res.status(404).json({ error: "No se encontró la solicitud de carga indicada" });
    }

    const idCliente = solicitudRows[0].idUsuario;

    const sql = `
      INSERT INTO negociacion (idSolicitud_Carga, idCliente, idTransportista, monto, estado, fecha_inicio, fecha_actualizacion)
      VALUES (?, ?, ?, ?, 'Oferta_Transportista', NOW(), NOW())
    `;
    const [result] = await connection.execute(sql, [idSolicitud_Carga, idCliente, idTransportista, monto || 0]);

    // Cambiar estado de la carga a "negociando"
    await connection.execute(
      `UPDATE solicitud_carga SET estado_carga = 'negociando' WHERE idSolicitud_Carga = ? AND estado_carga = 'disponible'`,
      [idSolicitud_Carga]
    );

    return res.status(201).json({
      success: true,
      message: "Negociación creada correctamente",
      idNegociacion: result.insertId,
      idCliente,
      idTransportista
    });
  } catch (err) {
    console.error("❌ Error al crear negociación:", err);
    return res.status(500).json({ error: "Error interno al crear negociación" });
  }
};

// Actualizar negociación
export const actualizarNegociacion = async (req, res) => {
  try {
    const { idNegociacion } = req.params;
    const { monto, monto_cliente, monto_transportista, estado } = req.body;

    // prioridad: monto explícito > monto_cliente > monto_transportista
    const montoFinal = (monto !== undefined && monto !== null)
      ? monto
      : (monto_cliente !== undefined && monto_cliente !== null)
        ? monto_cliente
        : (monto_transportista !== undefined && monto_transportista !== null)
          ? monto_transportista
          : null;

    // Si no viene monto ni estado y no hay nada para actualizar podrías devolver 400 (opcional)
    const sql = `
      UPDATE negociacion
      SET 
        ${montoFinal !== null ? "monto = ?, " : ""}
        estado = IFNULL(?, estado),
        fecha_actualizacion = NOW()
      WHERE idNegociacion = ?
`;
    // Construir params respetando el orden y presencia
    const params = [];
    if (montoFinal !== null) params.push(montoFinal);
    params.push(estado); // puede ser undefined -> IFNULL lo ignora
    params.push(idNegociacion);

    const [result] = await connection.execute(sql, params);

    return res.json({ success: true, message: "Negociación actualizada", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("❌ Error al actualizar negociación:", err);
    return res.status(500).json({ error: "Error interno al actualizar negociación" });
  }
};

// Pactar negociación (aceptar y cerrar carga)
export const pactarNegociacion = async (req, res) => {
  const idNegociacion = req.params.idNegociacion;
  const { idSolicitud_Carga, idTransportista } = req.body;

  if (!idNegociacion || !idSolicitud_Carga) {
    return res.status(400).json({ error: "Faltan idNegociacion o idSolicitud_Carga" });
  }

  try {
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE negociacion SET estado = 'Pactado', fecha_actualizacion = NOW() WHERE idNegociacion = ?`,
      [idNegociacion]
    );

    await connection.execute(
      `UPDATE negociacion SET estado = 'Cancelado', fecha_actualizacion = NOW() WHERE idSolicitud_Carga = ? AND idNegociacion != ?`,
      [idSolicitud_Carga, idNegociacion]
    );

    await connection.execute(
      `UPDATE solicitud_carga SET estado_carga = 'cerrado' WHERE idSolicitud_Carga = ?`,
      [idSolicitud_Carga]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Negociación pactada correctamente"
    });
  } catch (err) {
    console.error("❌ Error al pactar negociación:", err);
    try { await connection.rollback(); } catch (e) { console.error("rollback error:", e); }
    return res.status(500).json({ error: "Error al pactar negociación" });
  }
};

// Obtener negociaciones por carga
export const obtenerNegociacionesPorCarga = async (req, res) => {
  try {
    const { idSolicitud_Carga } = req.params;
    const sql = `
      SELECT n.*, u.nombre AS nombreTransportista
      FROM negociacion n
      LEFT JOIN usuario u ON n.idTransportista = u.idUsuario
      WHERE n.idSolicitud_Carga = ?
      ORDER BY n.fecha_inicio DESC
    `;
    const [rows] = await connection.execute(sql, [idSolicitud_Carga]);
    return res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener negociaciones:", err);
    return res.status(500).json({ error: "Error al obtener negociaciones" });
  }
};

// 🔹 Negociaciones del transportista
export const obtenerNegociacionesPorTransportista = async (req, res) => {
  try {
    const { idTransportista } = req.params;

    const sql = `
      SELECT 
        n.idNegociacion,
        n.idSolicitud_Carga,
        n.monto_cliente,
        n.monto_transportista,
        n.estado,
        n.fecha_actualizacion,
        s.descripcion,
        s.origen,
        s.destino,
        s.peso,
        s.distancia_km,
        s.estado_carga
      FROM negociacion n
      JOIN solicitud_carga s ON n.idSolicitud_Carga = s.idSolicitud_Carga
      WHERE n.idTransportista = ?
      ORDER BY n.fecha_actualizacion DESC
    `;

    const [rows] = await connection.execute(sql, [idTransportista]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener negociaciones del transportista:", err);
    res.status(500).json({ error: "Error al obtener negociaciones del transportista" });
  }
};

// 🔹 Contraoferta (transportista)
export const enviarContraoferta = async (req, res) => {
  try {
    const { idNegociacion, nuevoMonto } = req.body;

    const sql = `
      UPDATE negociacion 
      SET monto_transportista = ?, estado = 'Oferta_Transportista', fecha_actualizacion = NOW()
      WHERE idNegociacion = ?
    `;
    await connection.execute(sql, [nuevoMonto, idNegociacion]);

    res.json({ success: true, message: "📩 Contraoferta enviada correctamente" });
  } catch (err) {
    console.error("❌ Error al enviar contraoferta:", err);
    res.status(500).json({ error: "Error al enviar contraoferta" });
  }
};

// 🔹 Cancelar (transportista)
export const cancelarNegociacion = async (req, res) => {
  try {
    const { idNegociacion } = req.params;

    const sql = `
      UPDATE negociacion 
      SET estado = 'Cancelado', fecha_actualizacion = NOW()
      WHERE idNegociacion = ?
    `;
    await connection.execute(sql, [idNegociacion]);

    res.json({ success: true, message: "🚫 Negociación cancelada correctamente" });
  } catch (err) {
    console.error("❌ Error al cancelar negociación:", err);
    res.status(500).json({ error: "Error al cancelar negociación" });
  }
};

// Obtener negociaciones del cliente
export const obtenerNegociacionesPorCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;

    const sql = `
      SELECT 
        n.idNegociacion,
        n.idSolicitud_Carga,
        n.monto_cliente,
        n.monto_transportista,
        n.estado,
        n.fecha_actualizacion,
        s.descripcion,
        s.origen,
        s.destino,
        s.peso,
        s.distancia_km,
        s.estado_carga
      FROM negociacion n
      JOIN solicitud_carga s ON n.idSolicitud_Carga = s.idSolicitud_Carga
      WHERE n.idCliente = ?
      ORDER BY n.fecha_actualizacion DESC
    `;

    const [rows] = await connection.execute(sql, [idCliente]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener negociaciones del cliente:", err);
    res.status(500).json({ error: "Error al obtener negociaciones del cliente" });
  }
};

// Enviar contraoferta (cliente)
export const enviarContraofertaCliente = async (req, res) => {
  try {
    const { idNegociacion, nuevoMonto } = req.body;

    const sql = `
      UPDATE negociacion 
      SET monto_cliente = ?, estado = 'Oferta_Cliente', fecha_actualizacion = NOW()
      WHERE idNegociacion = ?
    `;
    await connection.execute(sql, [nuevoMonto, idNegociacion]);

    res.json({ success: true, message: "📩 Contraoferta enviada correctamente por el cliente" });
  } catch (err) {
    console.error("❌ Error al enviar contraoferta del cliente:", err);
    res.status(500).json({ error: "Error al enviar contraoferta del cliente" });
  }
};

// Cancelar (cliente)
export const cancelarNegociacionCliente = async (req, res) => {
  try {
    const { idNegociacion } = req.params;

    const sql = `
      UPDATE negociacion 
      SET estado = 'Cancelado', fecha_actualizacion = NOW()
      WHERE idNegociacion = ?
    `;
    await connection.execute(sql, [idNegociacion]);

    res.json({ success: true, message: "🚫 Negociación cancelada correctamente por el cliente" });
  } catch (err) {
    console.error("❌ Error al cancelar negociación del cliente:", err);
    res.status(500).json({ error: "Error al cancelar negociación del cliente" });
  }
};

import pool from '../config/db.js';

export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Usuario');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Usuario (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, correo, contrasena]
    );
    res.json({ id: result.insertId, nombre, correo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE idUsuario = ?', [req.params.id]);
    if (rows.length <= 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


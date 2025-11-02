// controllers/auth_controller.js
import connection from '../config/db.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena, tipoUsuario, empresa, nit, placa, vehiculo, capacidad } = req.body;

    if (!nombre || !correo || !contrasena || !tipoUsuario) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el correo ya existe
    const [existente] = await connection.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);
    if (existente.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Determinar el tipo de usuario (2 = Cliente, 3 = Transportista)
    let idTipo_Usuario;
    if (tipoUsuario === 'cliente') idTipo_Usuario = 2;
    else if (tipoUsuario === 'transportista') idTipo_Usuario = 3;
    else return res.status(400).json({ message: 'Tipo de usuario inválido' });

    // Crear el usuario
    const [resultUsuario] = await connection.query(
      'INSERT INTO Usuario (nombre, correo, contrasena, idTipo_Usuario) VALUES (?, ?, ?, ?)',
      [nombre, correo, hashedPassword, idTipo_Usuario]
    );

    const idUsuario = resultUsuario.insertId;

    // Dependiendo del tipo, crear registro adicional
    if (idTipo_Usuario === 2) {
      // Cliente
      await connection.query(
        'INSERT INTO cliente (idUsuario, empresa, nit) VALUES (?, ?, ?)',
        [idUsuario, empresa || null, nit || null]
      );
    } else if (idTipo_Usuario === 3) {
      // Transportista
      await connection.query(
        'INSERT INTO transportista (idUsuario, placa, vehiculo, capacidad) VALUES (?, ?, ?, ?)',
        [idUsuario, placa || null, vehiculo || null, capacidad || null]
      );
    }

    res.status(201).json({
      idUsuario,
      nombre,
      correo,
      tipoUsuario,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const [rows] = await connection.query('SELECT * FROM Usuario WHERE correo = ?', [correo]);

    if (rows.length === 0)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);

    if (!validPassword)
      return res.status(401).json({ message: 'Contraseña incorrecta' });

    res.json({
      message: 'Inicio de sesión exitoso',
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      idTipoUsuario: Number(user.idTipo_Usuario)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

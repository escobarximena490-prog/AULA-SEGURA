const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authRequired, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, adminOnly);

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.rol, u.estado, cu.correo, cu.estado AS cuenta_estado
     FROM usuario u
     LEFT JOIN cuenta_usuario cu ON cu.id_usuario = u.id_usuario
     ORDER BY u.nombre`
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nombre, rol, correo, contrasena } = req.body || {};
  if (!nombre || !rol || !correo || !contrasena) {
    return res.status(400).json({ message: 'Nombre, rol, correo y contraseña son obligatorios.' });
  }
  if (!['Administrador', 'Encargado'].includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [userResult] = await conn.query(
      'INSERT INTO usuario (nombre, rol) VALUES (?, ?)',
      [nombre.trim(), rol]
    );
    const hash = await bcrypt.hash(contrasena, 10);
    await conn.query(
      'INSERT INTO cuenta_usuario (id_usuario, correo, contrasena) VALUES (?, ?, ?)',
      [userResult.insertId, correo.trim().toLowerCase(), hash]
    );
    await conn.commit();
    res.status(201).json({ id_usuario: userResult.insertId, nombre, rol, correo });
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ese correo ya está registrado.' });
    }
    throw error;
  } finally {
    conn.release();
  }
});

module.exports = router;

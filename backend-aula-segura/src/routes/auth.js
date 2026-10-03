const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

function sign(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
}

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body || {};
  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }

  const [staffRows] = await pool.query(
    `SELECT cu.id_cuenta_usuario, cu.contrasena, cu.estado AS cuenta_estado,
            u.id_usuario, u.nombre, u.rol, u.estado AS usuario_estado
     FROM cuenta_usuario cu
     INNER JOIN usuario u ON u.id_usuario = cu.id_usuario
     WHERE cu.correo = ?`,
    [correo]
  );

  if (staffRows.length) {
    const row = staffRows[0];
    if (!row.cuenta_estado || !row.usuario_estado) {
      return res.status(403).json({ message: 'La cuenta está desactivada.' });
    }
    const ok = await bcrypt.compare(contrasena, row.contrasena);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }
    const user = {
      tipo: 'usuario',
      id_usuario: row.id_usuario,
      nombre: row.nombre,
      rol: row.rol,
      correo,
    };
    return res.json({ token: sign(user), user });
  }

  const [studentRows] = await pool.query(
    `SELECT ce.id_cuenta_estudiante, ce.contrasena, ce.estado AS cuenta_estado,
            e.id_estudiante, e.nombre, e.apellido, e.documento, e.estado AS estudiante_estado
     FROM cuenta_estudiante ce
     INNER JOIN estudiante e ON e.id_estudiante = ce.id_estudiante
     WHERE ce.correo = ?`,
    [correo]
  );

  if (!studentRows.length) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const row = studentRows[0];
  if (!row.cuenta_estado || !row.estudiante_estado) {
    return res.status(403).json({ message: 'La cuenta está desactivada.' });
  }
  const ok = await bcrypt.compare(contrasena, row.contrasena);
  if (!ok) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const user = {
    tipo: 'estudiante',
    id_estudiante: row.id_estudiante,
    nombre: `${row.nombre} ${row.apellido}`,
    documento: row.documento,
    rol: 'Estudiante',
    correo,
  };
  return res.json({ token: sign(user), user });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Debe iniciar sesión.' });
  }
  try {
    return res.json({ user: jwt.verify(token, process.env.JWT_SECRET) });
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o vencida.' });
  }
});

module.exports = router;

const express = require('express');
const pool = require('../db');
const { authRequired, staffOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  const { fecha, id_estudiante, q } = req.query;
  const filters = [];
  const params = [];

  if (req.user.tipo === 'estudiante') {
    filters.push('l.id_estudiante = ?');
    params.push(req.user.id_estudiante);
  } else if (id_estudiante) {
    filters.push('l.id_estudiante = ?');
    params.push(Number(id_estudiante));
  }

  if (fecha) {
    filters.push('l.fecha = ?');
    params.push(fecha);
  }

  if (q && req.user.tipo === 'usuario') {
    filters.push('(e.nombre LIKE ? OR e.apellido LIKE ? OR e.documento LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT l.id_llegada, l.fecha, l.hora, l.motivo, l.observacion,
            e.id_estudiante, e.documento, e.nombre, e.apellido,
            c.nombre_curso, c.grado, c.grupo,
            u.nombre AS registrado_por
     FROM llegada_tarde l
     INNER JOIN estudiante e ON e.id_estudiante = l.id_estudiante
     INNER JOIN curso c ON c.id_curso = e.id_curso
     INNER JOIN usuario u ON u.id_usuario = l.id_usuario
     ${where}
     ORDER BY l.fecha DESC, l.hora DESC`,
    params
  );
  res.json(rows);
});

router.post('/', staffOnly, async (req, res) => {
  const { id_estudiante, motivo, observacion } = req.body || {};
  if (!id_estudiante || !motivo) {
    return res.status(400).json({ message: 'Estudiante y motivo son obligatorios.' });
  }

  const [students] = await pool.query(
    'SELECT id_estudiante, estado FROM estudiante WHERE id_estudiante = ?',
    [id_estudiante]
  );
  if (!students.length) {
    return res.status(404).json({ message: 'Estudiante no encontrado.' });
  }
  if (!students[0].estado) {
    return res.status(400).json({ message: 'El estudiante está desactivado.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO llegada_tarde (id_estudiante, id_usuario, fecha, hora, motivo, observacion)
       VALUES (?, ?, CURDATE(), CURTIME(), ?, ?)`,
      [id_estudiante, req.user.id_usuario, motivo.trim(), observacion?.trim() || null]
    );
    const [rows] = await pool.query(
      `SELECT l.*, e.nombre, e.apellido, e.documento
       FROM llegada_tarde l
       INNER JOIN estudiante e ON e.id_estudiante = l.id_estudiante
       WHERE l.id_llegada = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este estudiante ya tiene una llegada tarde registrada hoy.' });
    }
    throw error;
  }
});

module.exports = router;

const express = require('express');
const pool = require('../db');
const { authRequired, staffOnly, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, staffOnly);

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(e.id_estudiante) AS total_estudiantes
     FROM curso c
     LEFT JOIN estudiante e ON e.id_curso = c.id_curso
     GROUP BY c.id_curso
     ORDER BY c.grado, c.grupo`
  );
  res.json(rows);
});

router.post('/', adminOnly, async (req, res) => {
  const { nombre_curso, grado, grupo } = req.body || {};
  if (!nombre_curso || !grado || !grupo) {
    return res.status(400).json({ message: 'Nombre, grado y grupo son obligatorios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO curso (nombre_curso, grado, grupo) VALUES (?, ?, ?)',
      [nombre_curso.trim(), Number(grado), String(grupo).trim().toUpperCase()]
    );
    const [rows] = await pool.query('SELECT * FROM curso WHERE id_curso = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un curso con ese grado y grupo.' });
    }
    throw error;
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authRequired, staffOnly, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, staffOnly);

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  const params = [];
  let where = '';
  if (q) {
    where = `WHERE e.nombre LIKE ? OR e.apellido LIKE ? OR e.documento LIKE ? OR c.nombre_curso LIKE ?`;
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  const [rows] = await pool.query(
    `SELECT e.id_estudiante, e.documento, e.nombre, e.apellido, e.estado,
            c.id_curso, c.nombre_curso, c.grado, c.grupo,
            ce.correo,
            COUNT(l.id_llegada) AS total_llegadas
     FROM estudiante e
     INNER JOIN curso c ON c.id_curso = e.id_curso
     LEFT JOIN cuenta_estudiante ce ON ce.id_estudiante = e.id_estudiante
     LEFT JOIN llegada_tarde l ON l.id_estudiante = e.id_estudiante
     ${where}
     GROUP BY e.id_estudiante, e.documento, e.nombre, e.apellido, e.estado,
              c.id_curso, c.nombre_curso, c.grado, c.grupo, ce.correo
     ORDER BY e.apellido, e.nombre`,
    params
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { documento, nombre, apellido, id_curso } = req.body || {};
  if (!documento || !nombre || !apellido || !id_curso) {
    return res.status(400).json({ message: 'Documento, nombre, apellido y curso son obligatorios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO estudiante (documento, nombre, apellido, id_curso) VALUES (?, ?, ?, ?)',
      [documento.trim(), nombre.trim(), apellido.trim(), Number(id_curso)]
    );
    const [rows] = await pool.query('SELECT * FROM estudiante WHERE id_estudiante = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un estudiante con ese documento.' });
    }
    throw error;
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellido, id_curso, estado } = req.body || {};
  const [current] = await pool.query('SELECT * FROM estudiante WHERE id_estudiante = ?', [id]);
  if (!current.length) {
    return res.status(404).json({ message: 'Estudiante no encontrado.' });
  }
  await pool.query(
    'UPDATE estudiante SET nombre = ?, apellido = ?, id_curso = ?, estado = ? WHERE id_estudiante = ?',
    [
      nombre ?? current[0].nombre,
      apellido ?? current[0].apellido,
      id_curso ?? current[0].id_curso,
      estado === undefined ? current[0].estado : Boolean(estado),
      id,
    ]
  );
  const [rows] = await pool.query('SELECT * FROM estudiante WHERE id_estudiante = ?', [id]);
  res.json(rows[0]);
});

router.post('/:id/cuenta', adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { correo, contrasena } = req.body || {};
  if (!correo || !contrasena) {
    return res.status(400).json({ message: 'Correo y contraseña son obligatorios.' });
  }
  const hash = await bcrypt.hash(contrasena, 10);
  try {
    await pool.query(
      'INSERT INTO cuenta_estudiante (id_estudiante, correo, contrasena) VALUES (?, ?, ?)',
      [id, correo.trim().toLowerCase(), hash]
    );
    res.status(201).json({ message: 'Cuenta de estudiante creada.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El estudiante ya tiene cuenta o el correo ya está en uso.' });
    }
    throw error;
  }
});

module.exports = router;

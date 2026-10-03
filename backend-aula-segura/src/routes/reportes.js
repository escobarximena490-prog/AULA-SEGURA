const express = require('express');
const pool = require('../db');
const { authRequired, staffOnly } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, staffOnly);

router.get('/resumen', async (_req, res) => {
  const [[totales]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM estudiante WHERE estado = 1) AS estudiantes_activos,
       (SELECT COUNT(*) FROM curso) AS grupos,
       (SELECT COUNT(*) FROM llegada_tarde WHERE fecha = CURDATE()) AS tardanzas_hoy,
       (SELECT COUNT(*) FROM llegada_tarde WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)) AS tardanzas_semana`
  );

  const [semana] = await pool.query(
    `SELECT fecha, COUNT(*) AS total
     FROM llegada_tarde
     WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY fecha
     ORDER BY fecha`
  );

  const [recientes] = await pool.query(
    `SELECT l.id_llegada, l.fecha, l.hora, l.motivo, e.nombre, e.apellido, e.documento, c.nombre_curso
     FROM llegada_tarde l
     INNER JOIN estudiante e ON e.id_estudiante = l.id_estudiante
     INNER JOIN curso c ON c.id_curso = e.id_curso
     ORDER BY l.fecha DESC, l.hora DESC
     LIMIT 8`
  );

  res.json({ totales, semana, recientes });
});

router.get('/por-estudiante', async (req, res) => {
  const { desde, hasta } = req.query;
  const filters = [];
  const params = [];
  if (desde) {
    filters.push('l.fecha >= ?');
    params.push(desde);
  }
  if (hasta) {
    filters.push('l.fecha <= ?');
    params.push(hasta);
  }
  const where = filters.length ? `AND ${filters.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT e.id_estudiante, e.documento, e.nombre, e.apellido, c.nombre_curso,
            COUNT(l.id_llegada) AS total_llegadas_tarde
     FROM estudiante e
     INNER JOIN curso c ON c.id_curso = e.id_curso
     LEFT JOIN llegada_tarde l ON l.id_estudiante = e.id_estudiante ${where}
     GROUP BY e.id_estudiante, e.documento, e.nombre, e.apellido, c.nombre_curso
     ORDER BY total_llegadas_tarde DESC, e.apellido`,
    params
  );
  res.json(rows);
});

module.exports = router;

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const cursoRoutes = require('./routes/cursos');
const estudianteRoutes = require('./routes/estudiantes');
const usuarioRoutes = require('./routes/usuarios');
const llegadaRoutes = require('./routes/llegadas');
const reporteRoutes = require('./routes/reportes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/llegadas', llegadaRoutes);
app.use('/api/reportes', reporteRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

async function ensureSchema() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function seedIfEmpty() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM usuario');
  if (total > 0) return;

  const adminHash = await bcrypt.hash('Admin123!', 10);
  const studentHash = await bcrypt.hash('Estudiante123!', 10);

  const [admin] = await pool.query(
    "INSERT INTO usuario (nombre, rol) VALUES ('Administrador', 'Administrador')"
  );
  await pool.query(
    'INSERT INTO cuenta_usuario (id_usuario, correo, contrasena) VALUES (?, ?, ?)',
    [admin.insertId, 'admin@llegapp.com', adminHash]
  );

  const [encargado] = await pool.query(
    "INSERT INTO usuario (nombre, rol) VALUES ('Portería', 'Encargado')"
  );
  await pool.query(
    'INSERT INTO cuenta_usuario (id_usuario, correo, contrasena) VALUES (?, ?, ?)',
    [encargado.insertId, 'porteria@llegapp.com', await bcrypt.hash('Encargado123!', 10)]
  );

  const courses = [
    ['6A', 6, 'A'],
    ['8B', 8, 'B'],
    ['11A', 11, 'A'],
  ];
  const courseIds = [];
  for (const [nombre, grado, grupo] of courses) {
    const [result] = await pool.query(
      'INSERT INTO curso (nombre_curso, grado, grupo) VALUES (?, ?, ?)',
      [nombre, grado, grupo]
    );
    courseIds.push(result.insertId);
  }

  const students = [
    ['1001234567', 'Juan', 'Pérez', courseIds[2]],
    ['1001234568', 'María', 'Gómez', courseIds[2]],
    ['1001234569', 'Carlos', 'Ruiz', courseIds[1]],
    ['1001234570', 'Laura', 'Díaz', courseIds[1]],
    ['1001234571', 'Sofía', 'Martínez', courseIds[0]],
    ['1001234572', 'Andrés', 'López', courseIds[0]],
  ];
  const studentIds = [];
  for (const [documento, nombre, apellido, idCurso] of students) {
    const [result] = await pool.query(
      'INSERT INTO estudiante (documento, nombre, apellido, id_curso) VALUES (?, ?, ?, ?)',
      [documento, nombre, apellido, idCurso]
    );
    studentIds.push(result.insertId);
  }

  await pool.query(
    'INSERT INTO cuenta_estudiante (id_estudiante, correo, contrasena) VALUES (?, ?, ?)',
    [studentIds[0], 'juan@llegapp.com', studentHash]
  );

  await pool.query(
    `INSERT INTO llegada_tarde (id_estudiante, id_usuario, fecha, hora, motivo, observacion)
     VALUES (?, ?, CURDATE(), CURTIME(), 'Transporte', 'Llegó 15 minutos tarde')`,
    [studentIds[0], admin.insertId]
  );
}

let prepared;
async function prepare() {
  if (!prepared) {
    prepared = (async () => {
      await ensureSchema();
      await seedIfEmpty();
    })();
  }
  await prepared;
}

async function start() {
  await prepare();
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    console.log(`API AULA SEGURA en http://localhost:${port}`);
  });
}

module.exports = { app, prepare, start };

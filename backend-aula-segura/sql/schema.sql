CREATE TABLE IF NOT EXISTS curso (
  id_curso INT AUTO_INCREMENT PRIMARY KEY,
  nombre_curso VARCHAR(50) NOT NULL,
  grado INT NOT NULL,
  grupo VARCHAR(10) NOT NULL,
  UNIQUE KEY uq_curso_grado_grupo (grado, grupo)
);

CREATE TABLE IF NOT EXISTS estudiante (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  documento VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  id_curso INT NOT NULL,
  estado BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_curso) REFERENCES curso(id_curso)
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(30) NOT NULL,
  estado BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cuenta_usuario (
  id_cuenta_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  estado BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS cuenta_estudiante (
  id_cuenta_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL UNIQUE,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  estado BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante)
);

CREATE TABLE IF NOT EXISTS llegada_tarde (
  id_llegada INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo VARCHAR(255),
  observacion TEXT,
  UNIQUE KEY uq_llegada_estudiante_fecha (id_estudiante, fecha),
  FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

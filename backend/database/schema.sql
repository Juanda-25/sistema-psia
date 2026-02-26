CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(100) NOT NULL UNIQUE,
  clave           VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(100) NOT NULL,
  rol             VARCHAR(20)  NOT NULL DEFAULT 'estudiante',
  creado_en       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfil_usuario (
  id             SERIAL PRIMARY KEY,
  usuario_id     INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  imagen_perfil  VARCHAR(255) DEFAULT NULL,
  hobbies        TEXT         DEFAULT NULL,
  contacto       VARCHAR(20)  DEFAULT NULL,
  semestre       VARCHAR(50)  DEFAULT NULL,
  actualizado_en TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rubricas (
  id          SERIAL PRIMARY KEY,
  profesor_id INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT         DEFAULT NULL,
  creado_en   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS criterios (
  id          SERIAL PRIMARY KEY,
  rubrica_id  INT          NOT NULL REFERENCES rubricas(id) ON DELETE CASCADE,
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT         DEFAULT NULL,
  puntaje_max NUMERIC(5,2) NOT NULL DEFAULT 10.00
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id             SERIAL PRIMARY KEY,
  rubrica_id     INT          NOT NULL REFERENCES rubricas(id),
  estudiante_id  INT          NOT NULL REFERENCES usuarios(id),
  profesor_id    INT          NOT NULL REFERENCES usuarios(id),
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta_archivo   VARCHAR(500) NOT NULL,
  puntaje_total  NUMERIC(5,2) DEFAULT NULL,
  comentario     TEXT         DEFAULT NULL,
  creado_en      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calificaciones_criterio (
  id             SERIAL PRIMARY KEY,
  evaluacion_id  INT          NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  criterio_id    INT          NOT NULL REFERENCES criterios(id),
  puntaje        NUMERIC(5,2) NOT NULL DEFAULT 0,
  observacion    TEXT         DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_evaluaciones_estudiante ON evaluaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_profesor   ON evaluaciones(profesor_id);
CREATE INDEX IF NOT EXISTS idx_criterios_rubrica       ON criterios(rubrica_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_eval     ON calificaciones_criterio(evaluacion_id);
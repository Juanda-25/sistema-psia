const pool = require('../../config/db');
const { calificarConIA } = require('./ia.service');

// Convierte puntaje sobre 100 a escala colombiana 1.0 - 5.0
const convertirEscala = (puntajeSobre100) => {
  const nota = 1 + (parseFloat(puntajeSobre100) / 100) * 4;
  return parseFloat(nota.toFixed(1));
};

const getRubricas = async () => {
  const result = await pool.query(
    `SELECT r.id, r.nombre, r.descripcion, r.creado_en,
            u.nombre_completo AS profesor
     FROM rubricas r
     JOIN usuarios u ON u.id = r.profesor_id
     ORDER BY r.creado_en DESC`
  );
  return result.rows;
};

const getRubricaById = async (id) => {
  const rubrica = await pool.query(
    `SELECT r.*, u.nombre_completo AS profesor
     FROM rubricas r JOIN usuarios u ON u.id = r.profesor_id
     WHERE r.id = $1`,
    [id]
  );
  if (!rubrica.rows[0]) throw new Error('Rúbrica no encontrada');

  const criterios = await pool.query(
    'SELECT * FROM criterios WHERE rubrica_id = $1 ORDER BY id',
    [id]
  );

  return { ...rubrica.rows[0], criterios: criterios.rows };
};

const crearRubrica = async (profesorId, { nombre, descripcion, criterios }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const rubResult = await client.query(
      `INSERT INTO rubricas (profesor_id, nombre, descripcion)
       VALUES ($1, $2, $3) RETURNING *`,
      [profesorId, nombre, descripcion]
    );
    const rubrica = rubResult.rows[0];

    for (const c of criterios) {
      await client.query(
        `INSERT INTO criterios (rubrica_id, nombre, descripcion, puntaje_max)
         VALUES ($1, $2, $3, $4)`,
        [rubrica.id, c.nombre, c.descripcion || null, c.puntaje_max]
      );
    }

    await client.query('COMMIT');
    return await getRubricaById(rubrica.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const buscarEstudiantes = async (nombre) => {
  const result = await pool.query(
    `SELECT id, nombre_completo, email
     FROM usuarios
     WHERE rol = 'estudiante'
     AND nombre_completo ILIKE $1
     ORDER BY nombre_completo
     LIMIT 10`,
    [`%${nombre}%`]
  );
  return result.rows;
};

// Estudiante sube documento → IA califica automáticamente
const evaluarConIA = async (estudianteId, { rubrica_id, nombre_archivo, ruta_archivo }) => {
  // Obtener criterios de la rúbrica
  const rubrica = await getRubricaById(rubrica_id);
  if (!rubrica) throw new Error('Rúbrica no encontrada');

  // Llamar a la IA para calificar
  const resultadoIA = await calificarConIA(ruta_archivo, rubrica.criterios);

  // Calcular puntaje total
  let sumObtenido = 0;
  let sumMax = 0;
  for (const c of rubrica.criterios) {
    sumMax += parseFloat(c.puntaje_max);
  }
  for (const cal of resultadoIA.calificaciones) {
    sumObtenido += parseFloat(cal.puntaje);
  }

  const puntajeSobre100 = sumMax > 0 ? (sumObtenido / sumMax) * 100 : 0;
  const nota_final = convertirEscala(puntajeSobre100);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Crear evaluación (sin profesor_id por ahora, lo asigna el sistema)
    const evalResult = await client.query(
      `INSERT INTO evaluaciones
         (rubrica_id, estudiante_id, profesor_id, nombre_archivo, ruta_archivo, puntaje_total, comentario)
       VALUES ($1, $2, $2, $3, $4, $5, $6) RETURNING *`,
      [rubrica_id, estudianteId, nombre_archivo, ruta_archivo, nota_final, resultadoIA.comentario_general]
    );
    const evaluacion = evalResult.rows[0];

    // Guardar calificaciones por criterio
    for (const cal of resultadoIA.calificaciones) {
      await client.query(
        `INSERT INTO calificaciones_criterio (evaluacion_id, criterio_id, puntaje, observacion)
         VALUES ($1, $2, $3, $4)`,
        [evaluacion.id, cal.criterio_id, cal.puntaje, cal.observacion || null]
      );
    }

    await client.query('COMMIT');
    return await getEvaluacionById(evaluacion.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Profesor ajusta la nota de una evaluación
const ajustarNota = async (profesorId, evaluacionId, { nota_profesor, comentario_profesor }) => {
  const result = await pool.query(
    `UPDATE evaluaciones
     SET puntaje_total = $1,
         comentario = $2,
         profesor_id = $3
     WHERE id = $4
     RETURNING *`,
    [nota_profesor, comentario_profesor, profesorId, evaluacionId]
  );
  if (!result.rows[0]) throw new Error('Evaluación no encontrada');
  return await getEvaluacionById(evaluacionId);
};

const getEvaluacionById = async (id) => {
  const ev = await pool.query(
    `SELECT e.*,
            u_est.nombre_completo AS estudiante,
            u_prof.nombre_completo AS profesor,
            r.nombre AS rubrica_nombre
     FROM evaluaciones e
     JOIN usuarios u_est  ON u_est.id  = e.estudiante_id
     JOIN usuarios u_prof ON u_prof.id = e.profesor_id
     JOIN rubricas r       ON r.id     = e.rubrica_id
     WHERE e.id = $1`,
    [id]
  );
  if (!ev.rows[0]) throw new Error('Evaluación no encontrada');

  const cals = await pool.query(
    `SELECT cc.puntaje, cc.observacion, c.nombre AS criterio, c.puntaje_max
     FROM calificaciones_criterio cc
     JOIN criterios c ON c.id = cc.criterio_id
     WHERE cc.evaluacion_id = $1`,
    [id]
  );

  return { ...ev.rows[0], detalle: cals.rows };
};

const getEvaluacionesByEstudiante = async (estudianteId) => {
  const result = await pool.query(
    `SELECT e.id, e.nombre_archivo, e.puntaje_total, e.creado_en,
            r.nombre AS rubrica, u.nombre_completo AS profesor
     FROM evaluaciones e
     JOIN rubricas r ON r.id = e.rubrica_id
     JOIN usuarios u ON u.id = e.profesor_id
     WHERE e.estudiante_id = $1
     ORDER BY e.creado_en DESC`,
    [estudianteId]
  );
  return result.rows;
};

// Profesor ve todos los documentos subidos
const getTodasEvaluaciones = async () => {
  const result = await pool.query(
    `SELECT e.id, e.nombre_archivo, e.puntaje_total, e.creado_en,
            u_est.nombre_completo AS estudiante,
            r.nombre AS rubrica
     FROM evaluaciones e
     JOIN usuarios u_est ON u_est.id = e.estudiante_id
     JOIN rubricas r     ON r.id     = e.rubrica_id
     ORDER BY e.creado_en DESC`
  );
  return result.rows;
};

module.exports = {
  getRubricas,
  getRubricaById,
  crearRubrica,
  buscarEstudiantes,
  evaluarConIA,
  ajustarNota,
  getEvaluacionById,
  getEvaluacionesByEstudiante,
  getTodasEvaluaciones,
};
const pool = require('../../config/db');

// Obtener todos los grupos con conteo de miembros
const getGrupos = async () => {
  const result = await pool.query(
    `SELECT g.*,
            COUNT(gm.id) AS total_miembros,
            g.max_integrantes - COUNT(gm.id) AS cupos_disponibles
     FROM grupos g
     LEFT JOIN grupo_miembros gm ON gm.grupo_id = g.id
     GROUP BY g.id
     ORDER BY g.creado_en DESC`
  );
  return result.rows;
};

// Recomienda grupos según semestre y hobbies del usuario
const getGruposRecomendados = async (usuarioId) => {
  // Obtener perfil del usuario
  const perfilResult = await pool.query(
    `SELECT u.nombre_completo, p.semestre, p.hobbies
     FROM usuarios u
     LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
     WHERE u.id = $1`,
    [usuarioId]
  );
  const perfil = perfilResult.rows[0];

  // Obtener grupos donde el usuario NO está y tienen cupos
  const result = await pool.query(
    `SELECT g.*,
            COUNT(gm.id) AS total_miembros,
            g.max_integrantes - COUNT(gm.id) AS cupos_disponibles
     FROM grupos g
     LEFT JOIN grupo_miembros gm ON gm.grupo_id = g.id
     WHERE g.id NOT IN (
       SELECT grupo_id FROM grupo_miembros WHERE usuario_id = $1
     )
     GROUP BY g.id
     HAVING COUNT(gm.id) < g.max_integrantes`,
    [usuarioId]
  );

  const hobbiesUsuario = (perfil?.hobbies || '').toLowerCase().split(/[,\s]+/).filter(Boolean);
  const semestreUsuario = (perfil?.semestre || '').toLowerCase().trim();

  // Calcular score de recomendación para cada grupo
  const gruposConScore = result.rows.map(grupo => {
    let score = 0;

    // +3 puntos si el semestre coincide
    if (semestreUsuario && grupo.semestre &&
        grupo.semestre.toLowerCase().includes(semestreUsuario)) {
      score += 3;
    }

    // +2 puntos por cada hobbie que coincida con los temas del grupo
    if (hobbiesUsuario.length > 0 && grupo.temas) {
      const temasGrupo = grupo.temas.toLowerCase();
      hobbiesUsuario.forEach(hobbie => {
        if (hobbie.length > 2 && temasGrupo.includes(hobbie)) {
          score += 2;
        }
      });
    }

    // +1 punto por cupos disponibles (más cupos = más recomendado)
    score += Math.min(parseInt(grupo.cupos_disponibles), 2);

    return { ...grupo, score };
  });

  // Ordenar por score descendente
  gruposConScore.sort((a, b) => b.score - a.score);

  return {
    perfil,
    grupos: gruposConScore
  };
};

// Unirse a un grupo
const unirseAGrupo = async (usuarioId, grupoId) => {
  // Verificar que el grupo tiene cupos
  const cuposResult = await pool.query(
    `SELECT g.max_integrantes - COUNT(gm.id) AS cupos
     FROM grupos g
     LEFT JOIN grupo_miembros gm ON gm.grupo_id = g.id
     WHERE g.id = $1
     GROUP BY g.id`,
    [grupoId]
  );

  if (!cuposResult.rows[0]) throw new Error('Grupo no encontrado');
  if (parseInt(cuposResult.rows[0].cupos) <= 0) throw new Error('El grupo ya está completo');

  // Verificar que no está ya en el grupo
  const yaEstaResult = await pool.query(
    'SELECT id FROM grupo_miembros WHERE grupo_id = $1 AND usuario_id = $2',
    [grupoId, usuarioId]
  );
  if (yaEstaResult.rows.length > 0) throw new Error('Ya eres miembro de este grupo');

  await pool.query(
    'INSERT INTO grupo_miembros (grupo_id, usuario_id) VALUES ($1, $2)',
    [grupoId, usuarioId]
  );

  return await getGrupoById(grupoId, usuarioId);
};

// Salirse de un grupo
const salirDeGrupo = async (usuarioId, grupoId) => {
  const result = await pool.query(
    'DELETE FROM grupo_miembros WHERE grupo_id = $1 AND usuario_id = $2 RETURNING id',
    [grupoId, usuarioId]
  );
  if (!result.rows[0]) throw new Error('No eres miembro de este grupo');
  return { message: 'Saliste del grupo correctamente' };
};

// Obtener detalle de un grupo con sus miembros
const getGrupoById = async (grupoId, usuarioId) => {
  const grupoResult = await pool.query(
    `SELECT g.*,
            COUNT(gm.id) AS total_miembros,
            g.max_integrantes - COUNT(gm.id) AS cupos_disponibles
     FROM grupos g
     LEFT JOIN grupo_miembros gm ON gm.grupo_id = g.id
     WHERE g.id = $1
     GROUP BY g.id`,
    [grupoId]
  );
  if (!grupoResult.rows[0]) throw new Error('Grupo no encontrado');

  const miembrosResult = await pool.query(
    `SELECT u.id, u.nombre_completo, u.email, p.semestre
     FROM grupo_miembros gm
     JOIN usuarios u ON u.id = gm.usuario_id
     LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
     WHERE gm.grupo_id = $1`,
    [grupoId]
  );

  const esMiembro = usuarioId
    ? miembrosResult.rows.some(m => m.id === usuarioId)
    : false;

  return {
    ...grupoResult.rows[0],
    miembros: miembrosResult.rows,
    es_miembro: esMiembro
  };
};

// Mis grupos
const getMisGrupos = async (usuarioId) => {
  const result = await pool.query(
    `SELECT g.*,
            COUNT(gm.id) AS total_miembros,
            g.max_integrantes - COUNT(gm.id) AS cupos_disponibles
     FROM grupos g
     JOIN grupo_miembros gm ON gm.grupo_id = g.id
     LEFT JOIN grupo_miembros gm2 ON gm2.grupo_id = g.id
     WHERE gm.usuario_id = $1
     GROUP BY g.id
     ORDER BY g.creado_en DESC`,
    [usuarioId]
  );
  return result.rows;
};

// Profesor crea grupo
const crearGrupo = async ({ nombre, descripcion, semestre, temas, max_integrantes = 5 }) => {
  const result = await pool.query(
    `INSERT INTO grupos (nombre, descripcion, semestre, temas, max_integrantes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre, descripcion, semestre, temas, max_integrantes]
  );
  return result.rows[0];
};

module.exports = {
  getGrupos,
  getGruposRecomendados,
  unirseAGrupo,
  salirDeGrupo,
  getGrupoById,
  getMisGrupos,
  crearGrupo,
};
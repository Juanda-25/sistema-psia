const pool = require('../../config/db');

const getProfile = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.email, u.nombre_completo, u.rol, u.creado_en,
            p.imagen_perfil, p.hobbies, p.contacto, p.semestre
     FROM usuarios u
     LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  if (!result.rows[0]) throw new Error('Usuario no encontrado');
  return result.rows[0];
};

const updateProfile = async (userId, { hobbies, contacto, semestre, imagen_perfil }) => {
  const result = await pool.query(
    `UPDATE perfil_usuario
     SET hobbies = $1, contacto = $2, semestre = $3,
         imagen_perfil = COALESCE($4, imagen_perfil),
         actualizado_en = NOW()
     WHERE usuario_id = $5
     RETURNING *`,
    [hobbies, contacto, semestre, imagen_perfil, userId]
  );
  return result.rows[0];
};

module.exports = { getProfile, updateProfile };
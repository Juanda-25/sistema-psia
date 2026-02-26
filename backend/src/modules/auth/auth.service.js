const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async ({ nombre_completo, email, clave, rol = 'estudiante' }) => {
  const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('El correo ya está registrado');
  }

  const hash = await bcrypt.hash(clave, 10);
  const result = await pool.query(
    `INSERT INTO usuarios (nombre_completo, email, clave, rol)
     VALUES ($1, $2, $3, $4) RETURNING id, email, nombre_completo, rol`,
    [nombre_completo, email, hash, rol]
  );

  await pool.query(
    'INSERT INTO perfil_usuario (usuario_id) VALUES ($1)',
    [result.rows[0].id]
  );

  return result.rows[0];
};

const login = async ({ email, clave }) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) throw new Error('Correo o contraseña incorrectos');

  const match = await bcrypt.compare(clave, user.clave);
  if (!match) throw new Error('Correo o contraseña incorrectos');

  const token = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre_completo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user.id, email: user.email, nombre_completo: user.nombre_completo, rol: user.rol }
  };
};

module.exports = { register, login };
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Probar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅ Conectado a PostgreSQL');
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err.message);
});

module.exports = pool;
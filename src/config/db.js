const { Pool } = require('pg');
require('dotenv').config();

// ✅ CORRECCIÓN ERROR 1 (INFRAESTRUCTURA): El string de conexión usaba 'localhost'
// pero dentro de Docker los contenedores se comunican por nombre de servicio.
// Se corrigió a 'db_futbol' que es el nombre del contenedor de PostgreSQL.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@db_futbol:5432/futbol_db';

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de Postgres', err);
});

module.exports = pool;

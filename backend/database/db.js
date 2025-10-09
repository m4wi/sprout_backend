import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rygreen',
  password: 'tu_contraseña',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar:', err));

// 🔁 Exportar el pool para usarlo en otros archivos
export default pool;

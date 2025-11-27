import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_geWhr60YHExC@ep-fragrant-resonance-ac3k1ssp-pooler.sa-east-1.aws.neon.tech/sprout?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Necesario en algunos entornos con Neon (como Vercel o local con cert SSL auto-firmado)
  }
});

// Opcional: prueba la conexión al iniciar
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL (Neon)'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err.stack));

export default pool;
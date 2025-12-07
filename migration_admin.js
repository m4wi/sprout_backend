import pool from './src/database/db.js';

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        await client.query('BEGIN');

        // 1. Add active column if it doesn't exist
        console.log('Adding active column to users table...');
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
    `);

        // 2. Clean up invalid user_type values
        console.log('Cleaning up invalid user_type values...');
        await client.query(`
        UPDATE users 
        SET user_type = 'ciudadano' 
        WHERE user_type NOT IN ('ciudadano', 'recolector', 'centro', 'admin') 
           OR user_type IS NULL;
    `);

        // 3. Update user_type check constraint
        console.log('Updating user_type check constraint...');

        try {
            await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_type_check');
            await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tipo_check');
            await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS usuarios_tipo_check');
        } catch (e) {
            console.log('Error dropping constraint:', e.message);
        }

        console.log('Adding new constraint...');
        await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_user_type_check 
      CHECK (user_type IN ('ciudadano', 'recolector', 'centro', 'admin'));
    `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();

import pool from './src/database/db.js';

async function inspect() {
    const client = await pool.connect();
    try {
        console.log('Inspecting users table...');

        // Get columns
        const resCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
        console.log('Columns:', resCols.rows);

        // Get sample data (first 10 rows)
        const resData = await client.query('SELECT * FROM users LIMIT 10');
        console.log('Sample Data:', resData.rows);

    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

inspect();

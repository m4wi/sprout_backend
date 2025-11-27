import pool from '../database/db.js';

export class Category {
    static async getAll() {
        const result = await pool.query(
            'SELECT * FROM categories WHERE recyclable = true ORDER BY name'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM categories WHERE id_category = $1',
            [id]
        );
        return result.rows[0] || null;
    }
}
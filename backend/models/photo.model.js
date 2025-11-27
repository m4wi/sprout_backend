import pool from '../database/db.js';

export class PhotoModel {
    static async getByGreenpoint(id_greenpoint) {
        const query = `
            SELECT id_photo, id_greenpoint, url, created_at, updated_at
            FROM photos
            WHERE id_greenpoint = $1
            ORDER BY created_at DESC`;
        const result = await pool.query(query, [id_greenpoint]);
        return result.rows;
    }

    static async create(id_greenpoint, url) {
        const query = `
            INSERT INTO photos (id_greenpoint, url)
            VALUES ($1, $2)
            RETURNING *`;
        const result = await pool.query(query, [id_greenpoint, url]);
        return result.rows[0];
    }
}

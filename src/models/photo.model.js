import pool from '../database/db.js';

export class PhotoModel {
    static async getByGreenpoint(id_greenpoint) {
        const query = `
            SELECT id_greenpoint_image, id_greenpoint, image_url, created_at, updated_at
            FROM greenpoint_images
            WHERE id_greenpoint = $1
            ORDER BY created_at DESC`;
        const result = await pool.query(query, [id_greenpoint]);
        return result.rows;
    }

    static async create(id_greenpoint, url) {
        const query = `
            INSERT INTO greenpoint_images (id_greenpoint, image_url)
            VALUES ($1, $2)
            RETURNING *`;
        const result = await pool.query(query, [id_greenpoint, url]);
        return result.rows[0];
    }
}

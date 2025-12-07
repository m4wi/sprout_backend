import pool from '../database/db.js';

export class GreenPointReportModel {
    static async create(reportData) {
        const { id_user, id_greenpoint, type, message } = reportData;
        const query = `
            INSERT INTO greenpoints_report (id_user, id_greenpoint, type, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [id_user, id_greenpoint, type || 'other', message];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async getAll() {
        const result = await pool.query(
            `SELECT r.*, u.username, u.email 
             FROM greenpoints_report r
             JOIN users u ON r.id_user = u.id_user
             ORDER BY r.created_at DESC`
        );
        return result.rows;
    }

    static async delete(id) {
        const result = await pool.query(
            'DELETE FROM greenpoints_report WHERE id_report = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}

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
}

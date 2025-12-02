import pool from '../database/db.js';

export class NotificationModel {
    /**
     * Crea una nueva notificación
     */
    static async create({ id_user, message, type = 'info', reference_id = null, priority = 0 }) {
        const query = `
            INSERT INTO notifications (id_user, message, type, reference_id, priority)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [id_user, message, type, reference_id, priority];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Obtiene todas las notificaciones de un usuario
     */
    static async findByUser(id_user, limit = 20, offset = 0) {
        const query = `
            SELECT * FROM notifications
            WHERE id_user = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [id_user, limit, offset]);
        return result.rows;
    }

    /**
     * Marca una notificación como leída
     */
    static async markAsRead(id_notification, id_user) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id_notification = $1 AND id_user = $2
            RETURNING *
        `;
        const result = await pool.query(query, [id_notification, id_user]);
        return result.rows[0];
    }

    /**
     * Marca todas las notificaciones de un usuario como leídas
     */
    static async markAllAsRead(id_user) {
        const query = `
            UPDATE notifications
            SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1 AND is_read = FALSE
            RETURNING *
        `;
        const result = await pool.query(query, [id_user]);
        return result.rows;
    }

    /**
     * Elimina una notificación
     */
    static async delete(id_notification, id_user) {
        const query = `
            DELETE FROM notifications
            WHERE id_notification = $1 AND id_user = $2
            RETURNING *
        `;
        const result = await pool.query(query, [id_notification, id_user]);
        return result.rows[0];
    }

    /**
     * Cuenta las notificaciones no leídas
     */
    static async countUnread(id_user) {
        const query = `
            SELECT COUNT(*) as count FROM notifications
            WHERE id_user = $1 AND is_read = FALSE
        `;
        const result = await pool.query(query, [id_user]);
        return parseInt(result.rows[0].count, 10);
    }
}

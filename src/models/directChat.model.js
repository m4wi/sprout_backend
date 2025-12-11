import pool from '../database/db.js';

export class DirectChatModel {

    /**
     * Obtiene o crea un chat entre dos usuarios
     * @param {number} user1_id
     * @param {number} user2_id
     */
    static async getOrCreateChat(user1_id, user2_id) {
        // Buscar chat existente (en cualquier dirección)
        const existing = await pool.query(
            `SELECT * FROM direct_chats 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)`,
            [user1_id, user2_id]
        );

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        // Crear nuevo chat
        // Definimos arbitrariamente quién es sender/receiver al crear, no importa el orden
        const result = await pool.query(
            `INSERT INTO direct_chats (sender_id, receiver_id)
             VALUES ($1, $2)
             RETURNING *`,
            [user1_id, user2_id]
        );
        return result.rows[0];
    }

    /**
     * Obtiene mensajes de un chat directo
     * @param {number} chatId
     * @param {number} limit
     */
    static async getMessages(chatId, limit = 50) {
        const result = await pool.query(
            `SELECT 
                m.*,
                u.name as sender_name,
                u.lastname as sender_lastname,
                u.avatar_url as sender_avatar
             FROM direct_chat_messages m
             JOIN users u ON m.sender_id = u.id_user
             WHERE m.id_chat = $1
             ORDER BY m.created_at ASC
             LIMIT $2`,
            [chatId, limit]
        );
        return result.rows;
    }

    /**
     * Envía un mensaje en un chat directo
     * @param {number} chatId
     * @param {number} senderId
     * @param {string} content
     */
    static async sendMessage(chatId, senderId, content) {
        const result = await pool.query(
            `INSERT INTO direct_chat_messages (id_chat, sender_id, content, status)
             VALUES ($1, $2, $3, 'sent')
             RETURNING *`,
            [chatId, senderId, content]
        );
        return result.rows[0];
    }
}

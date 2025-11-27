import pool from '../database/db.js';

export class GreenpointChat {

    /**
     * Obtiene el chat asociado a un greenpoint, incluyendo sus mensajes
     * @param {number} greenpoint_id
     * @param {number} limit - (opcional) número de mensajes a cargar (por defecto 50)
     * @returns {Object|null} Chat con mensajes, o null si no existe
     */
    static async getByGreenPointId(greenpoint_id, limit = 50) {
        // 1. Obtener el chat
        const chatResult = await pool.query(
            `SELECT 
                id_chat,
                sender_id,
                receiver_id,
                id_greenpoint,
                created_at,
                updated_at
            FROM greenpoint_chats
            WHERE id_greenpoint = $1`,
            [greenpoint_id]
        );

        if (chatResult.rows.length === 0) {
            return null;
        }

        const chat = chatResult.rows[0];

        // 2. Obtener los mensajes del chat (ordenados cronológicamente)
        const messagesResult = await pool.query(
            `SELECT 
                id_message,
                id_chat,
                sender_id,
                content,
                status,
                created_at,
                updated_at
            FROM greenpoint_chat_messages
            WHERE id_chat = $1
            ORDER BY created_at ASC
            LIMIT $2`,
            [chat.id_chat, limit]
        );

        return {
            ...chat,
            messages: messagesResult.rows
        };
    }

    /**
     * (Opcional) Crea un chat para un greenpoint
     * @param {number} greenpoint_id
     * @param {number} citizen_id
     * @param {number} collector_id
     * @returns {Object} Chat creado
     */
    static async createChat(greenpoint_id, citizen_id, collector_id) {
        // Asegurar que citizen_id y collector_id sean válidos (opcional: validar en controlador)

        const result = await pool.query(
            `INSERT INTO greenpoint_chats (sender_id, receiver_id, id_greenpoint)
        VALUES ($1, $2, $3)
        RETURNING *`,
            [citizen_id, collector_id, greenpoint_id]
        );

        return result.rows[0];
    }

    /**
     * Inserta un nuevo mensaje en un chat
     * @param {number} chat_id
     * @param {number} sender_id
     * @param {string} content
     * @returns {Object} Mensaje creado
     */
    static async insertMessage(chat_id, sender_id, content) {
        if (!content || content.trim() === '') {
            throw new Error('El contenido del mensaje no puede estar vacío');
        }

        const result = await pool.query(
            `INSERT INTO greenpoint_chat_messages (id_chat, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [chat_id, sender_id, content.trim()]
        );
        return result.rows[0];
    }

    /**
     * Actualiza el contenido de un mensaje (solo el remitente puede editarlo)
     * @param {number} message_id
     * @param {number} sender_id
     * @param {string} content
     * @returns {Object|null} Mensaje actualizado o null si no existe
     */
    static async updateMessage(message_id, sender_id, content) {
        if (!content || content.trim() === '') {
            throw new Error('El contenido del mensaje no puede estar vacío');
        }

        const result = await pool.query(
            `UPDATE greenpoint_chat_messages
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id_message = $2 AND sender_id = $3
       RETURNING *`,
            [content.trim(), message_id, sender_id]
        );
        return result.rows[0] || null;
    }

    /**
     * Elimina un mensaje (solo el remitente puede eliminarlo)
     * @param {number} message_id
     * @param {number} sender_id
     * @returns {boolean} True si se eliminó, false si no existe o no tiene permiso
     */
    static async deleteMessage(message_id, sender_id) {
        const result = await pool.query(
            `DELETE FROM greenpoint_chat_messages
       WHERE id_message = $1 AND sender_id = $2`,
            [message_id, sender_id]
        );
        return result.rowCount > 0;
    }

    /**
   * (Auxiliar) Verifica que un usuario pertenezca a un chat
   */
    static async isUserInChat(chat_id, user_id) {
        const result = await pool.query(
            `SELECT 1
       FROM greenpoint_chats
       WHERE id_chat = $1 AND (sender_id = $2 OR receiver_id = $2)`,
            [chat_id, user_id]
        );
        return result.rows.length > 0;
    }
}
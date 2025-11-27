import pool from '../database/db.js';

export class GreenpointCommentModel {
    /**
     * Obtiene todos los comentarios de un greenpoint
     * @param {number} id_greenpoint - ID del greenpoint
     * @returns {Array} Array de comentarios con información del usuario
     */
    static async getByGreenpoint(id_greenpoint) {
        const query = `
            SELECT 
                c.id_comment,
                c.id_greenpoint,
                c.id_user,
                c.content,
                c.created_at,
                c.updated_at,
                u.username,
                u.name,
                u.lastname,
                u.avatar_url
            FROM greenpoint_comments c
            JOIN users u ON c.id_user = u.id_user
            WHERE c.id_greenpoint = $1
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [id_greenpoint]);
        return result.rows;
    }

    /**
     * Obtiene un comentario por su ID
     * @param {number} id_comment - ID del comentario
     * @returns {Object|null} Comentario con información del usuario o null
     */
    static async findById(id_comment) {
        const query = `
            SELECT 
                c.id_comment,
                c.id_greenpoint,
                c.id_user,
                c.content,
                c.created_at,
                c.updated_at,
                u.username,
                u.name,
                u.lastname,
                u.avatar_url
            FROM greenpoint_comments c
            JOIN users u ON c.id_user = u.id_user
            WHERE c.id_comment = $1
        `;
        const result = await pool.query(query, [id_comment]);
        return result.rows[0] || null;
    }

    /**
     * Crea un nuevo comentario
     * @param {Object} commentData - Datos del comentario
     * @param {number} commentData.id_greenpoint - ID del greenpoint
     * @param {number} commentData.id_user - ID del usuario
     * @param {string} commentData.content - Contenido del comentario
     * @returns {Object} Comentario creado
     */
    static async create(commentData) {
        const { id_greenpoint, id_user, content } = commentData;

        if (!id_greenpoint || !id_user || !content || content.trim() === '') {
            throw new Error('Faltan datos requeridos: id_greenpoint, id_user y content');
        }

        const query = `
            INSERT INTO greenpoint_comments (id_greenpoint, id_user, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [id_greenpoint, id_user, content.trim()]);
        return result.rows[0];
    }

    /**
     * Actualiza un comentario
     * @param {number} id_comment - ID del comentario
     * @param {string} content - Nuevo contenido
     * @returns {Object|null} Comentario actualizado o null
     */
    static async update(id_comment, content) {
        if (!content || content.trim() === '') {
            throw new Error('El contenido del comentario no puede estar vacío');
        }

        const query = `
            UPDATE greenpoint_comments
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id_comment = $2
            RETURNING *
        `;
        const result = await pool.query(query, [content.trim(), id_comment]);
        return result.rows[0] || null;
    }

    /**
     * Elimina un comentario
     * @param {number} id_comment - ID del comentario
     * @returns {Object|null} Comentario eliminado o null
     */
    static async delete(id_comment) {
        const query = `
            DELETE FROM greenpoint_comments
            WHERE id_comment = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id_comment]);
        return result.rows[0] || null;
    }

    /**
     * Obtiene todos los comentarios de un usuario
     * @param {number} id_user - ID del usuario
     * @returns {Array} Array de comentarios del usuario
     */
    static async getByUser(id_user) {
        const query = `
            SELECT 
                c.id_comment,
                c.id_greenpoint,
                c.id_user,
                c.content,
                c.created_at,
                c.updated_at,
                g.description AS greenpoint_description
            FROM greenpoint_comments c
            JOIN greenpoints g ON c.id_greenpoint = g.id_greenpoint
            WHERE c.id_user = $1
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [id_user]);
        return result.rows;
    }

    /**
     * Verifica si un comentario pertenece a un usuario
     * @param {number} id_comment - ID del comentario
     * @param {number} id_user - ID del usuario
     * @returns {boolean} true si el comentario pertenece al usuario
     */
    static async belongsToUser(id_comment, id_user) {
        const query = `
            SELECT id_comment
            FROM greenpoint_comments
            WHERE id_comment = $1 AND id_user = $2
        `;
        const result = await pool.query(query, [id_comment, id_user]);
        return result.rows.length > 0;
    }
}


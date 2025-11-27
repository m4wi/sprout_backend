import { GreenpointCommentModel } from '../models/greenpointComment.model.js';
import { GreenPointModel } from '../models/greenpoint.model.js';

export class GreenpointCommentController {
    /**
     * GET /greenpoints/:id/comments
     * Obtiene todos los comentarios de un greenpoint
     */
    static async getCommentsByGreenpoint(req, res) {
        try {
            const { id } = req.params;
            const greenpointId = parseInt(id, 10);

            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint exista
            const greenpoint = await GreenPointModel.findById(greenpointId);
            if (!greenpoint) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            const comments = await GreenpointCommentModel.getByGreenpoint(greenpointId);
            res.json({
                greenpoint_id: greenpointId,
                comments_count: comments.length,
                comments
            });
        } catch (err) {
            console.error('Error al obtener comentarios:', err);
            res.status(500).json({ error: 'Error al cargar los comentarios' });
        }
    }

    /**
     * GET /comments/:id
     * Obtiene un comentario por su ID
     */
    static async getCommentById(req, res) {
        try {
            const { id } = req.params;
            const commentId = parseInt(id, 10);

            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({ error: 'ID de comentario inválido' });
            }

            const comment = await GreenpointCommentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }

            res.json(comment);
        } catch (err) {
            console.error('Error al obtener comentario:', err);
            res.status(500).json({ error: 'Error al cargar el comentario' });
        }
    }

    /**
     * POST /greenpoints/:id/comments
     * Crea un nuevo comentario en un greenpoint
     * Requiere autenticación
     */
    static async createComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.userId; // Del middleware authenticateToken
            console.log(userId)
            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. Debes estar autenticado' });
            }

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Validar contenido
            if (!content || typeof content !== 'string' || content.trim() === '') {
                return res.status(400).json({ error: 'El contenido del comentario es requerido' });
            }

            // Verificar que el greenpoint exista
            const greenpoint = await GreenPointModel.findById(greenpointId);
            if (!greenpoint) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            // Crear el comentario
            const newComment = await GreenpointCommentModel.create({
                id_greenpoint: greenpointId,
                id_user: userId,
                content
            });

            // Obtener el comentario con información del usuario
            const commentWithUser = await GreenpointCommentModel.findById(newComment.id_comment);

            res.status(201).json({
                message: 'Comentario creado exitosamente',
                comment: commentWithUser
            });
        } catch (err) {
            console.error('Error al crear comentario:', err);
            if (err.message.includes('Faltan datos')) {
                return res.status(400).json({ error: err.message });
            }
            if (err.code === '23503') {
                return res.status(400).json({ error: 'Usuario o greenpoint no válidos' });
            }
            res.status(500).json({ error: 'Error al crear el comentario' });
        }
    }

    /**
     * PATCH /comments/:id
     * Actualiza un comentario
     * Requiere autenticación y que el comentario pertenezca al usuario
     */
    static async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.userId; // Del middleware authenticateToken

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. Debes estar autenticado' });
            }

            const commentId = parseInt(id, 10);
            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({ error: 'ID de comentario inválido' });
            }

            // Validar contenido
            if (!content || typeof content !== 'string' || content.trim() === '') {
                return res.status(400).json({ error: 'El contenido del comentario es requerido' });
            }

            // Verificar que el comentario exista y pertenezca al usuario
            const comment = await GreenpointCommentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }

            const belongsToUser = await GreenpointCommentModel.belongsToUser(commentId, userId);
            if (!belongsToUser) {
                return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
            }

            // Actualizar el comentario
            const updatedComment = await GreenpointCommentModel.update(commentId, content);
            if (!updatedComment) {
                return res.status(404).json({ error: 'Comentario no encontrado para actualizar' });
            }

            // Obtener el comentario actualizado con información del usuario
            const commentWithUser = await GreenpointCommentModel.findById(commentId);

            res.json({
                message: 'Comentario actualizado exitosamente',
                comment: commentWithUser
            });
        } catch (err) {
            console.error('Error al actualizar comentario:', err);
            if (err.message.includes('contenido')) {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: 'Error al actualizar el comentario' });
        }
    }

    /**
     * DELETE /comments/:id
     * Elimina un comentario
     * Requiere autenticación y que el comentario pertenezca al usuario
     */
    static async deleteComment(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId; // Del middleware authenticateToken

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. Debes estar autenticado' });
            }

            const commentId = parseInt(id, 10);
            if (isNaN(commentId) || commentId <= 0) {
                return res.status(400).json({ error: 'ID de comentario inválido' });
            }

            // Verificar que el comentario exista y pertenezca al usuario
            const comment = await GreenpointCommentModel.findById(commentId);
            if (!comment) {
                return res.status(404).json({ error: 'Comentario no encontrado' });
            }

            const belongsToUser = await GreenpointCommentModel.belongsToUser(commentId, userId);
            if (!belongsToUser) {
                return res.status(403).json({ error: 'No tienes permiso para eliminar este comentario' });
            }

            // Eliminar el comentario
            const deletedComment = await GreenpointCommentModel.delete(commentId);
            if (!deletedComment) {
                return res.status(404).json({ error: 'Comentario no encontrado para eliminar' });
            }

            res.json({
                message: 'Comentario eliminado exitosamente',
                id: commentId
            });
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            res.status(500).json({ error: 'Error al eliminar el comentario' });
        }
    }

    /**
     * GET /users/:id/comments
     * Obtiene todos los comentarios de un usuario
     */
    static async getCommentsByUser(req, res) {
        try {
            const { id } = req.params;
            const userId = parseInt(id, 10);

            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'ID de usuario inválido' });
            }

            const comments = await GreenpointCommentModel.getByUser(userId);
            res.json({
                user_id: userId,
                comments_count: comments.length,
                comments
            });
        } catch (err) {
            console.error('Error al obtener comentarios del usuario:', err);
            res.status(500).json({ error: 'Error al cargar los comentarios' });
        }
    }
}


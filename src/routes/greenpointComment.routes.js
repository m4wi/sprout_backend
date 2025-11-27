import { Router } from 'express';
import { GreenpointCommentController } from '../controllers/greenpointComment.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas para comentarios de greenpoints
 * 
 * GET    /greenpoints/:id/comments     - Obtener todos los comentarios de un greenpoint
 * POST   /greenpoints/:id/comments     - Crear un comentario (requiere autenticación)
 * GET    /comments/:id                 - Obtener un comentario por ID
 * PATCH  /comments/:id                 - Actualizar un comentario (requiere autenticación)
 * DELETE /comments/:id                 - Eliminar un comentario (requiere autenticación)
 * GET    /users/:id/comments           - Obtener todos los comentarios de un usuario
 */

// Obtener comentarios de un greenpoint
// router.get('/greenpoints/:id/comments', GreenpointCommentController.getCommentsByGreenpoint);

// Crear un comentario en un greenpoint (requiere autenticación)
// router.post('/greenpoints/:id/comments', authenticateToken, GreenpointCommentController.createComment);

// Obtener un comentario por ID
router.get('/comments/:id', GreenpointCommentController.getCommentById);

// Actualizar un comentario (requiere autenticación)
router.patch('/comments/:id', authenticateToken, GreenpointCommentController.updateComment);

// Eliminar un comentario (requiere autenticación)
router.delete('/comments/:id', authenticateToken, GreenpointCommentController.deleteComment);

// Obtener comentarios de un usuario
router.get('/users/:id/comments', GreenpointCommentController.getCommentsByUser);

export default router;


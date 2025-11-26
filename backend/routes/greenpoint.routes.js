import { Router } from 'express';
import { GreenPointController } from '../controllers/greenpoint.controller.js'
import { GreenpointCommentController } from '../controllers/greenpointComment.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();


router.get('/', GreenPointController.getAllGreenPoints )
router.get('/:id', GreenPointController.getGreenPoint)
router.post('/', GreenPointController.createGreenPoint )
router.delete('/:id', GreenPointController.deleteGreenPoint)

router.get('/findCategory/:categoryId', GreenPointController.findGreenPointsByCategory)
router.get('/nearby', GreenPointController.findGreenPointsByLocation)

// Obtener greenpoints donde el usuario es recolector (requiere autenticación)
router.get('/my-collections', authenticateToken, GreenPointController.getMyCollections)



// Obtener comentarios de un greenpoint
router.get('/:id/comments', GreenpointCommentController.getCommentsByGreenpoint);

// Crear un comentario en un greenpoint (requiere autenticación)
router.post('/:id/comments', authenticateToken, GreenpointCommentController.createComment);

router.get('/comments/:id', GreenpointCommentController.getCommentById);

// Actualizar un comentario (requiere autenticación)
router.patch('/comments/:id', authenticateToken, GreenpointCommentController.updateComment);

// Eliminar un comentario (requiere autenticación)
router.delete('/comments/:id', authenticateToken, GreenpointCommentController.deleteComment);

// Obtener comentarios de un usuario
router.get('/users/:id/comments', GreenpointCommentController.getCommentsByUser);

export default router;
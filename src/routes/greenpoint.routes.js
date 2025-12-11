import { Router } from 'express';
import { GreenPointController } from '../controllers/greenpoint.controller.js'
import { GreenpointCommentController } from '../controllers/greenpointComment.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { PhotoController } from '../controllers/photo.controller.js';
import { ChatController } from '../controllers/chat.controller.js';
import uploadGreenpointPhoto from '../middlewares/uploadGreenpointPhoto.js';

const router = Router();


router.get('/', GreenPointController.getAllGreenPoints)
router.patch('/:id', authenticateToken, GreenPointController.updateGreenPoint)
router.patch('/:id/finish', authenticateToken, GreenPointController.finishGreenPoint)
// Rutas específicas antes de genéricas
router.get('/myCollections', authenticateToken, GreenPointController.getMyCollections)
router.get('/search', GreenPointController.searchGreenPoints)
router.get('/nearby', GreenPointController.findGreenPointsByLocation)
router.get('/findCategory/:categoryId', GreenPointController.findGreenPointsByCategory)
router.get('/posts', authenticateToken, GreenPointController.getPosts);
router.get('/fulldata/:greenPointId', authenticateToken, GreenPointController.getUpdateGreenPointData);

router.get('/:id', GreenPointController.getGreenPoint)
router.post('/', GreenPointController.createGreenPoint)
router.delete('/:id', authenticateToken, GreenPointController.deleteGreenPoint)

// (ubicada arriba) Obtener greenpoints donde el usuario es recolector



// Obtener comentarios de un greenpoint
router.get('/:id/comments', GreenpointCommentController.getCommentsByGreenpoint);

// Crear un comentario en un greenpoint (requiere autenticación)
router.post('/:id/comments', authenticateToken, GreenpointCommentController.createComment);

router.get('/comments/:id', GreenpointCommentController.getCommentById);

// Actualizar un comentario (requiere autenticación)
router.patch('/comments/:id', authenticateToken, GreenpointCommentController.updateComment);

// Eliminar un comentario (requiere autenticación)
router.delete('/comments/:id', authenticateToken, GreenpointCommentController.deleteComment);

// Obtener greenpoints de un usuario (requiere autenticación)
router.get('/users/:id', authenticateToken, GreenPointController.getUserGreenPoints);


// Obtener comentarios de un usuario
router.get('/users/:id/comments', GreenpointCommentController.getCommentsByUser);

router.get('/:id/photos', PhotoController.getPhotosByGreenpoint);
router.post('/:id/photos', authenticateToken, uploadGreenpointPhoto.single('photo'), PhotoController.uploadPhoto);
router.delete('/:id/photos/:photoId', authenticateToken, PhotoController.deletePhoto);

// Materiales del greenpoint (requiere autenticación)
router.get('/:id/materials', authenticateToken, GreenPointController.getGreenPointsMaterial);
router.post('/:id/materials', authenticateToken, GreenPointController.assignMaterialsToGreenPoint);

// Categorías del greenpoint
router.get('/:id/categories', GreenPointController.getCategories);
router.post('/:id/categories', authenticateToken, GreenPointController.assignCategory);

// Chat del greenpoint
router.get('/:id/chat', authenticateToken, ChatController.getChatByGreenpoint);
router.post('/:id/chat/message', authenticateToken, ChatController.sendMessageToGreenpoint);



export default router;

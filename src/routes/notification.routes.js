import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', NotificationController.create); // Opcional: para pruebas o admin
router.get('/', NotificationController.getMyNotifications);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.delete);

export default router;

import { Router } from 'express';
import { DirectChatController } from '../controllers/directChat.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateToken); // Provide userId to all routes

// Get chat with a specific user (creates if not exists)
// GET /api/direct-chats/user/:targetUserId
router.get('/user/:targetUserId', DirectChatController.getChatWithUser);

// Send message to a chat
// POST /api/direct-chats/:chatId/messages
router.post('/:chatId/messages', DirectChatController.sendMessage);

export default router;

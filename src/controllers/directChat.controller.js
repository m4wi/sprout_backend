import { DirectChatModel } from '../models/directChat.model.js';
import { UserModel } from '../models/user.model.js';

export class DirectChatController {

    static async getChatWithUser(req, res) {
        try {
            const currentUserId = req.userId; // From authenticateToken
            const targetUserId = parseInt(req.params.targetUserId);

            if (isNaN(targetUserId)) {
                return res.status(400).json({ error: 'ID de usuario inválido' });
            }

            if (currentUserId === targetUserId) {
                return res.status(400).json({ error: 'No puedes chatear contigo mismo' });
            }

            // Verify target user exists
            const targetUser = await UserModel.findById(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const chat = await DirectChatModel.getOrCreateChat(currentUserId, targetUserId);
            const messages = await DirectChatModel.getMessages(chat.id_chat);

            res.json({
                chat,
                messages,
                otherUser: {
                    id: targetUser.id_user,
                    name: targetUser.name,
                    lastname: targetUser.lastname,
                    username: targetUser.username,
                    avatar_url: targetUser.avatar_url
                }
            });

        } catch (error) {
            console.error('Error getting direct chat:', error);
            res.status(500).json({ error: 'Error al obtener el chat' });
        }
    }

    static async sendMessage(req, res) {
        try {
            const currentUserId = req.userId;
            const chatId = parseInt(req.params.chatId);
            const { content } = req.body;

            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Contenido vacío' });
            }

            const message = await DirectChatModel.sendMessage(chatId, currentUserId, content);

            // Emit real-time event
            const io = req.app.get('io');
            if (io) {
                io.to(`direct_chat_${chatId}`).emit('new_direct_message', message);
            }

            res.json({ message });

        } catch (error) {
            console.error('Error sending direct message:', error);
            res.status(500).json({ error: 'Error al enviar mensaje' });
        }
    }
}

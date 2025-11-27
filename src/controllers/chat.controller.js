
import { GreenpointChat } from '../models/greenpointChat.js'
import { GreenPointModel } from '../models/greenpoint.model.js'

export class ChatController {

    static async getChatByGreenpoint(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) return res.status(401).json({ error: 'No autorizado' });

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            const point = await GreenPointModel.findById(greenpointId);
            if (!point) return res.status(404).json({ error: 'Greenpoint no encontrado' });

            if (point.id_citizen !== userId && point.id_collector !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para ver el chat de este greenpoint' });
            }

            const chat = await GreenpointChat.getByGreenPointId(greenpointId, 100);
            res.json(chat || { messages: [] });
        } catch (err) {
            console.error('Error al obtener chat:', err);
            res.status(500).json({ error: 'Error al cargar el chat' });
        }
    }

    // Enviar mensaje
    static async sendMessage(req, res) {
        try {
            const { chat_id } = req.params;
            const { content } = req.body;
            const sender_id = req.userId;

            if (!sender_id) return res.status(401).json({ error: 'No autorizado' });
            if (!content) return res.status(400).json({ error: 'Contenido requerido' });

            const chatId = parseInt(chat_id, 10);
            if (isNaN(chatId)) return res.status(400).json({ error: 'ID de chat inválido' });

            // En este modelo, asumimos que el backend valida mediante el chat existente

            const message = await GreenpointChat.insertMessage(chatId, sender_id, content);
            res.status(201).json(message);
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
            res.status(400).json({ error: err.message || 'Error al enviar mensaje' });
        }
    };

    // Editar mensaje
    static async editMessage(req, res) {
        try {
            const { id } = req.params; // id del mensaje
            const { content } = req.body;
            const sender_id = req.userId;

            if (!sender_id) return res.status(401).json({ error: 'No autorizado' });
            if (!content) return res.status(400).json({ error: 'Contenido requerido' });

            const messageId = parseInt(id, 10);
            if (isNaN(messageId)) return res.status(400).json({ error: 'ID de mensaje inválido' });

            const updated = await GreenpointChat.updateMessage(messageId, sender_id, content);
            if (!updated) {
                return res.status(404).json({ error: 'Mensaje no encontrado o no tienes permiso' });
            }

            res.json(updated);
        } catch (err) {
            console.error('Error al editar mensaje:', err);
            res.status(400).json({ error: err.message || 'Error al editar mensaje' });
        }
    };

    // Eliminar mensaje
    static async deleteMessage(req, res) {
        try {
            const { id } = req.params;
            const sender_id = req.userId;

            if (!sender_id) return res.status(401).json({ error: 'No autorizado' });

            const messageId = parseInt(id, 10);
            if (isNaN(messageId)) return res.status(400).json({ error: 'ID de mensaje inválido' });

            const deleted = await GreenpointChat.deleteMessage(messageId, sender_id);
        
            if (!deleted) {
                return res.status(404).json({ error: 'Mensaje no encontrado o no tienes permiso' });
            }

            res.json({ message: 'Mensaje eliminado' });
        } catch (err) {
            console.error('Error al eliminar mensaje:', err);
            res.status(500).json({ error: 'Error al eliminar mensaje' });
        }
    };

    static async sendMessageToGreenpoint(req, res) {
        try {
            const { id } = req.params; // greenpoint id
            const { content } = req.body;
            const userId = req.userId;

            if (!userId) return res.status(401).json({ error: 'No autorizado' });
            if (!content) return res.status(400).json({ error: 'Contenido requerido' });

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            const point = await GreenPointModel.findById(greenpointId);
            if (!point) return res.status(404).json({ error: 'Greenpoint no encontrado' });
            if (point.id_citizen !== userId && point.id_collector !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para enviar mensajes en este chat' });
            }

            const chat = await GreenpointChat.getByGreenPointId(greenpointId, 1);
            if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
            const message = await GreenpointChat.insertMessage(chat.id_chat, userId, content);
            res.status(201).json(message);
        } catch (err) {
            console.error('Error al enviar mensaje al greenpoint:', err);
            res.status(400).json({ error: err.message || 'Error al enviar mensaje' });
        }
    }
}

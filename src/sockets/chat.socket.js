import jwt from 'jsonwebtoken';
import { GreenpointChat } from '../models/greenpointChat.js';
import { GreenPointModel } from '../models/greenpoint.model.js';

const SECRET_KEY = process.env.SECRET_KEY;

export function initChatSocket(io) {
    // Middleware de autenticación
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return next(new Error('Authentication error: Invalid token'));
            socket.userId = decoded.id;
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        socket.on('join_room', async ({ greenpoint_id }) => {
            try {
                const gpId = parseInt(greenpoint_id, 10);
                if (isNaN(gpId)) return;

                // Verificar pertenencia (opcional, pero recomendado)
                const point = await GreenPointModel.findById(gpId);
                if (!point) return;

                // Solo permitir unirse si es el ciudadano o el recolector
                // OJO: Si el chat aún no existe (no hay recolector), el ciudadano igual debería poder unirse
                // para esperar. Pero el chat se crea cuando se acepta la reserva?
                // Asumamos que si está en 'book.html', ya hay una relación.

                // Unirse a la sala
                const roomName = `greenpoint_${gpId}`;
                socket.join(roomName);
                console.log(`User ${socket.userId} joined room ${roomName}`);
            } catch (err) {
                console.error('Error joining room:', err);
            }
        });

        socket.on('join_direct_chat', ({ chatId }) => {
            const roomName = `direct_chat_${chatId}`;
            socket.join(roomName);
            console.log(`User ${socket.userId} joined direct chat ${roomName}`);
        });

        socket.on('send_message', async ({ greenpoint_id, content }) => {
            try {
                const gpId = parseInt(greenpoint_id, 10);
                if (isNaN(gpId) || !content) return;

                // 1. Obtener o verificar el chat
                // Usamos getByGreenPointId para obtener el ID del chat
                const chatData = await GreenpointChat.getByGreenPointId(gpId, 1);

                if (!chatData) {
                    socket.emit('error', { message: 'Chat no encontrado' });
                    return;
                }

                // 2. Guardar mensaje
                const message = await GreenpointChat.insertMessage(chatData.id_chat, socket.userId, content);

                // 3. Emitir a la sala
                const roomName = `greenpoint_${gpId}`;
                io.to(roomName).emit('new_message', message);

            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', { message: 'Error al enviar mensaje' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
}

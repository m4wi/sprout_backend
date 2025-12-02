import { NotificationModel } from '../models/notification.model.js';

export class NotificationController {

    static async create(req, res) {
        try {
            const { id_user, message, type, reference_id, priority } = req.body;

            // Validaciones básicas
            if (!id_user || !message) {
                return res.status(400).json({ message: 'id_user y message son requeridos' });
            }

            const notification = await NotificationModel.create({
                id_user,
                message,
                type,
                reference_id,
                priority
            });

            res.status(201).json(notification);
        } catch (error) {
            console.error('Error al crear notificación:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async getMyNotifications(req, res) {
        try {
            const id_user = req.user.id; // Asumiendo que viene del middleware de auth
            const { limit, page } = req.query;

            const limitParsed = parseInt(limit) || 20;
            const pageParsed = parseInt(page) || 1;
            const offset = (pageParsed - 1) * limitParsed;

            const notifications = await NotificationModel.findByUser(id_user, limitParsed, offset);
            const unreadCount = await NotificationModel.countUnread(id_user);

            res.json({
                notifications,
                unreadCount,
                page: pageParsed,
                limit: limitParsed
            });
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const id_user = req.user.id;

            const notification = await NotificationModel.markAsRead(id, id_user);

            if (!notification) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }

            res.json(notification);
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const id_user = req.user.id;
            await NotificationModel.markAllAsRead(id_user);
            res.json({ message: 'Todas las notificaciones marcadas como leídas' });
        } catch (error) {
            console.error('Error al marcar todas como leídas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const id_user = req.user.id;

            const notification = await NotificationModel.delete(id, id_user);

            if (!notification) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }

            res.json({ message: 'Notificación eliminada' });
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}

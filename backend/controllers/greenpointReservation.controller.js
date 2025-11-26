import { GreenpointReservationModel } from '../models/greenpointReservation.model.js';
import { GreenPointModel } from '../models/greenpoint.model.js';

export class GreenpointReservationController {
    /**
     * POST /greenpoints/:id/reservations
     * Crea una nueva reserva para un greenpoint
     * Requiere autenticación (recolector)
     */
    static async createReservation(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const userId = req.userId; // Del middleware authenticateToken

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. Debes estar autenticado' });
            }

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint exista
            const greenpoint = await GreenPointModel.findById(greenpointId);
            if (!greenpoint) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            // Verificar que el usuario no sea el creador del greenpoint
            if (greenpoint.id_citizen === userId) {
                return res.status(400).json({ error: 'No puedes reservar tu propio greenpoint' });
            }

            // Verificar que el greenpoint esté disponible (no tenga un recolector asignado)
            if (greenpoint.id_collector) {
                return res.status(400).json({ error: 'Este greenpoint ya tiene un recolector asignado' });
            }

            // Crear la reserva
            const newReservation = await GreenpointReservationModel.create({
                id_greenpoint: greenpointId,
                id_collector: userId,
                message
            });

            // Obtener la reserva con información completa
            const reservationWithDetails = await GreenpointReservationModel.findById(newReservation.id_reservation);

            res.status(201).json({
                message: 'Reserva creada exitosamente. Esperando aprobación del creador del greenpoint.',
                reservation: reservationWithDetails
            });
        } catch (err) {
            console.error('Error al crear reserva:', err);
            if (err.message.includes('Ya tienes una reserva pendiente')) {
                return res.status(400).json({ error: err.message });
            }
            if (err.code === '23503') {
                return res.status(400).json({ error: 'Usuario o greenpoint no válidos' });
            }
            res.status(500).json({ error: 'Error al crear la reserva' });
        }
    }

    /**
     * GET /greenpoints/:id/reservations
     * Obtiene todas las reservas de un greenpoint
     * Requiere autenticación (solo el creador puede ver las reservas)
     */
    static async getReservationsByGreenpoint(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query; // Filtro opcional por estado
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint exista y pertenezca al usuario
            const greenpoint = await GreenPointModel.findById(greenpointId);
            if (!greenpoint) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            if (greenpoint.id_citizen !== userId) {
                return res.status(403).json({ error: 'Solo el creador del greenpoint puede ver las reservas' });
            }

            const reservations = await GreenpointReservationModel.findByGreenpoint(greenpointId, status);

            res.json({
                greenpoint_id: greenpointId,
                reservations_count: reservations.length,
                reservations
            });
        } catch (err) {
            console.error('Error al obtener reservas:', err);
            res.status(500).json({ error: 'Error al cargar las reservas' });
        }
    }

    /**
     * GET /reservations/my-reservations
     * Obtiene todas las reservas del usuario autenticado (como recolector)
     */
    static async getMyReservations(req, res) {
        try {
            const { status } = req.query; // Filtro opcional por estado
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservations = await GreenpointReservationModel.findByCollector(userId, status);

            res.json({
                collector_id: userId,
                reservations_count: reservations.length,
                reservations
            });
        } catch (err) {
            console.error('Error al obtener mis reservas:', err);
            res.status(500).json({ error: 'Error al cargar las reservas' });
        }
    }

    /**
     * GET /reservations/my-greenpoints-reservations
     * Obtiene todas las reservas de los greenpoints creados por el usuario autenticado
     */
    static async getMyGreenpointsReservations(req, res) {
        try {
            const { status } = req.query; // Filtro opcional por estado
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservations = await GreenpointReservationModel.findByCitizen(userId, status);

            res.json({
                citizen_id: userId,
                reservations_count: reservations.length,
                reservations
            });
        } catch (err) {
            console.error('Error al obtener reservas de mis greenpoints:', err);
            res.status(500).json({ error: 'Error al cargar las reservas' });
        }
    }

    /**
     * GET /reservations/:id
     * Obtiene una reserva por su ID
     */
    static async getReservationById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservationId = parseInt(id, 10);
            if (isNaN(reservationId) || reservationId <= 0) {
                return res.status(400).json({ error: 'ID de reserva inválido' });
            }

            const reservation = await GreenpointReservationModel.findById(reservationId);
            if (!reservation) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el usuario tenga permiso para ver esta reserva
            // (debe ser el recolector o el creador del greenpoint)
            if (reservation.id_collector !== userId && reservation.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para ver esta reserva' });
            }

            res.json(reservation);
        } catch (err) {
            console.error('Error al obtener reserva:', err);
            res.status(500).json({ error: 'Error al cargar la reserva' });
        }
    }

    /**
     * PATCH /reservations/:id/accept
     * Acepta una reserva (solo el creador del greenpoint puede aceptar)
     * Requiere autenticación
     */
    static async acceptReservation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservationId = parseInt(id, 10);
            if (isNaN(reservationId) || reservationId <= 0) {
                return res.status(400).json({ error: 'ID de reserva inválido' });
            }

            // Verificar que la reserva exista
            const reservation = await GreenpointReservationModel.findById(reservationId);
            if (!reservation) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el usuario sea el creador del greenpoint
            const belongsToCitizen = await GreenpointReservationModel.belongsToCitizen(reservationId, userId);
            if (!belongsToCitizen) {
                return res.status(403).json({ error: 'Solo el creador del greenpoint puede aceptar reservas' });
            }

            // Verificar que la reserva esté pendiente
            if (reservation.status !== 'pending') {
                return res.status(400).json({ error: `No se puede aceptar una reserva con estado: ${reservation.status}` });
            }

            // Actualizar el estado de la reserva
            const updatedReservation = await GreenpointReservationModel.updateStatus(reservationId, 'accepted');
            if (!updatedReservation) {
                return res.status(500).json({ error: 'Error al aceptar la reserva' });
            }

            // Cancelar todas las demás reservas pendientes de este greenpoint
            const cancelledCount = await GreenpointReservationModel.cancelOtherPendingReservations(
                reservation.id_greenpoint,
                reservationId
            );

            // Actualizar el greenpoint asignando el recolector
            await GreenPointModel.update(reservation.id_greenpoint, {
                id_collector: reservation.id_collector,
                status: 'reserved' // o 'en_proceso' según tu lógica
            });

            // Obtener la reserva actualizada con información completa
            const reservationWithDetails = await GreenpointReservationModel.findById(reservationId);

            res.json({
                message: 'Reserva aceptada exitosamente. El recolector ha sido asignado al greenpoint.',
                reservation: reservationWithDetails
            });
        } catch (err) {
            console.error('Error al aceptar reserva:', err);
            if (err.message.includes('Estado inválido')) {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: 'Error al aceptar la reserva' });
        }
    }

    /**
     * PATCH /reservations/:id/reject
     * Rechaza una reserva (solo el creador del greenpoint puede rechazar)
     * Requiere autenticación
     */
    static async rejectReservation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservationId = parseInt(id, 10);
            if (isNaN(reservationId) || reservationId <= 0) {
                return res.status(400).json({ error: 'ID de reserva inválido' });
            }

            // Verificar que la reserva exista
            const reservation = await GreenpointReservationModel.findById(reservationId);
            if (!reservation) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Verificar que el usuario sea el creador del greenpoint
            const belongsToCitizen = await GreenpointReservationModel.belongsToCitizen(reservationId, userId);
            if (!belongsToCitizen) {
                return res.status(403).json({ error: 'Solo el creador del greenpoint puede rechazar reservas' });
            }

            // Verificar que la reserva esté pendiente
            if (reservation.status !== 'pending') {
                return res.status(400).json({ error: `No se puede rechazar una reserva con estado: ${reservation.status}` });
            }

            // Actualizar el estado de la reserva
            const updatedReservation = await GreenpointReservationModel.updateStatus(reservationId, 'rejected');
            if (!updatedReservation) {
                return res.status(500).json({ error: 'Error al rechazar la reserva' });
            }

            // Obtener la reserva actualizada con información completa
            const reservationWithDetails = await GreenpointReservationModel.findById(reservationId);

            res.json({
                message: 'Reserva rechazada',
                reservation: reservationWithDetails
            });
        } catch (err) {
            console.error('Error al rechazar reserva:', err);
            res.status(500).json({ error: 'Error al rechazar la reserva' });
        }
    }

    /**
     * PATCH /reservations/:id/cancel
     * Cancela una reserva (solo el recolector puede cancelar sus propias reservas)
     * Requiere autenticación
     */
    static async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const reservationId = parseInt(id, 10);
            if (isNaN(reservationId) || reservationId <= 0) {
                return res.status(400).json({ error: 'ID de reserva inválido' });
            }

            // Cancelar la reserva (el modelo verifica que pertenezca al usuario)
            const cancelledReservation = await GreenpointReservationModel.cancelReservation(reservationId, userId);
            if (!cancelledReservation) {
                return res.status(404).json({ error: 'Reserva no encontrada o no tienes permiso para cancelarla' });
            }

            res.json({
                message: 'Reserva cancelada exitosamente',
                reservation: cancelledReservation
            });
        } catch (err) {
            console.error('Error al cancelar reserva:', err);
            if (err.message.includes('No puedes cancelar') || err.message.includes('Solo se pueden cancelar')) {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: 'Error al cancelar la reserva' });
        }
    }
}


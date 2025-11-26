import { Router } from 'express';
import { GreenpointReservationController } from '../controllers/greenpointReservation.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

/**
 * Rutas para reservas de greenpoints
 * 
 * POST   /greenpoints/:id/reservations              - Crear una reserva (recolector autenticado)
 * GET    /greenpoints/:id/reservations              - Obtener reservas de un greenpoint (creador del greenpoint)
 * GET    /reservations/my-reservations               - Obtener mis reservas como recolector
 * GET    /reservations/my-greenpoints-reservations   - Obtener reservas de mis greenpoints (como creador)
 * GET    /reservations/:id                           - Obtener una reserva específica
 * PATCH  /reservations/:id/accept                   - Aceptar una reserva (creador del greenpoint)
 * PATCH  /reservations/:id/reject                    - Rechazar una reserva (creador del greenpoint)
 * PATCH  /reservations/:id/cancel                    - Cancelar una reserva (recolector)
 */

// Crear una reserva para un greenpoint (requiere autenticación)
router.post('/greenpoints/:id/reservations', authenticateToken, GreenpointReservationController.createReservation);

// Obtener reservas de un greenpoint (requiere autenticación y ser el creador)
router.get('/greenpoints/:id/reservations', authenticateToken, GreenpointReservationController.getReservationsByGreenpoint);

// Obtener mis reservas como recolector (requiere autenticación)
router.get('/reservations/my-reservations', authenticateToken, GreenpointReservationController.getMyReservations);

// Obtener reservas de mis greenpoints como creador (requiere autenticación)
router.get('/reservations/my-greenpoints-reservations', authenticateToken, GreenpointReservationController.getMyGreenpointsReservations);

// Obtener una reserva específica (requiere autenticación)
router.get('/reservations/:id', authenticateToken, GreenpointReservationController.getReservationById);

// Aceptar una reserva (requiere autenticación y ser el creador del greenpoint)
router.patch('/reservations/:id/accept', authenticateToken, GreenpointReservationController.acceptReservation);

// Rechazar una reserva (requiere autenticación y ser el creador del greenpoint)
router.patch('/reservations/:id/reject', authenticateToken, GreenpointReservationController.rejectReservation);

// Cancelar una reserva (requiere autenticación y ser el recolector)
router.patch('/reservations/:id/cancel', authenticateToken, GreenpointReservationController.cancelReservation);

export default router;


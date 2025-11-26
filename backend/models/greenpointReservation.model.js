import pool from '../database/db.js';

export class GreenpointReservationModel {
    /**
     * Crea una nueva reserva
     * @param {Object} reservationData - Datos de la reserva
     * @param {number} reservationData.id_greenpoint - ID del greenpoint
     * @param {number} reservationData.id_collector - ID del recolector
     * @param {string} reservationData.message - Mensaje opcional
     * @returns {Object} Reserva creada
     */
    static async create(reservationData) {
        const { id_greenpoint, id_collector, message } = reservationData;

        if (!id_greenpoint || !id_collector) {
            throw new Error('Faltan datos requeridos: id_greenpoint e id_collector');
        }

        // Verificar que no exista una reserva pendiente del mismo recolector
        const existing = await this.checkPendingReservation(id_greenpoint, id_collector);
        if (existing) {
            throw new Error('Ya tienes una reserva pendiente para este greenpoint');
        }

        const query = `
            INSERT INTO greenpoint_reservations (id_greenpoint, id_collector, message, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *
        `;
        const result = await pool.query(query, [id_greenpoint, id_collector, message || null]);
        return result.rows[0];
    }

    /**
     * Obtiene una reserva por su ID con información del usuario y greenpoint
     * @param {number} id_reservation - ID de la reserva
     * @returns {Object|null} Reserva con información completa
     */
    static async findById(id_reservation) {
        const query = `
            SELECT 
                r.id_reservation,
                r.id_greenpoint,
                r.id_collector,
                r.status,
                r.message,
                r.created_at,
                r.updated_at,
                u.username AS collector_username,
                u.name AS collector_name,
                u.lastname AS collector_lastname,
                u.avatar_url AS collector_avatar,
                g.description AS greenpoint_description,
                g.id_citizen,
                g.status AS greenpoint_status
            FROM greenpoint_reservations r
            JOIN users u ON r.id_collector = u.id_user
            JOIN greenpoints g ON r.id_greenpoint = g.id_greenpoint
            WHERE r.id_reservation = $1
        `;
        const result = await pool.query(query, [id_reservation]);
        return result.rows[0] || null;
    }

    /**
     * Obtiene todas las reservas de un greenpoint
     * @param {number} id_greenpoint - ID del greenpoint
     * @param {string} status - Filtro opcional por estado
     * @returns {Array} Array de reservas
     */
    static async findByGreenpoint(id_greenpoint, status = null) {
        let query = `
            SELECT 
                r.id_reservation,
                r.id_greenpoint,
                r.id_collector,
                r.status,
                r.message,
                r.created_at,
                r.updated_at,
                u.username AS collector_username,
                u.name AS collector_name,
                u.lastname AS collector_lastname,
                u.avatar_url AS collector_avatar,
                u.phone AS collector_phone
            FROM greenpoint_reservations r
            JOIN users u ON r.id_collector = u.id_user
            WHERE r.id_greenpoint = $1
        `;
        const params = [id_greenpoint];

        if (status) {
            query += ` AND r.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Obtiene todas las reservas de un recolector
     * @param {number} id_collector - ID del recolector
     * @param {string} status - Filtro opcional por estado
     * @returns {Array} Array de reservas
     */
    static async findByCollector(id_collector, status = null) {
        let query = `
            SELECT 
                r.id_reservation,
                r.id_greenpoint,
                r.id_collector,
                r.status,
                r.message,
                r.created_at,
                r.updated_at,
                g.description AS greenpoint_description,
                g.coordinates,
                g.status AS greenpoint_status,
                g.id_citizen
            FROM greenpoint_reservations r
            JOIN greenpoints g ON r.id_greenpoint = g.id_greenpoint
            WHERE r.id_collector = $1
        `;
        const params = [id_collector];

        if (status) {
            query += ` AND r.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Obtiene todas las reservas de los greenpoints creados por un ciudadano
     * @param {number} id_citizen - ID del ciudadano (creador del greenpoint)
     * @param {string} status - Filtro opcional por estado
     * @returns {Array} Array de reservas
     */
    static async findByCitizen(id_citizen, status = null) {
        let query = `
            SELECT 
                r.id_reservation,
                r.id_greenpoint,
                r.id_collector,
                r.status,
                r.message,
                r.created_at,
                r.updated_at,
                u.username AS collector_username,
                u.name AS collector_name,
                u.lastname AS collector_lastname,
                u.avatar_url AS collector_avatar,
                u.phone AS collector_phone,
                g.description AS greenpoint_description,
                g.coordinates
            FROM greenpoint_reservations r
            JOIN users u ON r.id_collector = u.id_user
            JOIN greenpoints g ON r.id_greenpoint = g.id_greenpoint
            WHERE g.id_citizen = $1
        `;
        const params = [id_citizen];

        if (status) {
            query += ` AND r.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY r.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Actualiza el estado de una reserva
     * @param {number} id_reservation - ID de la reserva
     * @param {string} status - Nuevo estado (accepted, rejected, cancelled)
     * @returns {Object|null} Reserva actualizada
     */
    static async updateStatus(id_reservation, status) {
        const validStatuses = ['accepted', 'rejected', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
        }

        const query = `
            UPDATE greenpoint_reservations
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id_reservation = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, id_reservation]);
        return result.rows[0] || null;
    }

    /**
     * Verifica si existe una reserva pendiente del mismo recolector en el mismo greenpoint
     * @param {number} id_greenpoint - ID del greenpoint
     * @param {number} id_collector - ID del recolector
     * @returns {Object|null} Reserva pendiente si existe
     */
    static async checkPendingReservation(id_greenpoint, id_collector) {
        const query = `
            SELECT * FROM greenpoint_reservations
            WHERE id_greenpoint = $1 
            AND id_collector = $2 
            AND status = 'pending'
        `;
        const result = await pool.query(query, [id_greenpoint, id_collector]);
        return result.rows[0] || null;
    }

    /**
     * Cancela una reserva (solo el recolector puede cancelar sus propias reservas)
     * @param {number} id_reservation - ID de la reserva
     * @param {number} id_collector - ID del recolector (para verificar)
     * @returns {Object|null} Reserva cancelada
     */
    static async cancelReservation(id_reservation, id_collector) {
        // Verificar que la reserva pertenezca al recolector
        const reservation = await this.findById(id_reservation);
        if (!reservation) {
            return null;
        }
        if (reservation.id_collector !== id_collector) {
            throw new Error('No puedes cancelar esta reserva');
        }
        if (reservation.status !== 'pending') {
            throw new Error('Solo se pueden cancelar reservas pendientes');
        }

        return await this.updateStatus(id_reservation, 'cancelled');
    }

    /**
     * Verifica si una reserva pertenece a un ciudadano (es dueño del greenpoint)
     * @param {number} id_reservation - ID de la reserva
     * @param {number} id_citizen - ID del ciudadano
     * @returns {boolean} true si el ciudadano es dueño del greenpoint
     */
    static async belongsToCitizen(id_reservation, id_citizen) {
        const query = `
            SELECT r.id_reservation
            FROM greenpoint_reservations r
            JOIN greenpoints g ON r.id_greenpoint = g.id_greenpoint
            WHERE r.id_reservation = $1 AND g.id_citizen = $2
        `;
        const result = await pool.query(query, [id_reservation, id_citizen]);
        return result.rows.length > 0;
    }

    /**
     * Verifica si una reserva pertenece a un recolector
     * @param {number} id_reservation - ID de la reserva
     * @param {number} id_collector - ID del recolector
     * @returns {boolean} true si la reserva pertenece al recolector
     */
    static async belongsToCollector(id_reservation, id_collector) {
        const query = `
            SELECT id_reservation
            FROM greenpoint_reservations
            WHERE id_reservation = $1 AND id_collector = $2
        `;
        const result = await pool.query(query, [id_reservation, id_collector]);
        return result.rows.length > 0;
    }

    /**
     * Cancela todas las reservas pendientes de un greenpoint excepto la especificada
     * Útil cuando se acepta una reserva
     * @param {number} id_greenpoint - ID del greenpoint
     * @param {number} excludeReservationId - ID de la reserva a excluir (la que se aceptó)
     * @returns {number} Número de reservas canceladas
     */
    static async cancelOtherPendingReservations(id_greenpoint, excludeReservationId) {
        const query = `
            UPDATE greenpoint_reservations
            SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id_greenpoint = $1 
            AND status = 'pending' 
            AND id_reservation != $2
            RETURNING id_reservation
        `;
        const result = await pool.query(query, [id_greenpoint, excludeReservationId]);
        return result.rows.length;
    }
}


import pool from '../database/db.js';

export class GreenpointCategory {
    /**
     * Asigna categorías a un greenpoint (reemplaza asignaciones anteriores)
     * @param {number} greenpointId
     * @param {number[]} categoryIds - IDs de categorías válidas
     * @returns {Array} Categorías asignadas
     */
    static async assignCategories(greenpointId, categoryIds) {
        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new Error('Se requiere al menos una categoría');
        }

        // Validar que todos los IDs sean enteros positivos
        if (!categoryIds.every(id => Number.isInteger(id) && id > 0)) {
            throw new Error('Todos los IDs de categoría deben ser enteros positivos');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Eliminar asignaciones anteriores
            await client.query(
                'DELETE FROM greenpoints_categories WHERE id_greenpoint = $1',
                [greenpointId]
            );

            // 2. Insertar nuevas asignaciones
            const values = [];
            const placeholders = [];
            for (let i = 0; i < categoryIds.length; i++) {
                placeholders.push(`($1, $${i + 2})`);
                values.push(greenpointId, categoryIds[i]);
            }

            await client.query(
                `INSERT INTO greenpoints_categories (id_greenpoint, id_category) 
         VALUES ${placeholders.join(', ')}`,
                values
            );

            // 3. Obtener categorías asignadas con sus datos
            const result = await client.query(
                `SELECT c.id_category, c.name, c.description, c.icon_url, c.color_hex
         FROM categories c
         JOIN greenpoints_categories gc ON c.id_category = gc.id_category
         WHERE gc.id_greenpoint = $1`,
                [greenpointId]
            );

            await client.query('COMMIT');
            return result.rows;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Obtiene las categorías de un greenpoint
     */
    static async getCategoriesByGreenpoint(greenpointId) {
        const result = await pool.query(
            `SELECT c.id_category, c.name, c.description, c.icon_url, c.color_hex
       FROM categories c
       JOIN greenpoints_categories gc ON c.id_category = gc.id_category
       WHERE gc.id_greenpoint = $1`,
            [greenpointId]
        );
        return result.rows;
    }
}
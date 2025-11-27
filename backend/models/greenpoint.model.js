import pool from '../database/db.js';

export class GreenPointModel {
    static async getAllPoints() {
        const query = `
        SELECT 
            g.id_greenpoint,
            g.id_category,
            g.coordinates,
            g.description,
            g.qr_code,
            g.stars,
            g.id_citizen,
            g.id_collector,
            g.created_at,
            g.updated_at,
            g.status,
            g.hour,
            g.direction,
            u.phone,
            ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.id_category IS NOT NULL) AS categories,
            COALESCE(
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'quantity', gm.quantity,
                  'unit', gm.unit,
                  'description', gm.description
                )
              ) FILTER (WHERE gm.id_greenpoint_material IS NOT NULL), '[]'
            ) AS materials
        FROM greenpoints g
        LEFT JOIN users u ON g.id_citizen = u.id_user
        LEFT JOIN greenpoints_categories gc ON g.id_greenpoint = gc.id_greenpoint
        LEFT JOIN categories c ON gc.id_category = c.id_category
        LEFT JOIN greenpoint_material gm ON g.id_greenpoint = gm.id_greenpoint
        WHERE g.status != 'deleted'
        GROUP BY 
            g.id_greenpoint,
            g.id_category,
            g.description,
            g.qr_code,
            g.stars,
            g.id_citizen,
            g.id_collector,
            g.created_at,
            g.updated_at,
            g.status,
            g.hour,
            g.direction,
            u.phone
        ORDER BY g.created_at DESC`;

        const result = await pool.query(query);
        return result.rows;
    }

    static async create(greenPointData) {
        const {
            id_category,
            coordinates,        // debe ser { longitude, latitude }
            description,
            qr_code,
            stars,
            id_citizen,
            id_collector,
            status = 'created'
        } = greenPointData;

        // ✅ Validar que coordinates sea un objeto con longitude y latitude
        if (
            !coordinates ||
            typeof coordinates.longitude !== 'number' ||
            typeof coordinates.latitude !== 'number'
        ) {
            throw new Error('Coordenadas inválidas. Se requiere { longitude: number, latitude: number }');
        }

        const { longitude, latitude } = coordinates;

        // ✅ Construye el POINT dentro de la consulta, no como cadena
        const query = `
            INSERT INTO greenpoints (
            id_category,
            coordinates,
            description,
            qr_code,
            stars,
            id_citizen,
            id_collector,
            status
            ) VALUES (
            $1,
            POINT($2, $3),   -- ← Aquí está la clave: POINT(longitude, latitude)
            $4,
            $5,
            $6,
            $7,
            $8,
            $9
            )
            RETURNING *`;

        const values = [
            id_category,
            longitude,        // $2
            latitude,         // $3
            description || null,
            qr_code || null,
            stars || null,
            id_citizen,
            id_collector || null,
            status
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM greenpoints WHERE id_greenpoint = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async softDelete(id) {
        const result = await pool.query(
            `UPDATE greenpoints 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
                WHERE id_greenpoint = $1 
                RETURNING *`,
            [id]
        );
        return result.rows[0] || null;
    }

    static async update(id, updates) {
        if (Object.keys(updates).length === 0) return null;

        // Lista de campos permitidos (debe coincidir con el controlador)
        const allowedFields = ['description', 'stars', 'qr_code', 'id_collector', 'status'];
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        if (Object.keys(filteredUpdates).length === 0) return null;

        const setClause = Object.keys(filteredUpdates)
            .map((key, i) => `"${key}" = $${i + 2}`)
            .join(', ');

        const values = [id, ...Object.values(filteredUpdates)];

        const query = `
            UPDATE greenpoints
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id_greenpoint = $1
            RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }


    /**
     * Registra múltiples materiales en una sola consulta (más eficiente)
     */
    static async createManyMaterial(id_greenpoint, materials) {
        if (materials.length === 0) return [];

        const values = [];
        const placeholders = [];

        for (let i = 0; i < materials.length; i++) {
            const { quantity, unit = 'unit', description } = materials[i];
            // Cada fila usa 4 parámetros: id_greenpoint, quantity, unit, description
            placeholders.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
            values.push(id_greenpoint, quantity, unit, description || null);
        }

        const query = `
        INSERT INTO greenpoint_material (id_greenpoint, quantity, unit, description)
        VALUES ${placeholders.join(', ')}
        RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows;
    }

    static async getAllMaterials(id_greenpoint) {
        const result = await pool.query(
            `SELECT 
            id_greenpoint_material,
            id_greenpoint,
            quantity,
            unit,
            description,
            created_at,
            updated_at
            FROM greenpoint_material 
            WHERE id_greenpoint = $1 
            ORDER BY created_at DESC`,
            [id_greenpoint]
        );
        return result.rows;
    }

    static async updateMaterial(id_material, updates) {
        const allowedFields = ['quantity', 'unit', 'description'];
        const filteredUpdates = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                if (field === 'quantity') {
                    if (typeof updates[field] !== 'number' || updates[field] <= 0) {
                        throw new Error('quantity debe ser un número positivo');
                    }
                }
                filteredUpdates[field] = updates[field];
            }
        }

        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        // Construir cláusula SET dinámica
        const setClause = Object.keys(filteredUpdates)
            .map((key, i) => `"${key}" = $${i + 2}`)
            .join(', ');

        const values = [id_material, ...Object.values(filteredUpdates)];

        const query = `
      UPDATE greenpoint_material
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id_greenpoint_material = $1
      RETURNING *`;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    /**
     * Obtiene un material por su ID (para verificar pertenencia)
     */
    static async findMaterialById(id_material) {
        const result = await pool.query(
            'SELECT * FROM greenpoint_material WHERE id_greenpoint_material = $1',
            [id_material]
        );
        return result.rows[0] || null;
    }

    /**
   * Obtiene varios materiales por sus IDs
   */
    static async getMaterialsByIds(ids) {
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        const query = `SELECT * FROM greenpoint_material WHERE id_greenpoint_material IN (${placeholders})`;
        const result = await pool.query(query, ids);
        return result.rows;
    }

    static async bulkMaterialUpdate(materials) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const results = [];

            for (const mat of materials) {
                const { id_greenpoint_material, quantity, unit, description } = mat;
                const updates = {};
                const fields = [];

                if (quantity !== undefined) {
                    if (typeof quantity !== 'number' || quantity <= 0) {
                        throw new Error(`quantity debe ser un número positivo para el material ${id_greenpoint_material}`);
                    }
                    updates.quantity = quantity;
                    fields.push('"quantity" = $1');
                }
                if (unit !== undefined) {
                    updates.unit = unit;
                    fields.push('"unit" = $2');
                }
                if (description !== undefined) {
                    updates.description = description;
                    fields.push('"description" = $3');
                }

                if (fields.length === 0) continue;

                // Construir query dinámica
                const setClause = fields.join(', ');
                const values = [
                    ...(updates.quantity !== undefined ? [updates.quantity] : []),
                    ...(updates.unit !== undefined ? [updates.unit] : []),
                    ...(updates.description !== undefined ? [updates.description] : []),
                    id_greenpoint_material
                ];

                const query = `
          UPDATE greenpoint_material
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id_greenpoint_material = $${values.length}
          RETURNING *`;

                const result = await client.query(query, values);
                if (result.rows.length > 0) {
                    results.push(result.rows[0]);
                }
            }

            await client.query('COMMIT');
            return results;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Obtiene greenpoints por categoría
     * @param {number} categoryId
     * @param {number} page - página (opcional, por defecto 1)
     * @param {number} limit - límite por página (opcional, por defecto 10)
     * @returns {Object} { rows, totalCount }
     */
    static async findByCategory(categoryId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // Consulta con paginación
        const query = `
        SELECT 
        g.id_greenpoint,
        g.coordinates,
        g.description,
        g.qr_code,
        g.hour,
        g.stars,
        g.id_citizen,
        g.id_collector,
        g.created_at,
        g.updated_at,
        g.status,
        CONCAT(u.name, ' ', u.lastname) AS citizen_name,
        u.avatar_url,
        JSON_AGG(
            JSON_BUILD_OBJECT(
            'id_category', c.id_category,
            'name', c.name,
            'description', c.description,
            'icon_url', c.icon_url,
            'color_hex', c.color_hex
            )
        ) AS categories
        FROM greenpoints g
        JOIN greenpoints_categories gc ON g.id_greenpoint = gc.id_greenpoint
        JOIN categories c ON gc.id_category = c.id_category
        JOIN users u ON g.id_citizen = u.id_user
        WHERE 
        g.status = 'approved'
        AND EXISTS (
            SELECT 1 
            FROM greenpoints_categories gc2 
            WHERE gc2.id_greenpoint = g.id_greenpoint 
            AND gc2.id_category = $1  -- Filtrar por categoría específica
        )
        GROUP BY 
        g.id_greenpoint,
        g.description,
        g.qr_code,
        u.name,
        u.lastname,
        g.hour,
        g.stars,
        g.id_citizen,
        g.id_collector,
        g.created_at,
        g.updated_at,
        u.avatar_url,
        g.status
        ORDER BY g.created_at DESC
        LIMIT $2 OFFSET $3`;

        const countQuery = `
        SELECT COUNT(DISTINCT g.id_greenpoint) FROM greenpoints g
        JOIN greenpoints_categories gc ON g.id_greenpoint = gc.id_greenpoint
        WHERE gc.id_category = $1 AND g.status = 'approved'`;

        const [result, countResult] = await Promise.all([
            pool.query(query, [categoryId, limit, offset]),
            pool.query(countQuery, [categoryId])
        ]);

        const totalCount = parseInt(countResult.rows[0].count, 10);

        return {
            rows: result.rows,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit)
        };
    }

    /**
     * Busca greenpoints cercanos a una ubicación (lat, lng)
     * @param {number} lat - Latitud del centro
     * @param {number} lng - Longitud del centro
     * @param {number} radiusKm - Radio en kilómetros (máx 50)
     * @returns {Array} Greenpoints cercanos
     */
    static async findByLocation(lat, lng, radiusKm = 5) {
        if (typeof lat !== 'number' || typeof lng !== 'number' || typeof radiusKm !== 'number') {
            throw new Error('Coordenadas y radio deben ser números');
        }
        if (radiusKm <= 0 || radiusKm > 50) {
            throw new Error('Radio debe estar entre 0 y 50 km');
        }

        const latRadius = radiusKm / 111.045;
        const lngRadius = latRadius / Math.cos((lat * Math.PI) / 180);

        const query = `
            SELECT *
            FROM greenpoints
            WHERE status = 'approved'
            AND longitude BETWEEN ($1::NUMERIC - $3::NUMERIC) AND ($1::NUMERIC + $3::NUMERIC)
            AND latitude BETWEEN ($2::NUMERIC - $4::NUMERIC) AND ($2::NUMERIC + $4::NUMERIC)
            ORDER BY 
            (longitude - $1::NUMERIC) ^ 2 + (latitude - $2::NUMERIC) ^ 2`;

        return (await pool.query(query, [lng, lat, lngRadius, latRadius])).rows;
    }

    /**
     * Obtiene todos los greenpoints donde un usuario es el recolector
     * @param {number} id_collector - ID del recolector
     * @param {string} status - Filtro opcional por estado
     * @returns {Array} Array de greenpoints
     */
    static async findByCollector(id_collector, status = null) {
        let query = `
            SELECT 
                id_greenpoint,
                id_category,
                coordinates,
                description,
                qr_code,
                stars,
                id_citizen,
                id_collector,
                created_at,
                updated_at,
                status,
                longitude,
                latitude,
                hour,
                direction
            FROM greenpoints
            WHERE id_collector = $1
        `;
        const params = [id_collector];

        if (status) {
            query += ` AND status = $2`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows;
    }
}

import { GreenPointModel } from "../models/greenpoint.model.js";
import { GreenpointCategory } from '../models/greenpointCategory.model.js';
import { Category } from '../models/category.model.js';

export class GreenPointController {

    static async getAllGreenPoints(req, res) {
        try {
            const allGreenPoints = await GreenPointModel.getAllPoints();
            res.json(allGreenPoints);
        } catch (err) {
            console.error('Error al obtener greenpoints:', err);
            res.status(500).json({ error: 'Error al cargar los puntos' });
        }
    }

    static async getGreenPoint(req, res) {
        try {
            const { id } = req.params
            const greenPoint = await GreenPointModel.findById(id);
            res.json(greenPoint);
        } catch (err) {
            console.error('Error al obtener greenpoints:', err);
            res.status(500).json({ error: 'Error al cargar los puntos' });
        }
    }


    static async createGreenPoint(req, res) {
        try {
            // const { id_citizen } = req.user; // asumiendo autenticación // 
            const {
                id_category,
                coordinates,      // { longitude: -70.25, latitude: -18.01 }
                description,
                qr_code,
                stars,
                id_citizen
            } = req.body;

            // Validar campos requeridos
            if (!id_category || !coordinates || !id_citizen) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }

            const newPoint = await GreenPointModel.create({
                id_category,
                coordinates,
                description,
                qr_code,
                stars,
                id_citizen,
                id_collector: null, // opcional, puede asignarse después
                status: 'created'   // o 'approved' si es un admin
            });

            res.status(201).json(newPoint);

        } catch (err) {

            console.error('Error al crear greenpoint:', err);
            if (err.message.includes('Coordenadas inválidas')) {
                return res.status(400).json({ error: err.message });
            }
            if (err.code === '23503') {
                return res.status(400).json({ error: 'Usuario o categoría no válidos' });
            }
            res.status(500).json({ error: 'Error al crear el punto' });
        }
    }

    static async deleteGreenPoint(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id_user;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const pointId = parseInt(id, 10);
            if (isNaN(pointId)) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el punto exista y pertenezca al usuario
            const point = await GreenPointModel.findById(pointId);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            if (point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para eliminar este greenpoint' });
            }

            // Actualizar status a 'deleted'
            const deletedPoint = await Greenpoint.softDelete(pointId);
            if (!deletedPoint) {
                return res.status(500).json({ error: 'Error al eliminar el greenpoint' });
            }

            res.json({ message: 'Greenpoint eliminado', id: pointId });
        } catch (err) {
            console.error('Error al eliminar greenpoint:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }


    static async updateGreenPoint(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id_user;

            // 1. Validar autenticación
            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            // 2. Validar ID
            const pointId = parseInt(id, 10);
            if (isNaN(pointId) || pointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // 3. Obtener el greenpoint actual
            const currentPoint = await GreenPointModel.findById(pointId);
            if (!currentPoint) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            // 4. Verificar autorización (solo el dueño)
            if (currentPoint.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para actualizar este greenpoint' });
            }

            // 5. Definir campos permitidos (lista blanca)
            const allowedFields = ['description', 'stars', 'qr_code'];
            const updates = {};

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
            }

            // 6. Actualizar en la base de datos
            const updatedPoint = await Greenpoint.update(pointId, updates);
            if (!updatedPoint) {
                return res.status(500).json({ error: 'Error al actualizar el greenpoint' });
            }

            res.json(updatedPoint);
        } catch (err) {
            console.error('Error al actualizar greenpoint:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    static async assignMaterialsToGreenPoint(req, res) {
        try {
            const { id } = req.params;
            const { materials } = req.body; // ← ahora es un array
            const userId = req.user?.id_user;

            // 1. Validar autenticación
            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            // 2. Validar ID del greenpoint
            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // 3. Verificar que el greenpoint exista y pertenezca al usuario
            const point = await Greenpoint.findById(greenpointId);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }
            if (point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No puedes registrar material en este greenpoint' });
            }

            // 4. Validar que sea un array no vacío
            if (!Array.isArray(materials) || materials.length === 0) {
                return res.status(400).json({ error: 'Se requiere al menos un material' });
            }

            // 5. Validar cada material
            for (const [index, mat] of materials.entries()) {
                if (!mat.quantity || typeof mat.quantity !== 'number' || mat.quantity <= 0) {
                    return res.status(400).json({ error: `Material ${index + 1}: quantity debe ser un número positivo` });
                }
                // unit y description son opcionales
            }

            // 6. Guardar todos los materiales (el modelo lo hace en transacción)
            const savedMaterials = await GreenPointModel.createManyMaterial(greenpointId, materials);

            res.status(201).json({
                message: `Se registraron ${savedMaterials.length} materiales`,
                materials: savedMaterials
            });
        } catch (err) {
            console.error('Error al registrar materiales:', err);
            res.status(400).json({ error: err.message || 'Error al registrar materiales' });
        }
    }

    static async getGreenPointsMaterial(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id_user;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint exista y pertenezca al usuario
            const point = await GreenPointModel.findById(greenpointId);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            // Solo el dueño (o en el futuro, admin/recolector) puede ver
            if (point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para ver este greenpoint' });
            }

            // Obtener todos los materiales del greenpoint
            const materials = await GreenPointModel.getAllMaterials(greenpointId);

            res.json({
                greenpoint_id: greenpointId,
                materials_count: materials.length,
                materials
            });
        } catch (err) {
            console.error('Error al obtener materiales del greenpoint:', err);
            res.status(500).json({ error: 'Error al cargar los materiales' });
        }
    }

    static async updateMaterial(req, res) {
        try {
            const { id } = req.params; // id del material (id_greenpoint_material)
            const updates = req.body;
            const userId = req.user?.id_user;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const materialId = parseInt(id, 10);
            if (isNaN(materialId) || materialId <= 0) {
                return res.status(400).json({ error: 'ID de material inválido' });
            }

            // 1. Obtener el material
            const material = await GreenPointModel.findMaterialById(materialId);
            if (!material) {
                return res.status(404).json({ error: 'Material no encontrado' });
            }

            // 2. Obtener el greenpoint para verificar permisos
            const point = await GreenPointModel.findById(material.id_greenpoint);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint asociado no encontrado' });
            }

            // 3. Verificar que el usuario sea el dueño del greenpoint
            if (point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para editar este material' });
            }

            // 4. Actualizar el material
            const updatedMaterial = await GreenPointModel.updateMaterial(materialId, updates);
            if (!updatedMaterial) {
                return res.status(404).json({ error: 'Material no encontrado para actualizar' });
            }

            res.json(updatedMaterial);
        } catch (err) {
            console.error('Error al editar material:', err);
            if (err.message.includes('quantity debe ser')) {
                return res.status(400).json({ error: err.message });
            }
            res.status(500).json({ error: 'Error al actualizar el material' });
        }
    }

    static async bulkUpdateMaterials(req, res) {
        try {
            const { id } = req.params; // id del greenpoint
            const { materials } = req.body;
            const userId = req.user?.id_user;

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint pertenezca al usuario
            const point = await GreenPointModel.findById(greenpointId);
            if (!point || point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No tienes permiso para este greenpoint' });
            }

            if (!Array.isArray(materials) || materials.length === 0) {
                return res.status(400).json({ error: 'Se requiere al menos un material' });
            }

            // Validar y extraer IDs
            const materialIds = materials.map(m => {
                const id = parseInt(m.id_greenpoint_material, 10);
                if (isNaN(id) || id <= 0) {
                    throw new Error(`ID de material inválido: ${m.id_greenpoint_material}`);
                }
                return id;
            });

            // Verificar que todos los materiales pertenezcan a este greenpoint
            const existingMaterials = await GreenPointModel.getMaterialsByIds(materialIds);
            const existingIds = new Set(existingMaterials.map(m => m.id_greenpoint_material));
            const missingIds = materialIds.filter(id => !existingIds.has(id));

            if (missingIds.length > 0) {
                return res.status(404).json({ error: `Materiales no encontrados: ${missingIds.join(', ')}` });
            }

            // Verificar que todos pertenezcan a este greenpoint
            const wrongGreenpoint = existingMaterials.find(m => m.id_greenpoint !== greenpointId);
            if (wrongGreenpoint) {
                return res.status(403).json({ error: 'Uno o más materiales no pertenecen a este greenpoint' });
            }

            // Actualizar en transacción
            const updated = await GreenPointModel.bulkMaterialUpdate(materials);
            res.json({ message: `Se actualizaron ${updated.length} materiales`, materials: updated });
        } catch (err) {
            console.error('Error en actualización masiva:', err);
            res.status(400).json({ error: err.message || 'Error al actualizar materiales' });
        }
    }

    static async assignCategory(req, res) {
        try {
            const { id } = req.params;
            const { categoryIds } = req.body;
            const userId = req.user?.id_user;

            if (!userId) return res.status(401).json({ error: 'No autorizado' });

            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID de greenpoint inválido' });
            }

            // Verificar que el greenpoint pertenezca al usuario
            const point = await GreenPointModel.findById(greenpointId);
            if (!point || point.id_citizen !== userId) {
                return res.status(403).json({ error: 'No puedes asignar categorías a este greenpoint' });
            }

            // Validar que las categorías existan
            if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
                return res.status(400).json({ error: 'Se requiere al menos una categoría' });
            }

            for (const catId of categoryIds) {
                const category = await Category.findById(catId);
                if (!category) {
                    return res.status(400).json({ error: `Categoría no válida: ${catId}` });
                }
            }

            const assigned = await GreenpointCategory.assignCategories(greenpointId, categoryIds);
            res.json({ message: 'Categorías asignadas', categories: assigned });
        } catch (err) {
            console.error('Error al asignar categorías:', err);
            res.status(400).json({ error: err.message || 'Error al asignar categorías' });
        }
    }
    static async getCategories(req, res) {
        try {
            const { id } = req.params;
            const greenPointsCategories = await GreenpointCategory.getCategoriesByGreenpoint(id);
            res.json(greenPointsCategories);
            } catch (error) {
            console.error('Error al obtener categorias:', error);
            res.status(500).json({ error: 'Error al cargar las categorias' });
        }
    }

    static async findGreenPointsByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Validar categoryId
            const catId = parseInt(categoryId, 10);
            if (isNaN(catId) || catId <= 0) {
                return res.status(400).json({ error: 'ID de categoría inválido' });
            }

            // Validar paginación
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Página debe ser un número positivo' });
            }
            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({ error: 'Límite debe estar entre 1 y 100' });
            }

            // Obtener greenpoints
            const result = await GreenPointModel.findByCategory(catId, pageNum, limitNum);

            res.json({
                greenpoints: result.rows,
                pagination: {
                    currentPage: result.page,
                    totalPages: result.totalPages,
                    totalCount: result.totalCount,
                    limit: limitNum
                }
            });
        } catch (err) {
            console.error('Error al buscar greenpoints por categoría:', err);
            res.status(500).json({ error: 'Error al cargar los greenpoints' });
        }
    };

    static async findGreenPointsByLocation(req, res) {
        try {
            const { lat, lng, radius = 5 } = req.query;

            // Validar coordenadas
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusKm = parseFloat(radius);

            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({ error: 'Coordenadas inválidas. Usa ?lat=-18.0059&lng=-70.2537' });
            }

            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                return res.status(400).json({ error: 'Coordenadas fuera de rango' });
            }

            if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
                return res.status(400).json({ error: 'Radio debe estar entre 0 y 50 km' });
            }
            console.log(latitude, longitude, radiusKm)
            const greenpoints = await GreenPointModel.findByLocation(latitude, longitude, radiusKm);
            
            // Formatear coordenadas para el frontend
            const formatted = greenpoints.map(gp => ({
            ...gp,
            coordinates: {
                longitude: parseFloat(gp.longitude),
                latitude: parseFloat(gp.latitude)
            }
            }));

            res.json({
                greenpoints: formatted,
                count: formatted.length,
                center: { latitude, longitude },
                radius_km: radiusKm
            });
        } catch (err) {
            console.error('Error al buscar por ubicación:', err);
            res.status(400).json({ error: err.message || 'Error al buscar greenpoints cercanos' });
        }
    };

    /**
     * GET /greenpoints/my-collections
     * Obtiene todos los greenpoints donde el usuario autenticado es el recolector
     * Requiere autenticación
     */
    static async getMyCollections(req, res) {
        try {
            const { status } = req.query; // Filtro opcional por estado
            const userId = req.userId; // Del middleware authenticateToken
            console.log(userId)
            if (!userId) {
                return res.status(401).json({ error: 'No autorizado. Debes estar autenticado' });
            }

            const greenpoints = await GreenPointModel.findByCollector(userId, status);

            res.json({
                collector_id: userId,
                greenpoints_count: greenpoints.length,
                greenpoints
            });
        } catch (err) {
            console.error('Error al obtener mis greenpoints como recolector:', err);
            res.status(500).json({ error: 'Error al cargar los greenpoints' });
        }
    }

}   

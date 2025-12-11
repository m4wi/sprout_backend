import { PhotoModel } from '../models/photo.model.js';
import { GreenPointModel } from '../models/greenpoint.model.js';

export class PhotoController {
    static async getPhotosByGreenpoint(req, res) {
        try {
            const { id } = req.params;
            const greenpointId = parseInt(id, 10);
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const photos = await PhotoModel.getByGreenpoint(greenpointId);
            res.json(photos);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener fotos' });
        }
    }

    static async uploadPhoto(req, res) {
        try {
            const { id } = req.params;
            const greenpointId = parseInt(id, 10);
            const userId = req.userId;

            const contentType = req.headers['content-type'] || '';
            if (!contentType.includes('multipart/form-data')) {
                console.warn('[PhotoController] Invalid Content-Type:', contentType);
                return res.status(400).json({
                    error: 'Content-Type incorrecto',
                    message: `Se espera 'multipart/form-data', se recibió '${contentType}'. Si estás probando con una herramienta, asegúrate de enviar el archivo como 'form-data' y NO establecer el header Content-Type manualmente.`
                });
            }

            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }
            if (isNaN(greenpointId) || greenpointId <= 0) {
                return res.status(400).json({ error: 'ID inválido' });
            }
            const point = await GreenPointModel.findById(greenpointId);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            // Loose equality to handle string/number differences
            if (point.id_citizen != userId) {
                console.warn(`[PhotoController] Permission denied. Owner: ${point.id_citizen}, User: ${userId}`);
                return res.status(403).json({ error: 'Sin permiso' });
            }
            if (!req.file) {
                console.warn('[PhotoController] No file received');
                return res.status(400).json({ error: 'Archivo requerido' });
            }
            const url = `${req.file.filename}`;
            const created = await PhotoModel.create(greenpointId, url);
            res.status(201).json(created);
        } catch (err) {
            console.error('[PhotoController] Error uploading photo:', err);
            res.status(500).json({ error: 'Error al subir foto' });
        }
    }
    static async deletePhoto(req, res) {
        try {
            const { id, photoId } = req.params;
            const greenpointId = parseInt(id, 10);
            const photoIdInt = parseInt(photoId, 10);
            const userId = req.userId;

            if (isNaN(greenpointId) || isNaN(photoIdInt)) {
                return res.status(400).json({ error: 'IDs inválidos' });
            }

            const point = await GreenPointModel.findById(greenpointId);
            if (!point) {
                return res.status(404).json({ error: 'Greenpoint no encontrado' });
            }

            if (point.id_citizen != userId) {
                return res.status(403).json({ error: 'Sin permiso' });
            }

            const deleted = await PhotoModel.delete(photoIdInt);
            if (!deleted) {
                return res.status(404).json({ error: 'Foto no encontrada' });
            }

            res.json({ message: 'Foto eliminada correctamente', photo: deleted });
        } catch (err) {
            console.error('[PhotoController] Error deleting photo:', err);
            res.status(500).json({ error: 'Error al eliminar foto' });
        }
    }
}

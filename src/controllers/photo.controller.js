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
            if (point.id_citizen !== userId) {
                return res.status(403).json({ error: 'Sin permiso' });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'Archivo requerido' });
            }
            const url = `/greenpoint_photo/${req.file.filename}`;
            const created = await PhotoModel.create(greenpointId, url);
            res.status(201).json(created);
        } catch (err) {
            res.status(500).json({ error: 'Error al subir foto' });
        }
    }
}

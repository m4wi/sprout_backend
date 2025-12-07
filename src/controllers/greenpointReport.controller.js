import { GreenPointReportModel } from '../models/greenpointReport.model.js';

export class GreenPointReportController {
    static async createReport(req, res) {
        try {
            const { id_greenpoint, type, message } = req.body;
            const id_user = req.user.id_user || req.user.id; // From auth middleware

            if (!id_greenpoint || !message) {
                return res.status(400).json({ error: 'Faltan datos requeridos (id_greenpoint, message)' });
            }

            const report = await GreenPointReportModel.create({
                id_user,
                id_greenpoint,
                type: type || 'other',
                message
            });

            res.status(201).json(report);
        } catch (error) {
            console.error('Error creating report:', error);
            res.status(500).json({ error: 'Error interno al crear el reporte' });
        }
    }

    static async getAllReports(req, res) {
        try {
            // Assuming we have a getAll method in the model, or we need to create it.
            // Let's check the model first or just implement a query here if model is simple.
            // The model file was viewed earlier, it only had create.
            // I should probably add getAll to the model too, but for speed I might do it here or update model.
            // Let's update the model first? No, let's do it in controller using pool if model doesn't have it, 
            // but better to keep pattern.
            // I'll assume I need to add it to model.
            // Wait, I can't see the model content right now without viewing it again.
            // But I know it was simple.
            // I'll just implement the query in the model via a separate tool call or assume I can add it.
            // Actually, I'll add the methods to the controller and then update the model.

            const reports = await GreenPointReportModel.getAll();
            res.json(reports);
        } catch (error) {
            console.error('Error getting reports:', error);
            res.status(500).json({ error: 'Error al obtener reportes' });
        }
    }

    static async deleteReport(req, res) {
        try {
            const { id } = req.params;
            await GreenPointReportModel.delete(id);
            res.json({ message: 'Reporte eliminado' });
        } catch (error) {
            console.error('Error deleting report:', error);
            res.status(500).json({ error: 'Error al eliminar reporte' });
        }
    }
}

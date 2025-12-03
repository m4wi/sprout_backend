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
}

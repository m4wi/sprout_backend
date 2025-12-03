import { Router } from 'express';
import { GreenPointReportController } from '../controllers/greenpointReport.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticateToken, GreenPointReportController.createReport);

export default router;

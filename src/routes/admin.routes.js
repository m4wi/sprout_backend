import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticateToken, isAdmin);

router.get('/users', UserController.getAllUsers);
router.patch('/users/:id/ban', UserController.toggleUserStatus);
// router.post('/users/:id/notify', UserController.notifyUser); // To be implemented

// Stats endpoint (placeholder for now)
router.get('/stats', async (req, res) => {
    // Implement stats logic here or in a separate controller
    res.json({
        users: 0,
        greenpoints: 0,
        reports: 0
    });
});

// Greenpoints Management
import { GreenPointController } from '../controllers/greenpoint.controller.js';
router.get('/greenpoints', GreenPointController.getAllGreenPoints); // Reuse existing, maybe add filters
router.delete('/greenpoints/:id', GreenPointController.deleteGreenPoint); // Modified to allow admin
router.patch('/greenpoints/:id', GreenPointController.updateGreenPoint); // Modified to allow admin

// Reports Management
import { GreenPointReportController } from '../controllers/greenpointReport.controller.js';
router.get('/reports', GreenPointReportController.getAllReports);
router.delete('/reports/:id', GreenPointReportController.deleteReport);

// Categories Management
import { CategoryController } from '../controllers/category.controller.js';
router.get('/categories', CategoryController.getAllCategories);
router.post('/categories', CategoryController.createCategory);
router.patch('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

export default router;

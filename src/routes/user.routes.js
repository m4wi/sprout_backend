import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js'
import upload from '../middlewares/upload.js';

const router = Router();

router.get('/:id', UserController.getUserProfile)
router.post('/create', UserController.createUser)
router.patch('/update/:id', UserController.updateUser)
router.post('/upload-photo/:id', upload.single('photo'), UserController.updateProfilePhoto);

export default router;
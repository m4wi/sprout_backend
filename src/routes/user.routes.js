import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js'

const router = Router();



router.get('/:id', UserController.getUserProfile )
router.post('/create', UserController.createUser)
router.patch('/update/:id', UserController.updateUser)


export default router;
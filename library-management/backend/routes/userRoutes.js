import express from 'express';
const router = express.Router();
import {
  registerUser,
  authUser,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/').get(protect, getUsers);
router.route('/:id').delete(protect, deleteUser);

export default router;

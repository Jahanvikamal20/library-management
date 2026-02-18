import express from 'express';
const router = express.Router();
import {
  getIssuedBooks,
  issueBook,
  returnBook,
} from '../controllers/issuedBookController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getIssuedBooks).post(protect, admin, issueBook);
router.route('/:id/return').put(protect, admin, returnBook);

export default router;

import express from 'express';
import { createReview, getHallReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/hall/:hallId', getHallReviews);
router.post('/', protect, createReview);

export default router;

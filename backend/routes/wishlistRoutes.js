import express from 'express';
import { getWishlist, toggleWishlist, compareHalls } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/compare', compareHalls);

// Protected routes
router.use(protect);
router.get('/', getWishlist);
router.post('/toggle/:hallId', toggleWishlist);

export default router;

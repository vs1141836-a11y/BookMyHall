import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Apply rate limiting specifically to login/register routes
router.post('/register', rateLimiter(20, 15 * 60 * 1000), registerUser);
router.post('/login', rateLimiter(20, 15 * 60 * 1000), loginUser);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post('/forgot-password', rateLimiter(5, 15 * 60 * 1000), forgotPassword);
router.post('/reset-password/:token', rateLimiter(5, 15 * 60 * 1000), resetPassword);

export default router;

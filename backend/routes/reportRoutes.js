import express from 'express';
import { createReport, getReports, resolveReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createReport);

// Admin-only routes
router.get('/', authorize('admin'), getReports);
router.put('/:id/resolve', authorize('admin'), resolveReport);

export default router;

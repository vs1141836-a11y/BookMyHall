import express from 'express';
import {
  getOwnerDashboardStats,
  getAdminDashboardStats,
  verifyOwner,
  approveHall,
  suspendUser,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Owner route
router.get('/owner', authorize('owner', 'admin'), getOwnerDashboardStats);

// Admin-only routes
router.get('/admin', authorize('admin'), getAdminDashboardStats);
router.put('/admin/verify-owner/:ownerId', authorize('admin'), verifyOwner);
router.put('/admin/approve-hall/:hallId', authorize('admin'), approveHall);
router.put('/admin/suspend-user/:userId', authorize('admin'), suspendUser);

export default router;

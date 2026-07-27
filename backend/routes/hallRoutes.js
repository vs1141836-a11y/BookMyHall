import express from 'express';
import {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
  getOwnerHalls,
} from '../controllers/hallController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getHalls);
router.get('/owner/my-halls', protect, authorize('owner', 'admin'), getOwnerHalls);
router.get('/:id', getHallById);

router.post('/', protect, authorize('owner', 'admin'), createHall);
router.put('/:id', protect, authorize('owner', 'admin'), updateHall);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHall);

export default router;

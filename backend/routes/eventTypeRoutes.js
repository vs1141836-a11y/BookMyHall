import express from 'express';
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType
} from '../controllers/eventTypeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEventTypes);
router.post('/', protect, authorize('admin'), createEventType);
router.put('/:id', protect, authorize('admin'), updateEventType);
router.delete('/:id', protect, authorize('admin'), deleteEventType);

export default router;

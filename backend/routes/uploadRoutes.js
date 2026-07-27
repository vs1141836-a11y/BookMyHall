import express from 'express';
import upload, { uploadMedia } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload single image
router.post('/image', protect, upload.single('image'), uploadMedia, (req, res) => {
  if (!req.uploadedUrl) {
    return res.status(400).json({ success: false, message: 'No file uploaded or failed' });
  }
  res.status(200).json({
    success: true,
    url: req.uploadedUrl,
  });
});

// Upload multiple images/videos
router.post('/multiple', protect, upload.array('files', 10), uploadMedia, (req, res) => {
  if (!req.uploadedUrls || req.uploadedUrls.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded or failed' });
  }
  res.status(200).json({
    success: true,
    urls: req.uploadedUrls,
  });
});

export default router;

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if keys exist
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer Local Disk Storage Configuration
const localDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './public/uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File Filter for Images/Videos
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|mp4|mov|avi/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, webp) and videos (mp4, mov, avi) are allowed!'));
};

const upload = multer({
  storage: localDiskStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});

// Middleware to handle Cloudinary upload if configured, otherwise remain local
export const uploadMedia = async (req, res, next) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next();
  }

  try {
    if (isCloudinaryConfigured) {
      if (req.file) {
        // Upload single file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
          folder: 'bookmyhall',
        });
        // Remove local file
        fs.unlinkSync(req.file.path);
        req.uploadedUrl = result.secure_url;
      }

      if (req.files) {
        // Upload multiple files
        const urls = [];
        const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        
        for (const file of filesArray) {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
            folder: 'bookmyhall',
          });
          fs.unlinkSync(file.path);
          urls.push(result.secure_url);
        }
        req.uploadedUrls = urls;
      }
    } else {
      // Return relative local path if Cloudinary is not configured
      const host = req.get('host');
      const protocol = req.protocol;
      
      if (req.file) {
        const relativePath = req.file.path.replace(/\\/g, '/').replace('public/', '');
        req.uploadedUrl = `${protocol}://${host}/${relativePath}`;
      }

      if (req.files) {
        const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        req.uploadedUrls = filesArray.map(file => {
          const relativePath = file.path.replace(/\\/g, '/').replace('public/', '');
          return `${protocol}://${host}/${relativePath}`;
        });
      }
    }
    next();
  } catch (error) {
    console.error('File upload error:', error);
    next(error);
  }
};

export default upload;

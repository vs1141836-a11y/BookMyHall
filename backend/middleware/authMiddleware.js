import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MOCK_DB_PATH = path.resolve('mock_db.json');

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bookmyhall_secret_key_12345');

      // Get user from the token (exclude password)
      if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        let mockUser = null;
        if (fs.existsSync(MOCK_DB_PATH)) {
          const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
          mockUser = db.users.find(u => u._id === decoded.id);
        }
        if (!mockUser) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        req.user = mockUser;
      } else {
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
      }

      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

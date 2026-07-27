import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const mockDbPath = path.resolve('mock_db.json');

const readMockDB = () => {
  if (!fs.existsSync(mockDbPath)) {
    return { users: [], bookings: [], payments: [], notifications: [] };
  }
  const db = JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
  db.notifications = db.notifications || [];
  return db;
};

const writeMockDB = (data) => {
  fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userNotifications = mockDB.notifications.filter(n => n.user === req.user._id);
      
      if (userNotifications.length === 0) {
        const defaultNotifs = [
          { _id: 'n1', title: 'Welcome to BookMyHall!', message: 'Explore our premium venues and book in one click.', createdAt: new Date().toISOString(), isRead: false, user: req.user._id },
          { _id: 'n2', title: 'Verify Profile Details', message: 'Ensure your phone number is correct for updates.', createdAt: new Date(Date.now() - 3600000).toISOString(), isRead: false, user: req.user._id }
        ];
        mockDB.notifications.push(...defaultNotifs);
        writeMockDB(mockDB);
        return res.status(200).json({ success: true, data: defaultNotifs });
      }

      return res.status(200).json({
        success: true,
        data: userNotifications
      });
    }

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const notifIdx = mockDB.notifications.findIndex(n => n._id === req.params.id && n.user === req.user._id);
      if (notifIdx === -1) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }
      mockDB.notifications[notifIdx].isRead = true;
      writeMockDB(mockDB);
      return res.status(200).json({
        success: true,
        data: mockDB.notifications[notifIdx]
      });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      mockDB.notifications = mockDB.notifications.map(n => 
        n.user === req.user._id ? { ...n, isRead: true } : n
      );
      writeMockDB(mockDB);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

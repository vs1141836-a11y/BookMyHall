import mongoose from 'mongoose';
import EventType from '../models/EventType.js';

// @desc    Get all event types
// @route   GET /api/event-types
// @access  Public
export const getEventTypes = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    const eventTypes = await EventType.find();
    res.status(200).json({
      success: true,
      count: eventTypes.length,
      data: eventTypes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event type
// @route   POST /api/event-types
// @access  Private (Admin only)
export const createEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.create(req.body);
    res.status(201).json({
      success: true,
      data: eventType
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event type
// @route   PUT /api/event-types/:id
// @access  Private (Admin only)
export const updateEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!eventType) {
      return res.status(404).json({ success: false, message: 'Event type not found' });
    }

    res.status(200).json({
      success: true,
      data: eventType
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event type
// @route   DELETE /api/event-types/:id
// @access  Private (Admin only)
export const deleteEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findByIdAndDelete(req.params.id);

    if (!eventType) {
      return res.status(404).json({ success: false, message: 'Event type not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Event type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

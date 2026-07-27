import Report from '../models/Report.js';

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, issueType, description } = req.body;

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      issueType,
      description
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin only)
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or ignore a report
// @route   PUT /api/reports/:id/resolve
// @access  Private (Admin only)
export const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body; // Resolved, Ignored

    let report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    report.resolutionNotes = resolutionNotes;
    report.resolvedBy = req.user._id;

    await report.save();

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

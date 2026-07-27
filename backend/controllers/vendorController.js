import Vendor from '../models/Vendor.js';

// @desc    Get owner's vendors
// @route   GET /api/vendors
// @access  Private (Owner/Admin)
export const getVendors = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const vendors = await Vendor.find(filter);
    
    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vendor
// @route   POST /api/vendors
// @access  Private (Owner/Admin)
export const createVendor = async (req, res, next) => {
  try {
    req.body.owner = req.user._id;
    const vendor = await Vendor.create(req.body);
    
    res.status(201).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
// @access  Private (Owner/Admin)
export const updateVendor = async (req, res, next) => {
  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Verify ownership
    if (vendor.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this vendor' });
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Owner/Admin)
export const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Verify ownership
    if (vendor.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this vendor' });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

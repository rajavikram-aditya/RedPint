const Drive = require('../models/Drive');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/drives
 * Hospital creates a blood drive.
 */
exports.createDrive = asyncHandler(async (req, res) => {
  const { location, latitude, longitude, date, description } = req.body;

  const drive = await Drive.create({
    hospitalId: req.userProfile._id,
    location,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    date: new Date(date),
    description: description || '',
  });

  res.status(201).json({ success: true, drive });
});

/**
 * GET /api/drives
 * List all upcoming blood drives.
 */
exports.getDrives = asyncHandler(async (req, res) => {
  const drives = await Drive.find({ date: { $gte: new Date() } })
    .populate('hospitalId', 'name address contactNumber')
    .sort({ date: 1 });

  res.json({ success: true, drives });
});

/**
 * GET /api/drives/:id
 * Get a single drive by ID.
 */
exports.getDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id).populate(
    'hospitalId',
    'name address contactNumber'
  );

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  res.json({ success: true, drive });
});

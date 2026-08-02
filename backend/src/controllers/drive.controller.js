const Drive = require('../models/Drive');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/drives
 * Hospital creates a blood drive.
 */
exports.createDrive = asyncHandler(async (req, res) => {
  const { name, location, latitude, longitude, date, description } = req.body;

  const drive = await Drive.create({
    hospitalId: req.userProfile._id,
    name: name || '',
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
    .populate('registeredDonors', 'name email phone bloodGroup')
    .sort({ date: 1 });

  res.json({ success: true, drives });
});

/**
 * GET /api/drives/:id
 * Get a single drive by ID.
 */
exports.getDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id)
    .populate('hospitalId', 'name address contactNumber')
    .populate('registeredDonors', 'name email phone bloodGroup');

  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  res.json({ success: true, drive });
});

/**
 * POST /api/drives/:id/register
 * Donor registers for a blood drive.
 */
exports.registerForDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) {
    return res.status(404).json({ success: false, message: 'Drive not found' });
  }

  const donorId = req.userProfile._id;
  if (drive.registeredDonors.includes(donorId)) {
    return res.status(400).json({ success: false, message: 'Already registered for this drive' });
  }

  drive.registeredDonors.push(donorId);
  await drive.save();

  res.json({ success: true, message: 'Successfully registered for the drive', drive });
});

const bcrypt = require('bcryptjs');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
const Match = require('../models/Match');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/donors/register
 * Register a new donor with native email and password. Accepts multipart form with document upload.
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, bloodGroup, latitude, longitude } = req.body;

  if (!name || !email || !password || !phone || !bloodGroup || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if already registered across models
  const existingDonor = await Donor.findOne({ email: cleanEmail });
  const existingHospital = await Hospital.findOne({ email: cleanEmail });
  const existingAdmin = await Admin.findOne({ email: cleanEmail });

  if (existingDonor || existingHospital || existingAdmin) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let documentUrl = null;
  if (req.file) {
    documentUrl = `/uploads/donors/${req.file.filename}`;
  }

  const donor = await Donor.create({
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    phone: phone.trim(),
    bloodGroup,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    verified: true,
    documentUrl,
  });

  const token = generateToken(donor._id, 'donor');

  const donorObj = donor.toObject();
  delete donorObj.password;

  res.status(201).json({
    success: true,
    message: 'Donor registration successful.',
    token,
    role: 'donor',
    donor: donorObj,
  });
});

/**
 * GET /api/donors/me/matches
 * Get all active matches for the logged-in donor.
 */
exports.getMyMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ donorId: req.userProfile._id })
    .populate({
      path: 'requestId',
      populate: { path: 'hospitalId', select: 'name address contactNumber latitude longitude' },
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, matches });
});

/**
 * GET /api/donors/me/profile
 * Get the logged-in donor's profile.
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const donorObj = req.userProfile.toObject ? req.userProfile.toObject() : req.userProfile;
  delete donorObj.password;
  res.json({ success: true, donor: donorObj });
});

/**
 * PATCH /api/donors/me/profile
 * Update donor profile fields.
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'latitude', 'longitude'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const donor = await Donor.findByIdAndUpdate(req.userProfile._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.json({ success: true, donor });
});

/**
 * GET /api/donors
 * Get all verified donors for matching preview (anonymized/basic info only).
 */
exports.getAllDonors = asyncHandler(async (req, res) => {
  const donors = await Donor.find({ verified: true })
    .select('name bloodGroup latitude longitude lastDonationDate -_id'); // basic info only
  res.json({ success: true, donors });
});

const bcrypt = require('bcryptjs');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/hospitals/register
 * Register a new hospital with native email and password. Accepts multipart form with license document.
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, address, latitude, longitude, contactNumber } = req.body;

  if (!name || !email || !password || !address || latitude === undefined || longitude === undefined || !contactNumber) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check if already registered
  const existingHospital = await Hospital.findOne({ email: cleanEmail });
  const existingDonor = await Donor.findOne({ email: cleanEmail });
  const existingAdmin = await Admin.findOne({ email: cleanEmail });

  if (existingHospital || existingDonor || existingAdmin) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let licenseDocUrl = null;
  if (req.file) {
    licenseDocUrl = `/uploads/hospitals/${req.file.filename}`;
  }

  const hospital = await Hospital.create({
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    address: address.trim(),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    contactNumber: contactNumber.trim(),
    verified: false,
    rejected: false,
    licenseDocUrl,
  });

  const token = generateToken(hospital._id, 'hospital');

  const hospitalObj = hospital.toObject();
  delete hospitalObj.password;

  res.status(201).json({
    success: true,
    message: 'Hospital registration submitted successfully. Awaiting administrator verification.',
    token,
    role: 'hospital',
    hospital: hospitalObj,
  });
});

/**
 * GET /api/hospitals
 * List all verified hospitals (public).
 */
exports.getAllHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ verified: true }).select(
    'name email address latitude longitude contactNumber'
  );
  res.json({ success: true, hospitals });
});

/**
 * GET /api/hospitals/me/profile
 * Get the logged-in hospital's profile.
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const hospitalObj = req.userProfile.toObject ? req.userProfile.toObject() : req.userProfile;
  delete hospitalObj.password;
  res.json({ success: true, hospital: hospitalObj });
});

/**
 * PATCH /api/hospitals/me/profile
 * Update hospital profile.
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'address', 'latitude', 'longitude', 'contactNumber'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const hospital = await Hospital.findByIdAndUpdate(req.userProfile._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.json({ success: true, hospital });
});

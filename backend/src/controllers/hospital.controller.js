const Hospital = require('../models/Hospital');
const { bucket } = require('../config/firebase');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/hospitals/register
 * Register a new hospital. Accepts multipart form with license document.
 */
exports.register = asyncHandler(async (req, res) => {
  const { uid } = req.user;

  const existing = await Hospital.findOne({ firebaseUid: uid });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Hospital already registered' });
  }

  const { name, address, latitude, longitude, contactNumber } = req.body;

  let licenseDocUrl = null;
  if (req.file) {
    const fileName = `hospitals/${uid}/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });
    await file.makePublic();
    licenseDocUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }

  const hospital = await Hospital.create({
    firebaseUid: uid,
    name,
    address,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    contactNumber,
    verified: false,
    licenseDocUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email to activate your account.',
    hospital,
  });
});

/**
 * GET /api/hospitals
 * List all verified hospitals (public).
 */
exports.getAllHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ verified: true }).select(
    'name address latitude longitude contactNumber'
  );
  res.json({ success: true, hospitals });
});

/**
 * GET /api/hospitals/me/profile
 * Get the logged-in hospital's profile.
 */
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, hospital: req.userProfile });
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
  });

  res.json({ success: true, hospital });
});

/**
 * PATCH /api/hospitals/:id/verify
 * Admin verifies a hospital.
 */
exports.verifyHospital = asyncHandler(async (req, res) => {
  if (req.user.uid !== process.env.ADMIN_UID) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  hospital.verified = true;
  await hospital.save();

  res.json({ success: true, message: 'Hospital verified successfully', hospital });
});

const Donor = require('../models/Donor');
const { bucket } = require('../config/firebase');
const { asyncHandler } = require('../utils/helpers');
const Match = require('../models/Match');

/**
 * POST /api/donors/register
 * Register a new donor. Accepts multipart form with document upload.
 */
exports.register = asyncHandler(async (req, res) => {
  const { uid, email } = req.user; // from Firebase token

  // Check if already registered
  const existing = await Donor.findOne({ firebaseUid: uid });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Donor already registered' });
  }

  const { name, phone, bloodGroup, latitude, longitude } = req.body;

  // Upload document to Firebase Storage if provided
  let documentUrl = null;
  if (req.file) {
    const fileName = `donors/${uid}/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });
    await file.makePublic();
    documentUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  }

  const donor = await Donor.create({
    firebaseUid: uid,
    name,
    email,
    phone,
    bloodGroup,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    verified: false, // Must verify email
    documentUrl,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email to activate your account.',
    donor,
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
  res.json({ success: true, donor: req.userProfile });
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
  });

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

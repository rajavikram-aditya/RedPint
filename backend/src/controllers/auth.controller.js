const { auth } = require('../config/firebase');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/auth/verify
 * After a user completes OTP verification on the client side,
 * this endpoint marks their DB record as verified.
 */
exports.verifyUser = asyncHandler(async (req, res) => {
  const { uid, email_verified } = req.user; // from verifyToken middleware

  if (!email_verified) {
    return res.status(403).json({ success: false, message: 'Email not verified. Please check your inbox for the verification link.' });
  }

  // Check donor first
  let user = await Donor.findOne({ firebaseUid: uid });
  if (user) {
    user.verified = true;
    await user.save();
    return res.json({ success: true, role: 'donor', message: 'Donor verified successfully' });
  }

  // Then hospital
  user = await Hospital.findOne({ firebaseUid: uid });
  if (user) {
    // Hospital requires admin verification, we just acknowledge email verification here
    return res.json({ success: true, role: 'hospital', message: 'Hospital email verified successfully. Awaiting admin approval.' });
  }

  return res.status(404).json({ success: false, message: 'User not found in database' });
});

/**
 * GET /api/auth/me
 * Return the current authenticated user's profile and role.
 */
exports.getMe = asyncHandler(async (req, res) => {
  if (!req.userProfile) {
    return res.status(404).json({ success: false, message: 'Profile not found. Please register first.' });
  }

  res.json({
    success: true,
    role: req.userRole,
    profile: req.userProfile,
  });
});

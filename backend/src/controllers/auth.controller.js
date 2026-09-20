const bcrypt = require('bcryptjs');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/auth/login
 * Universal login endpoint for Donor, Hospital, and Admin.
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  let user = null;
  let userRole = null;

  if (role === 'donor') {
    user = await Donor.findOne({ email: cleanEmail });
    userRole = 'donor';
  } else if (role === 'hospital') {
    user = await Hospital.findOne({ email: cleanEmail });
    userRole = 'hospital';
  } else if (role === 'admin') {
    user = await Admin.findOne({ email: cleanEmail });
    userRole = 'admin';
  } else {
    // If role not explicitly provided or generic, search sequentially
    user = await Donor.findOne({ email: cleanEmail });
    if (user) {
      userRole = 'donor';
    } else {
      user = await Hospital.findOne({ email: cleanEmail });
      if (user) {
        userRole = 'hospital';
      } else {
        user = await Admin.findOne({ email: cleanEmail });
        if (user) {
          userRole = 'admin';
        }
      }
    }
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user._id, userRole);

  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    success: true,
    message: 'Login successful',
    token,
    role: userRole,
    profile: userObj,
  });
});

/**
 * GET /api/auth/me
 * Return the current authenticated user's profile and role.
 */
exports.getMe = asyncHandler(async (req, res) => {
  if (!req.userProfile) {
    return res.status(404).json({ success: false, message: 'Profile not found. Please log in.' });
  }

  const userObj = req.userProfile.toObject();
  delete userObj.password;

  res.json({
    success: true,
    role: req.userRole,
    profile: userObj,
  });
});

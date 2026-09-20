const { auth } = require('../config/firebase');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');

/**
 * Middleware: verify Firebase ID token from Authorization header.
 * Attaches decoded token to req.user and fetches the DB profile.
 */
async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const idToken = header.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded; // { uid, email, ... }

    // Try to find the user in Donor, Hospital, or Admin collections
    const donor = await Donor.findOne({ firebaseUid: decoded.uid });
    if (donor) {
      req.userRole = 'donor';
      req.userProfile = donor;
      return next();
    }

    const hospital = await Hospital.findOne({ firebaseUid: decoded.uid });
    if (hospital) {
      req.userRole = 'hospital';
      req.userProfile = hospital;
      return next();
    }

    const admin = await Admin.findOne({ firebaseUid: decoded.uid });
    if (admin) {
      req.userRole = 'admin';
      req.userProfile = admin;
      return next();
    }

    // User exists in Firebase but not yet registered in our DB — that's okay for registration flow
    req.userRole = null;
    req.userProfile = null;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory: restrict access to specific roles.
 * Must be used AFTER verifyToken.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}

/**
 * Middleware: block unverified hospitals from performing actions.
 * Must be used AFTER verifyToken + requireRole('hospital').
 */
function requireVerified(req, res, next) {
  if (req.userRole === 'hospital' && !req.userProfile.verified) {
    return res.status(403).json({
      success: false,
      message: 'Your hospital account is pending admin approval.',
    });
  }
  next();
}

module.exports = { verifyToken, requireRole, requireVerified };

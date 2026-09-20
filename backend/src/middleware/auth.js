const jwt = require('jsonwebtoken');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'redpint_jwt_super_secret_key_2026';

/**
 * Generate a signed JWT for a given user & role.
 */
function generateToken(userId, role) {
  return jwt.sign(
    { id: userId.toString(), role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Middleware: verify JWT token from Authorization header.
 * Attaches decoded token to req.user and fetches the DB profile.
 */
async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = header.split('Bearer ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }

    if (decoded.role === 'donor') {
      const donor = await Donor.findById(decoded.id);
      if (donor) {
        req.userRole = 'donor';
        req.userProfile = donor;
        return next();
      }
    } else if (decoded.role === 'hospital') {
      const hospital = await Hospital.findById(decoded.id);
      if (hospital) {
        req.userRole = 'hospital';
        req.userProfile = hospital;
        return next();
      }
    } else if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (admin) {
        req.userRole = 'admin';
        req.userProfile = admin;
        return next();
      }
    }

    // Fallback: search all collections if role was missing
    let user = await Donor.findById(decoded.id);
    if (user) {
      req.userRole = 'donor';
      req.userProfile = user;
      return next();
    }
    user = await Hospital.findById(decoded.id);
    if (user) {
      req.userRole = 'hospital';
      req.userProfile = user;
      return next();
    }
    user = await Admin.findById(decoded.id);
    if (user) {
      req.userRole = 'admin';
      req.userProfile = user;
      return next();
    }

    return res.status(401).json({ success: false, message: 'User not found for token' });
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

module.exports = { generateToken, verifyToken, requireRole, requireVerified };

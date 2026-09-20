const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const Drive = require('../models/Drive');
const Donation = require('../models/Donation');
const { asyncHandler } = require('../utils/helpers');

/**
 * GET /api/admin/me
 * Return the logged-in admin's profile.
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.userProfile });
});

/**
 * GET /api/admin/hospitals/pending
 * List all hospitals awaiting verification, oldest first.
 */
exports.getPendingHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ verified: false, rejected: false }).sort({ createdAt: 1 });
  res.json({ success: true, hospitals });
});

/**
 * PATCH /api/admin/hospitals/:id/verify
 * Approve a hospital registration.
 */
exports.verifyHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  hospital.verified = true;
  hospital.rejected = false;
  await hospital.save();

  res.json({ success: true, message: 'Hospital verified successfully', hospital });
});

/**
 * PATCH /api/admin/hospitals/:id/reject
 * Soft-reject a hospital registration (flags it, preserves the document).
 */
exports.rejectHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  hospital.rejected = true;
  hospital.verified = false;
  await hospital.save();

  res.json({ success: true, message: 'Hospital registration rejected', hospital });
});

/**
 * GET /api/admin/stats
 * Return aggregate counts across the platform.
 */
exports.getStats = asyncHandler(async (req, res) => {
  const [
    totalDonors,
    totalHospitalsVerified,
    totalHospitalsPending,
    totalActiveRequests,
    totalDrives,
    totalDonations,
  ] = await Promise.all([
    Donor.countDocuments(),
    Hospital.countDocuments({ verified: true }),
    Hospital.countDocuments({ verified: false, rejected: false }),
    BloodRequest.countDocuments({ status: { $ne: 'fulfilled' } }),
    Drive.countDocuments(),
    Donation.countDocuments(),
  ]);

  res.json({
    success: true,
    stats: {
      totalDonors,
      totalHospitals: totalHospitalsVerified + totalHospitalsPending,
      totalHospitalsVerified,
      totalHospitalsPending,
      totalActiveRequests,
      totalDrives,
      totalDonations,
    },
  });
});

const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const Match = require('../models/Match');
const { asyncHandler } = require('../utils/helpers');

/**
 * POST /api/donations
 * Mark a donation as complete. Resets the donor's cooldown timer.
 * Called by hospital after a donor successfully donates.
 */
exports.recordDonation = asyncHandler(async (req, res) => {
  const { donorId, requestId, unitsDonated } = req.body;
  const hospital = req.userProfile;

  // Validate the match exists and was accepted
  const match = await Match.findOne({
    requestId,
    donorId,
    responseStatus: 'accepted',
  });

  if (!match) {
    return res.status(400).json({
      success: false,
      message: 'No accepted match found for this donor and request.',
    });
  }

  // Record the donation
  const donation = await Donation.create({
    donorId,
    hospitalId: hospital._id,
    requestId,
    donationDate: new Date(),
    unitsDonated: parseInt(unitsDonated, 10) || 1,
  });

  // Reset donor's cooldown — set lastDonationDate to now
  await Donor.findByIdAndUpdate(donorId, {
    lastDonationDate: new Date(),
  });

  // Check if the request is fully fulfilled
  const totalDonated = await Donation.aggregate([
    { $match: { requestId: new mongoose.Types.ObjectId(requestId) } },
    { $group: { _id: null, total: { $sum: '$unitsDonated' } } },
  ]);

  const request = await BloodRequest.findById(requestId);
  const total = totalDonated[0]?.total || 0;
  if (total >= request.unitsRequired) {
    request.status = 'fulfilled';
    await request.save();
  }

  res.status(201).json({
    success: true,
    message: 'Donation recorded. Donor cooldown has been reset.',
    donation,
    requestFulfilled: total >= request.unitsRequired,
  });
});

/**
 * GET /api/donations
 * Get donation history. Donors see their own; hospitals see theirs.
 */
exports.getDonations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.userRole === 'donor') {
    filter.donorId = req.userProfile._id;
  } else if (req.userRole === 'hospital') {
    filter.hospitalId = req.userProfile._id;
  }

  const donations = await Donation.find(filter)
    .populate('donorId', 'name bloodGroup')
    .populate('hospitalId', 'name')
    .populate('requestId', 'bloodGroupNeeded urgencyLevel')
    .sort({ donationDate: -1 });

  res.json({ success: true, donations });
});
